const fs = require("fs");
const path = require("path");
const { renderChapterBody, chapterCss, esc, iconPath } = require("./lib/render-html");
const { READING_GUIDE, SELF_ASSESS_CRITERIA } = require("./lib/constants");
const palette = require("./lib/palette");
const { BLOCK_EN } = require("./lib/translations");
const { CATEGORIES, ANNEX_NOTE_PT, ANNEX_NOTE_EN } = require("./lib/annex-data");

const BLOCK_TAGLINES = {
  1: "A base para qualquer conversa em inglês.",
  2: "Fale sobre sua trajetória com clareza e confiança.",
  3: "A linguagem de quem lidera pessoas em inglês.",
  4: "Construa e mantenha conexões profissionais reais.",
  5: "Defenda posições e feche acordos em inglês.",
  6: "Prepare-se para qualquer etapa do processo seletivo.",
  7: "Navegue temas sensíveis com precisão e respeito.",
  8: "Estruture ideias e fale em público com segurança.",
  9: "O vocabulário do mundo digital e da IA no trabalho.",
  10: "Fale de números, risco e estratégia com fluência.",
  11: "Do check-in ao jantar de negócios, em qualquer país.",
  12: "Conversas do dia a dia, com leveza e naturalidade.",
  13: "Encerre a jornada falando sobre quem você se tornou.",
};

const blocks = [];
for (let i = 1; i <= 13; i++) {
  const { themes } = require(`./data/bloco${i}`);
  blocks.push({ num: i, name: themes[0].blockName, nameEn: BLOCK_EN[i], tagline: BLOCK_TAGLINES[i], themes });
}

const masterCss = `
  @page {
    size: A4;
    margin: 1.9cm 2cm 2.1cm 2cm;
    @top-right { content: "English Speaking Practice"; font-size: 8pt; color: #${palette.lightGrey}; font-family: 'Helvetica', Arial, sans-serif; }
    @bottom-center { content: "Página " counter(page); font-size: 8pt; color: #${palette.lightGrey}; font-family: 'Helvetica', Arial, sans-serif; }
  }
  @page cover { margin: 0; @top-right { content: none; } @bottom-center { content: none; } }
  @page nofooter { margin: 1.9cm 2cm 2.1cm 2cm; @bottom-center { content: none; } }
  @page divider { margin: 0; @top-right { content: none; } @bottom-center { content: none; } }

  .cover-page { page: cover; margin: 0; padding: 0; width: 21cm; height: 29.7cm; overflow: hidden; }
  .cover-page img { width: 100%; height: 100%; display: block; object-fit: cover; }

  .fm { page: nofooter; }
  .fm h1.booktitle { font-size: 28pt; color: #${palette.cover}; margin: 0 0 2px 0; }
  .fm .subtitle-line { font-size: 13pt; color: #${palette.step6}; font-style: italic; margin-bottom: 18px; }
  .fm h2 { background: #${palette.cover}; color: #fff; padding: 6px 12px; font-size: 12pt; border-radius: 3px; margin: 16px 0 4px 0; }
  .fm h2 .en { display: block; font-weight: normal; font-style: italic; font-size: 8.5pt; color: #8fc4ec; margin-top: 1px; }
  .fm p { margin: 0 0 7px 0; }
  .fm ul { margin: 4px 0 10px 0; padding-left: 20px; }
  .fm li { margin-bottom: 4px; }
  .fm table { width: 100%; border-collapse: collapse; margin: 6px 0 12px 0; font-size: 9.5pt; }
  .fm th { background: #${palette.cover}; color: #fff; text-align: left; padding: 6px 9px; }
  .fm td { padding: 6px 9px; border-bottom: 1px solid #E3E9EF; }

  .toc-page { page: nofooter; page-break-before: always; }
  .toc-page h1 { font-size: 20pt; color: #${palette.cover}; margin-bottom: 2px; }
  .toc-page .h1en { font-style: italic; color: #${palette.step6}; font-size: 11pt; margin-bottom: 18px; }
  .toc-row { display: flex; align-items: baseline; text-decoration: none; color: #${palette.grey}; margin-bottom: 3px; font-size: 11pt; }
  .toc-row .t { white-space: nowrap; font-weight: bold; color: #${palette.cover}; }
  .toc-row .fill { flex: 1; border-bottom: 1px dotted #C9D6E3; margin: 0 8px; transform: translateY(-4px); }
  .toc-row::after { content: target-counter(attr(href), page); font-weight: bold; color: #${palette.cover}; }
  .toc-en { font-style: italic; color: #97A6B5; font-size: 8.5pt; margin: 0 0 10px 0; }

  .divider-page {
    page: divider;
    page-break-before: always;
    background: #${palette.cover};
    color: #fff;
    width: 21cm; height: 29.7cm;
    padding: 3cm 2.4cm;
    box-sizing: border-box;
  }
  .divider-page .dtop { display: flex; align-items: center; gap: 18px; margin-bottom: 8px; }
  .divider-page .dtop img { width: 56px; height: 56px; opacity: 0.9; }
  .divider-page .eyebrow { color: #8fc4ec; letter-spacing: 3px; font-weight: bold; font-size: 11pt; }
  .divider-page h1 { font-size: 34pt; margin: 6px 0 2px 0; }
  .divider-page .nameEn { font-style: italic; color: #8fc4ec; font-size: 15pt; margin-bottom: 6px; }
  .divider-page .tagline { font-style: italic; color: #C9D6E3; font-size: 13pt; margin-bottom: 30px; }
  .divider-page .drow { display: flex; align-items: baseline; text-decoration: none; color: #EAF3FA; margin-bottom: 13px; font-size: 11.5pt; }
  .divider-page .drow .num { display: inline-block; width: 32px; color: #8fc4ec; font-weight: bold; }
  .divider-page .drow .fill { flex: 1; border-bottom: 1px dotted rgba(255,255,255,0.35); margin: 0 8px; transform: translateY(-4px); }
  .divider-page .drow::after { content: target-counter(attr(href), page); font-weight: bold; color: #fff; }

  .annex-page { page: nofooter; page-break-before: always; }
  .annex-page h1 { font-size: 22pt; color: #${palette.cover}; margin-bottom: 2px; }
  .annex-page .h1en { font-style: italic; color: #${palette.step6}; font-size: 11pt; margin-bottom: 6px; }
  .annex-page .annex-intro { font-size: 10pt; color: #${palette.grey}; margin-bottom: 16px; }
  .annex-cat { background: #${palette.cover}; color: #fff; padding: 6px 12px; font-size: 12pt; border-radius: 3px; margin: 14px 0 4px 0; }
  .annex-cat .en { display: block; font-weight: normal; font-style: italic; font-size: 8.5pt; color: #8fc4ec; margin-top: 1px; }
  .annex-item { margin: 0 0 8px 0; padding-left: 2px; font-size: 10pt; }
  .annex-item .name { font-weight: bold; color: #${palette.cover}; }
  .annex-item .url { color: #${palette.step3}; font-size: 9pt; margin-left: 6px; }
  .annex-item .desc { display: block; color: #${palette.grey}; margin-top: 1px; }
  .annex-note { margin-top: 14px; font-size: 9pt; font-style: italic; color: #${palette.grey}; border-left: 3px solid #${palette.step5}; padding-left: 10px; }
`;

function tocPage() {
  const rows = blocks.map(b => `
    <a class="toc-row" href="#bloco-${b.num}">
      <span class="t">Bloco ${b.num}: ${esc(b.name)}</span>
      <span class="fill"></span>
    </a>
    <div class="toc-en">Block ${b.num}: ${esc(b.nameEn)}</div>`).join("");
  const annexRow = `
    <a class="toc-row" href="#anexo">
      <span class="t">Anexo: Aplicativos e Sites para Praticar Inglês</span>
      <span class="fill"></span>
    </a>
    <div class="toc-en">Appendix: Apps and Websites to Practice English</div>`;
  return `<div class="toc-page"><h1>Sumário</h1><div class="h1en">Table of Contents</div>${rows}${annexRow}</div>`;
}

function annexPage() {
  const cats = CATEGORIES.map(cat => {
    const items = cat.items.map(it => `
      <div class="annex-item">
        <span class="name">${esc(it.name)}</span><span class="url">${esc(it.url)}</span>
        <span class="desc">${esc(it.desc)}</span>
      </div>`).join("");
    return `<div class="annex-cat">${esc(cat.pt)}<span class="en">${esc(cat.en)}</span></div>${items}`;
  }).join("");
  return `<div class="annex-page" id="anexo">
    <h1>Anexo: Aplicativos e Sites para Praticar Inglês</h1>
    <div class="h1en">Appendix: Apps and Websites to Practice English</div>
    <p class="annex-intro">Uma seleção de ferramentas gratuitas ou com versão gratuita para complementar sua prática de inglês além deste livro, organizadas por categoria.</p>
    ${cats}
    <p class="annex-note">${esc(ANNEX_NOTE_PT)}<br>${esc(ANNEX_NOTE_EN)}</p>
  </div>`;
}

function dividerPage(block) {
  const rows = block.themes.map(t => `
    <a class="drow" href="#tema-${t.num}">
      <span class="num">${String(t.num).padStart(2, "0")}</span>
      <span>${esc(t.titleEn)}</span>
      <span class="fill"></span>
    </a>`).join("");
  return `<div class="divider-page" id="bloco-${block.num}">
    <div class="dtop">
      <img src="${iconPath(block.num)}">
      <div class="eyebrow">BLOCO ${block.num} DE 13 · BLOCK ${block.num} OF 13</div>
    </div>
    <h1>${esc(block.name)}</h1>
    <div class="nameEn">${esc(block.nameEn)}</div>
    <div class="tagline">${esc(block.tagline)}</div>
    ${rows}
  </div>`;
}

const frontMatterHtml = `
<div class="fm">
  <h1 class="booktitle">English Speaking Practice</h1>
  <div class="subtitle-line">Treino de Conversação</div>

  <h2>Boas-vindas<span class="en">Welcome</span></h2>
  <p>Você já consegue ler um texto em inglês. Já assiste vídeo com legenda e entende boa parte do que se fala. Mas na hora de abrir a boca (numa reunião, numa entrevista, numa conversa de corredor com um estrangeiro) trava.</p>
  <p>O <b>English Speaking Practice</b> foi criado para resolver exatamente isso: um protocolo semanal de estudo que leva você, toda semana, de um tema relevante do mundo real até uma conversa sustentada em inglês, com argumento, opinião e confiança.</p>

  <h2>Para quem é este material<span class="en">Who this book is for</span></h2>
  <p>Para quem já lê e assiste conteúdo em inglês em nível intermediário, mas trava na hora de falar, argumentar e sustentar opiniões, especialmente em contextos profissionais e sociais adultos.</p>

  <h2>Como funciona: o sistema guiado em 7 etapas<span class="en">How it works: the 7-step guided system</span></h2>
  <p><b>Etapa 1: Vocabulário contextualizado.</b> As palavras certas, aplicadas ao contexto do tema da semana.</p>
  <p><b>Etapa 2: Leitura com orientação de estudo.</b> Um texto curto e denso, com orientações de leitura ativa.</p>
  <p><b>Etapa 3: Listening com suporte em áudio e vídeo.</b> Treino de ouvido com roteiro de apoio.</p>
  <p><b>Etapa 4: Writing como preparação para a fala.</b> Organize suas ideias no papel antes de falar.</p>
  <p><b>Etapa 5: Gramática de apoio aplicada à conversação.</b> A estrutura certa para o tema da semana.</p>
  <p><b>Etapa 6: Speaking com perguntas abertas.</b> O coração do método: além do "yes" e do "no".</p>
  <p><b>Etapa 7: Autoavaliação de performance.</b> Registro do que travou e do que fluiu.</p>

  <h2>O que você vai encontrar neste livro<span class="en">What you'll find in this book</span></h2>
  <ul>
    <li>104 temas relevantes do mundo profissional, organizados em 13 blocos temáticos;</li>
    <li>Mais de 1.200 tópicos de discussão e perguntas de speaking;</li>
    <li>104 textos de leitura com roteiro de áudio para prática de listening;</li>
    <li>104 quadros de gramática aplicada, com exemplos e tradução;</li>
    <li>104 exercícios interativos de vocabulário, com gabarito;</li>
    <li>Painel de autoavaliação em cada tema.</li>
  </ul>

  <h2>Cronograma sugerido de estudos<span class="en">Suggested study schedule</span></h2>
  <table>
    <tr><th>Semanas</th><th>Foco</th><th>Blocos</th></tr>
    <tr><td>1 a 8</td><td>Base de conversação, carreira e liderança</td><td>1, 2, 3</td></tr>
    <tr><td>9 a 16</td><td>Networking, negociação e entrevistas</td><td>4, 5, 6</td></tr>
    <tr><td>17 a 24</td><td>Cultura corporativa e comunicação</td><td>7, 8</td></tr>
    <tr><td>25 a 32</td><td>Tecnologia, finanças e viagens</td><td>9, 10, 11</td></tr>
    <tr><td>33 a 39</td><td>Vida social, atualidades e mindset</td><td>12, 13</td></tr>
  </table>
  <p>Um tema por semana, na ordem que fizer mais sentido para você. Marque cada tema concluído e siga em frente.</p>
</div>
`;

function main() {
  const parts = [];
  parts.push(`<div class="cover-page"><img src="file://${path.join(__dirname, "..", "assets", "cover.png")}"></div>`);
  parts.push(frontMatterHtml);
  parts.push(tocPage());
  for (const block of blocks) {
    parts.push(dividerPage(block));
    for (const theme of block.themes) {
      parts.push(renderChapterBody(theme, READING_GUIDE, SELF_ASSESS_CRITERIA));
    }
  }
  parts.push(annexPage());

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>English Speaking Practice</title>
<style>${chapterCss("")}${masterCss}</style>
</head>
<body>
${parts.join("\n")}
</body>
</html>`;

  const outPath = path.join(__dirname, "..", "output", "master", "English-Speaking-Practice-Livro-Completo.html");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);
  console.log("wrote", outPath, `(${(html.length / 1e6).toFixed(1)} MB)`);
}

main();
