// Gera o HTML completo da proposta comercial Balerion Drinks a partir dos dados do cliente.
// data = { nome, dataEvento (YYYY-MM-DD), local, convidados, tipoEvento }

function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  if (!y || !m || !d) return iso;
  return `${d} de ${meses[m - 1]} de ${y}`;
}

function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Placeholder de imagem: mantém o layout exato da página original.
// slotKey vira o nome de arquivo sugerido em assets/images/ (ver README).
function imgSlot(slotKey, label) {
  return `<div class="img-slot" data-slot="${esc(slotKey)}">
    <span class="img-slot-label">📷 ${esc(label)}<br><small>assets/images/${esc(slotKey)}</small></span>
  </div>`;
}

function buildProposalHTML(data) {
  const nome = esc(data.nome || "Cliente");
  const local = esc(data.local || "A definir");
  const convidados = esc(data.convidados || "-");
  const tipoEvento = esc(data.tipoEvento || "Evento Social");
  const dataFormatada = esc(formatDateBR(data.dataEvento));

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Proposta Comercial Balerion Drinks - ${nome}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
${proposalCSS()}
</style>
</head>
<body>

${pageCapa(local, convidados)}
${pageQuemSomos()}
${pageDiferenciais()}
${pagePacotes()}
${pageCardapioSimples()}
${pageCardapioSofisticado()}
${pageMixSensacoes()}
${pageVitalis()}
${pageInvestimento(nome, dataFormatada, local, convidados, tipoEvento)}
${pageFechamento()}

</body>
</html>`;
}

function proposalCSS() {
  return `
  :root{
    --gold:#c9a45a; --gold-light:#e6cf9a; --gold-dark:#9c7a34;
    --maroon:#5c1414; --maroon-light:#7a1f1f;
    --bg-dark:#0b0b0b; --bg-dark2:#161010;
    --cream:#f6f1e3; --ink:#1c1810;
  }
  *{box-sizing:border-box;}
  body{margin:0;background:#333;font-family:'Cormorant Garamond',serif;}
  .page{
    position:relative;width:794px;min-height:1123px;margin:0 auto 24px;
    overflow:hidden;color:var(--ink);
  }
  .page-dark{background:radial-gradient(ellipse at 50% 0%,#1a1414 0%,var(--bg-dark) 60%);color:var(--cream);}
  .page-light{background:var(--cream);color:var(--ink);}
  .frame{
    position:absolute;inset:22px;border:2px solid var(--gold);pointer-events:none;
  }
  .frame::before{
    content:"";position:absolute;inset:6px;border:1px solid var(--gold);
  }
  .corner{position:absolute;width:26px;height:26px;border:2px solid var(--gold);}
  .corner.tl{top:14px;left:14px;border-right:none;border-bottom:none;}
  .corner.tr{top:14px;right:14px;border-left:none;border-bottom:none;}
  .corner.bl{bottom:14px;left:14px;border-right:none;border-top:none;}
  .corner.br{bottom:14px;right:14px;border-left:none;border-top:none;}
  .content{position:relative;z-index:2;padding:56px 64px;}
  h1,h2,h3{font-family:'Cinzel',serif;font-weight:600;margin:0;}
  .divider{display:flex;align-items:center;justify-content:center;gap:14px;margin:14px 0 26px;}
  .divider::before,.divider::after{content:"";flex:1;max-width:160px;height:1px;background:var(--gold);}
  .divider .diamond{width:8px;height:8px;background:var(--maroon-light);transform:rotate(45deg);border:1px solid var(--gold);}
  .page-dark .divider .diamond{background:#b3352c;}
  .eyebrow-line{text-align:center;font-family:'Cinzel',serif;letter-spacing:2px;}
  .banner{
    display:inline-block;margin:0 auto;padding:10px 26px;border:1px solid var(--gold);
    background:linear-gradient(180deg,var(--maroon-light),var(--maroon));color:var(--gold-light);
    font-family:'Cinzel',serif;letter-spacing:1px;text-align:center;
  }
  .banner-wrap{text-align:center;margin:18px 0;}
  .gold-text{color:var(--gold);}
  .img-slot{
    background:repeating-linear-gradient(135deg,#e4dcc6,#e4dcc6 10px,#d8cfb4 10px,#d8cfb4 20px);
    border:1.5px dashed var(--gold-dark);display:flex;align-items:center;justify-content:center;
    text-align:center;color:#6b5f3f;font-family:'Cinzel',serif;font-size:12px;letter-spacing:.5px;
  }
  .page-dark .img-slot{
    background:repeating-linear-gradient(135deg,#241c1c,#241c1c 10px,#1a1414 10px,#1a1414 20px);
    color:var(--gold-light);border-color:var(--gold);
  }
  .img-slot small{display:block;margin-top:4px;opacity:.75;font-family:monospace;font-size:10px;}
  .footer{
    position:absolute;bottom:34px;left:64px;right:64px;display:flex;
    align-items:center;justify-content:space-between;font-family:'Cinzel',serif;font-size:12px;
  }
  .footer .page-num{color:var(--gold);}
  .footer .mini-logo{display:flex;align-items:center;gap:6px;color:var(--gold);}
  .footer .mini-logo .glass{font-size:14px;}
  ul.plain{list-style:none;margin:0;padding:0;}
  .icon-list li{display:flex;gap:14px;align-items:flex-start;margin-bottom:16px;}
  .icon-list .ico{font-size:20px;width:28px;text-align:center;flex:none;color:var(--gold-dark);}
  .icon-list b{font-family:'Cinzel',serif;font-weight:600;}
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:0 40px;}
  .two-col .item{padding:10px 0;border-bottom:1px dotted #b8ab84;}
  .two-col .item b{display:block;font-family:'Cinzel',serif;color:var(--maroon-light);font-size:16px;letter-spacing:.5px;}
  .two-col .item span{font-size:14px;opacity:.85;}
  .pkg-card{
    display:flex;align-items:stretch;margin-bottom:16px;border:1px solid var(--gold);
    background:linear-gradient(180deg,#171010,#0d0a0a);color:var(--cream);min-height:150px;
  }
  .pkg-card.reverse{flex-direction:row-reverse;}
  .pkg-card .pkg-img{width:38%;}
  .pkg-card .pkg-txt{width:62%;padding:20px 26px;display:flex;flex-direction:column;justify-content:center;}
  .pkg-card .pkg-txt h3{font-size:24px;color:var(--gold-light);}
  .pkg-card .pkg-txt p{margin:8px 0 0;font-size:15px;opacity:.9;}
  table.price{width:100%;border-collapse:collapse;font-family:'Cinzel',serif;}
  table.price th,table.price td{border:1px solid var(--gold);padding:10px 14px;text-align:left;font-size:14px;}
  table.price th{background:var(--maroon);color:var(--gold-light);letter-spacing:.5px;}
  table.price td{background:#150f0f;color:var(--cream);}
  .info-grid{display:flex;justify-content:space-between;border:1px solid var(--gold);padding:18px 10px;margin:22px 0;}
  .info-grid .cell{flex:1;text-align:center;padding:0 6px;}
  .info-grid .cell .ic{font-size:20px;color:var(--gold);}
  .info-grid .cell .lb{font-size:13px;margin-top:6px;font-family:'Cormorant Garamond',serif;}
  .client-line{text-align:center;font-family:'Cinzel',serif;font-size:13px;color:var(--gold-light);
    border-top:1px solid var(--gold-dark);border-bottom:1px solid var(--gold-dark);padding:10px 0;margin:0 0 22px;}
  .contact-box{border:1px solid var(--gold);padding:16px 22px;display:flex;align-items:center;gap:26px;font-size:15px;}
  .contact-box .divide{width:1px;align-self:stretch;background:var(--gold-dark);}
  .contact-box .row{display:flex;align-items:center;gap:8px;margin:4px 0;}
  @media print{
    body{background:#fff;}
    .page{margin:0;box-shadow:none;page-break-after:always;}
  }
  `;
}

function pageCapa(local, convidados) {
  return `
  <section class="page page-dark">
    <div class="frame"></div>
    <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
    <div class="content" style="text-align:center;padding-top:70px;">
      ${imgSlot("logo-balerion.png", "Logo Balerion Drinks")}
      <div style="height:170px;"></div>
      <h1 style="font-size:26px;letter-spacing:6px;color:var(--gold);">BALERION</h1>
      <div style="font-family:'Cormorant Garamond',serif;letter-spacing:5px;color:#eee;font-size:14px;margin-top:2px;">— DRINKS —</div>
      <div class="divider" style="margin-top:18px;"><span class="diamond"></span></div>
      <h2 style="font-size:56px;line-height:1.05;color:var(--gold);">Proposta</h2>
      <h2 style="font-size:56px;line-height:1.05;"><span style="color:#f2ece0;">Comercial</span> <span class="gold-text">&amp;</span></h2>
      <h2 style="font-size:56px;line-height:1.05;color:var(--gold);">Experiência</h2>
      <div class="banner-wrap" style="margin-top:20px;">
        <span class="banner">Bares de Drinks para Eventos Sociais e Corporativos</span>
      </div>
      <div class="eyebrow-line" style="margin-top:16px;font-size:17px;color:#f2ece0;">
        ${local} &nbsp;•&nbsp; ${convidados} convidados
      </div>
    </div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:360px;">
      ${imgSlot("capa-bar-evento.jpg", "Foto do bar montado em evento")}
    </div>
  </section>`;
}

function pageQuemSomos() {
  return `
  <section class="page page-light">
    <div class="frame"></div>
    <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
    <div class="content">
      <h1 style="text-align:center;font-size:46px;">Quem <span class="gold-text">Somos</span></h1>
      <div class="divider"><span class="diamond"></span></div>
      <div style="display:flex;gap:40px;">
        <div style="flex:1;font-size:17px;line-height:1.6;">
          <p>A Balerion Drinks é uma empresa especializada em bar de drinks e coquetéis para eventos sociais e corporativos.</p>
          <p>Nosso objetivo é transformar celebrações em experiências únicas, oferecendo um serviço sofisticado, com atendimento personalizado e cardápio de drinks exclusivos.</p>
          <p>Com equipe treinada e ingredientes selecionados, garantimos qualidade, elegância e impacto visual, criando momentos que os convidados lembram para sempre.</p>
        </div>
        <div style="flex:1;">
          ${imgSlot("quem-somos-balcao.jpg", "Foto do balcão decorado")}
        </div>
      </div>
      <div class="banner-wrap" style="margin-top:34px;">
        <span class="banner">Experiência Única em Cocktails para o Seu Evento</span>
      </div>
      <div style="margin-top:18px;height:320px;">
        ${imgSlot("quem-somos-bartender.jpg", "Foto do bartender preparando drink")}
      </div>
    </div>
    <div class="footer">
      <span class="page-num">◆ 02 ◆</span>
      <span class="mini-logo"><span class="glass">🍸</span> BALERION —DRINKS—</span>
    </div>
  </section>`;
}

function pageDiferenciais() {
  const diferenciais = [
    ["🍽️", "Atendimento Premium", "acompanhamento completo, do contrato ao brinde final."],
    ["🏛️", "Balcão Personalizado", "estrutura elegante e decorada sob medida."],
    ["🍸", "Detalhes que Encantam", "copos, utensílios e cardápio exclusivos."],
    ["🍹", "Drinks Inesquecíveis", "autorais e clássicos preparados com ingredientes de qualidade."],
    ["🌿", "Para Todos os Convidados", "opções sofisticadas de drinks sem álcool."],
    ["🤵", "Equipe Especializada", "cordialidade, profissionalismo e excelência em cada detalhe."],
    ["🛡️", "Confiabilidade", "entrega pontual, ingredientes frescos e segurança em cada detalhe."],
  ];
  const estrutura = [
    "5 horas de festa com open bar completo, garantindo diversão sem interrupções.",
    "Bar montado e decorado diretamente no local, harmonizando com o tema do evento.",
    "Todos os ingredientes, frutas frescas e utensílios já inclusos no pacote, sem necessidade de planejamento extra.",
    "Experiência visual e sensorial que encanta e surpreende os convidados.",
    "Atendimento profissional e dedicado para transformar cada momento em memória inesquecível.",
  ];
  return `
  <section class="page page-light">
    <div class="frame"></div>
    <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
    <div class="content">
      <h1 style="text-align:center;font-size:42px;">Nossos <span class="gold-text">Diferenciais</span></h1>
      <p style="text-align:center;font-style:italic;">◆ Por que escolher a Balerion Drinks? ◆</p>
      <div style="display:flex;gap:40px;margin-top:18px;">
        <ul class="plain icon-list" style="flex:1;">
          ${diferenciais.map(([ico, t, d]) => `<li><span class="ico">${ico}</span><span><b>${t}</b> – ${d}</span></li>`).join("")}
        </ul>
        <div style="flex:1;">
          ${imgSlot("diferenciais-drink-taca.jpg", "Foto de drink em taça")}
        </div>
      </div>
      <div class="banner-wrap" style="margin-top:10px;"><span class="banner">Estrutura de Serviço</span></div>
      <div style="display:flex;gap:40px;margin-top:16px;">
        <ul class="plain" style="flex:1;">
          ${estrutura.map(t => `<li style="margin-bottom:14px;">◆ ${t}</li>`).join("")}
        </ul>
        <div style="flex:1;">
          ${imgSlot("diferenciais-bartender-servindo.jpg", "Foto do bartender servindo")}
        </div>
      </div>
    </div>
    <div class="footer">
      <span class="page-num">◆ 03 ◆</span>
      <span class="mini-logo"><span class="glass">🍸</span> BALERION —DRINKS—</span>
    </div>
  </section>`;
}

function pagePacotes() {
  const pacotes = [
    { nome: "Simples e Descontraído", desc: "Drinks clássicos, leves e refrescantes, ideais para animar qualquer festa.", img: "pacote-simples.jpg", rev: false },
    { nome: "Sofisticado e Conceituado", desc: "Drinks elaborados com ingredientes premium e apresentação refinada.", img: "pacote-sofisticado.jpg", rev: true },
    { nome: "Mix de Sensações", desc: "Uma seleção especial que une ousadia, criatividade e diversidade de sabores.", img: "pacote-mix.jpg", rev: false },
    { nome: "Vitalis", desc: "Drinks criativos, refrescantes e sofisticados, preparados sem álcool para todos curtirem juntos cada momento.", img: "pacote-vitalis.jpg", rev: true },
  ];
  return `
  <section class="page page-light">
    <div class="frame"></div>
    <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
    <div class="content">
      <h1 style="text-align:center;font-size:42px;">Nossos <span class="gold-text">Pacotes</span></h1>
      <p style="text-align:center;">Nossos pacotes foram pensados para atender cada estilo de celebração, do simples ao sofisticado, com opções alcoólicas e sem álcool que encantam todos os convidados.</p>
      <div style="margin-top:20px;">
        ${pacotes.map(p => `
          <div class="pkg-card ${p.rev ? "reverse" : ""}">
            <div class="pkg-img">${imgSlot(p.img, "Foto do pacote " + p.nome)}</div>
            <div class="pkg-txt">
              <h3>🔶 ${esc(p.nome)}</h3>
              <p>${esc(p.desc)}</p>
            </div>
          </div>`).join("")}
      </div>
    </div>
    <div class="footer">
      <span class="page-num">◆ 04 ◆</span>
      <span class="mini-logo"><span class="glass">🍸</span> BALERION —DRINKS—</span>
    </div>
  </section>`;
}

function pageCardapioSimples() {
  const col1 = [
    ["HI-FI", "Vodka com Refrigerante de Laranja"],
    ["CAIPIROSKA", "Vodka, fruta, açúcar"],
    ["MOJITO", "Rum, Limão, Açúcar, Clube Soda e Folhas de Hortelã"],
    ["OURO TROPICAL", "Cachaça Ouro, Limão Taiti, Limão Siciliano, Mel e Cravo"],
    ["STARK", "Rúcula, vodka, xar. açúcar, limão, uva roxa"],
    ["NEGRONI", "Gin, Campari, Vermute Rosso, Laranja"],
    ["CAIPIRINHA", "Cachaça, fruta, açúcar"],
  ];
  const col2 = [
    ["SAKERINHA", "Saquê, fruta, açúcar"],
    ["LAGOA AZUL", "Vodka, licor blue, Soda, limão, hortelã"],
    ["CUBA LIBRE", "Rum, Coca-Cola e Rodelas de Limão"],
    ["ESPANHOLA", "Vinho Tinto Suave, Abacaxi e Leite Condensado"],
    ["PIÑA COLADA", "Rum, Suco de Abacaxi, Leite de Coco e Leite Condensado"],
    ["GIN TÔNICA", "Gin, Tônica, especiarias"],
  ];
  const item = ([n, d]) => `<div class="item"><b>${n}</b><span>${d}</span></div>`;
  return `
  <section class="page page-light">
    <div class="frame"></div>
    <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
    <div class="content">
      <h1 style="text-align:center;font-size:40px;">Simples e <span class="gold-text">Descontraído</span></h1>
      <div class="banner-wrap"><span class="banner">CARDÁPIO</span></div>
      <div class="two-col" style="margin-top:10px;">
        <div>${col1.map(item).join("")}</div>
        <div>${col2.map(item).join("")}</div>
      </div>
    </div>
    <div style="position:absolute;left:64px;bottom:70px;width:120px;">${imgSlot("logo-balerion-mini.png", "Logo pequeno")}</div>
    <div style="position:absolute;right:64px;bottom:70px;width:280px;height:200px;">${imgSlot("cardapio-simples-drink.jpg", "Foto do drink com especiarias")}</div>
    <div class="footer">
      <span class="page-num">◆ 05 ◆</span>
      <span class="mini-logo"></span>
    </div>
  </section>`;
}

function pageCardapioSofisticado() {
  const drinks = [
    ["MARTINI CITRUS", "Martini, Refrigerante Citrus e Limão"],
    ["APEROL SPRITS", "Aperol, Espumante Prosseco, Clube Soda, Laranja"],
    ["MOSCOW MULE", "Vodka, limão, xar. gengibre, espuma de gengibre, água com gás"],
    ["FITZGERALD", "Gin, Limão Siciliano, X. de açúcar e Angostura"],
    ["SEX ON THE BEACH", "Vodka, Licor de Pêssego, S. Laranja, Xar. Grenadine"],
    ["MARACURED", "Wiskey, maracujá, xar. açúcar"],
    ["BELLINE", "Espumante e purê de pêssego"],
    ["MARACUTAYA", "Pitaya, Maracujá, Gin, X. Açúcar"],
    ["DRAGON CITRUS", "Gin, Limão, Energético Melância, Espuma Citrica"],
    ["EXPRESSO MARTINI", "Vodka, Café expresso, Licor de café"],
  ];
  const sabores1 = ["Morango com Maracujá", "Limão Siciliano com Gengibre", "Abacaxi com Hortelã e Pimenta Rosa", "Caju com Limão Siciliano"];
  const sabores2 = ["Tangerina com Gengibre", "Manga com Pimenta Dedo-de-Moça", "Manga com Maracujá e Açúcar Mascavo", "Pitaya Rosa com Limão Siciliano e Hortelã"];
  return `
  <section class="page page-light">
    <div class="frame"></div>
    <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
    <div class="content">
      <h1 style="text-align:center;font-size:38px;"><span class="gold-text">Sofisticado</span><br>e Conceituado</h1>
      <div style="display:flex;gap:34px;margin-top:16px;">
        <ul class="plain icon-list" style="flex:1;">
          ${drinks.map(([n, d]) => `<li><span class="ico">🍸</span><span><b>${n}</b> – ${d}</span></li>`).join("")}
        </ul>
        <div style="flex:0 0 260px;">${imgSlot("cardapio-sofisticado-drink.jpg", "Foto do drink sofisticado com framed logo")}</div>
      </div>
      <div class="banner-wrap" style="margin-top:6px;"><span class="banner">Caipirinhas Gourmet</span></div>
      <p style="text-align:center;font-style:italic;">Escolha uma opção entre os sabores</p>
      <div class="two-col">
        <ul class="plain">${sabores1.map(s => `<li style="margin-bottom:8px;">◆ ${s}</li>`).join("")}</ul>
        <ul class="plain">${sabores2.map(s => `<li style="margin-bottom:8px;">◆ ${s}</li>`).join("")}</ul>
      </div>
    </div>
    <div class="footer">
      <span class="page-num">◆ 06 ◆</span>
      <span class="mini-logo"><span class="glass">🍸</span> BALERION —DRINKS—</span>
    </div>
  </section>`;
}

function pageMixSensacoes() {
  return `
  <section class="page page-dark">
    <div class="frame"></div>
    <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
    <div class="content" style="text-align:center;">
      <h1 style="font-size:48px;"><span class="gold-text">Mix de</span><br><span style="color:#f2ece0;">Sensações</span></h1>
      <p style="font-style:italic;color:var(--gold-light);">Pacote personalizado</p>
      <div class="banner-wrap"><span class="banner">Limitado a 7 drinks*</span></div>
      <p style="max-width:520px;margin:16px auto;font-style:italic;">Uma seleção exclusiva que combina estilos, sabores e experiências inesquecíveis.</p>
      <div style="height:380px;margin-top:10px;">${imgSlot("mix-sensacoes-drinks.jpg", "Foto dos 5 drinks do Mix de Sensações")}</div>
      <div style="border:1px solid var(--gold);margin-top:26px;padding:14px;font-family:'Cinzel',serif;font-size:13px;letter-spacing:.5px;">
        *4 DRINKS CARTA SIMPLES E DESCONTRAÍDO<br>*3 DRINKS CARTA SOFISTICADO E CONCEITUADO
      </div>
    </div>
    <div class="footer">
      <span class="page-num">◆ 07 ◆</span>
      <span class="mini-logo"><span class="glass">🍸</span> BALERION —DRINKS—</span>
    </div>
  </section>`;
}

function pageVitalis() {
  const drinks = [
    ["MORANGO CITRUS", "Morango, Xar. Açúcar, Soda, Espuma Cítrica"],
    ["LIMONADA SUÍÇA", "Limão, leite condensado, água"],
    ["SODA ITALIANA", "Morango; Maçã verde; Tangerina; Frutas Vermelhas; Maracujá; Melancia; Pink limonada"],
    ["MOJITO", "Limão, Xar. Açucar, Hortelã, Clube Soda"],
    ["PINÃ DESCOLADA", "Abacaxi, Leite condensado, Leite de coco, Suco abacaxi"],
    ["CAIPFRUTA", "Fruta, Xar. Açúcar, Água Gaseificada"],
    ["BLUE OCEAN", "Xar. Blue, Clube Soda, Laranja"],
    ["ENERGI TROPICAL", "Energético, Espuma Cítrica"],
    ["BAILA LUA", "Xar. Curaçau blue, Abacaxi, Leite Condensado"],
    ["SUNSET", "Suco Laranja, Suco Pêssego, Cranberry"],
  ];
  return `
  <section class="page page-light">
    <div class="frame"></div>
    <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
    <div class="content">
      <h1 style="text-align:center;font-size:40px;">Vitalis - <span class="gold-text">0% Álcool</span></h1>
      <div class="divider"><span class="diamond"></span></div>
      <div style="display:flex;gap:34px;">
        <ul class="plain icon-list" style="flex:1;">
          ${drinks.map(([n, d]) => `<li><span class="ico">❖</span><span><b>${n}</b><br><span style="font-size:14px;">${d}</span></span></li>`).join("")}
        </ul>
        <div style="flex:0 0 280px;">${imgSlot("vitalis-drink-sem-alcool.jpg", "Foto do drink sem álcool")}</div>
      </div>
    </div>
    <div class="footer">
      <span class="page-num">◆ 08 ◆</span>
      <span class="mini-logo"><span class="glass">🍸</span> BALERION —DRINKS—</span>
    </div>
  </section>`;
}

function pageInvestimento(nome, dataFormatada, local, convidados, tipoEvento) {
  return `
  <section class="page page-dark">
    <div class="frame"></div>
    <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
    <div class="content" style="text-align:center;">
      ${imgSlot("logo-balerion.png", "Logo Balerion Drinks")}
      <div style="height:90px;"></div>
      <h1 style="font-size:42px;color:var(--gold);">Investimento</h1>
      <div class="divider"><span class="diamond"></span></div>

      <div class="info-grid">
        <div class="cell"><div class="ic">💼</div><div class="lb">${tipoEvento}</div></div>
        <div class="cell"><div class="ic">📍</div><div class="lb">${local}</div></div>
        <div class="cell"><div class="ic">👥</div><div class="lb">${convidados} pessoas</div></div>
        <div class="cell"><div class="ic">🍸</div><div class="lb">Drinks com e<br>sem álcool</div></div>
        <div class="cell"><div class="ic">🕐</div><div class="lb">Open bar<br>de 5h</div></div>
      </div>

      <div class="client-line">Cliente: ${nome} &nbsp;•&nbsp; Data do Evento: ${dataFormatada || "a combinar"}</div>

      <div style="display:flex;gap:30px;text-align:left;">
        <div style="flex:1;">
          <h3 style="font-size:20px;color:var(--gold);">Pacote está incluso</h3>
          <div class="divider" style="justify-content:flex-start;"><span class="diamond"></span></div>
          <ul class="plain" style="font-size:14px;line-height:1.9;">
            <li>◆ Frutas e Bebidas para preparo de drinks do cardápio;</li>
            <li>◆ Balcão desmontável para trabalho;</li>
            <li>◆ Cardápio Personalizado;</li>
            <li>◆ Utensílios para decoração do bar;</li>
            <li>◆ 3 Bartender + 1 barback;</li>
            <li>◆ Duração do open bar de 5h.</li>
          </ul>
        </div>
        <div style="flex:1;">
          <table class="price">
            <tr><th>PACOTE</th><th>VALOR</th></tr>
            <tr><td>SIMPLES E DESCONTRAÍDO</td><td>R$ 4.560,00</td></tr>
            <tr><td>SOFISTICADO E CONCEITUADO</td><td>R$ 5.080,00</td></tr>
            <tr><td>MIX DE SENSAÇÕES</td><td>R$ 5.630,00</td></tr>
            <tr><td>VITALIS</td><td>R$ 5.570,00</td></tr>
          </table>
        </div>
      </div>

      <div class="banner-wrap" style="margin-top:26px;"><span class="banner">Formas de Pagamento</span></div>
      <div style="display:flex;gap:30px;margin-top:14px;text-align:left;">
        <ul class="plain" style="flex:1;font-size:14px;line-height:1.9;">
          <li>◆ 20% - reserva da Data</li>
          <li>◆ 30% - no fechamento do contrato</li>
          <li>◆ 50% - até 7 dias antes do evento.</li>
        </ul>
        <div style="flex:1;font-size:14px;line-height:1.7;">
          <p>🔄 Parcelamento via PIX - Mensal</p>
          <p>💬 Demais opções de parcelamento, tratar diretamente com o contratante.</p>
        </div>
      </div>

      <p style="margin-top:18px;font-size:13px;font-style:italic;">⏳ Este orçamento é válido por 15 dias.</p>
    </div>
    <div class="footer" style="justify-content:center;">
      <span class="page-num">◆ 09 ◆</span>
    </div>
  </section>`;
}

function pageFechamento() {
  return `
  <section class="page page-dark">
    <div class="frame"></div>
    <div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
    <div class="content" style="text-align:center;padding-top:70px;">
      ${imgSlot("logo-balerion.png", "Logo Balerion Drinks")}
      <div style="height:90px;"></div>
      <h1 style="font-size:32px;color:var(--gold);">Sua celebração</h1>
      <h1 style="font-size:32px;color:#f2ece0;">merece o padrão</h1>
      <h1 style="font-size:56px;color:var(--gold);letter-spacing:4px;">BALERION</h1>
      <div class="divider"><span class="diamond"></span></div>
      <p style="font-size:17px;">Transforme seu evento em<br>uma <span class="gold-text">experiência lendária</span></p>
      <div class="banner-wrap" style="margin-top:18px;"><span class="banner">Garanta já sua data</span></div>

      <div class="contact-box" style="max-width:560px;margin:34px auto 0;">
        <div style="flex:1;text-align:left;">
          <div class="row">👤 Balerion Drinks</div>
          <div class="row">📍 Pirassununga - SP</div>
          <div class="row">📱 (19) 99998-9537</div>
        </div>
        <div class="divide"></div>
        <div style="flex:1;text-align:center;">🍸<br>Open Bar<br>para Eventos</div>
      </div>
    </div>
    <div style="position:absolute;right:0;bottom:0;width:320px;height:420px;opacity:.9;">
      ${imgSlot("fechamento-drink-destaque.jpg", "Foto de drink em destaque")}
    </div>
    <div class="footer">
      <span class="page-num">◆ 10 ◆</span>
      <span class="mini-logo"></span>
    </div>
  </section>`;
}
