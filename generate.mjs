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

const inputJson = JSON.parse(readFileSync(inputPath).toString());

let entries = inputJson.macros.map(entry => {
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

//TODO

//Force a max size on the written text or make the menu be scrollable
//add 'keys' to define a specific key press
//add 'delaytext' to write some text with a certain delay
//add 'time' to show and write the current time of the macropad