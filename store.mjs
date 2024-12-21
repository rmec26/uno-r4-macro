import { readFileSync, writeFileSync } from "fs"
import { sep } from "path";

const relative = (...parts) => { parts.unshift(import.meta.dirname); return parts.join(sep) };

writeFileSync(relative("generate", "base.ino"), readFileSync(relative("uno-r4-macro.ino")).toString().replaceAll(/^ *\/\/\{\{(.+)_START\}\}\n(.|\n)*\/\/\{\{\1_END\}\} *$/gm, (_, id) => {
  return `//{{${id}}}`;
}));
