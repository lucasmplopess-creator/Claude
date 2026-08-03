function quotedPart(s) {
  const m = String(s).match(/^"([^"]+)"/);
  return m ? m[1] : String(s).split(",")[0].replace(/^"|"$/g, "");
}

function vocabText(theme) {
  const lines = [`Theme ${theme.num}. ${theme.titleEn}. Vocabulary.`];
  for (const [word, , example] of theme.vocab) {
    lines.push(`${word}.`);
    lines.push(`${example}`);
  }
  return lines.join("\n");
}

function readingText(theme) {
  const lines = [`Theme ${theme.num}. ${theme.readingTitle}.`];
  lines.push(...theme.readingParagraphs);
  return lines.join("\n");
}

function dialogueText(theme) {
  const lines = [`Theme ${theme.num}. ${theme.titleEn}. Listening dialogue.`];
  for (const l of theme.audioScript) {
    lines.push(String(l).replace(/^"|"$/g, ""));
  }
  return lines.join("\n");
}

function expressionsText(theme) {
  const lines = [`Theme ${theme.num}. Useful expressions.`];
  for (const e of theme.expressions) {
    lines.push(quotedPart(e));
  }
  return lines.join("\n");
}

const AUDIO_BASE_URL = "https://raw.githubusercontent.com/lucasmplopess-creator/Claude/claude/ebook-english-speaking-practice-klm091/ebook";

function audioBase(theme) {
  return theme.audioFile.replace(/^audio\//, "").replace(/\.mp3$/, "");
}

function variant(file, text) {
  return { file, text, url: `${AUDIO_BASE_URL}/${file}` };
}

function audioVariants(theme) {
  const base = audioBase(theme);
  return {
    vocabulario: variant(`audio/${base}-vocabulario.mp3`, vocabText(theme)),
    leitura: variant(`audio/${base}-leitura.mp3`, readingText(theme)),
    dialogo: variant(`audio/${base}.mp3`, dialogueText(theme)),
    expressoes: variant(`audio/${base}-expressoes.mp3`, expressionsText(theme)),
  };
}

module.exports = { audioVariants, audioBase, AUDIO_BASE_URL };
