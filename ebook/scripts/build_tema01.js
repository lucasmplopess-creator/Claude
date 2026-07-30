const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, AlignmentType, PageBreak, LevelFormat,
  convertInchesToTwip, VerticalAlign, Header, Footer, PageNumber
} = require("docx");
const fs = require("fs");

const NAVY = "1B3B57";
const NAVY_DARK = "13293D";
const BLUE = "2E86C1";
const LIGHT_BG = "EAF1F8";
const GREY = "444444";

const FONT = "Calibri";

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    border: { bottom: { color: BLUE, space: 6, style: BorderStyle.SINGLE, size: 12 } },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 32, font: FONT })],
  });
}

function stepLabel(num, title, ptTitle) {
  return new Paragraph({
    spacing: { before: 500, after: 150 },
    shading: { type: ShadingType.CLEAR, fill: NAVY },
    children: [
      new TextRun({ text: `  ETAPA ${num}  `, bold: true, color: "FFFFFF", size: 20, font: FONT }),
      new TextRun({ text: `   ${title}`, bold: true, color: "FFFFFF", size: 24, font: FONT }),
    ],
  });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160, line: 300 },
    children: [new TextRun({ text, color: GREY, size: 22, font: FONT, italics: opts.italics || false })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullet-list", level: 0 },
    spacing: { after: 100 },
    children: [new TextRun({ text, color: GREY, size: 22, font: FONT })],
  });
}

function numbered(text, ref = "question-list") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 140, line: 280 },
    children: [new TextRun({ text, color: NAVY_DARK, size: 22, font: FONT })],
  });
}

function noteBox(title, text) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BLUE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BLUE },
      left: { style: BorderStyle.SINGLE, size: 4, color: BLUE },
      right: { style: BorderStyle.SINGLE, size: 4, color: BLUE },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: LIGHT_BG },
            margins: { top: 150, bottom: 150, left: 200, right: 200 },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [new TextRun({ text: title, bold: true, color: NAVY, size: 21, font: FONT })],
              }),
              ...text.map(t => new Paragraph({
                spacing: { after: 60 },
                children: [new TextRun({ text: t, color: GREY, size: 21, font: FONT })],
              })),
            ],
          }),
        ],
      }),
    ],
  });
}

function vocabTable(rows) {
  const header = new TableRow({
    tableHeader: true,
    children: [
      hCell("Word / Expression", 2600),
      hCell("Tradução", 2000),
      hCell("Example Sentence", 4600),
    ],
  });
  const body = rows.map(r => new TableRow({
    children: [
      bCell(r[0], 2600, true),
      bCell(r[1], 2000, false),
      bCell(r[2], 4600, false, true),
    ],
  }));
  return new Table({
    width: { size: 9200, type: WidthType.DXA },
    columnWidths: [2600, 2000, 4600],
    rows: [header, ...body],
  });
}

function hCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: NAVY },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", size: 20, font: FONT })] })],
  });
}

function bCell(text, width, bold = false, italics = false) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 90, bottom: 90, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [new TextRun({ text, bold, italics, color: GREY, size: 20, font: FONT })] })],
  });
}

function grammarTable(rows) {
  const header = new TableRow({
    tableHeader: true,
    children: [
      hCell("Estrutura", 2200),
      hCell("Exemplo (EN)", 3600),
      hCell("Tradução (PT)", 3400),
    ],
  });
  const body = rows.map(r => new TableRow({
    children: [bCell(r[0], 2200, true), bCell(r[1], 3600, false, true), bCell(r[2], 3400)],
  }));
  return new Table({
    width: { size: 9200, type: WidthType.DXA },
    columnWidths: [2200, 3600, 3400],
    rows: [header, ...body],
  });
}

function selfAssessTable() {
  const header = new TableRow({
    tableHeader: true,
    children: [
      hCell("Critério", 4200),
      hCell("Como foi?", 3000),
      hCell("Nota (1–5)", 2000),
    ],
  });
  const criteria = [
    "Consegui usar o vocabulário novo sem parar para pensar",
    "Entendi o áudio/vídeo sem depender da transcrição",
    "Escrevi minhas respostas antes de falar",
    "Apliquei a estrutura gramatical da etapa 5 corretamente",
    "Sustentei minhas respostas por mais de 2 frases",
    "Me senti confiante ao falar sobre este tema",
  ];
  const body = criteria.map(c => new TableRow({
    children: [bCell(c, 4200), bCell("", 3000), bCell("", 2000)],
  }));
  return new Table({
    width: { size: 9200, type: WidthType.DXA },
    columnWidths: [4200, 3000, 2000],
    rows: [header, ...body],
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }],
      },
      {
        reference: "question-list",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 300 } } } }],
      },
      {
        reference: "expr-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } } } }],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "English Speaking Practice — Nação Fluente", color: "8C9AA8", size: 16, font: FONT })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "Bloco 1 — Fundamentos da Conversação   |   Página ", color: "8C9AA8", size: 16, font: FONT }),
                new TextRun({ children: [PageNumber.CURRENT], color: "8C9AA8", size: 16, font: FONT }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ---- Cover / opening block ----
        new Paragraph({
          shading: { type: ShadingType.CLEAR, fill: NAVY },
          spacing: { after: 0 },
          children: [new TextRun({ text: " ", size: 2 })],
        }),
        new Table({
          width: { size: 9200, type: WidthType.DXA },
          columnWidths: [9200],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 9200, type: WidthType.DXA },
                  shading: { type: ShadingType.CLEAR, fill: NAVY },
                  margins: { top: 300, bottom: 300, left: 300, right: 300 },
                  children: [
                    new Paragraph({
                      spacing: { after: 60 },
                      children: [new TextRun({ text: "TEMA 1  ·  BLOCO 1 — FUNDAMENTOS DA CONVERSAÇÃO", bold: true, color: BLUE, size: 20, font: FONT })],
                    }),
                    new Paragraph({
                      spacing: { after: 80 },
                      children: [new TextRun({ text: "Talking About Yourself Beyond the Basics", bold: true, color: "FFFFFF", size: 40, font: FONT })],
                    }),
                    new Paragraph({
                      children: [new TextRun({ text: "Falando sobre você além do básico", color: "C9D6E3", italics: true, size: 24, font: FONT })],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ spacing: { before: 240, after: 100 }, children: [
          new TextRun({ text: "Tempo estimado: ", bold: true, color: NAVY, size: 21, font: FONT }),
          new TextRun({ text: "60–90 minutos, divididos ao longo da semana.", color: GREY, size: 21, font: FONT }),
        ]}),
        bodyText("Este é o primeiro tema do e-book, e por isso ele é também o mais fundamental: antes de discutir liderança, negociação ou carreira, você precisa conseguir falar sobre si mesmo de forma mais rica do que \"I'm fine, I work in marketing.\" Este tema te prepara para ir além do piloto automático."),

        // ---- Etapa 1: Vocabulário ----
        stepLabel(1, "Vocabulário Contextualizado", "Vocabulary in Context"),
        bodyText("Estas palavras e expressões vão te ajudar a descrever sua trajetória, personalidade e momento de vida com mais precisão e naturalidade."),
        vocabTable([
          ["background", "trajetória / bagagem", "My background is in finance, but I moved into product management five years ago."],
          ["to be rooted in (something)", "ter raízes em / vir de", "A lot of who I am professionally is rooted in how I was raised."],
          ["outgoing", "extrovertido(a)", "I'd say I'm fairly outgoing, especially once I get comfortable with a group."],
          ["reserved", "reservado(a)", "I'm more reserved at first, but I open up quickly."],
          ["turning point", "ponto de virada", "Moving abroad was a real turning point in how I see my career."],
          ["to be driven by (something)", "ser motivado por", "I'm mostly driven by learning — I get bored if I'm not being challenged."],
          ["resilient", "resiliente", "If there's one word to describe me, it's resilient."],
          ["milestone", "marco / conquista importante", "Getting my first leadership role was a huge milestone for me."],
          ["to take pride in", "ter orgulho de", "I take a lot of pride in how far my team has come this year."],
          ["work in progress", "trabalho em andamento (fig.)", "I'm still a work in progress when it comes to public speaking."],
          ["curious", "curioso(a)", "I'm naturally curious — I ask a lot of \"why\" questions."],
          ["to identify as", "se identificar como", "I identify more as a builder than a manager, if that makes sense."],
        ]),

        // ---- Etapa 2: Leitura ----
        stepLabel(2, "Leitura com Orientação de Estudo", "Guided Reading"),
        noteBox("Como ler este texto", [
          "1) Leia uma vez, rápido, só para captar a ideia geral — sem parar no que não entender.",
          "2) Leia de novo e grife toda expressão da Etapa 1 que aparecer no texto.",
          "3) Releia em voz alta, como se você estivesse contando essa história sobre você mesmo.",
        ]),
        bodyText("\"How Do You Actually Answer 'Tell Me About Yourself'?\"", { italics: false }),
        bodyText("Most people answer this question the same way: name, job title, maybe how long they've been doing it. It's not wrong — it's just forgettable. The people who stand out in interviews, in networking events, in any first conversation, do one thing differently: they connect a fact about themselves to a reason it matters."),
        bodyText("Instead of \"I've worked in marketing for six years,\" they say something closer to: \"My background is in marketing, but the turning point for me was leading a small team through a product launch — that's when I realized I was more driven by people than by campaigns.\" Same information. Completely different impression."),
        bodyText("This isn't about memorizing a perfect script. It's about knowing three or four things: where you come from professionally, a milestone that shaped how you work, a trait you'd genuinely use to describe yourself, and something you're still working on. Once you have those four anchors, you can answer almost any version of \"tell me about yourself\" — in an interview, at a conference, or in a casual conversation with a stranger who just asked what you do."),

        // ---- Etapa 3: Listening ----
        stepLabel(3, "Listening com Suporte em Áudio e Vídeo", "Guided Listening"),
        bodyText("Ouça o áudio deste tema (arquivo disponível para download na plataforma: audio/tema-01-talking-about-yourself.mp3) com o roteiro abaixo. Primeiro sem ler, depois acompanhando o texto."),
        noteBox("Roteiro do áudio (Audio Script)", [
          "\"So, tell me a bit about yourself — what's your background?\"",
          "\"Sure. So my background is actually in engineering, which surprises people once they find out I work in sales now. The turning point was a project where I had to present technical results to non-technical clients — I realized I was more driven by that kind of communication than by the engineering itself. I'd say I'm pretty outgoing, I take pride in building relationships fast, and... I'm still a work in progress when it comes to patience, honestly.\"",
        ]),
        bodyText("Depois de ouvir duas vezes, responda sem olhar o roteiro: quais das palavras da Etapa 1 você conseguiu identificar de ouvido?"),

        // ---- Etapa 4: Writing ----
        stepLabel(4, "Writing como Preparação para a Fala", "Writing Before Speaking"),
        bodyText("Antes de falar, escreva. Use as perguntas abaixo como guia e escreva de 4 a 6 frases — não precisa ser perfeito, precisa existir no papel primeiro."),
        numbered("What's your professional background, in one or two sentences?", "question-list"),
        numbered("What was a real turning point in your career or life?", "question-list"),
        numbered("What's one trait you'd genuinely use to describe yourself — and a small example that proves it?", "question-list"),
        numbered("What's something you're still working on (a \"work in progress\")?", "question-list"),
        bodyText("Espaço para escrever:"),
        ...Array.from({ length: 6 }).map(() => new Paragraph({
          spacing: { after: 220 },
          border: { bottom: { color: "C9D6E3", space: 4, style: BorderStyle.SINGLE, size: 4 } },
          children: [new TextRun({ text: " ", size: 22 })],
        })),

        // ---- Etapa 5: Gramática ----
        stepLabel(5, "Gramática de Apoio Aplicada à Conversação", "Grammar for Conversation"),
        bodyText("Para falar sobre sua trajetória, você vai alternar entre Simple Past e Present Perfect o tempo todo. Essa é a estrutura de apoio deste tema."),
        grammarTable([
          ["Present Perfect\n(have/has + particípio)", "I have worked in three different industries.", "Usado quando o fato ainda se conecta ao presente — sua experiência acumulada até agora, sem dizer quando exatamente."],
          ["Simple Past\n(verbo no passado)", "I worked in finance for two years before moving to tech.", "Usado quando o fato é um evento específico, encerrado, geralmente com um tempo marcado (\"for two years\", \"in 2021\")."],
          ["Present Perfect Continuous\n(have/has been + -ing)", "I've been focusing more on leadership lately.", "Usado para algo que começou no passado e continua acontecendo — ótimo para falar de mudanças recentes em você."],
        ]),
        bodyText("Dica prática: se você consegue colocar uma data ou período fechado na frase (\"in 2019\", \"last year\", \"for six months\" quando o período já terminou), use Simple Past. Se a ideia é \"até agora\", use Present Perfect."),

        // ---- Etapa 6: Speaking ----
        stepLabel(6, "Speaking — Perguntas Abertas", "Open-Ended Speaking"),
        bodyText("Responda em voz alta, gravando se possível. Não vale responder em uma frase só — use o que você escreveu na Etapa 4 como base, mas fale livremente."),
        numbered("What's your professional background, and how did you end up where you are today?", "question-list"),
        numbered("Looking back, what would you say was the biggest turning point in your career so far?", "question-list"),
        numbered("How would your closest coworkers describe your personality? Do you agree with them?", "question-list"),
        numbered("What's a milestone you're genuinely proud of — and why does it matter to you?", "question-list"),
        numbered("What's something about yourself that has changed a lot in the last few years?", "question-list"),
        numbered("If you had to describe yourself in three words, which would you pick, and why those three?", "question-list"),
        numbered("What's a \"work in progress\" for you right now — something you're actively trying to improve?", "question-list"),
        numbered("How is the way you introduce yourself different at work versus in a social setting?", "question-list"),
        numbered("Who influenced the way you see your own career the most, and how?", "question-list"),
        numbered("If a stranger asked \"so, what's your story?\", how would you actually answer that?", "question-list"),
        bodyText("Expressões úteis para esta conversa:", { italics: false }),
        new Paragraph({ numbering: { reference: "expr-list", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "\"If I'm being honest...\" — para introduzir uma resposta mais sincera/vulnerável.", color: GREY, size: 21, font: FONT })] }),
        new Paragraph({ numbering: { reference: "expr-list", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "\"Looking back...\" — para introduzir uma reflexão sobre o passado.", color: GREY, size: 21, font: FONT })] }),
        new Paragraph({ numbering: { reference: "expr-list", level: 0 }, spacing: { after: 80 }, children: [new TextRun({ text: "\"I'd like to think that...\" — para opiniões sobre si mesmo, de forma mais leve/humilde.", color: GREY, size: 21, font: FONT })] }),
        new Paragraph({ numbering: { reference: "expr-list", level: 0 }, spacing: { after: 200 }, children: [new TextRun({ text: "\"That's actually a good question...\" — para ganhar 2 segundos antes de responder algo mais difícil.", color: GREY, size: 21, font: FONT })] }),

        // ---- Vocabulary check exercise ----
        stepLabel("6.1", "Exercício Interativo — Complete com a Palavra Certa", "Vocabulary Check"),
        bodyText("Complete cada frase com uma palavra ou expressão da Etapa 1. Gabarito ao final desta seção."),
        numbered("Getting promoted to team lead was a real ______ for me.", "expr-list"),
        numbered("I'm pretty ______ — I love meeting new people at events.", "expr-list"),
        numbered("She's still a ______ when it comes to delegating tasks.", "expr-list"),
        numbered("My interest in psychology is ______ how I grew up in a house full of teachers.", "expr-list"),
        numbered("He's mostly ______ by impact — he wants his work to matter.", "expr-list"),
        bodyText("Gabarito: 1) milestone  2) outgoing  3) work in progress  4) rooted in  5) driven", { italics: true }),

        // ---- Etapa 7 ----
        stepLabel(7, "Autoavaliação de Performance", "Self-Assessment"),
        bodyText("Antes de marcar este tema como concluído, avalie honestamente como foi sua prática."),
        selfAssessTable(),
        bodyText(" "),
        bodyText("O que travou mais nesta conversa? O que você quer treinar de novo antes de seguir para o próximo tema?"),
        ...Array.from({ length: 3 }).map(() => new Paragraph({
          spacing: { after: 220 },
          border: { bottom: { color: "C9D6E3", space: 4, style: BorderStyle.SINGLE, size: 4 } },
          children: [new TextRun({ text: " ", size: 22 })],
        })),
        new Paragraph({
          spacing: { before: 300 },
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Marque este tema como concluído no seu Painel de Evolução e siga para o Tema 2.", bold: true, color: NAVY, size: 21, font: FONT })],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(__dirname + "/../output/Tema-01-Talking-About-Yourself.docx", buffer);
  console.log("done");
});
