const fs = require("fs");
const path = require("path");
const { renderChapterBody, chapterCss, esc } = require("./lib/render-html");
const { READING_GUIDE, SELF_ASSESS_CRITERIA } = require("./lib/constants");
const palette = require("./lib/palette");

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
  blocks.push({ num: i, name: themes[0].blockName, tagline: BLOCK_TAGLINES[i], themes });
}

const masterCss = `
  @page {
    size: A4;
    margin: 2.2cm 2cm 2.4cm 2cm;
    @top-right { content: "English Speaking Practice — Nação Fluente"; font-size: 8pt; color: #${palette.lightGrey}; font-family: 'Helvetica', Arial, sans-serif; }
    @bottom-center { content: "Página " counter(page); font-size: 8pt; color: #${palette.lightGrey}; font-family: 'Helvetica', Arial, sans-serif; }
  }
  @page cover { margin: 0; @top-right { content: none; } @bottom-center { content: none; } }
  @page nofooter { margin: 2.2cm 2cm 2.4cm 2cm; @bottom-center { content: none; } }
  @page divider { margin: 0; @top-right { content: none; } @bottom-center { content: none; } }

  .cover-page { page: cover; margin: 0; padding: 0; width: 21cm; height: 29.7cm; overflow: hidden; }
  .cover-page img { width: 100%; height: 100%; display: block; object-fit: cover; }

  .fm { page: nofooter; }
  .fm h1.booktitle { font-size: 30pt; color: #${palette.cover}; margin: 0 0 4px 0; }
  .fm .subtitle-line { font-size: 14pt; color: #${palette.step6}; font-style: italic; margin-bottom: 26px; }
  .fm h2 { background: #${palette.cover}; color: #fff; padding: 8px 14px; font-size: 13pt; border-radius: 3px; margin: 26px 0 12px 0; }
  .fm p { margin: 0 0 10px 0; }
  .fm ul { margin: 6px 0 16px 0; padding-left: 22px; }
  .fm li { margin-bottom: 6px; }
  .fm table { width: 100%; border-collapse: collapse; margin: 10px 0 20px 0; font-size: 9.8pt; }
  .fm th { background: #${palette.cover}; color: #fff; text-align: left; padding: 7px 10px; }
  .fm td { padding: 7px 10px; border-bottom: 1px solid #E3E9EF; }

  .toc-page { page: nofooter; page-break-before: always; }
  .toc-page h1 { font-size: 22pt; color: #${palette.cover}; margin-bottom: 22px; }
  .toc-row { display: flex; align-items: baseline; text-decoration: none; color: #${palette.grey}; margin-bottom: 10px; font-size: 11.5pt; }
  .toc-row .t { white-space: nowrap; font-weight: bold; color: #${palette.cover}; }
  .toc-row .fill { flex: 1; border-bottom: 1px dotted #C9D6E3; margin: 0 8px; transform: translateY(-4px); }
  .toc-row::after { content: target-counter(attr(href), page); font-weight: bold; color: #${palette.cover}; }

  .divider-page {
    page: divider;
    page-break-before: always;
    background: #${palette.cover};
    color: #fff;
    width: 21cm; height: 29.7cm;
    padding: 3.2cm 2.4cm;
    box-sizing: border-box;
  }
  .divider-page .eyebrow { color: #8fc4ec; letter-spacing: 3px; font-weight: bold; font-size: 12pt; }
  .divider-page h1 { font-size: 40pt; margin: 10px 0 6px 0; }
  .divider-page .tagline { font-style: italic; color: #C9D6E3; font-size: 14pt; margin-bottom: 40px; }
  .divider-page .drow { display: flex; align-items: baseline; text-decoration: none; color: #EAF3FA; margin-bottom: 16px; font-size: 12pt; }
  .divider-page .drow .num { display: inline-block; width: 34px; color: #8fc4ec; font-weight: bold; }
  .divider-page .drow .fill { flex: 1; border-bottom: 1px dotted rgba(255,255,255,0.35); margin: 0 8px; transform: translateY(-4px); }
  .divider-page .drow::after { content: target-counter(attr(href), page); font-weight: bold; color: #fff; }
`;

function tocPage() {
  const rows = blocks.map(b => `
    <a class="toc-row" href="#bloco-${b.num}">
      <span class="t">Bloco ${b.num} — ${esc(b.name)}</span>
      <span class="fill"></span>
    </a>`).join("");
  return `<div class="toc-page"><h1>Sumário</h1>${rows}</div>`;
}

function dividerPage(block) {
  const rows = block.themes.map(t => `
    <a class="drow" href="#tema-${t.num}">
      <span class="num">${String(t.num).padStart(2, "0")}</span>
      <span>${esc(t.titleEn)}</span>
      <span class="fill"></span>
    </a>`).join("");
  return `<div class="divider-page" id="bloco-${block.num}">
    <div class="eyebrow">BLOCO ${block.num} DE 13</div>
    <h1>${esc(block.name)}</h1>
    <div class="tagline">${esc(block.tagline)}</div>
    ${rows}
  </div>`;
}

const frontMatterHtml = `
<div class="fm">
  <h1 class="booktitle">English Speaking Practice</h1>
  <div class="subtitle-line">Treino de Conversação — Nação Fluente</div>

  <h2>Boas-vindas</h2>
  <p>Você já consegue ler um texto em inglês. Já assiste vídeo com legenda e entende boa parte do que se fala. Mas na hora de abrir a boca — numa reunião, numa entrevista, numa conversa de corredor com um estrangeiro — trava.</p>
  <p>O <b>English Speaking Practice</b> foi criado para resolver exatamente isso: um protocolo semanal de estudo que leva você, toda semana, de um tema relevante do mundo real até uma conversa sustentada em inglês, com argumento, opinião e confiança.</p>

  <h2>Para quem é este material</h2>
  <p>Para quem já lê e assiste conteúdo em inglês em nível intermediário, mas trava na hora de falar, argumentar e sustentar opiniões — especialmente em contextos profissionais e sociais adultos.</p>

  <h2>Como funciona: o sistema guiado em 7 etapas</h2>
  <p><b>Etapa 1 — Vocabulário contextualizado.</b> As palavras certas, aplicadas ao contexto do tema da semana.</p>
  <p><b>Etapa 2 — Leitura com orientação de estudo.</b> Um texto curto e denso, com orientações de leitura ativa.</p>
  <p><b>Etapa 3 — Listening com suporte em áudio e vídeo.</b> Treino de ouvido com roteiro de apoio.</p>
  <p><b>Etapa 4 — Writing como preparação para a fala.</b> Organize suas ideias no papel antes de falar.</p>
  <p><b>Etapa 5 — Gramática de apoio aplicada à conversação.</b> A estrutura certa para o tema da semana.</p>
  <p><b>Etapa 6 — Speaking com perguntas abertas.</b> O coração do método — além do "yes" e do "no".</p>
  <p><b>Etapa 7 — Autoavaliação de performance.</b> Registro do que travou e do que fluiu.</p>

  <h2>O que você vai encontrar neste livro</h2>
  <ul>
    <li>104 temas relevantes do mundo profissional, organizados em 13 blocos temáticos;</li>
    <li>Mais de 1.200 tópicos de discussão e perguntas de speaking;</li>
    <li>104 textos de leitura com roteiro de áudio para prática de listening;</li>
    <li>104 quadros de gramática aplicada, com exemplos e tradução;</li>
    <li>104 exercícios interativos de vocabulário, com gabarito;</li>
    <li>Painel de autoavaliação em cada tema.</li>
  </ul>

  <h2>Cronograma sugerido de estudos</h2>
  <table>
    <tr><th>Semanas</th><th>Foco</th><th>Blocos</th></tr>
    <tr><td>1–8</td><td>Base de conversação, carreira e liderança</td><td>1, 2, 3</td></tr>
    <tr><td>9–16</td><td>Networking, negociação e entrevistas</td><td>4, 5, 6</td></tr>
    <tr><td>17–24</td><td>Cultura corporativa e comunicação</td><td>7, 8</td></tr>
    <tr><td>25–32</td><td>Tecnologia, finanças e viagens</td><td>9, 10, 11</td></tr>
    <tr><td>33–39</td><td>Vida social, atualidades e mindset</td><td>12, 13</td></tr>
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

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>English Speaking Practice — Nação Fluente</title>
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
