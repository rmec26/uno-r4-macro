import { existsSync, readFileSync, statSync, writeFileSync } from "fs"
import { sep } from "path";

const inputPath = process.argv[2];

if (!inputPath) {
  console.log("No input path given to generate.");
  process.exit(1);
} else if (!existsSync(inputPath)) {
  console.log("Given input path does not exist.");
  process.exit(2);
} else if (!statSync(inputPath).isFile()) {
  console.log("Given input path is not a file.");
  process.exit(3);
}

const keyStartMap = {
  "KEY_L_": "KEY_LEFT_",
  "KEY_LT_": "KEY_LEFT_",
  "KEY_R_": "KEY_RIGHT_",
  "KEY_RT_": "KEY_RIGHT_",
  "KEY_NUM_": "KEY_KP_",
  "KEY_NUM_PAD_": "KEY_KP_",
  "KEY_NUMPAD_": "KEY_KP_",
}

const keyEndMap = {
  "OPTION": "ALT",
  "OPT": "ALT",
  "CONTROL": "CTRL",
  "WIN": "GUI",
  "WINDOWS": "GUI",
  "COMMAND": "GUI",
  "COM": "GUI",
  "SUPER": "GUI"
}

const keyMap = {
  "KEY_ALT": "KEY_LEFT_ALT",
  "KEY_SHIFT": "KEY_LEFT_SHIFT",
  "KEY_CTRL": "KEY_LEFT_CTRL",
  "KEY_GUI": "KEY_LEFT_GUI",
  "KEY_BS": "KEY_BACKSPACE",
  "KEY_CAPSLOCK": "KEY_CAPS_LOCK",
  "KEY_CL": "KEY_CAPS_LOCK",
  "KEY_ALT_GR": "KEY_RIGHT_ALT",
  "KEY_ALTGR": "KEY_RIGHT_ALT",
  "KEY_INS": "KEY_INSERT",
  "KEY_DEL": "KEY_DELETE",
  "KEY_PG_UP": "KEY_PAGE_UP",
  "KEY_PGUP": "KEY_PAGE_UP",
  "KEY_PG_DOWN": "KEY_PAGE_DOWN",
  "KEY_PG_DN": "KEY_PAGE_DOWN",
  "KEY_PGDOWN": "KEY_PAGE_DOWN",
  "KEY_PGDN": "KEY_PAGE_DOWN",
  "KEY_UP": "KEY_UP_ARROW",
  "KEY_DOWN": "KEY_DOWN_ARROW",
  "KEY_DN": "KEY_DOWN_ARROW",
  "KEY_LEFT": "KEY_LEFT_ARROW",
  "KEY_LT": "KEY_LEFT_ARROW",
  "KEY_RIGHT": "KEY_RIGHT_ARROW",
  "KEY_RT": "KEY_RIGHT_ARROW",
  "KEY_ESCAPE": "KEY_ESC",
  "KEY_ENTER": "KEY_RETURN",
  "KEY_PRT_SC": "KEY_PRINT_SCREEN",
  "KEY_PRTSC": "KEY_PRINT_SCREEN",
  "KEY_PS": "KEY_PRINT_SCREEN",
  "KEY_SL": "KEY_SCROLL_LOCK",
  "KEY_NUMBER_LOCK": "KEY_NUM_LOCK",
  "KEY_NUMLOCK": "KEY_NUM_LOCK",
  "KEY_NL": "KEY_NUM_LOCK",
  "KEY_KP_/": "KEY_KP_SLASH",
  "KEY_KP_*": "KEY_KP_ASTERISK",
  "KEY_KP_-": "KEY_KP_MINUS",
  "KEY_KP_+": "KEY_KP_PLUS",
}

const processKeyInput = (input) => {
  if (typeof input === "string" && input.length) {
    if (input.length == 1) {
      return `'${input}'`
    }
    let value = input.toUpperCase();
    if (!value.startsWith("KEY_")) {
      value = "KEY_" + value;
    }
    for (const [k, v] of Object.entries(keyStartMap)) {
      if (value.startsWith(k)) {
        value = value.replace(k, v);
        break;
      }
    }
    for (const [k, v] of Object.entries(keyEndMap)) {
      if (value.endsWith(k)) {
        value = value.replace(k, v);
        break;
      }
    }
    if (keyMap[value]) {
      value = keyMap[value];
    }
    return value;
  }
  return null;
}

const processAllKeysInput = (input) => {
  if (input) {
    if (!(input instanceof Array)) {
      input = [input];
    }
    input = input.map(key => processKeyInput(key)).filter(Boolean);
    if (input.length > 0) {
      return input;
    }
  }
  return null;
}

const mouseKeyMap = {
  "MOUSE_LT": "MOUSE_LEFT",
  "MOUSE_L": "MOUSE_LEFT",
  "MOUSE_RT": "MOUSE_RIGHT",
  "MOUSE_R": "MOUSE_RIGHT",
  "MOUSE_MID": "MOUSE_MIDDLE",
  "MOUSE_MD": "MOUSE_MIDDLE",
  "MOUSE_M": "MOUSE_MIDDLE",
}

const processMouseKeyInput = (input) => {
  if (typeof input === "string" && input.length) {
    if (input.length == 1) {
      return `'${input}'`
    }
    let value = input.toUpperCase();
    if (!value.startsWith("MOUSE_")) {
      value = "MOUSE_" + value;
    }
    if (mouseKeyMap[value]) {
      value = mouseKeyMap[value];
    }
    return value;
  }
  return null;
}

const processAllMouseKeysInput = (input) => {
  if (input) {
    if (!(input instanceof Array)) {
      input = [input];
    }
    input = input.map(key => processMouseKeyInput(key)).filter(Boolean);
    if (input.length > 0) {
      return input;
    }
  }
  return null;
}

const relative = (...parts) => { parts.unshift(import.meta.dirname); return parts.join(sep) };

const checkAndProcessText = (input) => input && typeof input.text === "string" && input.text.length > 0 ? { text: input.text } : null;
const checkAndProcessDelay = (input) => input && typeof input.delay === "number" && input.delay > 0 ? { delay: Math.trunc(input.delay) } : null;
const checkAndProcessWait = (input) => {
  if (input) {
    if (input.wait === true) {
      return { wait: true };
    }
    if (typeof input.wait === "number" && input.wait > 0) {
      return { waitTimeout: Math.trunc(input.wait) }
    }
  }
  return null;
};

const checkAndProcessClick = (input) => {
  if (input && input.click) {
    let keys = processAllKeysInput(input.click);
    if (keys) {
      return { click: keys };
    }
  }
  return null;
}

const checkAndProcessPress = (input) => {
  if (input && input.press) {
    let keys = processAllKeysInput(input.press);
    if (keys) {
      return { press: keys };
    }
  }
  return null;
}

const checkAndProcessRelease = (input) => {
  if (input && input.release) {
    let keys = processAllKeysInput(input.release);
    if (keys) {
      return { release: keys };
    }
  }
  return null;
}

const checkAndProcessMouseClick = (input) => {
  if (input && input.mouseClick) {
    let keys = processAllMouseKeysInput(input.mouseClick);
    if (keys) {
      return { mouseClick: keys };
    }
  }
  return null;
}

const checkAndProcessMousePress = (input) => {
  if (input && input.mousePress) {
    let keys = processAllMouseKeysInput(input.mousePress);
    if (keys) {
      return { mousePress: keys };
    }
  }
  return null;
}

const checkAndProcessMouseRelease = (input) => {
  if (input && input.mouseRelease) {
    let keys = processAllMouseKeysInput(input.mouseRelease);
    if (keys) {
      return { mouseRelease: keys };
    }
  }
  return null;
}

const checkAndProcessMouseMove = (input) => {
  if (input && (input.mouseMove instanceof Array) && input.mouseMove.length == 2 && typeof input.mouseMove[0] == "number" && typeof input.mouseMove[1] == "number") {
    return { mouseMove: [Math.trunc(input.mouseMove[0]), Math.trunc(input.mouseMove[1])] };
  }
  return null;
}

const checkAndProcessMouseScroll = (input) => {
  if (input && typeof input.mouseScroll == "number" && input.mouseScroll != 0) {
    return { mouseScroll: Math.trunc(input.mouseScroll) };
  }
  return null;
}

const checkAndProcessRepeat = (input) => {
  if (input && input.macro) {
    if (typeof input.repeat === "number" && input.repeat > 0) {
      return { repeat: input.repeat, macro: processMacro(input.macro) };
    } else if (typeof input.repeat === "string") {
      switch (input.repeat.toLowerCase()) {
        case "hold":
          return { repeatHold: true, macro: processMacro(input.macro) };
        case "click":
          return { repeatUntilClick: true, macro: processMacro(input.macro) };
      }
    }
  }
  return null;
}

const checkAndProcessCode = (input) => {
  if (input && input.code) {
    if (input.code instanceof Array) {
      input.code = input.code.map(line => line.toString()).filter(Boolean).join("\n");
    }
    if (typeof input.code === "string" && input.code.length > 0) {
      return { code: input.code };
    }
  }
  return null;
}

const allProcessors = [
  checkAndProcessText,
  checkAndProcessDelay,
  checkAndProcessWait,
  checkAndProcessClick,
  checkAndProcessPress,
  checkAndProcessRelease,
  checkAndProcessMouseClick,
  checkAndProcessMousePress,
  checkAndProcessMouseRelease,
  checkAndProcessMouseMove,
  checkAndProcessMouseScroll,
  checkAndProcessRepeat,
  checkAndProcessCode,
];

const checkAndProcessAll = (input) => {
  let result = null;
  for (let process of allProcessors) {
    result = process(input);
    if (result) {
      break;
    }
  }
  return result;
}

const processMacro = (macro) => {
  if (!(macro instanceof Array)) {
    macro = [macro];
  }
  return macro.map(input => processStep(input)).filter(Boolean);
};

const processStep = (input) => {
  let result = null;
  switch (typeof input) {
    case "string":
      result = checkAndProcessText({ text: input })
      break;
    case "number":
      result = checkAndProcessDelay({ delay: input })
      break;
    case "object":
      result = checkAndProcessAll(input);
  }
  return result;
}

const inputJson = JSON.parse(readFileSync(inputPath).toString());

let entries = inputJson.macros.map(entry => {
  let [name, macro] = Object.entries(entry)[0];
  return { name, macro: processMacro(macro) };
});

const generateDefine = () => `#define MAX_ENTRIES ${entries.length}`

const generateStep = (input, level = 0) => {
  if (input.text) {
    return `        Keyboard.print(${JSON.stringify(input.text)});`
  }
  if (input.delay) {
    return `        delay(${input.delay});`
  }
  if (input.wait) {
    return `        waitForAnyKey();`
  }
  if (input.waitTimeout) {
    return `        waitForAnyKey(${input.waitTimeout});`
  }
  if (input.click) {
    return `${input.click.map(key => `        Keyboard.press(${key});`).join("\n")}\n${input.click.map(key => `        Keyboard.release(${key});`).join("\n")}`
  }
  if (input.press) {
    return input.press.map(key => `        Keyboard.press(${key});`).join("\n");
  }
  if (input.release) {
    return input.release.map(key => `        Keyboard.release(${key});`).join("\n");
  }
  if (input.mouseClick) {
    return `${input.mouseClick.map(key => `        Mouse.press(${key});`).join("\n")}\n${input.mouseClick.map(key => `        Mouse.release(${key});`).join("\n")}`
  }
  if (input.mousePress) {
    return input.mousePress.map(key => `        Mouse.press(${key});`).join("\n");
  }
  if (input.mouseRelease) {
    return input.mouseRelease.map(key => `        Mouse.release(${key});`).join("\n");
  }
  if (input.mouseMove) {
    return `        Mouse.move(${input.mouseMove});`
  }
  if (input.mouseScroll) {
    return `        Mouse.move(0,0,${input.mouseScroll});`
  }
  if (input.repeat) {
    return `        for(int i${level}=0;i${level}<${input.repeat};i${level}++){\n${input.macro.map(step => generateStep(step, level + 1)).join("\n")}\n      }`
  }
  if (input.repeatHold) {
    return `        printMenuBottom("Hold ");
        lcd.write(byte(RIGHT_ARROW));
        do {
          key = readKey();
        } while (key == NONE);
        printMenuBottom("Release ");
        lcd.write(byte(RIGHT_ARROW));
        while (key == RIGHT) {
${input.macro.map(step => generateStep(step, level)).join("\n")}
          key = readKey();
        };
        printMenuBottom("Running");
        while (key != NONE) {
          key = readKey();
        };`
  }
  if (input.repeatUntilClick) {
    return `        printMenuBottom("Stop with ");
        lcd.write(byte(RIGHT_ARROW));
        do {
${input.macro.map(step => generateStep(step, level)).join("\n")}
          key = readKey();
        } while (key != RIGHT);
        printMenuBottom("Release ");
        lcd.write(byte(RIGHT_ARROW));
        while (key != NONE) {
          key = readKey();
        };
        printMenuBottom("Running");`
  }
  if (input.code) {
    return "        " + input.code.replaceAll(/\n/gm, "\n        ");
  }
  throw new Error("Unable to generate step: " + JSON.stringify(input));
}

const generateNameCases = () => entries.map(({ name }, i) => `    case ${i}:
      printMenuTop(${JSON.stringify(name)});
      printMenuBottom("Run");
      lcd.write(byte(RIGHT_ARROW));
      break;`).join("\n");

const generateSelectionCases = () => entries.map(({ macro }, i) => `    case ${i}:
      {
${macro.map(step => generateStep(step)).join("\n")}
        break;
      }`).join("\n");

const generateStartMessage = () => {
  let message = typeof inputJson.startMessage == "string" ? inputJson.startMessage : "Uno R4 Macro";
  if (message.length < 16) {
    message = "".padEnd((16 - (message.length % 2 ? message.length + 1 : message.length)) / 2) + message;
  }
  return `printTop(${JSON.stringify(message)});`;
}

let baseFile = readFileSync(relative("generate", "base.ino")).toString();

writeFileSync(relative("uno-r4-macro.ino"), baseFile.replaceAll(/ *\/\/\{\{(.+)\}\}/g, (_, id) => {
  let generatedText;
  switch (id) {
    case "DEFINE":
      generatedText = generateDefine();
      break;
    case "PRINT_SELECTION":
      generatedText = generateNameCases();
      break;
    case "RUN_SELECTION":
      generatedText = generateSelectionCases();
      break;
    case "START_MESSAGE":
      generatedText = generateStartMessage();
      break;
    default:
      return `//{{${id}}}`;
  }
  return `//{{${id}_START}}\n${generatedText}\n//{{${id}_END}}`;
}));
