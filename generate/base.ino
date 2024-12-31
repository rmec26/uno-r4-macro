#include <Keyboard.h>
#include <Mouse.h>
#include <LiquidCrystal.h>

#define UP 1
#define DOWN 2
#define LEFT 3
#define RIGHT 4
#define SELECT 5
#define NONE 0
#define UP_ICON 0
#define DOWN_ICON 1
#define BACK_ICON 2
#define CONTINUE_ICON 3
#define DOT_ICON 4
#define CANCEL_ICON 5
#define KEY_DEBOUNCE 10
#define SEND_CLICK_AFTER 300
//{{DEFINE}}

LiquidCrystal lcd(8, 9, 4, 5, 6, 7);

byte pressed_key = NONE;

byte current_key = NONE;

long current_key_time;

byte position = 0;

void (*currentRunner)(byte);

//Start Functions definitions

void loadStart();

void runStart(byte key);

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
    } else if (key == pressed_key && millis() - current_key_time >= SEND_CLICK_AFTER) {
      key = pressed_key;
      pressed_key = NONE;
      current_key = NONE;
      return key;
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

byte upIcon[8] = {
  0b00000,
  0b00000,
  0b00100,
  0b01110,
  0b11011,
  0b10001,
  0b00000,
  0b00000
};

byte downIcon[8] = {
  0b00000,
  0b00000,
  0b10001,
  0b11011,
  0b01110,
  0b00100,
  0b00000,
  0b00000
};

byte dotIcon[8] = {
  0b00000,
  0b00000,
  0b00100,
  0b01110,
  0b01110,
  0b00100,
  0b00000,
  0b00000
};

byte backIcon[8] = {
  0b00000,
  0b00000,
  0b00110,
  0b01100,
  0b11000,
  0b01100,
  0b00110,
  0b00000
};

byte continueIcon[8] = {
  0b00000,
  0b00000,
  0b01000,
  0b01100,
  0b01110,
  0b01100,
  0b01000,
  0b00000
};

byte cancelIcon[8] = {
  0b00000,
  0b00000,
  0b11111,
  0b10001,
  0b10001,
  0b10001,
  0b11111,
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

void waitForNoKey(byte icon) {
  printMenuBottom("Release ");
  lcd.write(icon);
  byte key = NONE;
  do {
    key = readKey();
  } while (key != NONE);
}

void waitForNoKey() {
  printMenuBottom("Release keys");
  byte key = NONE;
  do {
    key = readKey();
  } while (key != NONE);
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

bool delayOrCancel(long delay) {
  byte key = NONE;
  long start = millis();
  do {
    key = readKey();
  } while (key != SELECT && (millis() - start) < delay);

  return key == SELECT;
}

byte delayOrCancelOrContinue(long delay) {
  byte key = NONE;
  long start = millis();
  do {
    key = readKey();
  } while (key != SELECT && key != RIGHT && (millis() - start) < delay);
  if(key != SELECT && key != RIGHT){
    return NONE;
  }
  return key;
}

void printMenuArrows() {
  lcd.setCursor(0, 0);
  lcd.write("  ");
  lcd.setCursor(0, 1);
  lcd.write("  ");

  switch (position) {
    case 0:
      lcd.setCursor(0, 0);
      lcd.write(byte(DOT_ICON));
      lcd.setCursor(0, 1);
      lcd.write(byte(DOWN_ICON));
      break;
    case MAX_ENTRIES - 1:
      lcd.setCursor(0, 0);
      lcd.write(byte(UP_ICON));
      lcd.setCursor(0, 1);
      lcd.write(byte(DOT_ICON));
      break;
    default:
      lcd.setCursor(0, 0);
      lcd.write(byte(UP_ICON));
      lcd.setCursor(0, 1);
      lcd.write(byte(DOWN_ICON));
      break;
  }
}

void printRunningMenu() {
  lcd.setCursor(0, 0);
  lcd.write(byte(DOT_ICON));
  lcd.write(" ");
  lcd.setCursor(0, 1);
  lcd.write(byte(DOT_ICON));
  lcd.write(" Running");
}

//Menu Functions

void printCurrentMenuSelection() {
  switch (position) {
//{{PRINT_SELECTION}}
  }
  printMenuArrows();
}

void runCurrentSelection() {
  byte key = NONE;
  printRunningMenu();
  switch (position) {
//{{RUN_SELECTION}}
  }
  Keyboard.releaseAll();
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

void loadMenu() {
  lcd.createChar(UP_ICON, upIcon);
  lcd.createChar(DOWN_ICON, downIcon);
  lcd.createChar(BACK_ICON, backIcon);
  lcd.createChar(CONTINUE_ICON, continueIcon);
  lcd.createChar(DOT_ICON, dotIcon);
  lcd.createChar(CANCEL_ICON, cancelIcon);
  printCurrentMenuSelection();
}

void runMenu(byte key) {
  if (key != NONE) {
    if (key == UP) {
      previousSelection();
      printCurrentMenuSelection();
    } else if (key == DOWN) {
      nextSelection();
      printCurrentMenuSelection();
    } else if (key == LEFT || key == SELECT) {
      currentRunner = runStart;
      loadStart();
    } else if (key == RIGHT) {
      runCurrentSelection();
      printCurrentMenuSelection();
    }
  }
}

//Start Function

void loadStart() {
  lcd.createChar(CONTINUE_ICON, continueIcon);
//{{START_MESSAGE}}
  printBottom("    Click ");
  lcd.write(byte(CONTINUE_ICON));
}

void runStart(byte key) {
  if (key == RIGHT) {
    currentRunner = runMenu;
    loadMenu();
  }
}

void setup() {
  lcd.begin(16, 2);
  printTop("Loading...");
  Keyboard.begin();
  Mouse.begin();
  currentRunner = runStart;
  loadStart();
}

void loop() {
  (*currentRunner)(getLastKey());
}
