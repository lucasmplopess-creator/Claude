const form = document.getElementById("proposalForm");
const preview = document.getElementById("preview");
const downloadBtn = document.getElementById("downloadBtn");

let lastHTML = null;

function readForm() {
  return {
    nome: document.getElementById("nome").value.trim(),
    dataEvento: document.getElementById("dataEvento").value,
    local: document.getElementById("local").value.trim(),
    convidados: document.getElementById("convidados").value.trim(),
    tipoEvento: document.getElementById("tipoEvento").value,
  };
}

function slugify(str) {
  return String(str || "cliente")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function generate() {
  const data = readForm();
  lastHTML = buildProposalHTML(data);
  preview.srcdoc = lastHTML;
  downloadBtn.disabled = false;
  return data;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  generate();
});

downloadBtn.addEventListener("click", () => {
  if (!lastHTML) return;
  const data = readForm();
  const filename = `proposta-balerion-${slugify(data.nome)}-${data.dataEvento || "sem-data"}.html`;
  const blob = new Blob([lastHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
