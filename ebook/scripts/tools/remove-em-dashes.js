// Removes em-dashes from all bloco data files, replacing them with a comma.
// SAFE: only touches text within the immediate vicinity of the em-dash
// character itself — never runs a blind find/replace over generic quote or
// comma patterns, which would corrupt JS array/object syntax.
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const files = fs.readdirSync(dataDir).filter(f => /^bloco\d+\.js$/.test(f));

let totalReplacements = 0;

for (const file of files) {
  const full = path.join(dataDir, file);
  let content = fs.readFileSync(full, "utf8");
  const before = (content.match(/—/g) || []).length;

  // Match the em-dash plus any whitespace/comma immediately touching it on
  // either side, and collapse the whole thing to a single ", ".
  content = content.replace(/\s*,?\s*—\s*,?\s*/g, ", ");

  const after = (content.match(/—/g) || []).length;
  totalReplacements += before - after;

  fs.writeFileSync(full, content);
  console.log(file, `${before} -> ${after}`);
}

console.log("Total em-dashes removed:", totalReplacements);
