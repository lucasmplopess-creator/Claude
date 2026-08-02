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

function audioBase(theme) {
  return theme.audioFile.replace(/^audio\//, "").replace(/\.mp3$/, "");
}

function audioVariants(theme) {
  const base = audioBase(theme);
  return {
    vocabulario: { file: `audio/${base}-vocabulario.mp3`, text: vocabText(theme) },
    leitura: { file: `audio/${base}-leitura.mp3`, text: readingText(theme) },
    dialogo: { file: `audio/${base}.mp3`, text: dialogueText(theme) },
    expressoes: { file: `audio/${base}-expressoes.mp3`, text: expressionsText(theme) },
  };
}

module.exports = { audioVariants, audioBase };
