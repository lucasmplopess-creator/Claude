"use strict";

// Listas de opções — específicas da empresa. Ajuste livremente os valores
// abaixo para refletir os setores, eixos estratégicos e valores reais da DS.
const SETORES = [
  "Produção",
  "Manutenção",
  "Qualidade",
  "Logística / Almoxarifado",
  "Comercial",
  "Administrativo / Financeiro",
  "Recursos Humanos",
  "Tecnologia da Informação",
  "Segurança do Trabalho",
  "Meio Ambiente",
  "Outro",
];

const EIXOS = [
  "Segurança",
  "Qualidade",
  "Produtividade / Eficiência",
  "Meio Ambiente e Sustentabilidade",
  "Pessoas e Cultura",
  "Inovação e Tecnologia",
  "Redução de Custos",
  "Outro",
];

const VALORES_DS = [
  "Segurança em primeiro lugar",
  "Integridade",
  "Excelência",
  "Colaboração e Trabalho em Equipe",
  "Inovação",
  "Respeito às Pessoas",
  "Sustentabilidade",
  "Foco no Cliente",
];

// Perguntas do formulário, agrupadas em etapas (wizard) na ordem apresentada.
const STEPS = [
  {
    title: "Identificação",
    subtitle: "Conte um pouco sobre quem está sugerindo a ideia.",
    fields: [
      {
        id: "setorOportunidade",
        type: "select",
        label: "Em qual setor você observou a oportunidade de Melhoria?",
        options: SETORES,
        required: true,
      },
      {
        id: "matricula",
        type: "text",
        label: "Matrícula",
        required: true,
      },
      {
        id: "nome",
        type: "text",
        label: "Seu Nome e Sobrenome",
        required: true,
      },
      {
        id: "setorTrabalho",
        type: "select",
        label: "Em qual setor você trabalha?",
        options: SETORES,
        required: true,
      },
    ],
  },
  {
    title: "Classificação da ideia",
    subtitle: "Ajude a categorizar sua sugestão.",
    fields: [
      {
        id: "eixo",
        type: "select",
        label: "Qual eixo está relacionado à sua sugestão?",
        options: EIXOS,
        required: true,
      },
      {
        id: "valorDs",
        type: "select",
        label: "Sua sugestão está alinhada a qual Valor da DS?",
        options: VALORES_DS,
        required: true,
      },
    ],
  },
  {
    title: "O problema",
    subtitle: "Descreva a situação atual que você quer melhorar.",
    fields: [
      {
        id: "situacao",
        type: "textarea",
        label: "Qual é a situação que você deseja melhorar?",
        help: "Descreva o problema.",
        required: true,
      },
      {
        id: "causaRaiz",
        type: "textarea",
        label: "Qual é a causa Raiz do problema?",
        help: "Identifique a principal causa que gera o problema. (Exemplo: falta de treinamento, falha de equipamento, má comunicação).",
        required: true,
      },
    ],
  },
  {
    title: "A solução e seu impacto",
    subtitle: "Detalhe sua proposta e o que ela deve gerar de valor.",
    fields: [
      {
        id: "solucao",
        type: "textarea",
        label: "Qual seria sua solução sugerida? Como você consertaria isso?",
        help: "Detalhe sua proposta de solução. Como ela resolverá o problema? Quais os passos que precisam ser tomados?",
        required: true,
      },
      {
        id: "beneficios",
        type: "textarea",
        label: "Quais benefícios você espera alcançar com a implementação dessa ideia?",
        help: "Exemplos: Melhorar a eficiência, reduzir custos, aumentar a segurança, etc.",
        required: true,
      },
      {
        id: "recursos",
        type: "textarea",
        label: "Quais recursos seriam necessários para implementar sua sugestão?",
        help: "(Pessoas, equipamentos, materiais, etc.)",
        required: true,
      },
      {
        id: "desafios",
        type: "textarea",
        label: "Quais desafios ou obstáculos você prevê na implementação da sua ideia?",
        required: true,
      },
    ],
  },
  {
    title: "Indicação",
    subtitle: "Por último, um detalhe rápido sobre a autoria da ideia.",
    fields: [
      {
        id: "indicarOutraPessoa",
        type: "radio",
        label: "Gostaria de indicar outra pessoa para esta ideia?",
        options: ["Sim", "Não"],
        required: true,
        conditional: {
          showWhen: "Sim",
          field: {
            id: "nomePessoaIndicada",
            type: "text",
            label: "Nome da pessoa indicada",
            required: true,
          },
        },
      },
    ],
  },
];

const FORM_FIELDS = STEPS.flatMap((step) => step.fields);

// Posição do círculo do logo dentro da foto do banner (frações do tamanho
// original da imagem), usada para alinhar o anel giratório sobre a foto
// mesmo quando ela é redimensionada de forma responsiva.
const HERO_LOGO = { xFrac: 0.2216, yFrac: 0.4995, dFrac: 0.3508 };

let currentStep = 0;
let cachedIdeas = [];

const els = {};

function qs(id) { return document.getElementById(id); }

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

// Todas as chamadas à API passam por aqui: sempre envia o cookie de sessão
// e, em requisições que mudam estado (POST/DELETE), o token CSRF que o
// servidor grava no cookie XSRF-TOKEN — sem isso o Spring Security rejeita
// a requisição com 403.
async function apiFetch(url, options = {}) {
  const opts = { credentials: "same-origin", ...options };
  const method = (opts.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    const token = getCookie("XSRF-TOKEN");
    opts.headers = Object.assign({}, opts.headers, token ? { "X-XSRF-TOKEN": token } : {});
  }
  return fetch(url, opts);
}

function renderField(field) {
  const wrap = document.createElement("div");
  wrap.className = "field";
  wrap.dataset.fieldId = field.id;

  const label = document.createElement("label");
  label.className = "field-label";
  label.setAttribute("for", field.id);
  label.textContent = field.label;
  if (field.required) {
    const mark = document.createElement("span");
    mark.className = "required-mark";
    mark.textContent = "*";
    label.appendChild(mark);
  }
  wrap.appendChild(label);

  if (field.help) {
    const help = document.createElement("p");
    help.className = "field-help";
    help.textContent = field.help;
    wrap.appendChild(help);
  }

  if (field.type === "select") {
    const select = document.createElement("select");
    select.id = field.id;
    select.name = field.id;
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Selecionar sua resposta";
    select.appendChild(blank);
    field.options.forEach((opt) => {
      const o = document.createElement("option");
      o.value = opt;
      o.textContent = opt;
      select.appendChild(o);
    });
    wrap.appendChild(select);
  } else if (field.type === "text") {
    const input = document.createElement("input");
    input.type = "text";
    input.id = field.id;
    input.name = field.id;
    input.placeholder = "Insira sua resposta";
    wrap.appendChild(input);
  } else if (field.type === "textarea") {
    const textarea = document.createElement("textarea");
    textarea.id = field.id;
    textarea.name = field.id;
    textarea.placeholder = "Insira sua resposta";
    wrap.appendChild(textarea);
  } else if (field.type === "radio") {
    const group = document.createElement("div");
    group.className = "radio-group";
    field.options.forEach((opt) => {
      const optLabel = document.createElement("label");
      optLabel.className = "radio-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = field.id;
      input.value = opt;
      optLabel.appendChild(input);
      optLabel.appendChild(document.createTextNode(opt));
      group.appendChild(optLabel);
    });
    wrap.appendChild(group);

    if (field.conditional) {
      const condWrap = document.createElement("div");
      condWrap.className = "field conditional-field";
      condWrap.hidden = true;
      condWrap.dataset.fieldId = field.conditional.field.id;

      const condLabel = document.createElement("label");
      condLabel.className = "field-label";
      condLabel.setAttribute("for", field.conditional.field.id);
      condLabel.textContent = field.conditional.field.label;
      if (field.conditional.field.required) {
        const mark = document.createElement("span");
        mark.className = "required-mark";
        mark.textContent = "*";
        condLabel.appendChild(mark);
      }
      condWrap.appendChild(condLabel);

      const condInput = document.createElement("input");
      condInput.type = "text";
      condInput.id = field.conditional.field.id;
      condInput.name = field.conditional.field.id;
      condInput.placeholder = "Insira sua resposta";
      condWrap.appendChild(condInput);

      wrap.appendChild(condWrap);

      group.addEventListener("change", () => {
        const checked = group.querySelector("input:checked");
        const show = checked && checked.value === field.conditional.showWhen;
        condWrap.hidden = !show;
        if (!show) condInput.value = "";
      });
    }
  }

  return wrap;
}

function positionHeroRing() {
  const hero = document.querySelector(".hero");
  const img = qs("heroImage");
  const ring = qs("heroRing");
  if (!hero || !img || !ring || !img.naturalWidth) return;

  const cw = hero.clientWidth;
  const ch = hero.clientHeight;
  const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
  const renderedW = img.naturalWidth * scale;
  const renderedH = img.naturalHeight * scale;
  const offsetX = (cw - renderedW) / 2;
  const offsetY = (ch - renderedH) / 2;

  const centerX = offsetX + HERO_LOGO.xFrac * renderedW;
  const centerY = offsetY + HERO_LOGO.yFrac * renderedH;
  const diameter = HERO_LOGO.dFrac * renderedW * 1.14;

  ring.style.width = diameter + "px";
  ring.style.height = diameter + "px";
  ring.style.left = (centerX - diameter / 2) + "px";
  ring.style.top = (centerY - diameter / 2) + "px";
  ring.classList.add("visible");
}

function renderStepper() {
  const stepper = qs("stepper");
  stepper.innerHTML = "";
  STEPS.forEach((step, i) => {
    const li = document.createElement("li");
    const dot = document.createElement("span");
    dot.className = "step-dot";
    dot.innerHTML = `<span>${i + 1}</span>`;
    li.appendChild(dot);
    stepper.appendChild(li);

    if (i < STEPS.length - 1) {
      const connector = document.createElement("div");
      connector.className = "step-connector";
      connector.innerHTML = '<div class="step-connector-fill"></div>';
      li.appendChild(connector);
    }
  });
}

function updateStepper() {
  const items = qs("stepper").children;
  Array.from(items).forEach((li, i) => {
    li.classList.toggle("active", i === currentStep);
    li.classList.toggle("done", i < currentStep);
    const fill = li.querySelector(".step-connector-fill");
    if (fill) fill.style.width = i < currentStep ? "100%" : "0%";
  });
  qs("stepProgressLabel").textContent = `Passo ${currentStep + 1} de ${STEPS.length} — ${STEPS[currentStep].title}`;
}

function renderForm() {
  renderStepper();

  const container = qs("stepsContainer");
  container.innerHTML = "";

  STEPS.forEach((step, i) => {
    const panel = document.createElement("div");
    panel.className = "step-panel";
    panel.dataset.stepIndex = String(i);

    const title = document.createElement("h2");
    title.className = "step-title";
    title.textContent = step.title;
    panel.appendChild(title);

    const subtitle = document.createElement("p");
    subtitle.className = "step-subtitle";
    subtitle.textContent = step.subtitle;
    panel.appendChild(subtitle);

    step.fields.forEach((field) => panel.appendChild(renderField(field)));

    container.appendChild(panel);
  });

  goToStep(0);
}

function goToStep(index) {
  currentStep = index;
  document.querySelectorAll(".step-panel").forEach((panel) => {
    panel.classList.toggle("active", Number(panel.dataset.stepIndex) === index);
  });
  updateStepper();

  qs("btnPrevStep").hidden = index === 0;
  const isLast = index === STEPS.length - 1;
  qs("btnNextStep").hidden = isLast;
  qs("btnSubmit").hidden = !isLast;
}

function clearInvalid(scopeEl) {
  const root = scopeEl || document;
  root.querySelectorAll(".field.invalid").forEach((el) => el.classList.remove("invalid"));
  qs("formError").hidden = true;
}

function validateFields(fields) {
  let valid = true;
  let firstInvalid = null;

  fields.forEach((field) => {
    const wrap = document.querySelector(`.field[data-field-id="${field.id}"]`);
    let fieldValid = true;

    if (field.type === "radio") {
      const checked = document.querySelector(`input[name="${field.id}"]:checked`);
      fieldValid = !!checked;

      if (fieldValid && field.conditional && checked.value === field.conditional.showWhen) {
        const condField = field.conditional.field;
        const condEl = qs(condField.id);
        const condWrap = document.querySelector(`.field[data-field-id="${condField.id}"]`);
        if (condField.required && !condEl.value.trim()) {
          condWrap.classList.add("invalid");
          valid = false;
          if (!firstInvalid) firstInvalid = condWrap;
        } else {
          condWrap.classList.remove("invalid");
        }
      }
    } else {
      const el = qs(field.id);
      fieldValid = !field.required || !!el.value.trim();
    }

    if (!fieldValid) {
      wrap.classList.add("invalid");
      valid = false;
      if (!firstInvalid) firstInvalid = wrap;
    } else {
      wrap.classList.remove("invalid");
    }
  });

  if (!valid) {
    qs("formError").hidden = false;
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return valid;
}

function collectFormData() {
  const data = {};
  FORM_FIELDS.forEach((field) => {
    if (field.type === "radio") {
      const checked = document.querySelector(`input[name="${field.id}"]:checked`);
      data[field.id] = checked ? checked.value : "";
      if (field.conditional && data[field.id] === field.conditional.showWhen) {
        data[field.conditional.field.id] = qs(field.conditional.field.id).value.trim();
      }
    } else {
      data[field.id] = qs(field.id).value.trim();
    }
  });
  return data;
}

function resetForm() {
  qs("ideaForm").reset();
  clearInvalid();
  document.querySelectorAll(".conditional-field").forEach((el) => { el.hidden = true; });
  goToStep(0);
}

function showScreen(name) {
  ["homeScreen", "formScreen", "successScreen", "loginScreen", "responsesScreen"].forEach((id) => {
    qs(id).hidden = id !== name;
  });
  if (name === "formScreen") positionHeroRing();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// A tela de respostas exige login: verifica a sessão no servidor antes de
// decidir se mostra a tabela ou o formulário de login.
async function openResponses() {
  try {
    const res = await apiFetch("/api/auth/me");
    const data = await res.json();
    if (data.authenticated) {
      showScreen("responsesScreen");
      await loadAndRenderResponses();
    } else {
      showScreen("loginScreen");
    }
  } catch (e) {
    showScreen("loginScreen");
  }
}

function showLoginError(msg) {
  const el = qs("loginError");
  el.textContent = msg;
  el.hidden = false;
}

async function handleLogin(e) {
  e.preventDefault();
  qs("loginError").hidden = true;

  const username = qs("loginUsername").value.trim();
  const password = qs("loginPassword").value;

  try {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      qs("loginForm").reset();
      showScreen("responsesScreen");
      await loadAndRenderResponses();
    } else if (res.status === 429) {
      showLoginError("Muitas tentativas de login. Aguarde um minuto e tente novamente.");
    } else {
      showLoginError("Usuário ou senha inválidos.");
    }
  } catch (err) {
    showLoginError("Não foi possível conectar ao servidor. Tente novamente.");
  }
}

async function handleLogout() {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch (e) {
    // mesmo se a chamada falhar, seguimos para a home
  }
  showScreen("homeScreen");
}

function handleNextStep() {
  clearInvalid();
  if (!validateFields(STEPS[currentStep].fields)) return;
  goToStep(currentStep + 1);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handlePrevStep() {
  clearInvalid();
  goToStep(currentStep - 1);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function handleSubmit(e) {
  e.preventDefault();
  clearInvalid();
  if (!validateFields(STEPS[currentStep].fields)) return;

  const data = collectFormData();
  const submitBtn = qs("btnSubmit");
  submitBtn.disabled = true;

  try {
    const res = await apiFetch("/api/ideias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      resetForm();
      showScreen("successScreen");
    } else if (res.status === 429) {
      qs("formError").hidden = false;
      qs("formError").textContent = "Muitos envios em pouco tempo. Aguarde um minuto e tente novamente.";
    } else {
      qs("formError").hidden = false;
      qs("formError").textContent = "Não foi possível enviar sua ideia. Verifique os campos e tente novamente.";
    }
  } catch (err) {
    qs("formError").hidden = false;
    qs("formError").textContent = "Não foi possível conectar ao servidor. Tente novamente em instantes.";
  } finally {
    submitBtn.disabled = false;
  }
}

function fieldLabelById(id) {
  for (const f of FORM_FIELDS) {
    if (f.id === id) return f.label;
    if (f.conditional && f.conditional.field.id === id) return f.conditional.field.label;
  }
  return id;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR");
}

async function loadAndRenderResponses() {
  try {
    const res = await apiFetch("/api/ideias");
    if (res.status === 401) {
      showScreen("loginScreen");
      return;
    }
    if (!res.ok) throw new Error("Falha ao carregar respostas");
    cachedIdeas = await res.json();
  } catch (err) {
    cachedIdeas = [];
  }
  renderResponsesTable();
}

function renderResponsesTable() {
  const list = cachedIdeas;
  const search = (qs("responsesSearch").value || "").toLowerCase();

  const filtered = list.filter((item) => {
    if (!search) return true;
    return [item.nome, item.matricula, item.setorOportunidade, item.setorTrabalho, item.eixo, item.situacao]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(search));
  });

  qs("responsesEmpty").hidden = list.length !== 0;
  document.querySelector(".table-wrap").hidden = list.length === 0;

  const tbody = qs("responsesTbody");
  tbody.innerHTML = "";

  filtered
    .forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formatDate(item.createdAt)}</td>
        <td>${escapeHtml(item.nome)}</td>
        <td>${escapeHtml(item.matricula)}</td>
        <td>${escapeHtml(item.setorOportunidade)}</td>
        <td>${escapeHtml(item.setorTrabalho)}</td>
        <td>${escapeHtml(item.eixo)}</td>
        <td>${escapeHtml(item.valorDs)}</td>
        <td>${escapeHtml(item.situacao)}</td>
        <td><button class="link-btn" data-delete-id="${item.id}">Excluir</button></td>
      `;
      tr.addEventListener("click", (ev) => {
        if (ev.target.closest("[data-delete-id]")) return;
        showDetail(item);
      });
      tbody.appendChild(tr);
    });

  tbody.querySelectorAll("[data-delete-id]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      deleteSubmission(btn.dataset.deleteId);
    });
  });
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function deleteSubmission(id) {
  try {
    const res = await apiFetch(`/api/ideias/${id}`, { method: "DELETE" });
    if (res.status === 401) {
      showScreen("loginScreen");
      return;
    }
    if (!res.ok) throw new Error("Falha ao excluir");
    cachedIdeas = cachedIdeas.filter((item) => item.id !== id);
    renderResponsesTable();
  } catch (err) {
    alert("Não foi possível excluir esta ideia. Tente novamente.");
  }
}

function showDetail(item) {
  const body = qs("detailBody");
  body.innerHTML = "";
  const dl = document.createElement("dl");

  const allFieldIds = FORM_FIELDS.flatMap((f) => f.conditional ? [f.id, f.conditional.field.id] : [f.id]);

  allFieldIds.forEach((id) => {
    if (item[id] === undefined || item[id] === "") return;
    const row = document.createElement("div");
    row.className = "detail-row";
    const dt = document.createElement("dt");
    dt.textContent = fieldLabelById(id);
    const dd = document.createElement("dd");
    dd.textContent = item[id];
    row.appendChild(dt);
    row.appendChild(dd);
    dl.appendChild(row);
  });

  const row = document.createElement("div");
  row.className = "detail-row";
  const dt = document.createElement("dt");
  dt.textContent = "Enviado em";
  const dd = document.createElement("dd");
  dd.textContent = formatDate(item.createdAt);
  row.appendChild(dt);
  row.appendChild(dd);
  dl.insertBefore(row, dl.firstChild);

  body.appendChild(dl);
  qs("detailOverlay").hidden = false;
}

function exportCsv() {
  // O servidor gera o arquivo pronto; o cookie de sessão vai junto por ser
  // uma navegação normal (mesma origem), então não precisa de token extra.
  window.location.href = "/api/ideias/export/csv";
}

function exportJson() {
  window.location.href = "/api/ideias/export/json";
}

async function clearAll() {
  if (!confirm("Tem certeza que deseja apagar TODAS as respostas do banco de dados? Essa ação não pode ser desfeita.")) return;
  try {
    const res = await apiFetch("/api/ideias", { method: "DELETE" });
    if (res.status === 401) {
      showScreen("loginScreen");
      return;
    }
    if (!res.ok) throw new Error("Falha ao apagar");
    cachedIdeas = [];
    renderResponsesTable();
  } catch (err) {
    alert("Não foi possível apagar as respostas. Tente novamente.");
  }
}

function init() {
  renderForm();

  const heroImage = qs("heroImage");
  if (heroImage.complete) {
    positionHeroRing();
  } else {
    heroImage.addEventListener("load", positionHeroRing);
  }
  window.addEventListener("resize", positionHeroRing);

  qs("ideaForm").addEventListener("submit", handleSubmit);
  qs("btnNextStep").addEventListener("click", handleNextStep);
  qs("btnPrevStep").addEventListener("click", handlePrevStep);
  qs("navHome").addEventListener("click", () => showScreen("homeScreen"));
  qs("navForm").addEventListener("click", () => showScreen("formScreen"));
  qs("navResponses").addEventListener("click", openResponses);
  qs("optionNewIdea").addEventListener("click", () => showScreen("formScreen"));
  qs("optionViewIdeas").addEventListener("click", openResponses);
  qs("btnAnotherResponse").addEventListener("click", () => showScreen("formScreen"));
  qs("btnGoResponses").addEventListener("click", openResponses);
  qs("loginForm").addEventListener("submit", handleLogin);
  qs("btnLogout").addEventListener("click", handleLogout);
  qs("responsesSearch").addEventListener("input", renderResponsesTable);
  qs("btnExportCsv").addEventListener("click", exportCsv);
  qs("btnExportJson").addEventListener("click", exportJson);
  qs("btnClearAll").addEventListener("click", clearAll);
  qs("btnCloseDetail").addEventListener("click", () => { qs("detailOverlay").hidden = true; });
  qs("detailOverlay").addEventListener("click", (e) => {
    if (e.target === qs("detailOverlay")) qs("detailOverlay").hidden = true;
  });
}

document.addEventListener("DOMContentLoaded", init);
