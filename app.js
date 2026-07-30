(function () {
  "use strict";

  var STORAGE_INDEX_KEY = "mindflux:index";
  var STORAGE_MAP_PREFIX = "mindflux:map:";
  var CANVAS_CENTER_X = 3000;
  var CANVAS_CENTER_Y = 2000;
  var ROOT_COLOR = "#2D3142";
  var PALETTE = [
    "#5B5FEF", "#F76E6E", "#4CC9A0", "#F7B84F",
    "#B57BEE", "#F76EC2", "#3AB6D6", "#8BC34A"
  ];
  var MAX_HISTORY = 60;

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
      root: {
        id: uid(),
        text: name,
        x: CANVAS_CENTER_X,
        y: CANVAS_CENTER_Y,
        color: ROOT_COLOR,
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
    els.statusText.textContent = "Pronto.";

    centerOnRoot();
    render();
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

    var color = isRootParent ? PALETTE[paletteCursor++ % PALETTE.length] : parent.color;

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

      div.addEventListener("mousedown", function (e) { onNodeMouseDown(e, node); });
      div.addEventListener("dblclick", function (e) {
        e.stopPropagation();
        startEditingNode(node.id, true);
      });

      layer.appendChild(div);
    });
  }

  /* ============ Color panel ============ */

  function buildColorSwatches() {
    els.colorSwatches.innerHTML = "";
    PALETTE.concat([ROOT_COLOR]).forEach(function (color) {
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
    pan.x = rect.width / 2 - CANVAS_CENTER_X * zoom;
    pan.y = rect.height / 2 - CANVAS_CENTER_Y * zoom;
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

  function onViewportMouseDown(e) {
    if (e.target !== els.canvasViewport && e.target !== els.canvasContent && e.target.id !== "connectorsLayer" && e.target.id !== "nodesLayer") {
      return;
    }
    selectedNodeId = null;
    render();
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
    selectedNodeId = node.id;
    render();
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
