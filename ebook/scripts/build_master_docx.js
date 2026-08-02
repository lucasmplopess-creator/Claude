const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun,
  Header, Footer, PageNumber, AlignmentType, ShadingType, Table, TableRow, TableCell,
  WidthType, TableOfContents, VerticalAlign,
} = require("docx");
const { buildChapterContent, FONT, getIcon } = require("./lib/render-docx");
const { READING_GUIDE, SELF_ASSESS_CRITERIA } = require("./lib/constants");
const palette = require("./lib/palette");
const { BLOCK_EN } = require("./lib/translations");

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

function hiddenHeading(level, text) {
  return new Paragraph({
    heading: level,
    pageBreakBefore: true,
    spacing: { after: 0 },
    children: [new TextRun({ text, color: "FFFFFF", size: 2, font: FONT })],
  });
}

function fmHeading(pt, en) {
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: palette.cover },
    spacing: { before: 220, after: 100 },
    children: [
      new TextRun({ text: pt, bold: true, color: "FFFFFF", size: 23, font: FONT }),
      new TextRun({ text: en, italics: true, color: "8fc4ec", size: 16, font: FONT, break: 1 }),
    ],
  });
}

function fmPara(text) {
  return new Paragraph({ spacing: { after: 120, line: 276 }, children: [new TextRun({ text, color: palette.grey, size: 21, font: FONT })] });
}

function dividerBlock(block) {
  const rows = block.themes.map(t => new Paragraph({
    spacing: { after: 50 },
    children: [new TextRun({ text: `${String(t.num).padStart(2, "0")}   `, bold: true, color: "8fc4ec", size: 20, font: FONT }), new TextRun({ text: t.titleEn, color: "EAF3FA", size: 20, font: FONT })],
  }));
  return new Table({
    width: { size: 9200, type: WidthType.DXA }, columnWidths: [1300, 7900],
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: 1300, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: palette.cover },
        margins: { top: 450, bottom: 0, left: 450, right: 0 }, verticalAlign: VerticalAlign.TOP,
        children: [new Paragraph({ children: [new ImageRun({ data: getIcon(block.num), transformation: { width: 50, height: 50 }, type: "png" })] })],
      }),
      new TableCell({
        width: { size: 7900, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill: palette.cover },
        margins: { top: 450, bottom: 450, left: 250, right: 450 },
        children: [
          new Paragraph({ spacing: { after: 30 }, children: [new TextRun({ text: `BLOCO ${block.num} DE 13`, bold: true, color: "8fc4ec", size: 19, font: FONT })] }),
          new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: block.name, bold: true, color: "FFFFFF", size: 32, font: FONT })] }),
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: block.nameEn, italics: true, color: "8fc4ec", size: 24, font: FONT })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: block.tagline, italics: true, color: "C9D6E3", size: 21, font: FONT })] }),
          ...rows,
        ],
      }),
    ] })],
  });
}

async function main() {
  const coverBuffer = fs.readFileSync(path.join(__dirname, "..", "assets", "cover.png"));

  const bodyChildren = [
    new Paragraph({ children: [new TextRun({ text: "English Speaking Practice", bold: true, color: palette.cover, size: 58, font: FONT })] }),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Treino de Conversação", italics: true, color: palette.step6, size: 27, font: FONT })] }),

    fmHeading("Boas-vindas", "Welcome"),
    fmPara("Você já consegue ler um texto em inglês. Já assiste vídeo com legenda e entende boa parte do que se fala. Mas na hora de abrir a boca (numa reunião, numa entrevista, numa conversa de corredor com um estrangeiro) trava."),
    fmPara("O English Speaking Practice foi criado para resolver exatamente isso: um protocolo semanal de estudo que leva você, toda semana, de um tema relevante do mundo real até uma conversa sustentada em inglês, com argumento, opinião e confiança."),

    fmHeading("Para quem é este material", "Who this book is for"),
    fmPara("Para quem já lê e assiste conteúdo em inglês em nível intermediário, mas trava na hora de falar, argumentar e sustentar opiniões, especialmente em contextos profissionais e sociais adultos."),

    fmHeading("Como funciona: o sistema guiado em 7 etapas", "How it works: the 7-step guided system"),
    fmPara("Etapa 1: Vocabulário contextualizado. Etapa 2: Leitura com orientação de estudo. Etapa 3: Listening com suporte em áudio e vídeo. Etapa 4: Writing como preparação para a fala. Etapa 5: Gramática de apoio aplicada à conversação. Etapa 6: Speaking com perguntas abertas. Etapa 7: Autoavaliação de performance."),

    fmHeading("O que você vai encontrar neste livro", "What you'll find in this book"),
    fmPara("104 temas relevantes do mundo profissional, organizados em 13 blocos temáticos; mais de 1.200 tópicos de discussão e perguntas de speaking; 104 textos de leitura com roteiro de áudio; 104 quadros de gramática aplicada; 104 exercícios interativos com gabarito; e painel de autoavaliação em cada tema."),

    new Paragraph({ pageBreakBefore: true, spacing: { after: 10 }, children: [new TextRun({ text: "Sumário", bold: true, color: palette.cover, size: 42, font: FONT })] }),
    new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: "Table of Contents", italics: true, color: palette.step6, size: 22, font: FONT })] }),
    fmPara("Este sumário é um campo dinâmico do Word. Clique com o botão direito sobre ele e escolha \"Atualizar campo\" (ou pressione F9) para carregar os números de página corretos. This is a live Word field; right-click and choose \"Update field\" to load page numbers."),
    new TableOfContents("Sumário", { hyperlink: true, headingStyleRange: "1-2" }),
  ];

  for (const block of blocks) {
    bodyChildren.push(hiddenHeading(HeadingLevel.HEADING_1, `Bloco ${block.num}: ${block.name} (${block.nameEn})`));
    bodyChildren.push(dividerBlock(block));
    for (const theme of block.themes) {
      bodyChildren.push(...buildChapterContent(theme, READING_GUIDE, SELF_ASSESS_CRITERIA, {
        withHeading: true, headingLevel: HeadingLevel.HEADING_2, pageBreakBefore: true,
      }));
    }
  }

  const doc = new Document({
    numbering: {
      config: [
        { reference: "question-list", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } }] },
        { reference: "expr-list", levels: [{ level: 0, format: "bullet", text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }] },
      ],
    },
    sections: [
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [new ImageRun({ data: coverBuffer, transformation: { width: 794, height: 1123 }, type: "png" })],
          }),
        ],
      },
      {
        properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 800, bottom: 800, left: 1000, right: 1000 } } },
        headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "English Speaking Practice", color: palette.lightGrey, size: 16, font: FONT })] })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ text: "Página ", color: palette.lightGrey, size: 16, font: FONT }),
          new TextRun({ children: [PageNumber.CURRENT], color: palette.lightGrey, size: 16, font: FONT }),
        ] })] }) },
        children: bodyChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outDir = path.join(__dirname, "..", "output", "master");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "English-Speaking-Practice-Livro-Completo.docx"), buffer);
  console.log("wrote master docx");
}

main();
