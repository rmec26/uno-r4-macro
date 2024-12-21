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
#define KEY_DEBOUNCE 10
//{{DEFINE}}

LiquidCrystal lcd(8, 9, 4, 5, 6, 7);

byte last_key = NONE;

byte pressed_key = NONE;

byte current_key = NONE;

long current_key_time;

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

char position = 0;

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

void printMenu() {
  printBottom("");
  switch (position) {
    case 0:
      lcd.setCursor(3, 1);
      lcd.write(byte(DOWN_ARROW));
      break;
    case MAX_ENTRIES - 1:
      lcd.setCursor(2, 1);
      lcd.write(byte(UP_ARROW));
      break;
    default:
      lcd.setCursor(2, 1);
      lcd.write(byte(UP_ARROW));
      lcd.write(byte(DOWN_ARROW));
      break;
  }
}

void printCurrentSelection() {
  switch (position) {
//{{PRINT_SELECTION}}
  }
  printMenu();
}

void runCurrentSelection() {
  printBottom("Running");
  switch (position) {
//{{RUN_SELECTION}}
  }
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

void processSelectionKey() {
  if (last_key == UP) {
    previousSelection();
  } else if (last_key == DOWN) {
    nextSelection();
  } else if (last_key == LEFT) {
    runCurrentSelection();
  } else if (last_key == RIGHT) {
    runCurrentSelection();
  } else {
    runCurrentSelection();
  }
}

void processLastKey() {
  if (last_key != NONE) {
    processSelectionKey();  //this call should be dependent on the current mode
    last_key = NONE;
    printCurrentSelection();  //this call should be dependent on the current mode
  }
}

void setup() {
  lcd.begin(16, 2);
  lcd.createChar(UP_ARROW, upArrow);
  lcd.createChar(DOWN_ARROW, downArrow);
  printTop("Loading...");
  Keyboard.begin();
  printCurrentSelection();
}

void loop() {
  last_key = getLastKey();
  processLastKey();
}
