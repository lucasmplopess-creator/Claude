const palette = require("./palette");

function esc(s) {
  return String(s);
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

function renderChapterHtml(theme, guide, criteria) {
  const numStr = String(theme.num).padStart(2, "0");
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Tema ${theme.num} — ${esc(theme.titleEn)}</title>
<style>
  @page {
    size: A4;
    margin: 2.2cm 2cm 2.4cm 2cm;
    @top-right { content: "English Speaking Practice — Nação Fluente"; font-size: 8pt; color: #${palette.lightGrey}; font-family: 'Helvetica', Arial, sans-serif; }
    @bottom-center { content: "Bloco ${theme.block} — ${esc(theme.blockName)}   |   Página " counter(page); font-size: 8pt; color: #${palette.lightGrey}; font-family: 'Helvetica', Arial, sans-serif; }
  }
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica', Arial, sans-serif; color: #${palette.grey}; font-size: 10.5pt; line-height: 1.5; }
  .cover { background: #${palette.cover}; color: #fff; padding: 22px 24px; border-radius: 4px; margin-bottom: 14px; }
  .cover .eyebrow { color: #8fc4ec; font-weight: bold; font-size: 9.5pt; letter-spacing: 0.5px; margin-bottom: 6px; }
  .cover h1 { font-size: 22pt; margin: 0 0 6px 0; color: #fff; }
  .cover .subtitle { color: #C9D6E3; font-style: italic; font-size: 12pt; margin: 0; }
  .meta { margin: 10px 0 14px 0; font-size: 10.5pt; }
  .meta b { color: #${palette.cover}; }
  .intro { margin-bottom: 6px; }
  h2.step { color: #fff; padding: 8px 12px; font-size: 12.5pt; margin: 22px 0 10px 0; border-radius: 3px; }
  h2.step .tag { background: rgba(255,255,255,0.22); padding: 2px 8px; border-radius: 3px; font-size: 9.5pt; margin-right: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 14px 0; font-size: 9.8pt; }
  th { color: #fff; text-align: left; padding: 6px 8px; }
  td { padding: 6px 8px; border-bottom: 1px solid #E3E9EF; vertical-align: top; }
  .example { font-style: italic; }
  .notebox { border-radius: 4px; padding: 10px 14px; margin: 10px 0 16px 0; border: 1px solid; }
  .notebox .title { font-weight: bold; margin-bottom: 6px; }
  .notebox p { margin: 3px 0; }
  ol, ul { margin: 6px 0 14px 0; padding-left: 20px; }
  ol li, ul li { margin-bottom: 7px; }
  .lines { border-bottom: 1px solid #C9D6E3; height: 22px; margin-bottom: 6px; }
  .expr-list { list-style: none; padding-left: 0; margin: 6px 0 14px 0; }
  .expr-list li { margin-bottom: 6px; padding-left: 14px; position: relative; }
  .gabarito { font-style: italic; color: #${palette.cover}; margin-top: -6px; }
  .footer-note { text-align: center; font-weight: bold; color: #${palette.cover}; margin-top: 18px; font-size: 11pt; }

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
</style>
</head>
<body>

<div class="cover">
  <div class="eyebrow">TEMA ${theme.num} &nbsp;·&nbsp; BLOCO ${theme.block} — ${esc(theme.blockName).toUpperCase()}</div>
  <h1>${esc(theme.titleEn)}</h1>
  <p class="subtitle">${esc(theme.titlePt)}</p>
</div>

<div class="meta"><b>Tempo estimado:</b> ${esc(theme.estimatedTime)}</div>
<p class="intro">${esc(theme.intro)}</p>

<div class="s1">
<h2 class="step"><span class="tag">ETAPA 1</span>Vocabulário Contextualizado</h2>
<p>Estas palavras e expressões vão te ajudar a se expressar sobre este tema com mais precisão e naturalidade.</p>
<table>
<tr><th>Word / Expression</th><th>Tradução</th><th>Example Sentence</th></tr>
${rows(theme.vocab)}
</table>
</div>

<div class="s2">
<h2 class="step"><span class="tag">ETAPA 2</span>Leitura com Orientação de Estudo</h2>
<div class="notebox">
  <div class="title">Como ler este texto</div>
  ${guide.map(g => `<p>${esc(g)}</p>`).join("")}
</div>
<p><b>"${esc(theme.readingTitle)}"</b></p>
${theme.readingParagraphs.map(p => `<p>${esc(p)}</p>`).join("")}
</div>

<div class="s3">
<h2 class="step"><span class="tag">ETAPA 3</span>Listening com Suporte em Áudio e Vídeo</h2>
<p>Ouça o áudio deste tema (arquivo disponível para download na plataforma: <i>${esc(theme.audioFile)}</i>) com o roteiro abaixo. Primeiro sem ler, depois acompanhando o texto.</p>
<div class="notebox">
  <div class="title">Roteiro do áudio (Audio Script)</div>
  ${theme.audioScript.map(l => `<p>${esc(l)}</p>`).join("")}
</div>
<p>${esc(theme.audioFollowup)}</p>
</div>

<div class="s4">
<h2 class="step"><span class="tag">ETAPA 4</span>Writing como Preparação para a Fala</h2>
<p>Antes de falar, escreva. Use as perguntas abaixo como guia e escreva de 4 a 6 frases — não precisa ser perfeito, precisa existir no papel primeiro.</p>
${ol(theme.writingQuestions)}
<p>Espaço para escrever:</p>
${lines(6)}
</div>

<div class="s5">
<h2 class="step"><span class="tag">ETAPA 5</span>Gramática de Apoio Aplicada à Conversação</h2>
<p>${esc(theme.grammarIntro)}</p>
<table>
<tr><th>Estrutura</th><th>Exemplo (EN)</th><th>Tradução (PT)</th></tr>
${grammarRows(theme.grammarRows)}
</table>
<p>${esc(theme.grammarTip)}</p>
</div>

<div class="s6">
<h2 class="step"><span class="tag">ETAPA 6</span>Speaking — Perguntas Abertas</h2>
<p>Responda em voz alta, gravando se possível. Não vale responder em uma frase só — use o que você escreveu na Etapa 4 como base, mas fale livremente.</p>
${ol(theme.speakingQuestions)}
<p><b>Expressões úteis para esta conversa:</b></p>
${exprList(theme.expressions)}
</div>

<div class="sx">
<h2 class="step"><span class="tag">EXERCÍCIO</span>Complete com a Palavra Certa</h2>
<p>Complete cada frase com uma palavra ou expressão da Etapa 1. Gabarito ao final desta seção.</p>
${ol(theme.exerciseSentences)}
<p class="gabarito">${esc(theme.exerciseAnswers)}</p>
</div>

<div class="s7">
<h2 class="step"><span class="tag">ETAPA 7</span>Autoavaliação de Performance</h2>
<p>Antes de marcar este tema como concluído, avalie honestamente como foi sua prática.</p>
<table>
<tr><th>Critério</th><th>Como foi?</th><th>Nota (1–5)</th></tr>
${criteria.map(c => `<tr><td>${esc(c)}</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join("")}
</table>
<p>O que travou mais nesta conversa? O que você quer treinar de novo antes de seguir para o próximo tema?</p>
${lines(3)}
</div>

<p class="footer-note">${theme.num >= 104 ? "Parabéns — você concluiu os 104 temas do English Speaking Practice. Volte a qualquer tema sempre que quiser revisar." : `Marque este tema como concluído no seu Painel de Evolução e siga para o Tema ${theme.num + 1}.`}</p>

</body>
</html>
`;
}

module.exports = { renderChapterHtml };
