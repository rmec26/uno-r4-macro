#include <Keyboard.h>
#include <LiquidCrystal.h>

#define UP 1
#define DOWN 2
#define LEFT 3
#define RIGHT 4
#define SELECT 5
#define NONE 0
#define UP_ARROW 0
#define DOWN_ARROW 1
#define NO_ARROW 2
#define KEY_DEBOUNCE 10
//{{DEFINE}}

LiquidCrystal lcd(8, 9, 4, 5, 6, 7);

byte pressed_key = NONE;

byte current_key = NONE;

long current_key_time;

byte position = 0;

byte readKey() {
  byte key = NONE;
  int x = analogRead(0);
  if (x < 60) {
    key = RIGHT;
  } else if (x < 200) {
    key = UP;
  } else if (x < 400) {
    key = DOWN;
  } else if (x < 600) {
    key = LEFT;
  } else if (x < 800) {
    key = SELECT;
  }
  return key;
}

byte getLastKey() {
  byte key = readKey();
  if (key != NONE) {
    if (current_key != key) {
      current_key = key;
      current_key_time = millis();
    } else if (key != pressed_key && millis() - current_key_time >= KEY_DEBOUNCE) {
      pressed_key = key;
    }
    return NONE;
  } else {
    if (pressed_key != NONE) {
      key = pressed_key;
      pressed_key = NONE;
      current_key = NONE;
    }
    return key;
  }
}

byte upArrow[8] = {
  0b00000,
  0b00000,
  0b00100,
  0b01110,
  0b11011,
  0b10001,
  0b00000,
  0b00000
};

byte downArrow[8] = {
  0b00000,
  0b00000,
  0b10001,
  0b11011,
  0b01110,
  0b00100,
  0b00000,
  0b00000
};

byte noArrow[8] = {
  0b00000,
  0b00000,
  0b00100,
  0b01110,
  0b01110,
  0b00100,
  0b00000,
  0b00000
};

void printTop(char* text) {
  lcd.setCursor(0, 0);
  lcd.print("                ");
  lcd.setCursor(0, 0);
  lcd.print(text);
}

void printBottom(char* text) {
  lcd.setCursor(0, 1);
  lcd.print("                ");
  lcd.setCursor(0, 1);
  lcd.print(text);
}

void printMenuTop(char* text) {
  lcd.setCursor(2, 0);
  lcd.print("               ");
  lcd.setCursor(2, 0);
  lcd.print(text);
}

void printMenuBottom(char* text) {
  lcd.setCursor(2, 1);
  lcd.print("               ");
  lcd.setCursor(2, 1);
  lcd.print(text);
}

byte waitForAnyKey(long timeout) {
  printMenuBottom("Press any key");
  byte key = NONE;
  if (timeout) {
    long start = millis();
    do {
      key = getLastKey();
    } while (key == NONE && (millis() - start) < timeout);
  } else {
    do {
      key = getLastKey();
    } while (key == NONE);
  }
  printMenuBottom("Running");
  return key;
}

byte waitForAnyKey() {
  return waitForAnyKey(0);
}

void printMenuArrows() {
  lcd.setCursor(0, 0);
  lcd.write("  ");
  lcd.setCursor(0, 1);
  lcd.write("  ");

  switch (position) {
    case 0:
      lcd.setCursor(0, 0);
      lcd.write(byte(NO_ARROW));
      lcd.setCursor(0, 1);
      lcd.write(byte(DOWN_ARROW));
      break;
    case MAX_ENTRIES - 1:
      lcd.setCursor(0, 0);
      lcd.write(byte(UP_ARROW));
      lcd.setCursor(0, 1);
      lcd.write(byte(NO_ARROW));
      break;
    default:
      lcd.setCursor(0, 0);
      lcd.write(byte(UP_ARROW));
      lcd.setCursor(0, 1);
      lcd.write(byte(DOWN_ARROW));
      break;
  }
}

void printCurrentSelection() {
  switch (position) {
//{{PRINT_SELECTION}}
  }
  printMenuArrows();
}

void runCurrentSelection() {
  printMenuBottom("Running");
  switch (position) {
//{{RUN_SELECTION}}
  }
  printMenuBottom("");
}

void nextSelection() {
  if (position < MAX_ENTRIES - 1) {
    position++;
  }
}

void previousSelection() {
  if (position > 0) {
    position--;
  }
}

void processSelectionKey(byte key) {
  if (key == UP) {
    previousSelection();
  } else if (key == DOWN) {
    nextSelection();
  } else if (key == LEFT) {
    // runCurrentSelection();
  } else if (key == RIGHT) {
    runCurrentSelection();
  } else {  //SELECT
    runCurrentSelection();
  }
}

void processLastKey(byte key) {
  if (key != NONE) {
    processSelectionKey(key);  //this call should be dependent on the current mode
    printCurrentSelection();   //this call should be dependent on the current mode
  }
}

void setup() {
  // Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.createChar(UP_ARROW, upArrow);
  lcd.createChar(DOWN_ARROW, downArrow);
  lcd.createChar(NO_ARROW, noArrow);
  printTop("Loading...");
  Keyboard.begin();
  printCurrentSelection();
}

void loop() {
  processLastKey(getLastKey());
}
