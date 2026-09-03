/* Balerion Drinks — comportamentos da landing page */
(function () {
  "use strict";

  var WHATSAPP = "5519999989537";

  /* ---------- fotos ausentes viram placeholder com o nome do arquivo ---------- */
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    function markEmpty() {
      var fig = img.closest(".photo");
      if (fig) fig.classList.add("is-empty");
      img.remove();
    }
    if (img.complete && img.naturalWidth === 0) markEmpty();
    img.addEventListener("error", markEmpty);
  });

  /* ---------- nav: fundo ao rolar + menu mobile ---------- */
  var nav = document.getElementById("nav");
  var menu = document.getElementById("menu");
  var burger = document.getElementById("burger");

  function onScroll() {
    nav.classList.toggle("is-stuck", window.scrollY > 20);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeMenu() {
    menu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }

  burger.addEventListener("click", function () {
    var open = menu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  menu.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeMenu();
  });

  /* ---------- reveal ao entrar na viewport ---------- */
  var revealables = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- abas dos cardápios ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));

  function activateTab(name) {
    var found = false;
    tabs.forEach(function (tab) {
      var active = tab.dataset.tab === name;
      if (active) found = true;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      var panel = document.getElementById(tab.getAttribute("aria-controls"));
      if (!panel) return;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
    return found;
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () { activateTab(tab.dataset.tab); });
  });

  /* setas do teclado navegam entre as abas */
  document.querySelector(".tabs").addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var i = tabs.indexOf(document.activeElement);
    if (i === -1) return;
    var next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    activateTab(next.dataset.tab);
    e.preventDefault();
  });

  /* "Ver cardápio" nos cards de pacote já abre a aba certa */
  document.querySelectorAll('a[href="#cardapios"][data-tab]').forEach(function (link) {
    link.addEventListener("click", function () { activateTab(link.dataset.tab); });
  });

  /* ---------- formulário: monta a mensagem do WhatsApp ---------- */
  var form = document.getElementById("form");

  function formatDateBR(iso) {
    if (!iso) return "";
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = form.elements;
    var linhas = [
      "Olá, Balerion Drinks! Gostaria de um orçamento.",
      "",
      "Nome: " + (f.nome.value || "-"),
      "Tipo de evento: " + f.tipo.value,
      "Data: " + (formatDateBR(f.data.value) || "a definir"),
      "Local: " + (f.local.value || "a definir"),
      "Convidados: " + (f.convidados.value || "a definir"),
      "Pacote de interesse: " + f.pacote.value
    ];
    if (f.msg.value.trim()) linhas.push("", "Detalhes: " + f.msg.value.trim());

    window.open(
      "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(linhas.join("\n")),
      "_blank",
      "noopener"
    );
  });

  /* ---------- ano do rodapé ---------- */
  document.getElementById("ano").textContent = new Date().getFullYear();
})();
