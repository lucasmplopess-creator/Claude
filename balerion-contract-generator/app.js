(function () {
  'use strict';

  var STORAGE_KEY = 'balerion-contrato-rascunho';
  var CURRENCY_FIELDS = ['totalValue', 'extraGuestValue', 'extraHourValue'];
  var PERCENT_FIELDS = ['depositPercent', 'signaturePercent', 'finalPercent'];

  var CONTRATADA = {
    nome: 'Lucas Martins Pereira Lopes',
    endereco: 'Rua Guilherme Miguel Berger, nº 839, Jardim São Valentim, Pirassununga/SP',
    email: 'baleriondrinks@gmail.com',
    cnpj: '62.457.535/0001-43',
    telefone: '(19) 99998-9537',
  };

  var EXAMPLE_DATA = {
    clientName: 'Mariane Alves Raibolt',
    clientDocument: '057.724.147-80',
    clientPhone: '(24) 9 8811-9554',
    clientAddress: 'Rua Éttori Baggio, nº 556, Jardim Margarida, Pirassununga/SP',
    clientEmail: 'mariraiboltpacheco@gmail.com',
    eventType: 'Festa de 15 anos',
    quoteNumber: '0014838',
    eventLocation: 'Decor Art - Pirassununga/SP',
    eventDate: '2027-01-09',
    guestCount: '50',
    startTime: '19:00',
    endTime: '00:00',
    durationHours: '5',
    extraHourValue: '250,00',
    totalValue: '1.780,00',
    extraGuestValue: '35,00',
    depositPercent: '20',
    signaturePercent: '50',
    finalPercent: '30',
    finalDays: '7',
    menu: 'Sofisticado e Conceituado, conforme Anexo I - Cardápio do evento.',
    suppliesBy: 'provider',
    notes: '',
    imageConsent: 'yes',
    reviewed: true,
  };

  var PAGE_W = 595.28;
  var PAGE_H = 841.89;
  var MARGIN_X = 56;
  var CONTENT_W = PAGE_W - MARGIN_X * 2;
  var TOTAL_PAGES = 8;

  var form = document.getElementById('contractForm');
  var exampleButton = document.getElementById('exampleButton');
  var resetButton = document.getElementById('resetButton');
  var downloadButton = document.getElementById('downloadButton');
  var paymentAlert = document.getElementById('paymentAlert');
  var saveStateEl = document.getElementById('saveState');
  var toastEl = document.getElementById('toast');

  var saveTimer = null;
  var toastTimer = null;
  var assetCache = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    captureFallbacks();
    restoreDraft();
    updatePreview();
    validatePayments();
    bindEvents();
  }

  function bindEvents() {
    form.addEventListener('input', handleFormInput);
    form.addEventListener('change', handleFormInput);
    form.addEventListener('submit', handleSubmit);
    exampleButton.addEventListener('click', handleExampleFill);
    resetButton.addEventListener('click', handleReset);
  }

  function handleFormInput(event) {
    var target = event.target;
    if (target && event.type === 'input' && CURRENCY_FIELDS.indexOf(target.name) !== -1) {
      maskCurrencyInput(target);
    }
    updatePreview();
    if (target && PERCENT_FIELDS.indexOf(target.name) !== -1) {
      validatePayments();
    }
    updateSaveState(true);
    scheduleSave();
  }

  function handleExampleFill() {
    setFormData(EXAMPLE_DATA);
    updatePreview();
    validatePayments();
    scheduleSave();
    showToast('Exemplo preenchido. Revise os dados antes de gerar o PDF.');
  }

  function handleReset() {
    if (!window.confirm('Limpar todos os campos preenchidos?')) return;
    form.reset();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      /* localStorage indisponível, seguir sem bloquear */
    }
    updatePreview();
    validatePayments();
    updateSaveState(false);
    showToast('Formulário limpo.');
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!validatePayments()) {
      showToast('Os percentuais de pagamento precisam somar 100%.', true);
      var finalField = form.elements.finalPercent;
      if (finalField) finalField.focus();
      return;
    }

    var data = getFormData();
    setDownloadLoading(true);

    generateContractPdf(data)
      .then(function (pdfBytes) {
        downloadBlob(pdfBytes, buildFileName(data));
        showToast('Contrato gerado com sucesso.');
      })
      .catch(function (err) {
        console.error(err);
        showToast('Não foi possível gerar o PDF. Tente novamente.', true);
      })
      .finally(function () {
        setDownloadLoading(false);
      });
  }

  function setDownloadLoading(isLoading) {
    downloadButton.disabled = isLoading;
    downloadButton.classList.toggle('is-loading', isLoading);
  }

  /* ---------- Estado, rascunho e formatação ---------- */

  function getFormData() {
    var data = {};
    var formData = new FormData(form);
    formData.forEach(function (value, key) {
      data[key] = value;
    });
    data.reviewed = form.elements.reviewed ? form.elements.reviewed.checked : false;
    return data;
  }

  function setFormData(data) {
    Object.keys(data).forEach(function (key) {
      var field = form.elements[key];
      if (!field) return;
      if (typeof RadioNodeList !== 'undefined' && field instanceof RadioNodeList) {
        Array.prototype.forEach.call(field, function (el) {
          el.checked = el.value === data[key];
        });
      } else if (field.type === 'checkbox') {
        field.checked = Boolean(data[key]);
      } else {
        field.value = data[key] == null ? '' : data[key];
      }
    });
  }

  function restoreDraft() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      setFormData(JSON.parse(raw));
    } catch (err) {
      console.warn('Não foi possível restaurar o rascunho salvo.', err);
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormData()));
      } catch (err) {
        console.warn('Não foi possível salvar o rascunho.', err);
      }
      updateSaveState(false);
    }, 500);
  }

  function updateSaveState(isPending) {
    saveStateEl.classList.toggle('is-pending', Boolean(isPending));
  }

  function maskCurrencyInput(field) {
    var digits = field.value.replace(/\D/g, '');
    if (!digits) {
      field.value = '';
      return;
    }
    var cents = parseInt(digits, 10);
    field.value = (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatDateBR(isoDate) {
    if (!isoDate) return '';
    var parts = String(isoDate).split('-');
    if (parts.length !== 3) return '';
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function validatePayments() {
    var deposit = Number(form.elements.depositPercent.value) || 0;
    var signature = Number(form.elements.signaturePercent.value) || 0;
    var finalShare = Number(form.elements.finalPercent.value) || 0;
    var sum = Math.round((deposit + signature + finalShare) * 100) / 100;
    var ok = sum === 100;
    paymentAlert.hidden = ok;
    return ok;
  }

  /* ---------- Prévia ao vivo ---------- */

  function captureFallbacks() {
    document.querySelectorAll('[data-preview]').forEach(function (el) {
      if (el.dataset.fallback === undefined) {
        el.dataset.fallback = el.textContent;
      }
    });
  }

  function setPreviewText(name, value) {
    var text = value === undefined || value === null || value === '' ? null : String(value);
    document.querySelectorAll('[data-preview="' + name + '"]').forEach(function (el) {
      el.textContent = text === null ? el.dataset.fallback || '' : text;
    });
  }

  function updatePreview() {
    var data = getFormData();
    setPreviewText('clientName', data.clientName);
    setPreviewText('clientDocument', data.clientDocument);
    setPreviewText('clientPhone', data.clientPhone);
    setPreviewText('clientAddress', data.clientAddress);
    setPreviewText('clientEmail', data.clientEmail);
    setPreviewText('eventType', data.eventType);
    setPreviewText('quoteNumber', data.quoteNumber);
    setPreviewText('eventLocation', data.eventLocation);
    setPreviewText('eventDate', formatDateBR(data.eventDate));
    setPreviewText('guestCount', data.guestCount ? String(data.guestCount) : '');
    setPreviewText('startTime', data.startTime);
    setPreviewText('endTime', data.endTime);
    setPreviewText('totalValue', data.totalValue);
  }

  /* ---------- Utilidades ---------- */

  function showToast(message, isError, duration) {
    clearTimeout(toastTimer);
    toastEl.textContent = message;
    toastEl.classList.toggle('is-error', Boolean(isError));
    toastEl.classList.add('is-visible');
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, duration || 3200);
  }

  function buildFileName(data) {
    var base = (data.clientName || 'contrato')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return 'Contrato-Balerion-Drinks-' + (base || 'cliente') + '.pdf';
  }

  function downloadBlob(bytes, filename) {
    var blob = new Blob([bytes], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 4000);
  }

  function loadAsset(path) {
    if (assetCache[path]) return assetCache[path];
    var promise = fetch(path)
      .then(function (response) {
        if (!response.ok) throw new Error('Falha ao carregar ' + path);
        return response.arrayBuffer();
      })
      .then(function (buffer) {
        return new Uint8Array(buffer);
      });
    assetCache[path] = promise;
    return promise;
  }

  /* ---------- Geração do PDF ---------- */

  function wrapText(text, font, size, maxWidth) {
    var words = String(text == null ? '' : text).split(/\s+/).filter(Boolean);
    var lines = [];
    var current = '';
    words.forEach(function (word) {
      var candidate = current ? current + ' ' + word : word;
      if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
    });
    if (current) lines.push(current);
    return lines.length ? lines : [''];
  }

  function drawParagraph(page, text, y, opts) {
    var lines = wrapText(text, opts.font, opts.size, opts.maxWidth);
    lines.forEach(function (line) {
      page.drawText(line, { x: opts.x, y: y, size: opts.size, font: opts.font, color: opts.color });
      y -= opts.lineHeight;
    });
    return y - (opts.gapAfter || 0);
  }

  function drawBullets(page, items, y, opts) {
    var indent = 14;
    items.forEach(function (item) {
      var lines = wrapText(item, opts.font, opts.size, opts.maxWidth - indent);
      lines.forEach(function (line, i) {
        if (i === 0) {
          page.drawText('•', { x: opts.x, y: y, size: opts.size, font: opts.boldFont, color: GOLD });
        }
        page.drawText(line, { x: opts.x + indent, y: y, size: opts.size, font: opts.font, color: opts.color });
        y -= opts.lineHeight;
      });
    });
    return y - (opts.gapAfter || 0);
  }

  var GOLD, DARK, MUTED, LINE;

  function initColors() {
    var rgb = window.PDFLib.rgb;
    GOLD = rgb(0.804, 0.643, 0.369);
    DARK = rgb(0.129, 0.114, 0.094);
    MUTED = rgb(0.478, 0.447, 0.4);
    LINE = rgb(0.87, 0.87, 0.87);
  }

  function paragraph(ctx, page, text, y, overrides) {
    var opts = Object.assign(
      { font: ctx.bodyFont, size: 10.5, color: DARK, maxWidth: CONTENT_W, lineHeight: 14.5, x: MARGIN_X, gapAfter: 8 },
      overrides
    );
    return drawParagraph(page, text, y, opts);
  }

  function bullets(ctx, page, items, y, overrides) {
    var opts = Object.assign(
      {
        font: ctx.bodyFont,
        boldFont: ctx.boldFont,
        size: 10.5,
        color: DARK,
        maxWidth: CONTENT_W,
        lineHeight: 14.5,
        x: MARGIN_X,
        gapAfter: 8,
      },
      overrides
    );
    return drawBullets(page, items, y, opts);
  }

  function drawHeader(ctx, page, kicker) {
    var logoW = 44;
    var logoH = logoW / (ctx.logoImage.width / ctx.logoImage.height);
    page.drawImage(ctx.logoImage, { x: MARGIN_X, y: PAGE_H - 34 - logoH, width: logoW, height: logoH });

    var textX = MARGIN_X + logoW + 12;
    page.drawText('BALERION DRINKS', { x: textX, y: PAGE_H - 36, size: 8, font: ctx.boldFont, color: GOLD });
    page.drawText('CONTRATO DE PRESTAÇÃO DE SERVIÇO', {
      x: textX,
      y: PAGE_H - 48,
      size: 11,
      font: ctx.boldFont,
      color: DARK,
    });

    var kickerSize = 9;
    var kickerWidth = ctx.boldFont.widthOfTextAtSize(kicker, kickerSize);
    page.drawText(kicker, {
      x: PAGE_W - MARGIN_X - kickerWidth,
      y: PAGE_H - 42,
      size: kickerSize,
      font: ctx.boldFont,
      color: GOLD,
    });

    page.drawLine({
      start: { x: MARGIN_X, y: PAGE_H - 66 },
      end: { x: PAGE_W - MARGIN_X, y: PAGE_H - 66 },
      thickness: 1.2,
      color: GOLD,
    });

    return PAGE_H - 94;
  }

  function drawFooter(ctx, page, pageNum) {
    page.drawLine({ start: { x: MARGIN_X, y: 50 }, end: { x: PAGE_W - MARGIN_X, y: 50 }, thickness: 0.6, color: LINE });
    page.drawText('BALERION DRINKS | 62.457.535/0001-43 | BALERIONDRINKS@GMAIL.COM', {
      x: MARGIN_X,
      y: 34,
      size: 7.5,
      font: ctx.bodyFont,
      color: MUTED,
    });
    var right = pageNum + ' / ' + TOTAL_PAGES;
    var rw = ctx.boldFont.widthOfTextAtSize(right, 8.5);
    page.drawText(right, { x: PAGE_W - MARGIN_X - rw, y: 34, size: 8.5, font: ctx.boldFont, color: GOLD });
  }

  function drawGroupLabel(ctx, page, text, y) {
    page.drawText(text, { x: MARGIN_X, y: y, size: 11.5, font: ctx.boldFont, color: GOLD });
    return y - 20;
  }

  function drawClauseHeading(ctx, page, text, y) {
    page.drawText(text, { x: MARGIN_X, y: y, size: 13, font: ctx.displayFont, color: DARK });
    return y - 22;
  }

  function drawField(ctx, page, label, value, y, width) {
    var maxWidth = width || CONTENT_W;
    page.drawText(label, { x: MARGIN_X, y: y, size: 8, font: ctx.boldFont, color: GOLD });
    var lines = wrapText(value || '-', ctx.bodyFont, 10.5, maxWidth);
    var vy = y - 13;
    lines.forEach(function (line) {
      page.drawText(line, { x: MARGIN_X, y: vy, size: 10.5, font: ctx.bodyFont, color: DARK });
      vy -= 14;
    });
    return vy - 6;
  }

  function drawFieldGrid(ctx, page, pairs, y) {
    var cols = pairs.length;
    var colWidth = CONTENT_W / cols;
    var maxLines = 1;
    pairs.forEach(function (p, i) {
      var x = MARGIN_X + i * colWidth;
      page.drawText(p.label, { x: x, y: y, size: 8, font: ctx.boldFont, color: GOLD });
      var lines = wrapText(p.value || '-', ctx.bodyFont, 10.5, colWidth - 10);
      maxLines = Math.max(maxLines, lines.length);
      var vy = y - 13;
      lines.forEach(function (line) {
        page.drawText(line, { x: x, y: vy, size: 10.5, font: ctx.bodyFont, color: DARK });
        vy -= 14;
      });
    });
    return y - 13 - maxLines * 14 - 6;
  }

  function supplyClauseText(data) {
    if (data.suppliesBy === 'client') {
      return 'As frutas, bebidas, insumos e quaisquer outros elementos necessários à execução dos drinks escolhidos serão fornecidos pela CONTRATANTE, em estrita conformidade com o cardápio previamente estabelecido.';
    }
    if (data.suppliesBy === 'quote') {
      return (
        'As frutas, bebidas, insumos e quaisquer outros elementos necessários à execução dos drinks escolhidos serão fornecidos conforme definido no orçamento aprovado nº ' +
        (data.quoteNumber || 'informado entre as partes') +
        ', em estrita conformidade com o cardápio previamente estabelecido.'
      );
    }
    return 'As frutas, bebidas, insumos e quaisquer outros elementos necessários à execução dos drinks escolhidos serão fornecidos pela CONTRATADA, em estrita conformidade com o cardápio previamente estabelecido.';
  }

  function imageClauseText(data) {
    if (data.imageConsent === 'no') {
      return 'A CONTRATANTE, ao firmar o presente contrato, não autoriza a utilização de registros fotográficos ou audiovisuais do evento para fins de divulgação institucional ou publicitária da marca Balerion Drinks. A CONTRATADA compromete-se a não utilizar, publicar ou compartilhar quaisquer imagens do evento, dos convidados ou da degustação dos drinks em mídias sociais, páginas eletrônicas ou materiais de promoção, exceto mediante autorização expressa e por escrito da CONTRATANTE.';
    }
    return 'A CONTRATANTE, ao firmar o presente contrato, autoriza, de forma gratuita, irrevogável e irretratável, a CONTRATADA a realizar registros fotográficos e audiovisuais do evento, bem como da degustação dos drinks, exclusivamente para fins de divulgação institucional e publicitária da marca Balerion Drinks, em mídias sociais, páginas eletrônicas e demais materiais de promoção. A utilização das imagens dar-se-á sem limitação de prazo ou território, sendo vedada qualquer manipulação que venha a denegrir a imagem da CONTRATANTE, de seus convidados ou do evento. Fica facultado à CONTRATANTE solicitar, por escrito, a exclusão de imagens específicas que, a seu exclusivo critério, entenda prejudiciais à sua imagem ou à de seus convidados, obrigação esta que deverá ser atendida pela CONTRATADA no prazo de até 05 (cinco) dias úteis.';
  }

  function drawCoverPage(ctx) {
    var page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    page.drawImage(ctx.coverImage, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
  }

  function drawPartiesPage(ctx, data) {
    var page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    var y = drawHeader(ctx, page, 'IDENTIFICAÇÃO DAS PARTES');

    y = drawGroupLabel(ctx, page, 'CONTRATANTE', y);
    y = drawField(ctx, page, 'NOME', data.clientName, y);
    y = drawFieldGrid(ctx, page, [
      { label: 'CPF/CNPJ', value: data.clientDocument },
      { label: 'TELEFONE', value: data.clientPhone || 'Não informado' },
    ], y);
    y = drawField(ctx, page, 'ENDEREÇO', data.clientAddress || 'Não informado', y);
    y = drawField(ctx, page, 'E-MAIL', data.clientEmail || 'Não informado', y);

    y -= 16;
    y = drawGroupLabel(ctx, page, 'CONTRATADA', y);
    y = drawField(ctx, page, 'NOME', CONTRATADA.nome, y);
    y = drawField(ctx, page, 'ENDEREÇO', CONTRATADA.endereco, y);
    y = drawField(ctx, page, 'E-MAIL', CONTRATADA.email, y);
    y = drawFieldGrid(ctx, page, [
      { label: 'CNPJ', value: CONTRATADA.cnpj },
      { label: 'TELEFONE', value: CONTRATADA.telefone },
    ], y);

    drawFooter(ctx, page, 2);
  }

  function drawObjectPage(ctx, data) {
    var page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    var y = drawHeader(ctx, page, 'OBJETO DO CONTRATO E SERVIÇOS');

    y = drawClauseHeading(ctx, page, '1 - OBJETO DO CONTRATO', y);
    y = paragraph(
      ctx,
      page,
      'O presente contrato tem por objeto a prestação de serviços de bartender pela CONTRATADA, compreendendo montagem, operação e desmontagem de bar, bem como a preparação e serviço de drinks e coquetéis durante o evento ' +
        (data.eventType || 'contratado') +
        ', para ' +
        (data.guestCount || '-') +
        ' convidados.',
      y
    );
    y = drawField(ctx, page, 'LOCAL DO EVENTO', data.eventLocation, y);
    y = drawFieldGrid(ctx, page, [
      { label: 'DATA', value: formatDateBR(data.eventDate) || 'A definir' },
      { label: 'HORÁRIO', value: (data.startTime || '--:--') + ' às ' + (data.endTime || '--:--') },
      { label: 'CONVIDADOS', value: data.guestCount ? String(data.guestCount) : '-' },
      { label: 'ORÇAMENTO', value: data.quoteNumber || 'Não informado' },
    ], y);

    y -= 16;
    y = drawClauseHeading(ctx, page, '2 - SERVIÇOS INCLUSOS', y);
    y = paragraph(ctx, page, 'A CONTRATADA se compromete a fornecer:', y, { gapAfter: 2 });
    y = bullets(ctx, page, [
      'Reuniões para alinhamento estratégico do evento;',
      'Escolha de drinks e montagem de cardápio, com degustação (quando contratado);',
      'Montagem e desmontagem do bar;',
      'Preparação e serviço de drinks;',
      'Fornecimento de utensílios e insumos necessários, conforme cardápio contratado;',
      'Atendimento aos convidados de acordo com normas de conduta ética e segurança.',
    ], y);

    drawFooter(ctx, page, 3);
  }

  function drawEquipmentPage(ctx, data) {
    var page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    var y = drawHeader(ctx, page, 'EQUIPAMENTOS E DURAÇÃO');

    y = drawClauseHeading(ctx, page, '3 - EQUIPAMENTOS E DANOS', y);
    y = paragraph(
      ctx,
      page,
      'A CONTRATADA fornecerá todos os equipamentos e materiais se necessários e contratados. A CONTRATANTE se responsabiliza por danos ou quebras causados por terceiros. Os valores de reposição serão:',
      y,
      { gapAfter: 2 }
    );
    y = bullets(ctx, page, [
      'Copo Whisky: R$ 12,00 por unidade;',
      'Taça Baronne/Hurricane: R$ 20,00 por unidade;',
      'Copo Long Drink: R$ 15,00 por unidade;',
      'Caneca Moscow Mule: R$ 20,00 por unidade.',
    ], y, { gapAfter: 2 });
    y = paragraph(
      ctx,
      page,
      'A cobrança será acompanhada de relatório e comprovação fotográfica no dia do evento, e o pagamento deverá ser realizado em até 15 dias corridos após a notificação.',
      y
    );

    y -= 10;
    y = drawClauseHeading(ctx, page, '4 - DURAÇÃO E HORAS EXTRAS', y);
    y = paragraph(
      ctx,
      page,
      'O serviço será prestado por ' +
        (data.durationHours || '-') +
        ' horas corridas, com início às ' +
        (data.startTime || '--:--') +
        ' e término às ' +
        (data.endTime || '--:--') +
        '. Horas extras poderão ser contratadas no momento do evento, mediante aceite da CONTRATADA, com custo de R$ ' +
        (data.extraHourValue || '0,00') +
        ' por hora adicional ou fração.',
      y
    );

    y -= 10;
    y = drawClauseHeading(ctx, page, '5 - VALORES E PAGAMENTO', y);
    y = paragraph(
      ctx,
      page,
      'O valor total do serviço é de R$ ' + (data.totalValue || '0,00') + ' podendo ser pago da seguinte forma:',
      y,
      { gapAfter: 2 }
    );
    y = bullets(ctx, page, [
      (data.depositPercent || '0') + '% como sinal para reserva de agenda (não reembolsável);',
      (data.signaturePercent || '0') + '% na assinatura do contrato;',
      (data.finalPercent || '0') + '% até ' + (data.finalDays || '0') + ' dias antes do evento.',
    ], y, { gapAfter: 2 });
    y = paragraph(
      ctx,
      page,
      'Formas de pagamento: PIX, dinheiro, transferência bancária ou cartão de crédito/débito. Neste caso, a taxa administrativa será integralmente arcada pelo CONTRATANTE.',
      y
    );

    drawFooter(ctx, page, 4);
  }

  function drawObligationsPage(ctx, data) {
    var page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    var y = drawHeader(ctx, page, 'OBRIGAÇÕES, AJUSTES E RESCISÃO');

    y = drawClauseHeading(ctx, page, '6 - OBRIGAÇÕES DAS PARTES', y);
    y = drawGroupLabel(ctx, page, 'CONTRATANTE', y);
    y = bullets(ctx, page, [
      'Garantir acesso ao local do evento para montagem e desmontagem;',
      'Fornecer informações claras sobre número de convidados, cardápio, estrutura, horário de início e demais informações adicionais sobre o evento.',
    ], y, { gapAfter: 4 });
    y = drawGroupLabel(ctx, page, 'CONTRATADA', y);
    y = bullets(ctx, page, [
      'Chegar com no mínimo 3 horas de antecedência para finalização da montagem;',
      'Fornecer todo serviço com ética e qualidade;',
      'Prestar o serviço de forma profissional e segura.',
    ], y);

    y -= 6;
    y = drawClauseHeading(ctx, page, '7 - AJUSTE DE VALORES', y);
    y = paragraph(
      ctx,
      page,
      'O valor poderá ser reajustado proporcionalmente conforme alteração no número de convidados. Será tolerada variação de até 10% sem ajuste. Caso o número real exceda o informado, a CONTRATADA poderá cobrar R$ ' +
        (data.extraGuestValue || '0,00') +
        ' por convidado extra ou encerrar o serviço ao término dos insumos contratados, sem maiores penalidades.',
      y
    );

    y -= 6;
    y = drawClauseHeading(ctx, page, '8 - RESCISÃO', y);
    y = paragraph(ctx, page, 'O contrato poderá ser rescindido por qualquer parte com 30 dias de antecedência, mediante:', y, {
      gapAfter: 2,
    });
    y = bullets(ctx, page, [
      'Cancelamento pela CONTRATANTE com menos de 30 dias: multa de 20% do valor total;',
      'Cancelamento com menos de 7 dias: multa de 50% do valor total;',
      'Cancelamento no dia do evento: multa de 100% do valor.',
    ], y, { gapAfter: 2 });
    y = paragraph(
      ctx,
      page,
      'Valores já pagos poderão ser utilizados como crédito para remarcação, se acordado por escrito entre ambas as partes.',
      y
    );

    drawFooter(ctx, page, 5);
  }

  function drawForceMajeurePage(ctx) {
    var page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    var y = drawHeader(ctx, page, 'FORÇA MAIOR, PROTEÇÃO E DISPOSIÇÕES');

    y = drawClauseHeading(ctx, page, '9 - CASO FORTUITO OU FORÇA MAIOR', y);
    y = paragraph(
      ctx,
      page,
      'Nenhuma parte será responsabilizada por descumprimento contratual em razão de fatos imprevisíveis ou inevitáveis (ex.: desastres naturais, pandemias, greves, acidentes graves). Nesses casos, será possível reagendar o evento sem custo adicional.',
      y
    );

    y -= 8;
    y = drawClauseHeading(ctx, page, '10 - PROTEÇÃO DE DADOS', y);
    y = paragraph(
      ctx,
      page,
      'As partes declaram ciência e concordância com a Lei Geral de Proteção de Dados - LGPD (Lei 13.709/2018), comprometendo-se a utilizar as informações e dados pessoais exclusivamente para a execução deste contrato, sendo proibida a divulgação por ambas as partes.',
      y
    );

    y -= 8;
    y = drawClauseHeading(ctx, page, '11 - DISPOSIÇÕES GERAIS', y);
    y = paragraph(
      ctx,
      page,
      'Este contrato é regido pelas leis brasileiras. Alterações somente terão validade se feitas por escrito e assinadas por ambas as partes. Fica eleito o foro de Pirassununga/SP para dirimir quaisquer dúvidas ou controvérsias.',
      y
    );

    drawFooter(ctx, page, 6);
  }

  function drawMenuPage(ctx, data) {
    var page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    var y = drawHeader(ctx, page, 'CARDÁPIO E AUTORIZAÇÃO DE IMAGEM');

    y = drawClauseHeading(ctx, page, '12 - CARDÁPIO', y);
    y = paragraph(
      ctx,
      page,
      'O cardápio a ser servido no evento será previamente definido em comum acordo pela CONTRATANTE e CONTRATADA, com base no orçamento aprovado nº ' +
        (data.quoteNumber || 'informado entre as partes') +
        ', conforme detalhamento constante do ANEXO I - CARDÁPIO DO EVENTO.',
      y
    );
    y = paragraph(ctx, page, supplyClauseText(data), y);
    y = paragraph(
      ctx,
      page,
      'Alterações no cardápio após a assinatura do presente instrumento somente serão admitidas mediante solicitação formal da CONTRATANTE, com antecedência mínima de 10 (dez) dias da data do evento, podendo ensejar revisão dos valores pactuados.',
      y
    );
    y = paragraph(
      ctx,
      page,
      'A CONTRATADA não se responsabiliza pelo fornecimento de insumos, bebidas ou quaisquer itens não previstos no cardápio previamente acordado entre as partes.',
      y,
      { gapAfter: 12 }
    );
    y = drawField(ctx, page, 'CARDÁPIO DEFINIDO', data.menu || 'Conforme Anexo I - Cardápio do evento', y);
    if (data.notes && String(data.notes).trim()) {
      y = drawField(ctx, page, 'OBSERVAÇÕES ADICIONAIS', data.notes, y);
    }

    y -= 10;
    y = drawClauseHeading(ctx, page, '13 - DA AUTORIZAÇÃO DE USO DE IMAGEM PARA FINS PUBLICITÁRIOS', y);
    y = paragraph(ctx, page, imageClauseText(data), y, { lineHeight: 14 });

    drawFooter(ctx, page, 7);
  }

  function drawMinorsAndSignaturePage(ctx, data) {
    var page = ctx.doc.addPage([PAGE_W, PAGE_H]);
    var y = drawHeader(ctx, page, 'PROTEÇÃO DE MENORES E ASSINATURAS');

    y = drawClauseHeading(ctx, page, '14 - PROIBIÇÃO DE FORNECIMENTO DE BEBIDAS ALCOÓLICAS A MENORES', y);
    y = paragraph(
      ctx,
      page,
      'Em conformidade com a Lei Federal nº 13.106/2015 e o Estatuto da Criança e do Adolescente, fica expressamente proibido o fornecimento, venda ou entrega de bebidas alcoólicas a menores de 18 anos durante o evento. A CONTRATADA reserva-se o direito de exigir documento de identificação para comprovação da idade e recusar atendimento a qualquer pessoa que não comprove ser maior de idade. A responsabilidade pelo controle de acesso de menores no evento é da CONTRATANTE, que responderá por eventuais infrações decorrentes do descumprimento desta cláusula.',
      y
    );

    y -= 10;
    y = drawClauseHeading(ctx, page, '15 - ASSINATURA DO CONTRATO', y);
    var closing = 'Cientes e de acordo, ambas as partes firmam o presente contrato.';
    var place = data.eventLocation ? data.eventLocation + ', ' : '';
    var when = formatDateBR(data.eventDate);
    if (place || when) {
      closing += ' ' + place + when + '.';
    }
    y = paragraph(ctx, page, closing, y, { gapAfter: 40 });

    var colWidth = CONTENT_W / 2 - 12;
    var leftX = MARGIN_X;
    var rightX = MARGIN_X + CONTENT_W / 2 + 12;
    page.drawLine({ start: { x: leftX, y: y }, end: { x: leftX + colWidth, y: y }, thickness: 0.8, color: MUTED });
    page.drawLine({ start: { x: rightX, y: y }, end: { x: rightX + colWidth, y: y }, thickness: 0.8, color: MUTED });
    page.drawText('CONTRATANTE', { x: leftX, y: y - 14, size: 9, font: ctx.boldFont, color: GOLD });
    page.drawText('CONTRATADA', { x: rightX, y: y - 14, size: 9, font: ctx.boldFont, color: GOLD });
    page.drawText(data.clientName || '-', { x: leftX, y: y - 30, size: 10.5, font: ctx.bodyFont, color: DARK });
    page.drawText(CONTRATADA.nome, { x: rightX, y: y - 30, size: 10.5, font: ctx.bodyFont, color: DARK });
    page.drawText('CPF/CNPJ: ' + (data.clientDocument || '-'), {
      x: leftX,
      y: y - 44,
      size: 8.5,
      font: ctx.bodyFont,
      color: MUTED,
    });
    page.drawText('CNPJ: ' + CONTRATADA.cnpj, { x: rightX, y: y - 44, size: 8.5, font: ctx.bodyFont, color: MUTED });

    drawFooter(ctx, page, 8);
  }

  function generateContractPdf(data) {
    var PDFDocument = window.PDFLib.PDFDocument;
    var StandardFonts = window.PDFLib.StandardFonts;

    return PDFDocument.create().then(function (doc) {
      doc.registerFontkit(window.fontkit);
      initColors();

      return Promise.all([
        loadAsset('./assets/balerion-logo.png'),
        loadAsset('./assets/cover-page.jpg'),
        loadAsset('./assets/fonts/PlayfairDisplay-Variable.ttf'),
      ]).then(function (assets) {
        return Promise.all([
          doc.embedPng(assets[0]),
          doc.embedJpg(assets[1]),
          doc.embedFont(assets[2]),
          doc.embedFont(StandardFonts.Helvetica),
          doc.embedFont(StandardFonts.HelveticaBold),
        ]).then(function (fonts) {
          var ctx = {
            doc: doc,
            logoImage: fonts[0],
            coverImage: fonts[1],
            displayFont: fonts[2],
            bodyFont: fonts[3],
            boldFont: fonts[4],
          };

          drawCoverPage(ctx);
          drawPartiesPage(ctx, data);
          drawObjectPage(ctx, data);
          drawEquipmentPage(ctx, data);
          drawObligationsPage(ctx, data);
          drawForceMajeurePage(ctx);
          drawMenuPage(ctx, data);
          drawMinorsAndSignaturePage(ctx, data);

          return doc.save();
        });
      });
    });
  }
})();
