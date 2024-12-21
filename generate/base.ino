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
//{{DEFINE}}

LiquidCrystal lcd(8, 9, 4, 5, 6, 7);

char last_key = NONE;

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

void setup() {
  lcd.begin(16, 2);
  lcd.createChar(UP_ARROW, upArrow);
  lcd.createChar(DOWN_ARROW, downArrow);
  printTop("Loading...");
  Keyboard.begin();
  printCurrentSelection();
}

void processSelectionKey(){
  printBottom("Running");
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
    processSelectionKey();//this call should be dependent on the current mode
    last_key = NONE;
    printCurrentSelection();//this call should be dependent on the current mode
  }
}

void loop() {
  int x;
  x = analogRead(0);
  if (x < 60) {
    last_key = RIGHT;
  } else if (x < 200) {
    last_key = UP;
  } else if (x < 400) {
    last_key = DOWN;
  } else if (x < 600) {
    last_key = LEFT;
  } else if (x < 800) {
    last_key = SELECT;
  } else {
    processLastKey();
  }
}
