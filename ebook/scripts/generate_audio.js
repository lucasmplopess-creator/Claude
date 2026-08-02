const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { audioVariants } = require("./lib/audio-text");

const outDir = path.join(__dirname, "..", "audio");
fs.mkdirSync(outDir, { recursive: true });
const tmpDir = path.join(__dirname, "..", "output", "_audio_tmp");
fs.mkdirSync(tmpDir, { recursive: true });

let count = 0;
let skipped = 0;
const total = 104 * 4;
const startArg = parseInt(process.argv[2] || "1", 10);
const endArg = parseInt(process.argv[3] || "104", 10);

for (let b = 1; b <= 13; b++) {
  const { themes } = require(`./data/bloco${b}`);
  for (const theme of themes) {
    if (theme.num < startArg || theme.num > endArg) continue;
    const variants = audioVariants(theme);
    for (const [key, { file, text }] of Object.entries(variants)) {
      const mp3Path = path.join(__dirname, "..", file);
      if (fs.existsSync(mp3Path) && fs.statSync(mp3Path).size > 0) {
        skipped++;
        continue;
      }
      const txtPath = path.join(tmpDir, `t${theme.num}-${key}.txt`);
      const wavPath = path.join(tmpDir, `t${theme.num}-${key}.wav`);
      fs.writeFileSync(txtPath, text, "utf8");
      execFileSync("espeak-ng", ["-v", "en-us", "-s", "150", "-f", txtPath, "-w", wavPath], { stdio: "ignore" });
      execFileSync("lame", ["-q", "5", "--silent", wavPath, mp3Path], { stdio: "ignore" });
      fs.unlinkSync(txtPath);
      fs.unlinkSync(wavPath);
      count++;
      if (count % 20 === 0) console.log(`generated ${count} (skipped ${skipped}) ...`);
    }
  }
}
console.log(`done. generated ${count}, skipped ${skipped}, target total ${total}`);
