# uno-r4-macro


This project allows you to turn an Arduino Uno R4 and a LCD Keypad Shield into a costumizable keyboard macro runner.

## Requirements

* Arduino Uno R4
* LCD Keypad Shield
* Arduino IDE
* node

## How to install

1. Create a json file with the desired macros.
2. Run `node generate.mjs <macro_file>`.
3. Open the generated `uno-r4-macro.ino` in the Arduino IDE.
4. Connect the Arduino Uno R4 to the computer.
5. Click the `Upload` option in the Arduino IDE.

## Macro definition

The JSON with the macro definitions should be an object with the given properties.

* `startMessage`:`string` - (Optional) Defines the message shown at the start of the device.
* `macros`:`Macro[]` - Array containg the macro definitions available on the device.


### Example of a macro definition file
```json
{
  "startMessage": "Macro Tester",
  "macros": [
    {
      "Macro 1": ["ThisIsATest\t",{"delay":500},"qwertyuiop12345\n"]
    },
    {
      "Macro 2": ["SimpleTestWithNewLine\n"]
    },
    {
      "Macro 3": ["justAline"]
    },
    {
      "Macro 4": ["TestWithWaiting\n",{"wait":true},{"text":"line2\n"}]
    },
    {
      "Macro 5": ["TestWithTimedWaiting\n",{"waitTimeout":5000},{"text":"and done.\n"}]
    },
    {
      "Macro 6": [
        "RepeatTest\n",
        {
          "repeat": 5,
          "macro": ["Neat\n",200]
        },
        {"text": "and done.\n"}
      ]
    },
    {
      "Test 7": [
        "RepeatHoldTest\n",
        {
          "repeatHold": true,
          "macro": ["Neat\n",100]
        },
        {
          "text": "and done.\n"
        }
      ]
    }
  ]
}
```


### Macro commands

* `text`
  * `{text:string}` - writes the given string.
  * `{text:string,delay:number}` - writes the given string with the given delay between each character.
* `delay`:`{delay:number}` - delays the macro run by the given amount of time (in milliseconds).
* `wait`
  * `{wait:true}` - waits for a '>' key press on the arduino before continuing running.
  * `{wait:number}` - waits for a '>' key press on the arduino or for the given amount of time (in milliseconds) to pass, whichever is first, before continuing running.
* `click`:`{click:Key|Key[]}` - presses and releases all given keys.
* `press`:`{press:Key|Key[]}` - presses all given keys.
* `release`:`{release:Key|Key[]}` - releases all given keys.
* `mouseClick`:`{mouseClick:MouseKey|MouseKey[]}` - presses and releases all given mouse keys.
* `mousePress`:`{mousePress:MouseKey|MouseKey[]}` - presses all given mouse keys.
* `mouseRelease`:`{mouseRelease:MouseKey|MouseKey[]}` - releases all given mouse keys.
* `mouseMove`:`{mouseMove:[number,number]}` - moves the mouse the given \[x,y\] amount.
* `mouseScroll`:`{mouseScroll:number}` - scrolls the mouse the given amount.
* `repeat`
  * `{repeat:number,macro:MacroStep|MacroStep[]}` -  Repeats the given macro the desired amount of times.
  * `{repeat:"hold",macro:MacroStep|MacroStep[]}` -  Waits for '>' to be pressed and repeats the given macro while is being pressed.
  * `{repeat:"click",macro:MacroStep|MacroStep[]}` -  Repeats the given macro until the '>' is pressed.
* `code`:`{code:string|string[]}` - inserts the given string or string array directly as code on the generated file.

//TODO Explain the possible key inputs