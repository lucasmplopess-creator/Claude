const fs = require("fs");
const path = require("path");
const { Packer } = require("docx");
const { buildChapterDoc } = require("./lib/render-docx");
const { renderChapterHtml } = require("./lib/render-html");
const { themes, READING_GUIDE, SELF_ASSESS_CRITERIA } = require("./data/bloco1");

const OUT = path.join(__dirname, "..", "output");
const HTML_OUT = path.join(OUT, "html");

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  for (const theme of themes) {
    const numStr = String(theme.num).padStart(2, "0");
    const base = `Tema-${numStr}-${slugify(theme.titleEn).split("-").slice(0, 5).join("-")}`;

    const doc = buildChapterDoc(theme, READING_GUIDE, SELF_ASSESS_CRITERIA);
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(OUT, `${base}.docx`), buffer);

    const html = renderChapterHtml(theme, READING_GUIDE, SELF_ASSESS_CRITERIA);
    fs.writeFileSync(path.join(HTML_OUT, `${base}.html`), html);

    console.log("built", base);
  }
}

main();
