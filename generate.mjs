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

const relative = (...parts) => { parts.unshift(import.meta.dirname); return parts.join(sep) };

const checkAndProcessText = (input) => input && typeof input.text === "string" && input.text.length > 0 ? { text: input.text } : null;
const checkAndProcessDelay = (input) => input && typeof input.delay === "number" && input.delay > 0 ? { delay: Math.trunc(input.delay) } : null;
const checkAndProcessWait = (input) => input && input.wait ? { wait: true } : null;
const checkAndProcessWaitTimeout = (input) => input && typeof input.waitTimeout === "number" && input.waitTimeout > 0 ? { waitTimeout: Math.trunc(input.waitTimeout) } : null;

const allProcessors = [
  checkAndProcessText,
  checkAndProcessDelay,
  checkAndProcessWait,
  checkAndProcessWaitTimeout,
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

const processInput = (input) => {
  let result = null;
  switch (typeof input) {
    case "string":
      result = checkAndProcessText({ text: input })
      break;
    case "number":
      result = checkAndProcessDelay({ text: input })
      break;
    case "object":
      result = checkAndProcessAll(input);
  }
  return result;
}

let entries = JSON.parse(readFileSync(inputPath).toString()).map(entry => {
  let [name, inputs] = Object.entries(entry)[0];
  if (!(inputs instanceof Array)) {
    inputs = [inputs];
  }
  return { name, input: inputs.map(input => processInput(input)).filter(Boolean) };
});

const generateDefine = () => `#define MAX_ENTRIES ${entries.length}`

const generateInput = (input) => {
  if (input.text) {
    return `      Keyboard.print(${JSON.stringify(input.text)});`
  }
  if (input.delay) {
    return `      delay(${input.delay});`
  }
  if (input.wait) {
    return `      waitForAnyKey();`
  }
  if (input.waitTimeout) {
    return `      waitForAnyKey(${input.waitTimeout});`
  }
}

const generateNameCases = () => entries.map(({ name }, i) => `    case ${i}:
      printMenuTop(${JSON.stringify(name)});
      printMenuBottom("Run");
      lcd.write(byte(RIGHT_ARROW));
      break;`).join("\n");

const generateSelectionCases = () => entries.map(({ input }, i) => `    case ${i}:
${input.map(input => generateInput(input)).join("\n")}
      break;`).join("\n");

let baseFile = readFileSync(relative("generate", "base.ino")).toString();

writeFileSync(relative("uno-r4-macro.ino"), baseFile.replaceAll(/ *\/\/\{\{(.+)\}\}/g, (_, id) => {
  switch (id) {
    case "DEFINE":
      return `//{{DEFINE_START}}\n${generateDefine()}\n//{{DEFINE_END}}`;
    case "PRINT_SELECTION":
      return `//{{PRINT_SELECTION_START}}\n${generateNameCases()}\n//{{PRINT_SELECTION_END}}`;
    case "RUN_SELECTION":
      return `//{{RUN_SELECTION_START}}\n${generateSelectionCases()}\n//{{RUN_SELECTION_END}}`;
    default:
      return `//{{${id}}}`;
  }
}));

//TODO

//Force a max size on the written text or make the menu be scrollable
//add 'keys' to define a specific key press
//add 'delaytext' to write some text with a certain delay
//add 'time' to show and write the current time of the macropad