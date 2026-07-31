(function () {
  "use strict";

  var STORAGE_INDEX_KEY = "mindflux:index";
  var STORAGE_MAP_PREFIX = "mindflux:map:";
  var CANVAS_CENTER_X = 3000;
  var CANVAS_CENTER_Y = 2000;
  var MAX_HISTORY = 60;

  var THEMES = [
    { id: "meister", name: "Meister", rootColor: "#2D3142", colors: ["#5B5FEF", "#F76E6E", "#4CC9A0", "#F7B84F", "#B57BEE", "#F76EC2", "#3AB6D6", "#8BC34A"] },
    { id: "prism", name: "Prism", rootColor: "#212529", colors: ["#4361EE", "#F72585", "#4CC9F0", "#FFB703", "#7209B7", "#06D6A0", "#FB5607", "#3A86FF"] },
    { id: "colorburst", name: "Color Burst", rootColor: "#1D3557", colors: ["#E63946", "#2A9D8F", "#E9C46A", "#E76F51", "#457B9D", "#F4A261", "#9B5DE5", "#00BBF9"] },
    { id: "ocean", name: "Ocean", rootColor: "#03045E", colors: ["#0077B6", "#00B4D8", "#48CAE4", "#0096C7", "#023E8A", "#5390D9", "#4EA8DE", "#0466C8"] },
    { id: "sunset", name: "Sunset", rootColor: "#6A040F", colors: ["#FF6B6B", "#FFA07A", "#FFD166", "#F77F00", "#EF476F", "#D62828", "#C9184A", "#FFB4A2"] },
    { id: "vintage", name: "Vintage", rootColor: "#3E2723", colors: ["#A9927D", "#8C6A5D", "#B08968", "#7F5539", "#9C6644", "#DDB892", "#6B4C3B", "#AD8B73"] },
    { id: "pastel", name: "Pastel", rootColor: "#495057", colors: ["#A0C4FF", "#FFADAD", "#FFD6A5", "#CBF3C9", "#CAFFBF", "#9BF6FF", "#BDB2FF", "#FFC6FF"] },
    { id: "bubbles", name: "Bubbles", rootColor: "#22223B", colors: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF", "#06D6A0", "#EF476F", "#118AB2"] },
    { id: "aquarelle", name: "Aquarelle", rootColor: "#023047", colors: ["#8ECAE6", "#219EBC", "#FFB703", "#FB8500", "#A8DADC", "#457B9D", "#E76F51", "#E63946"] },
    { id: "spring", name: "Spring", rootColor: "#1B4332", colors: ["#95D5B2", "#74C69D", "#52B788", "#40916C", "#B7E4C7", "#FFD166", "#EF476F", "#2D6A4F"] },
    { id: "nostalgia", name: "Nostalgia", rootColor: "#22223B", colors: ["#C9ADA7", "#9A8C98", "#4A4E69", "#B08968", "#DDBEA9", "#CB997E", "#A5A58D", "#6B705C"] },
    { id: "cubicle", name: "Cubicle", rootColor: "#212529", colors: ["#6C757D", "#495057", "#5C677D", "#457B9D", "#868E96", "#4A5568", "#718096", "#2B6CB0"] },
    { id: "midnite", name: "Midnite", rootColor: "#2b2c3d", dark: true, canvasBg: "#14151f", dotColor: "#2a2b3d", colors: ["#4CC9F0", "#F72585", "#7209B7", "#4361EE", "#4895EF", "#B5179E", "#3A0CA3", "#4CC9A0"] },
    { id: "fireworks", name: "Fireworks", rootColor: "#2b2c3d", dark: true, canvasBg: "#16161e", dotColor: "#2c2c38", colors: ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF", "#06D6A0", "#EF476F", "#F15BB5"] },
    { id: "blackboard", name: "Blackboard", rootColor: "#333333", dark: true, canvasBg: "#1c1c1c", dotColor: "#333333", colors: ["#FFFFFF", "#8ECAE6", "#FFD166", "#95D5B2", "#F4A261", "#CDB4DB", "#F28482", "#A8DADC"] },
    { id: "darkmode", name: "Dark Mode", rootColor: "#2b2c3d", dark: true, canvasBg: "#1a1a24", dotColor: "#2a2a38", colors: ["#5B5FEF", "#F76E6E", "#4CC9A0", "#F7B84F", "#B57BEE", "#F76EC2", "#3AB6D6", "#8BC34A"] }
  ];

  var LAYOUTS = [
    { id: "mindmap", name: "Mapa mental" },
    { id: "org", name: "Organograma" },
    { id: "list", name: "Lista" }
  ];

  var ORG_LEVEL_GAP = 130;
  var ORG_SLOT_WIDTH = 190;
  var LIST_ROW_GAP = 62;
  var LIST_INDENT = 70;
  var LIST_BASE_X = 260;
  var LIST_BASE_Y = 200;

  var els = {};
  var currentMap = null;
  var selectedNodeId = null;
  var editingNodeId = null;
  var history = [];
  var future = [];
  var pan = { x: 0, y: 0 };
  var zoom = 1;
  var paletteCursor = 0;

  var drag = null;
  var panState = null;
  var saveTimer = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheEls();
    bindDashboardEvents();
    bindEditorEvents();
    buildColorSwatches();
    showDashboard();
  }

  function cacheEls() {
    els.dashboardScreen = document.getElementById("dashboardScreen");
    els.editorScreen = document.getElementById("editorScreen");
    els.mapGrid = document.getElementById("mapGrid");
    els.emptyState = document.getElementById("emptyState");
    els.dashboardSearch = document.getElementById("dashboardSearch");
    els.btnNewMap = document.getElementById("btnNewMap");
    els.btnNewMapEmpty = document.getElementById("btnNewMapEmpty");
    els.btnImportMap = document.getElementById("btnImportMap");
    els.importFileInput = document.getElementById("importFileInput");

    els.btnBackToDashboard = document.getElementById("btnBackToDashboard");
    els.mapTitleInput = document.getElementById("mapTitleInput");
    els.btnUndo = document.getElementById("btnUndo");
    els.btnRedo = document.getElementById("btnRedo");
    els.btnZoomOut = document.getElementById("btnZoomOut");
    els.btnZoomIn = document.getElementById("btnZoomIn");
    els.btnZoomReset = document.getElementById("btnZoomReset");
    els.btnFit = document.getElementById("btnFit");
    els.searchInput = document.getElementById("searchInput");
    els.btnExportPng = document.getElementById("btnExportPng");
    els.btnExportJson = document.getElementById("btnExportJson");
    els.btnShortcuts = document.getElementById("btnShortcuts");

    els.btnAppearance = document.getElementById("btnAppearance");
    els.appearancePanel = document.getElementById("appearancePanel");
    els.btnCloseAppearance = document.getElementById("btnCloseAppearance");
    els.layoutOptions = document.getElementById("layoutOptions");
    els.themeGrid = document.getElementById("themeGrid");

    els.colorPanel = document.getElementById("colorPanel");
    els.colorSwatches = document.getElementById("colorSwatches");
    els.canvasViewport = document.getElementById("canvasViewport");
    els.canvasContent = document.getElementById("canvasContent");
    els.connectorsLayer = document.getElementById("connectorsLayer");
    els.nodesLayer = document.getElementById("nodesLayer");
    els.statusText = document.getElementById("statusText");
    els.saveIndicator = document.getElementById("saveIndicator");

    els.modalOverlay = document.getElementById("modalOverlay");
    els.modalTitle = document.getElementById("modalTitle");
    els.modalBody = document.getElementById("modalBody");
    els.modalCancel = document.getElementById("modalCancel");
    els.modalConfirm = document.getElementById("modalConfirm");

    els.modalOverlay.addEventListener("mousedown", function (e) {
      if (e.target === e.currentTarget) closeModal();
    });
  }

  /* ============ Utilities ============ */

  function uid() {
    return "n" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function formatDate(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function findNode(node, id) {
    if (node.id === id) return node;
    for (var i = 0; i < node.children.length; i++) {
      var found = findNode(node.children[i], id);
      if (found) return found;
    }
    return null;
  }

  function findParent(node, childId, parent) {
    if (node.id === childId) return parent || null;
    for (var i = 0; i < node.children.length; i++) {
      var found = findParent(node.children[i], childId, node);
      if (found !== undefined && found !== null) return found;
    }
    return null;
  }

  function countNodes(node) {
    var c = 1;
    for (var i = 0; i < node.children.length; i++) c += countNodes(node.children[i]);
    return c;
  }

  /* ============ Modal helper ============ */

  function showModal(opts) {
    els.modalTitle.textContent = opts.title || "";
    els.modalBody.innerHTML = opts.bodyHTML || "";
    els.modalConfirm.textContent = opts.confirmText || "Confirmar";
    els.modalConfirm.className = "btn " + (opts.danger ? "btn-danger" : "btn-primary");
    els.modalConfirm.style.display = opts.hideConfirm ? "none" : "";
    els.modalCancel.textContent = opts.cancelText || "Cancelar";
    els.modalOverlay.hidden = false;

    var confirmHandler = function () {
      if (opts.onConfirm) {
        var result = opts.onConfirm();
        if (result === false) return;
      }
      closeModal();
    };
    var cancelHandler = function () {
      if (opts.onCancel) opts.onCancel();
      closeModal();
    };

    els.modalConfirm.onclick = confirmHandler;
    els.modalCancel.onclick = cancelHandler;

    if (opts.onOpen) opts.onOpen(els.modalBody);
  }

  function closeModal() {
    els.modalOverlay.hidden = true;
    els.modalConfirm.onclick = null;
    els.modalCancel.onclick = null;
  }

  /* ============ Storage ============ */

  function loadIndex() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_INDEX_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveIndex(index) {
    localStorage.setItem(STORAGE_INDEX_KEY, JSON.stringify(index));
  }

  function loadMap(id) {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_MAP_PREFIX + id));
    } catch (e) {
      return null;
    }
  }

  function persistMap(map) {
    localStorage.setItem(STORAGE_MAP_PREFIX + map.id, JSON.stringify(map));
    var index = loadIndex();
    var entry = index.find(function (m) { return m.id === map.id; });
    if (!entry) {
      entry = { id: map.id, name: map.name, createdAt: map.createdAt };
      index.push(entry);
    }
    entry.name = map.name;
    entry.updatedAt = map.updatedAt;
    entry.nodeCount = countNodes(map.root);
    saveIndex(index);
  }

  function deleteMapFromStorage(id) {
    localStorage.removeItem(STORAGE_MAP_PREFIX + id);
    var index = loadIndex().filter(function (m) { return m.id !== id; });
    saveIndex(index);
  }

  function scheduleSave() {
    if (!currentMap) return;
    currentMap.updatedAt = nowIso();
    var mapToSave = currentMap;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      saveTimer = null;
      persistMap(mapToSave);
      flashSaveIndicator();
    }, 300);
  }

  function flushPendingSave() {
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    if (currentMap) persistMap(currentMap);
  }

  function flashSaveIndicator() {
    els.saveIndicator.textContent = "Salvo " + new Date().toLocaleTimeString("pt-BR");
    els.saveIndicator.classList.add("show");
    setTimeout(function () { els.saveIndicator.classList.remove("show"); }, 1500);
  }

  /* ============ Dashboard ============ */

  function bindDashboardEvents() {
    els.btnNewMap.addEventListener("click", function () { promptNewMap(); });
    els.btnNewMapEmpty.addEventListener("click", function () { promptNewMap(); });
    els.btnImportMap.addEventListener("click", function () { els.importFileInput.click(); });
    els.importFileInput.addEventListener("change", handleImportFile);
    els.dashboardSearch.addEventListener("input", renderDashboard);
  }

  function promptNewMap() {
    showModal({
      title: "Novo mapa mental",
      bodyHTML: '<input type="text" id="newMapNameInput" placeholder="Ex: Planejamento Q3" />',
      confirmText: "Criar mapa",
      onOpen: function (body) {
        var input = body.querySelector("#newMapNameInput");
        input.focus();
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); els.modalConfirm.click(); }
        });
      },
      onConfirm: function () {
        var name = document.getElementById("newMapNameInput").value.trim() || "Mapa sem título";
        var map = createNewMap(name);
        persistMap(map);
        openMap(map.id);
      }
    });
  }

  function createNewMap(name) {
    var id = uid();
    var ts = nowIso();
    return {
      id: id,
      name: name,
      createdAt: ts,
      updatedAt: ts,
      themeId: THEMES[0].id,
      layoutMode: "mindmap",
      root: {
        id: uid(),
        text: name,
        x: CANVAS_CENTER_X,
        y: CANVAS_CENTER_Y,
        color: THEMES[0].rootColor,
        collapsed: false,
        side: 0,
        children: []
      }
    };
  }

  function renderDashboard() {
    var index = loadIndex().sort(function (a, b) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    var query = els.dashboardSearch.value.trim().toLowerCase();
    if (query) {
      index = index.filter(function (m) { return m.name.toLowerCase().indexOf(query) !== -1; });
    }

    els.mapGrid.innerHTML = "";
    els.emptyState.hidden = index.length > 0 || query;

    index.forEach(function (m) {
      var card = document.createElement("div");
      card.className = "map-card";
      card.innerHTML =
        '<div class="map-card-thumb">' + escapeHtml(initials(m.name)) + '</div>' +
        '<div class="map-card-name"></div>' +
        '<div class="map-card-meta"></div>' +
        '<div class="map-card-actions">' +
        '<button class="btn btn-ghost btn-duplicate">Duplicar</button>' +
        '<button class="btn btn-ghost btn-export">JSON</button>' +
        '<button class="btn btn-ghost btn-delete">Excluir</button>' +
        '</div>';
      card.querySelector(".map-card-name").textContent = m.name;
      card.querySelector(".map-card-meta").textContent =
        (m.nodeCount || 1) + " tópicos · atualizado em " + formatDate(m.updatedAt);

      card.addEventListener("click", function () { openMap(m.id); });
      card.querySelector(".btn-duplicate").addEventListener("click", function (e) {
        e.stopPropagation();
        duplicateMap(m.id);
      });
      card.querySelector(".btn-export").addEventListener("click", function (e) {
        e.stopPropagation();
        exportMapJson(loadMap(m.id));
      });
      card.querySelector(".btn-delete").addEventListener("click", function (e) {
        e.stopPropagation();
        confirmDeleteMap(m.id, m.name);
      });
      els.mapGrid.appendChild(card);
    });
  }

  function initials(name) {
    var parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(function (p) { return p[0] ? p[0].toUpperCase() : ""; }).join("");
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function duplicateMap(id) {
    var map = loadMap(id);
    if (!map) return;
    var copy = deepClone(map);
    copy.id = uid();
    copy.name = map.name + " (cópia)";
    copy.createdAt = nowIso();
    copy.updatedAt = copy.createdAt;
    reassignIds(copy.root);
    persistMap(copy);
    renderDashboard();
  }

  function reassignIds(node) {
    node.id = uid();
    node.children.forEach(reassignIds);
  }

  function confirmDeleteMap(id, name) {
    showModal({
      title: "Excluir mapa",
      bodyHTML: "<p>Tem certeza que deseja excluir <strong>" + escapeHtml(name) + "</strong>? Essa ação não pode ser desfeita.</p>",
      confirmText: "Excluir",
      danger: true,
      onConfirm: function () {
        deleteMapFromStorage(id);
        renderDashboard();
      }
    });
  }

  function exportMapJson(map) {
    if (!map) return;
    var blob = new Blob([JSON.stringify(map, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = sanitizeFilename(map.name) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function sanitizeFilename(name) {
    return name.replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "-") || "mapa-mental";
  }

  function handleImportFile(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!data.root || !data.root.text) throw new Error("invalid");
        data.id = uid();
        data.updatedAt = nowIso();
        data.createdAt = data.createdAt || data.updatedAt;
        data.name = data.name || "Mapa importado";
        reassignIds(data.root);
        persistMap(data);
        renderDashboard();
        showModal({
          title: "Importado com sucesso",
          bodyHTML: "<p>O mapa <strong>" + escapeHtml(data.name) + "</strong> foi importado.</p>",
          confirmText: "Abrir mapa",
          onConfirm: function () { openMap(data.id); }
        });
      } catch (err) {
        showModal({
          title: "Erro ao importar",
          bodyHTML: "<p>O arquivo selecionado não é um mapa MindFlux válido.</p>",
          hideConfirm: true,
          cancelText: "Fechar"
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function showDashboard() {
    flushPendingSave();
    els.editorScreen.hidden = true;
    els.dashboardScreen.hidden = false;
    currentMap = null;
    renderDashboard();
  }

  /* ============ Editor: open / navigation ============ */

  function openMap(id) {
    flushPendingSave();
    var map = loadMap(id);
    if (!map) return;
    currentMap = map;
    currentMap.themeId = currentMap.themeId || THEMES[0].id;
    currentMap.layoutMode = currentMap.layoutMode || "mindmap";
    selectedNodeId = null;
    editingNodeId = null;
    history = [];
    future = [];
    pan = { x: 0, y: 0 };
    zoom = 1;
    paletteCursor = countTopLevelChildren(map.root);

    els.dashboardScreen.hidden = true;
    els.editorScreen.hidden = false;
    els.mapTitleInput.value = map.name;
    els.colorPanel.hidden = true;
    els.appearancePanel.hidden = true;
    els.statusText.textContent = "Pronto.";

    applyCanvasTheme();
    buildColorSwatches();
    render();
    centerOnRoot();
    renderAppearancePanel();
  }

  function countTopLevelChildren(root) {
    return root.children.length;
  }

  function bindEditorEvents() {
    els.btnBackToDashboard.addEventListener("click", showDashboard);

    els.mapTitleInput.addEventListener("input", function () {
      currentMap.name = els.mapTitleInput.value.trim() || "Mapa sem título";
      scheduleSave();
    });

    els.btnUndo.addEventListener("click", undo);
    els.btnRedo.addEventListener("click", redo);
    els.btnZoomIn.addEventListener("click", function () { setZoom(zoom * 1.2, viewportCenterClient()); });
    els.btnZoomOut.addEventListener("click", function () { setZoom(zoom / 1.2, viewportCenterClient()); });
    els.btnZoomReset.addEventListener("click", function () { zoom = 1; centerOnRoot(); applyTransform(); });
    els.btnFit.addEventListener("click", fitToScreen);
    els.btnExportPng.addEventListener("click", exportPng);
    els.btnExportJson.addEventListener("click", function () { exportMapJson(currentMap); });
    els.btnShortcuts.addEventListener("click", showShortcutsModal);
    els.btnAppearance.addEventListener("click", function () {
      selectNode(null);
      els.appearancePanel.hidden = !els.appearancePanel.hidden;
      if (!els.appearancePanel.hidden) renderAppearancePanel();
    });
    els.btnCloseAppearance.addEventListener("click", function () { els.appearancePanel.hidden = true; });
    els.searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); runSearch(); }
    });

    els.canvasViewport.addEventListener("mousedown", onViewportMouseDown);
    els.canvasViewport.addEventListener("wheel", onWheelZoom, { passive: false });
    document.addEventListener("mousemove", onDocumentMouseMove);
    document.addEventListener("mouseup", onDocumentMouseUp);
    document.addEventListener("keydown", onDocumentKeyDown);

    window.addEventListener("beforeunload", flushPendingSave);
  }

  function viewportCenterClient() {
    var rect = els.canvasViewport.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function showShortcutsModal() {
    showModal({
      title: "Atalhos de teclado",
      hideConfirm: true,
      cancelText: "Fechar",
      bodyHTML:
        "<ul>" +
        "<li><kbd>Tab</kbd> — adicionar subtópico</li>" +
        "<li><kbd>Enter</kbd> — adicionar tópico irmão</li>" +
        "<li><kbd>Delete</kbd> / <kbd>Backspace</kbd> — excluir tópico selecionado</li>" +
        "<li><kbd>F2</kbd> ou duplo clique — renomear tópico</li>" +
        "<li><kbd>Setas</kbd> — navegar entre tópicos</li>" +
        "<li><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Y</kbd> — desfazer / refazer</li>" +
        "<li>Roda do mouse — zoom · Arraste o fundo — mover tela</li>" +
        "</ul>"
    });
  }

  /* ============ History (undo/redo) ============ */

  function pushHistory() {
    history.push(JSON.stringify(currentMap.root));
    if (history.length > MAX_HISTORY) history.shift();
    future = [];
  }

  function undo() {
    if (!history.length) return;
    future.push(JSON.stringify(currentMap.root));
    currentMap.root = JSON.parse(history.pop());
    selectedNodeId = null;
    render();
    scheduleSave();
  }

  function redo() {
    if (!future.length) return;
    history.push(JSON.stringify(currentMap.root));
    currentMap.root = JSON.parse(future.pop());
    selectedNodeId = null;
    render();
    scheduleSave();
  }

  /* ============ Node operations ============ */

  function addChild(parentId) {
    var parent = findNode(currentMap.root, parentId);
    if (!parent) return null;
    pushHistory();

    var isRootParent = parent.id === currentMap.root.id;
    var side = isRootParent ? (parent.children.length % 2 === 0 ? 1 : -1) : parent.side;
    var offsetX = isRootParent ? 260 : 220;
    var index = parent.children.length;
    var dir = index % 2 === 0 ? -1 : 1;
    var magnitude = Math.ceil((index + 1) / 2);
    var x = parent.x + side * offsetX;
    var y = parent.y + dir * magnitude * 70;

    var themeColors = currentTheme().colors;
    var color = isRootParent ? themeColors[paletteCursor++ % themeColors.length] : parent.color;

    var child = {
      id: uid(),
      text: "Novo tópico",
      x: x, y: y,
      color: color,
      collapsed: false,
      side: side,
      children: []
    };
    parent.children.push(child);
    parent.collapsed = false;
    selectedNodeId = child.id;
    render();
    scheduleSave();
    startEditingNode(child.id, true);
    return child;
  }

  function addSibling(nodeId) {
    if (nodeId === currentMap.root.id) return addChild(nodeId);
    var parent = findParent(currentMap.root, nodeId, null);
    if (!parent) return addChild(currentMap.root.id);
    return addChild(parent.id);
  }

  function deleteNode(nodeId) {
    if (nodeId === currentMap.root.id) {
      flashStatus("Não é possível excluir o tópico central.");
      return;
    }
    var node = findNode(currentMap.root, nodeId);
    var parent = findParent(currentMap.root, nodeId, null);
    if (!node || !parent) return;

    var doDelete = function () {
      pushHistory();
      parent.children = parent.children.filter(function (c) { return c.id !== nodeId; });
      selectedNodeId = parent.id;
      render();
      scheduleSave();
    };

    if (node.children.length > 0) {
      showModal({
        title: "Excluir tópico",
        bodyHTML: "<p>Isso também vai excluir <strong>" + (countNodes(node) - 1) + " subtópico(s)</strong>. Deseja continuar?</p>",
        confirmText: "Excluir",
        danger: true,
        onConfirm: doDelete
      });
    } else {
      doDelete();
    }
  }

  function toggleCollapse(nodeId) {
    var node = findNode(currentMap.root, nodeId);
    if (!node || node.children.length === 0) return;
    node.collapsed = !node.collapsed;
    render();
    scheduleSave();
  }

  function setNodeColor(nodeId, color) {
    var node = findNode(currentMap.root, nodeId);
    if (!node) return;
    pushHistory();
    node.color = color;
    render();
    scheduleSave();
  }

  function commitNodeText(nodeId, text) {
    var node = findNode(currentMap.root, nodeId);
    if (!node) return;
    var trimmed = text.trim();
    if (trimmed && trimmed !== node.text) {
      pushHistory();
      node.text = trimmed;
      scheduleSave();
    }
    editingNodeId = null;
    render();
  }

  function startEditingNode(nodeId, selectAll) {
    editingNodeId = nodeId;
    render();
    var input = els.nodesLayer.querySelector('[data-editing-input="' + nodeId + '"]');
    if (input) {
      input.focus();
      if (selectAll) input.select();
    }
  }

  function flashStatus(msg) {
    els.statusText.textContent = msg;
    setTimeout(function () {
      if (els.statusText.textContent === msg) els.statusText.textContent = "Pronto.";
    }, 2500);
  }

  /* ============ Rendering ============ */

  function getVisibleNodes() {
    var list = [];
    (function walk(node) {
      list.push(node);
      if (!node.collapsed) {
        node.children.forEach(walk);
      }
    })(currentMap.root);
    return list;
  }

  function render() {
    applyAutoLayout(currentLayoutMode());
    var visible = getVisibleNodes();
    var visibleIds = {};
    visible.forEach(function (n) { visibleIds[n.id] = true; });

    renderConnectors(visible);
    renderNodes(visible);
    updateColorPanel();
    els.btnUndo.disabled = history.length === 0;
    els.btnRedo.disabled = future.length === 0;
  }

  function renderConnectors(visible) {
    var svg = els.connectorsLayer;
    svg.innerHTML = "";
    visible.forEach(function (node) {
      node.children.forEach(function (child) {
        if (node.collapsed) return;
        var isVisible = visible.indexOf(child) !== -1;
        if (!isVisible) return;
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        var dx = (child.x - node.x) * 0.5;
        var d = "M " + node.x + " " + node.y + " C " + (node.x + dx) + " " + node.y + ", " + (child.x - dx) + " " + child.y + ", " + child.x + " " + child.y;
        path.setAttribute("d", d);
        path.setAttribute("stroke", child.color);
        path.setAttribute("stroke-width", "3");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        svg.appendChild(path);
      });
    });
  }

  function renderNodes(visible) {
    var layer = els.nodesLayer;
    layer.innerHTML = "";
    visible.forEach(function (node) {
      var isRoot = node.id === currentMap.root.id;
      var div = document.createElement("div");
      div.className = "node" + (isRoot ? " root" : "") + (node.id === selectedNodeId ? " selected" : "") + (node._match ? " match" : "");
      div.style.left = node.x + "px";
      div.style.top = node.y + "px";
      if (isRoot) {
        div.style.background = node.color;
      } else {
        div.style.borderColor = node.color;
        div.style.color = "#23243a";
      }
      div.dataset.id = node.id;

      if (editingNodeId === node.id) {
        var input = document.createElement("input");
        input.type = "text";
        input.className = "node-text-input";
        input.value = node.text;
        input.dataset.editingInput = node.id;
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); commitNodeText(node.id, input.value); }
          else if (e.key === "Escape") { e.preventDefault(); editingNodeId = null; render(); }
          e.stopPropagation();
        });
        input.addEventListener("blur", function () { commitNodeText(node.id, input.value); });
        input.addEventListener("mousedown", function (e) { e.stopPropagation(); });
        div.appendChild(input);
      } else {
        var span = document.createElement("span");
        span.textContent = node.text;
        div.appendChild(span);
      }

      if (node.children.length > 0) {
        var toggle = document.createElement("div");
        toggle.className = "node-toggle";
        toggle.textContent = node.collapsed ? "+" : "−";
        toggle.title = node.collapsed ? "Expandir" : "Recolher";
        toggle.addEventListener("mousedown", function (e) { e.stopPropagation(); });
        toggle.addEventListener("click", function (e) {
          e.stopPropagation();
          toggleCollapse(node.id);
        });
        div.appendChild(toggle);
      }

      if (node.id === selectedNodeId) {
        div.appendChild(buildNodeActions(node));
      }

      div.addEventListener("mousedown", function (e) { onNodeMouseDown(e, node); });
      div.addEventListener("dblclick", function (e) {
        e.stopPropagation();
        startEditingNode(node.id, true);
      });

      layer.appendChild(div);
    });
  }

  function buildNodeActions(node) {
    var wrap = document.createElement("div");
    wrap.className = "node-actions";
    wrap.addEventListener("mousedown", function (e) { e.stopPropagation(); });

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "node-action-btn";
    addBtn.textContent = "+ Subtópico";
    addBtn.title = "Adicionar subtópico (Tab)";
    addBtn.addEventListener("click", function (e) { e.stopPropagation(); addChild(node.id); });
    wrap.appendChild(addBtn);

    var editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "node-action-btn";
    editBtn.textContent = "Editar";
    editBtn.title = "Renomear (duplo clique)";
    editBtn.addEventListener("click", function (e) { e.stopPropagation(); startEditingNode(node.id, true); });
    wrap.appendChild(editBtn);

    if (node.id !== currentMap.root.id) {
      var delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "node-action-btn danger";
      delBtn.textContent = "Excluir";
      delBtn.title = "Excluir tópico (Delete)";
      delBtn.addEventListener("click", function (e) { e.stopPropagation(); deleteNode(node.id); });
      wrap.appendChild(delBtn);
    }

    return wrap;
  }

  /* ============ Themes & layouts ============ */

  function currentTheme() {
    var themeId = currentMap ? currentMap.themeId : null;
    var found = THEMES.filter(function (t) { return t.id === themeId; })[0];
    return found || THEMES[0];
  }

  function currentLayoutMode() {
    return (currentMap && currentMap.layoutMode) || "mindmap";
  }

  function setColorRecursive(node, color) {
    node.color = color;
    node.children.forEach(function (child) { setColorRecursive(child, color); });
  }

  function applyTheme(themeId) {
    var theme = THEMES.filter(function (t) { return t.id === themeId; })[0];
    if (!theme || !currentMap) return;
    pushHistory();
    currentMap.themeId = themeId;
    currentMap.root.color = theme.rootColor;
    currentMap.root.children.forEach(function (branch, i) {
      setColorRecursive(branch, theme.colors[i % theme.colors.length]);
    });
    paletteCursor = currentMap.root.children.length;
    applyCanvasTheme();
    buildColorSwatches();
    render();
    scheduleSave();
    renderAppearancePanel();
  }

  function setLayoutMode(mode) {
    if (!currentMap || currentMap.layoutMode === mode) return;
    currentMap.layoutMode = mode;
    if (mode === "mindmap") layoutMindmapRoot();
    render();
    fitToScreen();
    scheduleSave();
    renderAppearancePanel();
  }

  function layoutMindmapRoot() {
    var root = currentMap.root;
    root.x = CANVAS_CENTER_X;
    root.y = CANVAS_CENTER_Y;
    root.children.forEach(function (child, i) {
      child.side = i % 2 === 0 ? 1 : -1;
      layoutMindmapNode(child, root, i, true);
    });
  }

  function layoutMindmapNode(node, parent, indexAmongSiblings, isTopLevel) {
    var offsetX = isTopLevel ? 260 : 220;
    var dir = indexAmongSiblings % 2 === 0 ? -1 : 1;
    var magnitude = Math.ceil((indexAmongSiblings + 1) / 2);
    node.x = parent.x + node.side * offsetX;
    node.y = parent.y + dir * magnitude * 70;
    node.children.forEach(function (child, i) {
      child.side = node.side;
      layoutMindmapNode(child, node, i, false);
    });
  }

  function applyCanvasTheme() {
    var theme = currentTheme();
    els.canvasViewport.classList.toggle("dark-canvas", !!theme.dark);
    if (theme.dark) {
      els.canvasViewport.style.backgroundColor = theme.canvasBg;
      els.canvasViewport.style.backgroundImage = "radial-gradient(circle, " + theme.dotColor + " 1px, transparent 1px)";
    } else {
      els.canvasViewport.style.backgroundColor = "";
      els.canvasViewport.style.backgroundImage = "";
    }
  }

  function renderAppearancePanel() {
    if (!currentMap) return;
    var mode = currentLayoutMode();
    els.layoutOptions.innerHTML = "";
    LAYOUTS.forEach(function (layout) {
      var card = document.createElement("div");
      card.className = "layout-card" + (layout.id === mode ? " active" : "");
      card.innerHTML = '<div class="layout-card-icon">' + layoutIconSvg(layout.id) + '</div><div class="layout-card-label"></div>';
      card.querySelector(".layout-card-label").textContent = layout.name;
      card.addEventListener("click", function () { setLayoutMode(layout.id); });
      els.layoutOptions.appendChild(card);
    });

    var activeThemeId = currentTheme().id;
    els.themeGrid.innerHTML = "";
    THEMES.forEach(function (theme) {
      var card = document.createElement("div");
      card.className = "theme-card" + (theme.dark ? " theme-card-dark" : "") + (theme.id === activeThemeId ? " active" : "");
      var preview = document.createElement("div");
      preview.className = "theme-preview";
      var positions = [
        { x: -30, y: -8, rot: -18 },
        { x: -22, y: 8, rot: 18 },
        { x: 14, y: -8, rot: 18 },
        { x: 22, y: 8, rot: -18 }
      ];
      theme.colors.slice(0, 4).forEach(function (color, i) {
        var bar = document.createElement("div");
        bar.className = "theme-preview-bar";
        bar.style.background = color;
        var p = positions[i];
        bar.style.transform = "translate(" + p.x + "px, " + p.y + "px) rotate(" + p.rot + "deg)";
        preview.appendChild(bar);
      });
      card.appendChild(preview);
      var label = document.createElement("div");
      label.className = "theme-card-label";
      label.textContent = theme.name;
      card.appendChild(label);
      card.addEventListener("click", function () { applyTheme(theme.id); });
      els.themeGrid.appendChild(card);
    });
  }

  function layoutIconSvg(layoutId) {
    if (layoutId === "mindmap") {
      return '<svg width="40" height="32" viewBox="0 0 40 32" fill="none"><circle cx="20" cy="16" r="4" fill="#5B5FEF"/><line x1="16" y1="14" x2="4" y2="6" stroke="#9aa" stroke-width="2"/><line x1="16" y1="18" x2="4" y2="26" stroke="#9aa" stroke-width="2"/><line x1="24" y1="14" x2="36" y2="6" stroke="#9aa" stroke-width="2"/><line x1="24" y1="18" x2="36" y2="26" stroke="#9aa" stroke-width="2"/><circle cx="4" cy="6" r="3" fill="#F76E6E"/><circle cx="4" cy="26" r="3" fill="#4CC9A0"/><circle cx="36" cy="6" r="3" fill="#F7B84F"/><circle cx="36" cy="26" r="3" fill="#B57BEE"/></svg>';
    }
    if (layoutId === "org") {
      return '<svg width="40" height="32" viewBox="0 0 40 32" fill="none"><rect x="14" y="2" width="12" height="7" rx="2" fill="#5B5FEF"/><line x1="20" y1="9" x2="20" y2="15" stroke="#9aa" stroke-width="2"/><line x1="6" y1="15" x2="34" y2="15" stroke="#9aa" stroke-width="2"/><line x1="6" y1="15" x2="6" y2="21" stroke="#9aa" stroke-width="2"/><line x1="20" y1="15" x2="20" y2="21" stroke="#9aa" stroke-width="2"/><line x1="34" y1="15" x2="34" y2="21" stroke="#9aa" stroke-width="2"/><rect x="1" y="21" width="10" height="7" rx="2" fill="#F76E6E"/><rect x="15" y="21" width="10" height="7" rx="2" fill="#4CC9A0"/><rect x="29" y="21" width="10" height="7" rx="2" fill="#F7B84F"/></svg>';
    }
    return '<svg width="40" height="32" viewBox="0 0 40 32" fill="none"><rect x="2" y="3" width="14" height="5" rx="2" fill="#5B5FEF"/><line x1="6" y1="8" x2="6" y2="15" stroke="#9aa" stroke-width="2"/><rect x="10" y="13" width="12" height="5" rx="2" fill="#F76E6E"/><line x1="6" y1="15" x2="6" y2="24" stroke="#9aa" stroke-width="2"/><rect x="10" y="22" width="12" height="5" rx="2" fill="#4CC9A0"/></svg>';
  }

  function applyAutoLayout(mode) {
    if (!currentMap) return;
    if (mode === "org") {
      layoutOrgNode(currentMap.root, 0, { x: 0 });
    } else if (mode === "list") {
      layoutListNode(currentMap.root, 0, { count: 0 });
    }
  }

  function layoutOrgNode(node, depth, counter) {
    node.y = 260 + depth * ORG_LEVEL_GAP;
    if (node.collapsed || node.children.length === 0) {
      node.x = counter.x * ORG_SLOT_WIDTH + ORG_SLOT_WIDTH / 2;
      counter.x++;
      return;
    }
    var startX = counter.x;
    node.children.forEach(function (child) { layoutOrgNode(child, depth + 1, counter); });
    var endX = counter.x - 1;
    node.x = ((startX + endX) / 2) * ORG_SLOT_WIDTH + ORG_SLOT_WIDTH / 2;
  }

  function layoutListNode(node, depth, order) {
    node.x = LIST_BASE_X + depth * LIST_INDENT;
    node.y = LIST_BASE_Y + order.count * LIST_ROW_GAP;
    order.count++;
    if (!node.collapsed) {
      node.children.forEach(function (child) { layoutListNode(child, depth + 1, order); });
    }
  }

  /* ============ Color panel ============ */

  function buildColorSwatches() {
    els.colorSwatches.innerHTML = "";
    currentTheme().colors.concat([currentTheme().rootColor]).forEach(function (color) {
      var sw = document.createElement("div");
      sw.className = "color-swatch";
      sw.style.background = color;
      sw.dataset.color = color;
      sw.addEventListener("click", function () {
        if (selectedNodeId) setNodeColor(selectedNodeId, color);
      });
      els.colorSwatches.appendChild(sw);
    });
  }

  function updateColorPanel() {
    if (!selectedNodeId) {
      els.colorPanel.hidden = true;
      return;
    }
    var node = findNode(currentMap.root, selectedNodeId);
    if (!node) { els.colorPanel.hidden = true; return; }
    els.colorPanel.hidden = false;
    var swatches = els.colorSwatches.querySelectorAll(".color-swatch");
    swatches.forEach(function (sw) {
      sw.classList.toggle("active", sw.dataset.color.toLowerCase() === node.color.toLowerCase());
    });
  }

  /* ============ Canvas transform (pan/zoom) ============ */

  function applyTransform() {
    els.canvasContent.style.transform = "translate(" + pan.x + "px, " + pan.y + "px) scale(" + zoom + ")";
    els.btnZoomReset.textContent = Math.round(zoom * 100) + "%";
  }

  function centerOnRoot() {
    var rect = els.canvasViewport.getBoundingClientRect();
    pan.x = rect.width / 2 - currentMap.root.x * zoom;
    pan.y = rect.height / 2 - currentMap.root.y * zoom;
    applyTransform();
  }

  function centerOnNode(node) {
    var rect = els.canvasViewport.getBoundingClientRect();
    pan.x = rect.width / 2 - node.x * zoom;
    pan.y = rect.height / 2 - node.y * zoom;
    applyTransform();
  }

  function setZoom(newZoom, clientPoint) {
    newZoom = Math.max(0.2, Math.min(2.5, newZoom));
    var rect = els.canvasViewport.getBoundingClientRect();
    var cx = clientPoint ? clientPoint.x - rect.left : rect.width / 2;
    var cy = clientPoint ? clientPoint.y - rect.top : rect.height / 2;
    var canvasX = (cx - pan.x) / zoom;
    var canvasY = (cy - pan.y) / zoom;
    zoom = newZoom;
    pan.x = cx - canvasX * zoom;
    pan.y = cy - canvasY * zoom;
    applyTransform();
  }

  function fitToScreen() {
    var visible = getVisibleNodes();
    if (!visible.length) return;
    var minX = Math.min.apply(null, visible.map(function (n) { return n.x; }));
    var maxX = Math.max.apply(null, visible.map(function (n) { return n.x; }));
    var minY = Math.min.apply(null, visible.map(function (n) { return n.y; }));
    var maxY = Math.max.apply(null, visible.map(function (n) { return n.y; }));
    var pad = 140;
    var rect = els.canvasViewport.getBoundingClientRect();
    var w = Math.max(1, maxX - minX + pad * 2);
    var h = Math.max(1, maxY - minY + pad * 2);
    var newZoom = Math.max(0.2, Math.min(2.5, Math.min(rect.width / w, rect.height / h)));
    zoom = newZoom;
    pan.x = rect.width / 2 - (minX + maxX) / 2 * zoom;
    pan.y = rect.height / 2 - (minY + maxY) / 2 * zoom;
    applyTransform();
  }

  function onWheelZoom(e) {
    e.preventDefault();
    var factor = Math.pow(1.0015, -e.deltaY);
    setZoom(zoom * factor, { x: e.clientX, y: e.clientY });
  }

  /* ============ Mouse interaction ============ */

  function clientToCanvas(clientX, clientY) {
    var rect = els.canvasViewport.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom
    };
  }

  function selectNode(nodeId) {
    if (selectedNodeId === nodeId) return;
    var prev = els.nodesLayer.querySelector(".node.selected");
    if (prev) {
      prev.classList.remove("selected");
      var prevActions = prev.querySelector(".node-actions");
      if (prevActions) prevActions.remove();
    }
    selectedNodeId = nodeId;
    if (nodeId) {
      var el = els.nodesLayer.querySelector('[data-id="' + nodeId + '"]');
      if (el) {
        el.classList.add("selected");
        var node = findNode(currentMap.root, nodeId);
        if (node) el.appendChild(buildNodeActions(node));
      }
    }
    updateColorPanel();
  }

  function onViewportMouseDown(e) {
    if (e.target !== els.canvasViewport && e.target !== els.canvasContent && e.target.id !== "connectorsLayer" && e.target.id !== "nodesLayer") {
      return;
    }
    selectNode(null);
    panState = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y
    };
    els.canvasViewport.classList.add("panning");
  }

  function onNodeMouseDown(e, node) {
    e.stopPropagation();
    if (editingNodeId && editingNodeId !== node.id) {
      var input = els.nodesLayer.querySelector('[data-editing-input="' + editingNodeId + '"]');
      if (input) commitNodeText(editingNodeId, input.value);
    }
    selectNode(node.id);
    if (currentLayoutMode() !== "mindmap") return;
    var startCanvas = clientToCanvas(e.clientX, e.clientY);
    drag = {
      nodeId: node.id,
      offsetX: node.x - startCanvas.x,
      offsetY: node.y - startCanvas.y,
      moved: false,
      historySaved: false,
      startClientX: e.clientX,
      startClientY: e.clientY
    };
  }

  function onDocumentMouseMove(e) {
    if (drag) {
      var dxScreen = e.clientX - drag.startClientX;
      var dyScreen = e.clientY - drag.startClientY;
      if (Math.abs(dxScreen) > 3 || Math.abs(dyScreen) > 3) drag.moved = true;
      if (!drag.moved) return;
      if (!drag.historySaved) { pushHistory(); drag.historySaved = true; }
      var node = findNode(currentMap.root, drag.nodeId);
      if (!node) return;
      var canvasPt = clientToCanvas(e.clientX, e.clientY);
      node.x = canvasPt.x + drag.offsetX;
      node.y = canvasPt.y + drag.offsetY;
      render();
      return;
    }
    if (panState) {
      pan.x = panState.startPanX + (e.clientX - panState.startClientX);
      pan.y = panState.startPanY + (e.clientY - panState.startClientY);
      applyTransform();
    }
  }

  function onDocumentMouseUp() {
    if (drag) {
      if (drag.moved) scheduleSave();
      drag = null;
    }
    if (panState) {
      panState = null;
      els.canvasViewport.classList.remove("panning");
    }
  }

  /* ============ Keyboard ============ */

  function onDocumentKeyDown(e) {
    if (els.editorScreen.hidden) return;
    var activeTag = document.activeElement ? document.activeElement.tagName : "";
    var isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA";

    if (isTyping) {
      if (document.activeElement === els.mapTitleInput || document.activeElement === els.searchInput || document.activeElement === els.dashboardSearch) {
        return;
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
      e.preventDefault(); undo(); return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) {
      e.preventDefault(); redo(); return;
    }

    if (isTyping) return;

    if (!selectedNodeId) {
      if (e.key === "Tab") { e.preventDefault(); addChild(currentMap.root.id); }
      return;
    }

    switch (e.key) {
      case "Tab":
        e.preventDefault();
        addChild(selectedNodeId);
        break;
      case "Enter":
        e.preventDefault();
        addSibling(selectedNodeId);
        break;
      case "Delete":
      case "Backspace":
        e.preventDefault();
        deleteNode(selectedNodeId);
        break;
      case "F2":
        e.preventDefault();
        startEditingNode(selectedNodeId, true);
        break;
      case "Escape":
        selectedNodeId = null;
        render();
        break;
      case "ArrowUp":
      case "ArrowDown":
        e.preventDefault();
        navigateSibling(e.key === "ArrowDown" ? 1 : -1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        navigateToParent();
        break;
      case "ArrowRight":
        e.preventDefault();
        navigateToFirstChild();
        break;
    }
  }

  function navigateSibling(dir) {
    var parent = findParent(currentMap.root, selectedNodeId, null);
    if (!parent) return;
    var idx = parent.children.findIndex(function (c) { return c.id === selectedNodeId; });
    var next = parent.children[idx + dir];
    if (next) { selectedNodeId = next.id; render(); centerOnNode(next); }
  }

  function navigateToParent() {
    var parent = findParent(currentMap.root, selectedNodeId, null);
    if (parent) { selectedNodeId = parent.id; render(); centerOnNode(parent); }
  }

  function navigateToFirstChild() {
    var node = findNode(currentMap.root, selectedNodeId);
    if (node && node.children.length > 0) {
      if (node.collapsed) { node.collapsed = false; }
      selectedNodeId = node.children[0].id;
      render();
      centerOnNode(node.children[0]);
    }
  }

  /* ============ Search ============ */

  function runSearch() {
    var query = els.searchInput.value.trim().toLowerCase();
    clearMatches(currentMap.root);
    if (!query) { render(); return; }
    var match = findFirstMatch(currentMap.root, query);
    if (!match) {
      flashStatus("Nenhum tópico encontrado para \"" + els.searchInput.value + "\".");
      render();
      return;
    }
    expandAncestors(match.id);
    match._match = true;
    selectedNodeId = match.id;
    render();
    centerOnNode(match);
  }

  function clearMatches(node) {
    delete node._match;
    node.children.forEach(clearMatches);
  }

  function findFirstMatch(node, query) {
    if (node.text.toLowerCase().indexOf(query) !== -1) return node;
    for (var i = 0; i < node.children.length; i++) {
      var found = findFirstMatch(node.children[i], query);
      if (found) return found;
    }
    return null;
  }

  function expandAncestors(nodeId) {
    var parent = findParent(currentMap.root, nodeId, null);
    while (parent) {
      parent.collapsed = false;
      parent = findParent(currentMap.root, parent.id, null);
    }
  }

  /* ============ Export PNG ============ */

  function exportPng() {
    var visible = getVisibleNodes();
    if (!visible.length) return;
    var pad = 80;
    var minX = Math.min.apply(null, visible.map(function (n) { return n.x; })) - pad;
    var maxX = Math.max.apply(null, visible.map(function (n) { return n.x; })) + pad;
    var minY = Math.min.apply(null, visible.map(function (n) { return n.y; })) - pad;
    var maxY = Math.max.apply(null, visible.map(function (n) { return n.y; })) + pad;
    var width = maxX - minX;
    var height = maxY - minY;

    var svgParts = [];
    svgParts.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '" font-family="Arial, sans-serif">');
    svgParts.push('<rect width="100%" height="100%" fill="#f4f5fa" />');

    visible.forEach(function (node) {
      node.children.forEach(function (child) {
        if (node.collapsed) return;
        if (visible.indexOf(child) === -1) return;
        var x1 = node.x - minX, y1 = node.y - minY, x2 = child.x - minX, y2 = child.y - minY;
        var dx = (x2 - x1) * 0.5;
        svgParts.push('<path d="M ' + x1 + ' ' + y1 + ' C ' + (x1 + dx) + ' ' + y1 + ', ' + (x2 - dx) + ' ' + y2 + ', ' + x2 + ' ' + y2 + '" stroke="' + child.color + '" stroke-width="3" fill="none" stroke-linecap="round" />');
      });
    });

    visible.forEach(function (node) {
      var isRoot = node.id === currentMap.root.id;
      var x = node.x - minX, y = node.y - minY;
      var text = escapeXml(node.text);
      var approxW = Math.max(60, text.length * (isRoot ? 9 : 7.5) + 32);
      var h = isRoot ? 46 : 36;
      if (isRoot) {
        svgParts.push('<rect x="' + (x - approxW / 2) + '" y="' + (y - h / 2) + '" width="' + approxW + '" height="' + h + '" rx="14" fill="' + node.color + '" />');
        svgParts.push('<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#ffffff">' + text + '</text>');
      } else {
        svgParts.push('<rect x="' + (x - approxW / 2) + '" y="' + (y - h / 2) + '" width="' + approxW + '" height="' + h + '" rx="18" fill="#ffffff" stroke="' + node.color + '" stroke-width="2" />');
        svgParts.push('<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="13" fill="#23243a">' + text + '</text>');
      }
    });

    svgParts.push("</svg>");
    var svgString = svgParts.join("");

    var scale = 2;
    var img = new Image();
    var svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(svgBlob);
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      var ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (blob) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = sanitizeFilename(currentMap.name) + ".png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, "image/png");
    };
    img.onerror = function () {
      flashStatus("Não foi possível gerar o PNG neste navegador.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function escapeXml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

})();
