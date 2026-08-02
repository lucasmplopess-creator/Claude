const path = require("path");
const palette = require("./palette");
const { STEP_EN, BLOCK_EN } = require("./translations");

function esc(s) {
  return String(s);
}

function iconPath(blockNum) {
  return "file://" + path.join(__dirname, "..", "..", "assets", "icons", `block-${blockNum}.png`);
}

function rows(vocab) {
  return vocab.map(([w, t, e]) => `
    <tr><td><b>${esc(w)}</b></td><td>${esc(t)}</td><td class="example">${esc(e)}</td></tr>`).join("");
}

function grammarRows(rowsData) {
  return rowsData.map(([structure, example, translation]) => `
    <tr><td><b>${structure.split("\n")[0]}</b>${structure.includes("\n") ? "<br>" + structure.split("\n")[1] : ""}</td><td class="example">${esc(example)}</td><td>${esc(translation)}</td></tr>`).join("");
}

function ol(items) {
  return `<ol>${items.map(i => `<li>${esc(i)}</li>`).join("")}</ol>`;
}

function exprList(items) {
  return `<ul class="expr-list">${items.map(i => `<li>${esc(i)}</li>`).join("")}</ul>`;
}

function lines(n) {
  return Array.from({ length: n }).map(() => `<div class="lines"></div>`).join("");
}

function stepHeader(cls, tag, pt, en) {
  return `<h2 class="step ${cls}"><span class="tag">${tag}</span><span class="stitle"><span class="pt">${esc(pt)}</span><span class="en">${esc(en)}</span></span></h2>`;
}

function chapterCss(pageRule) {
  return `
  ${pageRule}
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica', Arial, sans-serif; color: #${palette.grey}; font-size: 10.5pt; line-height: 1.42; }
  .cover { background: #${palette.cover}; color: #fff; padding: 16px 18px; border-radius: 4px; margin-bottom: 10px; display: flex; align-items: center; gap: 16px; }
  .cover .icon { width: 54px; height: 54px; flex: none; opacity: 0.92; }
  .cover .eyebrow { color: #8fc4ec; font-weight: bold; font-size: 9pt; letter-spacing: 0.4px; margin-bottom: 4px; }
  .cover .eyebrow .en { display: block; color: #6f93ad; font-weight: normal; font-style: italic; font-size: 7.5pt; letter-spacing: 0.2px; margin-top: 1px; }
  .cover h1 { font-size: 19pt; margin: 0 0 3px 0; color: #fff; line-height: 1.12; }
  .cover .subtitle { color: #C9D6E3; font-style: italic; font-size: 10.5pt; margin: 0; }
  .meta { margin: 8px 0 10px 0; font-size: 10pt; }
  .meta b { color: #${palette.cover}; }
  .intro { margin-bottom: 4px; }
  p { margin: 0 0 8px 0; }
  h2.step { color: #fff; padding: 6px 10px; font-size: 11.5pt; margin: 16px 0 8px 0; border-radius: 3px; display: flex; align-items: center; }
  h2.step .tag { background: rgba(255,255,255,0.22); padding: 2px 7px; border-radius: 3px; font-size: 8.5pt; margin-right: 8px; flex: none; }
  h2.step .stitle { display: flex; flex-direction: column; line-height: 1.18; }
  h2.step .stitle .en { font-weight: normal; font-style: italic; font-size: 8pt; opacity: 0.82; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 10px 0; font-size: 9.5pt; }
  th { color: #fff; text-align: left; padding: 5px 7px; }
  td { padding: 5px 7px; border-bottom: 1px solid #E3E9EF; vertical-align: top; }
  .example { font-style: italic; }
  .notebox { border-radius: 4px; padding: 8px 12px; margin: 6px 0 10px 0; border: 1px solid; }
  .notebox .title { font-weight: bold; margin-bottom: 4px; }
  .notebox p { margin: 2px 0; }
  ol, ul { margin: 4px 0 10px 0; padding-left: 19px; }
  ol li, ul li { margin-bottom: 5px; }
  .lines { border-bottom: 1px solid #C9D6E3; height: 17px; margin-bottom: 4px; }
  .expr-list { list-style: none; padding-left: 0; margin: 4px 0 10px 0; }
  .expr-list li { margin-bottom: 4px; padding-left: 14px; position: relative; }
  .gabarito { font-style: italic; color: #${palette.cover}; margin-top: -4px; }
  .footer-note { text-align: center; font-weight: bold; color: #${palette.cover}; margin-top: 12px; font-size: 10.5pt; }

  .s1 h2, .s1 .tag { background: #${palette.step1}; }
  .s1 th { background: #${palette.step1}; }
  .s1 .notebox { background: #EAF1F8; border-color: #${palette.step1}; }
  .s1 .notebox .title { color: #${palette.step1}; }
  .s1 tr:nth-child(even) td { background: #F5F9FC; }

  .s2 h2, .s2 .tag { background: #${palette.step2}; }
  .s2 .notebox { background: #E9F5F1; border-color: #${palette.step2}; }
  .s2 .notebox .title { color: #${palette.step2}; }

  .s3 h2, .s3 .tag { background: #${palette.step3}; }
  .s3 .notebox { background: #F1ECF7; border-color: #${palette.step3}; }
  .s3 .notebox .title { color: #${palette.step3}; }

  .s4 h2, .s4 .tag { background: #${palette.step4}; }
  .s4 .lines { border-bottom-color: #E6C79C; }

  .s5 h2, .s5 .tag { background: #${palette.step5}; }
  .s5 th { background: #${palette.step5}; }
  .s5 tr:nth-child(even) td { background: #FBF2F0; }

  .s6 h2, .s6 .tag { background: #${palette.step6}; }
  .s6 .expr-list li:before { content: "•"; color: #${palette.step6}; position: absolute; left: 0; font-weight: bold; }

  .sx h2, .sx .tag { background: #${palette.exercise}; }
  .sx .gabarito { color: #${palette.exercise}; }

  .s7 h2, .s7 .tag { background: #${palette.step7}; }
  .s7 th { background: #${palette.step7}; }
  `;
}

function renderChapterBody(theme, guide, criteria, opts = {}) {
  const blockEn = BLOCK_EN[theme.block] || "";
  return `
<div class="chapter" id="tema-${theme.num}"${opts.pageBreak === false ? "" : ' style="page-break-before: always;"'}>
<div class="cover">
  <img class="icon" src="${iconPath(theme.block)}">
  <div>
    <div class="eyebrow">TEMA ${theme.num} &nbsp;·&nbsp; BLOCO ${theme.block} &nbsp;·&nbsp; ${esc(theme.blockName).toUpperCase()}<span class="en">THEME ${theme.num} · BLOCK ${theme.block} · ${blockEn.toUpperCase()}</span></div>
    <h1>${esc(theme.titleEn)}</h1>
    <p class="subtitle">${esc(theme.titlePt)}</p>
  </div>
</div>

<div class="meta"><b>Tempo estimado:</b> ${esc(theme.estimatedTime)}</div>
<p class="intro">${esc(theme.intro)}</p>

<div class="s1">
${stepHeader("", "ETAPA 1", "Vocabulário Contextualizado", STEP_EN[1])}
<p>Estas palavras e expressões vão te ajudar a se expressar sobre este tema com mais precisão e naturalidade.</p>
<table>
<tr><th>Word / Expression</th><th>Tradução</th><th>Example Sentence</th></tr>
${rows(theme.vocab)}
</table>
</div>

<div class="s2">
${stepHeader("", "ETAPA 2", "Leitura com Orientação de Estudo", STEP_EN[2])}
<div class="notebox">
  <div class="title">Como ler este texto</div>
  ${guide.map(g => `<p>${esc(g)}</p>`).join("")}
</div>
<p><b>"${esc(theme.readingTitle)}"</b></p>
${theme.readingParagraphs.map(p => `<p>${esc(p)}</p>`).join("")}
</div>

<div class="s3">
${stepHeader("", "ETAPA 3", "Listening com Suporte em Áudio e Vídeo", STEP_EN[3])}
<p>Ouça o áudio deste tema (arquivo disponível para download na plataforma: <i>${esc(theme.audioFile)}</i>) com o roteiro abaixo. Primeiro sem ler, depois acompanhando o texto.</p>
<div class="notebox">
  <div class="title">Roteiro do áudio (Audio Script)</div>
  ${theme.audioScript.map(l => `<p>${esc(l)}</p>`).join("")}
</div>
<p>${esc(theme.audioFollowup)}</p>
</div>

<div class="s4">
${stepHeader("", "ETAPA 4", "Writing como Preparação para a Fala", STEP_EN[4])}
<p>Antes de falar, escreva. Use as perguntas abaixo como guia e escreva de 4 a 6 frases: não precisa ser perfeito, precisa existir no papel primeiro.</p>
${ol(theme.writingQuestions)}
<p>Espaço para escrever:</p>
${lines(5)}
</div>

<div class="s5">
${stepHeader("", "ETAPA 5", "Gramática de Apoio Aplicada à Conversação", STEP_EN[5])}
<p>${esc(theme.grammarIntro)}</p>
<table>
<tr><th>Estrutura</th><th>Exemplo (EN)</th><th>Tradução (PT)</th></tr>
${grammarRows(theme.grammarRows)}
</table>
<p>${esc(theme.grammarTip)}</p>
</div>

<div class="s6">
${stepHeader("", "ETAPA 6", "Speaking: Perguntas Abertas", STEP_EN[6])}
<p>Responda em voz alta, gravando se possível. Não vale responder em uma frase só: use o que você escreveu na Etapa 4 como base, mas fale livremente.</p>
${ol(theme.speakingQuestions)}
<p><b>Expressões úteis para esta conversa:</b></p>
${exprList(theme.expressions)}
</div>

<div class="sx">
${stepHeader("", "EXERCÍCIO", "Complete com a Palavra Certa", STEP_EN.EX)}
<p>Complete cada frase com uma palavra ou expressão da Etapa 1. Gabarito ao final desta seção.</p>
${ol(theme.exerciseSentences)}
<p class="gabarito">${esc(theme.exerciseAnswers)}</p>
</div>

<div class="s7">
${stepHeader("", "ETAPA 7", "Autoavaliação de Performance", STEP_EN[7])}
<p>Antes de marcar este tema como concluído, avalie honestamente como foi sua prática.</p>
<table>
<tr><th>Critério</th><th>Como foi?</th><th>Nota (1-5)</th></tr>
${criteria.map(c => `<tr><td>${esc(c)}</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join("")}
</table>
<p>O que travou mais nesta conversa? O que você quer treinar de novo antes de seguir para o próximo tema?</p>
${lines(2)}
</div>

<p class="footer-note">${theme.num >= 104 ? "Parabéns! Você concluiu os 104 temas do English Speaking Practice. Volte a qualquer tema sempre que quiser revisar." : `Marque este tema como concluído no seu Painel de Evolução e siga para o Tema ${theme.num + 1}.`}</p>
</div>
`;
}

function renderChapterHtml(theme, guide, criteria) {
  const blockEn = BLOCK_EN[theme.block] || "";
  const pageRule = `
  @page {
    size: A4;
    margin: 1.9cm 2cm 2.1cm 2cm;
    @top-right { content: "English Speaking Practice"; font-size: 8pt; color: #${palette.lightGrey}; font-family: 'Helvetica', Arial, sans-serif; }
    @bottom-center { content: "Bloco ${theme.block} · ${esc(theme.blockName)} (${blockEn})   |   Página " counter(page); font-size: 7.5pt; color: #${palette.lightGrey}; font-family: 'Helvetica', Arial, sans-serif; }
  }`;
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Tema ${theme.num}: ${esc(theme.titleEn)}</title>
<style>${chapterCss(pageRule)}</style>
</head>
<body>
${renderChapterBody(theme, guide, criteria, { pageBreak: false })}
</body>
</html>
`;
}

module.exports = { renderChapterHtml, renderChapterBody, chapterCss, esc, iconPath };
