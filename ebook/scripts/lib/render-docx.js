const fs = require("fs");
const path = require("path");
const {
  Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, LevelFormat,
  VerticalAlign, Header, Footer, PageNumber, ImageRun,
} = require("docx");
const palette = require("./palette");
const { STEP_EN, BLOCK_EN } = require("./translations");
const { audioVariants } = require("./audio-text");

const FONT = "Calibri";
const GREY = palette.grey;

const iconCache = {};
function getIcon(blockNum) {
  if (!iconCache[blockNum]) {
    iconCache[blockNum] = fs.readFileSync(path.join(__dirname, "..", "..", "assets", "icons", `block-${blockNum}.png`));
  }
  return iconCache[blockNum];
}

function stepLabel(tag, titlePt, titleEn, color) {
  return new Paragraph({
    spacing: { before: 340, after: 110 },
    shading: { type: ShadingType.CLEAR, fill: color },
    children: [
      new TextRun({ text: `  ETAPA ${tag}  `, bold: true, color: "FFFFFF", size: 18, font: FONT }),
      new TextRun({ text: `   ${titlePt}`, bold: true, color: "FFFFFF", size: 23, font: FONT }),
      new TextRun({ text: `   ${titleEn}`, italics: true, color: "D8E7F2", size: 17, font: FONT, break: 1 }),
    ],
  });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 276 },
    children: [new TextRun({ text, color: GREY, size: 21, font: FONT, italics: opts.italics || false, bold: opts.bold || false })],
  });
}

function numbered(text, ref) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 100, line: 264 },
    children: [new TextRun({ text, color: palette.navyDark, size: 21, font: FONT })],
  });
}

function exprItem(text) {
  return new Paragraph({
    numbering: { reference: "expr-list", level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, color: GREY, size: 20, font: FONT })],
  });
}

function noteBox(title, lines, color, bg) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color },
      bottom: { style: BorderStyle.SINGLE, size: 4, color },
      left: { style: BorderStyle.SINGLE, size: 4, color },
      right: { style: BorderStyle.SINGLE, size: 4, color },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: bg },
            margins: { top: 110, bottom: 110, left: 180, right: 180 },
            children: [
              new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, bold: true, color, size: 20, font: FONT })] }),
              ...lines.map(t => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: t, color: GREY, size: 20, font: FONT })] })),
            ],
          }),
        ],
      }),
    ],
  });
}

function hCell(text, width, color) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: color },
    margins: { top: 80, bottom: 80, left: 110, right: 110 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 19, font: FONT })] })],
  });
}

function bCell(text, width, bold = false, italics = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [new TextRun({ text, bold, italics, color: GREY, size: 19, font: FONT })] })],
  });
}

function vocabTable(vocabRows, color) {
  const header = new TableRow({ tableHeader: true, children: [hCell("Word / Expression", 2600, color), hCell("Tradução", 2000, color), hCell("Example Sentence", 4600, color)] });
  const body = vocabRows.map(r => new TableRow({ children: [bCell(r[0], 2600, true), bCell(r[1], 2000), bCell(r[2], 4600, false, true)] }));
  return new Table({ width: { size: 9200, type: WidthType.DXA }, columnWidths: [2600, 2000, 4600], rows: [header, ...body] });
}

function grammarTable(gRows, color) {
  const header = new TableRow({ tableHeader: true, children: [hCell("Estrutura", 2200, color), hCell("Exemplo (EN)", 3600, color), hCell("Tradução (PT)", 3400, color)] });
  const body = gRows.map(r => new TableRow({ children: [bCell(r[0], 2200, true), bCell(r[1], 3600, false, true), bCell(r[2], 3400)] }));
  return new Table({ width: { size: 9200, type: WidthType.DXA }, columnWidths: [2200, 3600, 3400], rows: [header, ...body] });
}

function selfAssessTable(criteria, color) {
  const header = new TableRow({ tableHeader: true, children: [hCell("Critério", 4200, color), hCell("Como foi?", 3000, color), hCell("Nota (1-5)", 2000, color)] });
  const body = criteria.map(c => new TableRow({ children: [bCell(c, 4200), bCell("", 3000), bCell("", 2000)] }));
  return new Table({ width: { size: 9200, type: WidthType.DXA }, columnWidths: [4200, 3000, 2000], rows: [header, ...body] });
}

function writingLines(n) {
  return Array.from({ length: n }).map(() => new Paragraph({
    spacing: { after: 160 },
    border: { bottom: { color: "C9D6E3", space: 4, style: BorderStyle.SINGLE, size: 4 } },
    children: [new TextRun({ text: " ", size: 21 })],
  }));
}

function buildChapterContent(theme, guide, criteria, opts = {}) {
  const p = palette;
  const blockEn = BLOCK_EN[theme.block] || "";
  const audio = audioVariants(theme);
  return [
          ...(opts.withHeading ? [new Paragraph({
            heading: opts.headingLevel || HeadingLevel.HEADING_2,
            pageBreakBefore: opts.pageBreakBefore !== false,
            spacing: { after: 0 },
            children: [new TextRun({ text: `Tema ${theme.num}: ${theme.titleEn}`, color: "FFFFFF", size: 2, font: FONT })],
          })] : []),
          new Table({
            width: { size: 9200, type: WidthType.DXA }, columnWidths: [1200, 8000],
            rows: [new TableRow({ children: [
              new TableCell({
                width: { size: 1200, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: p.cover },
                margins: { top: 260, bottom: 260, left: 200, right: 100 },
                verticalAlign: VerticalAlign.CENTER,
                children: [new Paragraph({ children: [new ImageRun({ data: getIcon(theme.block), transformation: { width: 44, height: 44 }, type: "png" })] })],
              }),
              new TableCell({
                width: { size: 8000, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: p.cover },
                margins: { top: 260, bottom: 260, left: 100, right: 260 },
                children: [
                  new Paragraph({ spacing: { after: 40 }, children: [
                    new TextRun({ text: `TEMA ${theme.num}  ·  BLOCO ${theme.block}  ·  ${theme.blockName.toUpperCase()}`, bold: true, color: "8fc4ec", size: 18, font: FONT }),
                    new TextRun({ text: `THEME ${theme.num} · BLOCK ${theme.block} · ${blockEn.toUpperCase()}`, italics: true, color: "5F87A3", size: 14, font: FONT, break: 1 }),
                  ] }),
                  new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: theme.titleEn, bold: true, color: "FFFFFF", size: 38, font: FONT })] }),
                  new Paragraph({ children: [new TextRun({ text: theme.titlePt, color: "C9D6E3", italics: true, size: 22, font: FONT })] }),
                ],
              }),
            ] })],
          }),
          new Paragraph({ spacing: { before: 180, after: 80 }, children: [
            new TextRun({ text: "Tempo estimado: ", bold: true, color: p.cover, size: 20, font: FONT }),
            new TextRun({ text: theme.estimatedTime, color: GREY, size: 20, font: FONT }),
          ] }),
          bodyText(theme.intro),

          stepLabel(1, "Vocabulário Contextualizado", STEP_EN[1], p.step1),
          bodyText("Estas palavras e expressões vão te ajudar a se expressar sobre este tema com mais precisão e naturalidade."),
          vocabTable(theme.vocab, p.step1),
          bodyText(`Áudio com a pronúncia de cada palavra e seu exemplo (arquivo para download na plataforma: ${audio.vocabulario.file}). Ouça e repita em voz alta.`, { italics: true }),

          stepLabel(2, "Leitura com Orientação de Estudo", STEP_EN[2], p.step2),
          noteBox("Como ler este texto", guide, p.step2, "E9F5F1"),
          bodyText(`"${theme.readingTitle}"`, { bold: false, italics: false }),
          ...theme.readingParagraphs.map(t => bodyText(t)),
          bodyText(`Áudio com a narração deste texto (arquivo para download na plataforma: ${audio.leitura.file}). Ouça acompanhando a leitura, depois sem olhar para o texto.`, { italics: true }),

          stepLabel(3, "Listening com Suporte em Áudio e Vídeo", STEP_EN[3], p.step3),
          bodyText(`Ouça o áudio deste tema (arquivo disponível para download na plataforma: ${theme.audioFile}) com o roteiro abaixo. Primeiro sem ler, depois acompanhando o texto.`),
          noteBox("Roteiro do áudio (Audio Script)", theme.audioScript, p.step3, "F1ECF7"),
          bodyText(theme.audioFollowup),

          stepLabel(4, "Writing como Preparação para a Fala", STEP_EN[4], p.step4),
          bodyText("Antes de falar, escreva. Use as perguntas abaixo como guia e escreva de 4 a 6 frases: não precisa ser perfeito, precisa existir no papel primeiro."),
          ...theme.writingQuestions.map(q => numbered(q, "question-list")),
          bodyText("Espaço para escrever:"),
          ...writingLines(5),

          stepLabel(5, "Gramática de Apoio Aplicada à Conversação", STEP_EN[5], p.step5),
          bodyText(theme.grammarIntro),
          grammarTable(theme.grammarRows, p.step5),
          bodyText(theme.grammarTip),

          stepLabel(6, "Speaking: Perguntas Abertas", STEP_EN[6], p.step6),
          bodyText("Responda em voz alta, gravando se possível. Não vale responder em uma frase só: use o que você escreveu na Etapa 4 como base, mas fale livremente."),
          ...theme.speakingQuestions.map(q => numbered(q, "question-list")),
          bodyText("Expressões úteis para esta conversa:"),
          ...theme.expressions.map(e => exprItem(e)),
          bodyText(`Áudio com a pronúncia de cada expressão (arquivo para download na plataforma: ${audio.expressoes.file}).`, { italics: true }),

          stepLabel("EX", "Complete com a Palavra Certa", STEP_EN.EX, p.exercise),
          bodyText("Complete cada frase com uma palavra ou expressão da Etapa 1. Gabarito ao final desta seção."),
          ...theme.exerciseSentences.map(q => numbered(q, "question-list")),
          bodyText(theme.exerciseAnswers, { italics: true }),

          stepLabel(7, "Autoavaliação de Performance", STEP_EN[7], p.step7),
          bodyText("Antes de marcar este tema como concluído, avalie honestamente como foi sua prática."),
          selfAssessTable(criteria, p.step7),
          bodyText("O que travou mais nesta conversa? O que você quer treinar de novo antes de seguir para o próximo tema?"),
          ...writingLines(2),

          new Paragraph({ spacing: { before: 220 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: theme.num >= 104 ? "Parabéns! Você concluiu os 104 temas do English Speaking Practice. Volte a qualquer tema sempre que quiser revisar." : `Marque este tema como concluído no seu Painel de Evolução e siga para o Tema ${theme.num + 1}.`, bold: true, color: p.cover, size: 20, font: FONT })] }),
  ];
}

function buildChapterDoc(theme, guide, criteria) {
  const p = palette;
  return new Document({
    numbering: {
      config: [
        { reference: "question-list", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } }] },
        { reference: "expr-list", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] },
      ],
    },
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 800, bottom: 800, left: 1000, right: 1000 } } },
        headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "English Speaking Practice", color: p.lightGrey, size: 16, font: FONT })] })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: `Bloco ${theme.block} · ${theme.blockName}   |   Página `, color: p.lightGrey, size: 16, font: FONT }),
          new TextRun({ children: [PageNumber.CURRENT], color: p.lightGrey, size: 16, font: FONT }),
        ] })] }) },
        children: buildChapterContent(theme, guide, criteria),
      },
    ],
  });
}

module.exports = { buildChapterDoc, buildChapterContent, stepLabel, bodyText, noteBox, hCell, bCell, writingLines, FONT, getIcon };
