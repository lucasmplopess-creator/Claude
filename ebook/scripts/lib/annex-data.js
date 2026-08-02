const CATEGORIES = [
  {
    pt: "Pronúncia",
    en: "Pronunciation",
    items: [
      { name: "Forvo", url: "https://forvo.com", desc: "Dicionário de pronúncia com áudios reais gravados por falantes nativos, palavra por palavra." },
      { name: "YouGlish", url: "https://youglish.com", desc: "Busca qualquer palavra ou expressão em vídeos reais do YouTube para ouvir a pronúncia em contexto." },
      { name: "Accent Hero", url: "https://accenthero.com", desc: "Treino de pronúncia e sotaque com feedback de inteligência artificial em tempo real." },
      { name: "ELSA Speak", url: "https://elsaspeak.com", desc: "Aplicativo de pronúncia com correção por IA, focado em reduzir sotaque e aumentar a clareza da fala." },
    ],
  },
  {
    pt: "Conversação e Speaking",
    en: "Conversation and Speaking",
    items: [
      { name: "Free4Talk", url: "https://www.free4talk.com", desc: "Salas de conversação ao vivo, gratuitas, com falantes de inglês do mundo todo." },
      { name: "HelloTalk", url: "https://www.hellotalk.com", desc: "Troca de idiomas com falantes nativos por chat, áudio e chamadas de voz ou vídeo." },
      { name: "ChatGPT (modo de voz)", url: "https://chatgpt.com", desc: "Pratique conversas faladas em inglês com IA, a qualquer hora, sem hora marcada." },
      { name: "Speak & Improve", url: "https://speakandimprove.com", desc: "Ferramenta da Cambridge para praticar speaking e receber feedback de nível (CEFR) por IA." },
    ],
  },
  {
    pt: "Listening",
    en: "Listening",
    items: [
      { name: "TED Talks", url: "https://www.ted.com/talks", desc: "Palestras em inglês com legendas em inglês e português, sobre os mais variados temas." },
      { name: "VOA Learning English", url: "https://learningenglish.voanews.com", desc: "Notícias narradas em inglês simplificado, em ritmo mais lento, pensado para estudantes." },
      { name: "News in Levels", url: "https://www.newsinlevels.com", desc: "Notícias reais adaptadas em três níveis de dificuldade, do iniciante ao avançado." },
      { name: "Radio Garden", url: "https://radio.garden", desc: "Rádios ao vivo de qualquer parte do mundo, ótimo para treinar o ouvido em sotaques reais." },
    ],
  },
  {
    pt: "Vocabulário e Gramática",
    en: "Vocabulary and Grammar",
    items: [
      { name: "Grammarly", url: "https://www.grammarly.com", desc: "Corretor gramatical e de estilo para revisar textos, e-mails e mensagens em inglês." },
      { name: "Anki", url: "https://apps.ankiweb.net", desc: "Flashcards de repetição espaçada, excelente para fixar o vocabulário de cada tema deste livro." },
      { name: "Memrise", url: "https://www.memrise.com", desc: "Cursos de vocabulário e expressões do dia a dia com vídeos de falantes nativos." },
      { name: "Lingoclip", url: "https://lingoclip.com", desc: "Aprenda vocabulário e expressões assistindo a trechos reais de filmes e séries." },
    ],
  },
  {
    pt: "Leitura",
    en: "Reading",
    items: [
      { name: "Manybooks", url: "https://manybooks.net", desc: "Milhares de livros gratuitos em inglês, ideais para praticar leitura extensiva." },
      { name: "Espresso English", url: "https://www.espressoenglish.net", desc: "Lições e artigos curtos e diretos sobre inglês prático para o dia a dia e o trabalho." },
    ],
  },
  {
    pt: "Comunidade e Eventos",
    en: "Community and Events",
    items: [
      { name: "Meetup", url: "https://www.meetup.com", desc: "Encontre grupos locais (presenciais ou online) de intercâmbio de idiomas e prática de inglês." },
    ],
  },
  {
    pt: "Entrevistas e Contexto Profissional",
    en: "Interviews and Professional Context",
    items: [
      { name: "ChatGPT (simulação de entrevista)", url: "https://chatgpt.com", desc: "Peça para a IA simular uma entrevista de emprego em inglês e te dar feedback sobre suas respostas." },
      { name: "Yoodli", url: "https://yoodli.ai", desc: "Feedback de IA sobre ritmo, clareza e vícios de linguagem em apresentações e entrevistas." },
    ],
  },
];

const ANNEX_NOTE_PT = "O aplicativo \"Interview Warmup\", do Google, foi descontinuado em 2026 e por isso não está incluído nesta lista. As alternativas acima cobrem a mesma necessidade: simular perguntas de entrevista em inglês e receber feedback.";
const ANNEX_NOTE_EN = "Google's \"Interview Warmup\" tool was discontinued in 2026 and is therefore not included in this list. The alternatives above cover the same need: simulating English interview questions and getting feedback.";

module.exports = { CATEGORIES, ANNEX_NOTE_PT, ANNEX_NOTE_EN };
