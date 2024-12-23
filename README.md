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
* `macros`:`macro[]` - Array containg the macro definitions available on the device.


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
    }
  ]
}
```


### Macro commands

* `text` - writes the given string.
* `delay` - delays the macro run by the given time amount (in milliseconds).
* `wait` - waits for a key press on the arduino before continuing running.
* `waitTimeout` - waits for a key press on the arduino or for the given amount of time to pass, whichever is first, before continuing running.