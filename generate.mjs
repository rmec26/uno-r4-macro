import { readFileSync, writeFileSync } from "fs"
import { sep } from "path";

const relative = (...parts) => { parts.unshift(import.meta.dirname); return parts.join(sep) };

const processInput = (input) => {
  switch (typeof input) {
    case "string":
      if (input.length > 0) {
        return { text: input };
      }
    case "number":
      if (input > 0) {
        return { delay: Math.trunc(input) };
      }
    case "object":
      if (typeof input.text === "string" && input.text.length > 0) {
        return { text: input.text };

      } else if (typeof input.delay === "number" && input.delay > 0) {
        return { delay: input.delay };
      }

  }
  return null;
}

let entries = JSON.parse(readFileSync(relative("input.json")).toString()).map(entry => {
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
}

const generateNameCases = () => entries.map(({ name }, i) => `    case ${i}:
      printMenuTop(${JSON.stringify(name)});
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

//Force a max size on the written text
//add modes
//add start mode
//add wait mode?
//add 'keys' to define a specific key press
//add 'wait' to wait for input on the arduino before running
//Consider interface change to make the arrows be at the start of the screen
//add 'delaytext' to write some text with a certain delay
//add 'time' to show and write the current time of the macropad
//check what is the best way to make the system be able to wait and continue a flow, probably when running a script enter a running mode and any input that has a wait uses a counter to set what state they are, and let the system return to it after the wait