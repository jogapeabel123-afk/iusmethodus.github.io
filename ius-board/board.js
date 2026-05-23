/* ============================================================
   IUS METHODUS BOARD — Interactive runtime
   - theme toggle
   - sidebar panel
   - draggable canvas + draggable nodes + SVG edges + pan/zoom
   - hybrid flow stepper
   ============================================================ */

(function() {
  'use strict';

  /* ---------- THEME ---------- */
  const themeBtn = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  const stored = localStorage.getItem('ius-theme');
  if (stored) root.setAttribute('data-theme', stored);
  themeBtn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('ius-theme', next);
  });

  /* ---------- SIDEBAR ---------- */
  const sidebar = document.querySelector('.sidebar-panel');
  const trigger = document.querySelector('.sidebar-trigger');
  const scrim = document.querySelector('.scrim');
  const closeSidebar = document.querySelector('[data-close-sidebar]');
  function openSide() { sidebar.classList.add('open'); scrim.classList.add('show'); }
  function shutSide() { sidebar.classList.remove('open'); scrim.classList.remove('show'); }
  trigger?.addEventListener('click', openSide);
  closeSidebar?.addEventListener('click', shutSide);
  scrim?.addEventListener('click', shutSide);

  /* ---------- INTERSECTION REVEAL ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- ACTIVE NAV ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => navIO.observe(s));

  /* ============================================================
     CANVAS ENGINE
     - draggable nodes
     - SVG bezier edges that follow nodes
     - pan via empty-space drag, zoom via wheel
     ============================================================ */
  function initCanvas(canvasEl, data) {
    const view = canvasEl.querySelector('.canvas-view');
    const stage = canvasEl.querySelector('.canvas-stage');
    const svg = canvasEl.querySelector('svg.edges');
    const status = canvasEl.querySelector('.canvas-status');

    // build nodes
    const nodes = {};
    data.nodes.forEach(n => {
      const el = document.createElement('div');
      el.className = 'node';
      if (n.kind) el.dataset.kind = n.kind;
      el.dataset.id = n.id;
      el.style.left = n.x + 'px';
      el.style.top = n.y + 'px';
      el.innerHTML = `
        <div class="n-tag">${n.tag || 'Nodo'}</div>
        <h4>${n.title}</h4>
        ${n.body ? `<p>${n.body}</p>` : ''}
        ${n.meta ? `<div class="n-meta"><span>${n.meta[0]}</span><span>${n.meta[1] || ''}</span></div>` : ''}
      `;
      stage.appendChild(el);
      nodes[n.id] = { el, x: n.x, y: n.y };
    });

    // build edges
    const edges = data.edges.map(e => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'edge' + (e.flow ? ' flow animated' : ''));
      svg.appendChild(path);
      return { ...e, path };
    });

    function nodeCenter(id) {
      const n = nodes[id];
      const r = n.el.getBoundingClientRect();
      // Use width/height relative to stage scale: we use actual offset values
      return {
        x: n.x + n.el.offsetWidth / 2,
        y: n.y + n.el.offsetHeight / 2,
        w: n.el.offsetWidth,
        h: n.el.offsetHeight,
      };
    }

    function nodeAnchor(id, towardX, towardY) {
      const c = nodeCenter(id);
      const dx = towardX - c.x;
      const dy = towardY - c.y;
      const hw = c.w / 2, hh = c.h / 2;
      // exit on the rectangle border roughly toward target
      const absX = Math.abs(dx), absY = Math.abs(dy);
      let ax, ay;
      if (absX / hw > absY / hh) {
        ax = c.x + Math.sign(dx) * hw;
        ay = c.y + dy * (hw / absX);
      } else {
        ay = c.y + Math.sign(dy) * hh;
        ax = c.x + dx * (hh / absY);
      }
      return { x: ax, y: ay };
    }

    function drawEdges() {
      edges.forEach(e => {
        const cFrom = nodeCenter(e.from);
        const cTo = nodeCenter(e.to);
        const aFrom = nodeAnchor(e.from, cTo.x, cTo.y);
        const aTo = nodeAnchor(e.to, cFrom.x, cFrom.y);
        const midX = (aFrom.x + aTo.x) / 2;
        const d = `M${aFrom.x},${aFrom.y} C${midX},${aFrom.y} ${midX},${aTo.y} ${aTo.x},${aTo.y}`;
        e.path.setAttribute('d', d);
      });
    }

    // node drag
    let dragging = null;
    stage.addEventListener('pointerdown', (ev) => {
      const nodeEl = ev.target.closest('.node');
      if (!nodeEl) return;
      ev.preventDefault();
      ev.stopPropagation();
      const id = nodeEl.dataset.id;
      const n = nodes[id];
      const sc = scale;
      dragging = {
        id,
        node: n,
        startX: ev.clientX,
        startY: ev.clientY,
        ox: n.x,
        oy: n.y,
      };
      nodeEl.classList.add('dragging');
      nodeEl.setPointerCapture(ev.pointerId);
    });
    stage.addEventListener('pointermove', (ev) => {
      if (!dragging) return;
      const sc = scale;
      const dx = (ev.clientX - dragging.startX) / sc;
      const dy = (ev.clientY - dragging.startY) / sc;
      dragging.node.x = dragging.ox + dx;
      dragging.node.y = dragging.oy + dy;
      dragging.node.el.style.left = dragging.node.x + 'px';
      dragging.node.el.style.top = dragging.node.y + 'px';
      drawEdges();
    });
    stage.addEventListener('pointerup', (ev) => {
      if (!dragging) return;
      dragging.node.el.classList.remove('dragging');
      dragging = null;
    });

    // pan / zoom
    let scale = 1;
    let tx = 0, ty = 0;
    function applyStage() {
      stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      if (status) status.querySelector('[data-zoom]').textContent = Math.round(scale * 100) + '%';
    }

    let panning = null;
    view.addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('.node')) return;
      panning = { sx: ev.clientX, sy: ev.clientY, otx: tx, oty: ty };
      view.classList.add('dragging');
      view.setPointerCapture(ev.pointerId);
    });
    view.addEventListener('pointermove', (ev) => {
      if (!panning) return;
      tx = panning.otx + (ev.clientX - panning.sx);
      ty = panning.oty + (ev.clientY - panning.sy);
      applyStage();
    });
    view.addEventListener('pointerup', () => {
      panning = null; view.classList.remove('dragging');
    });
    view.addEventListener('wheel', (ev) => {
      if (!ev.ctrlKey && !ev.metaKey && Math.abs(ev.deltaY) < 30) return;
      ev.preventDefault();
      const rect = view.getBoundingClientRect();
      const mx = ev.clientX - rect.left;
      const my = ev.clientY - rect.top;
      const next = Math.max(0.5, Math.min(1.6, scale * (1 - ev.deltaY * 0.0015)));
      const k = next / scale;
      tx = mx - (mx - tx) * k;
      ty = my - (my - ty) * k;
      scale = next;
      applyStage();
    }, { passive: false });

    // zoom buttons
    canvasEl.querySelectorAll('[data-zoom-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.zoomAction;
        if (a === 'in') scale = Math.min(1.6, scale * 1.15);
        if (a === 'out') scale = Math.max(0.5, scale / 1.15);
        if (a === 'fit') { scale = 1; tx = 0; ty = 0; }
        applyStage();
      });
    });

    // filter chips
    canvasEl.querySelectorAll('[data-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        canvasEl.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const f = chip.dataset.filter;
        Object.values(nodes).forEach(n => {
          const k = n.el.dataset.kind || 'default';
          if (f === 'all') n.el.style.opacity = 1;
          else n.el.style.opacity = (k === f || n.el.dataset.id === f) ? 1 : 0.2;
        });
      });
    });

    // initial paint
    requestAnimationFrame(() => { drawEdges(); applyStage(); });
    window.addEventListener('resize', drawEdges);
  }

  /* ---------- DERECHO data ---------- */
  const derechoData = {
    nodes: [
      { id: 'root', kind: 'root', tag: 'IUS · Núcleo', title: 'Sistema Jurídico', body: 'Bloque raíz desde el que se derivan jerarquía, interpretación y argumentación.', x: 920, y: 240, meta: ['§ Art. 1', 'core'] },
      { id: 'intro', tag: 'I · Fundamento', title: 'Introducción al Derecho', body: 'Concepto, fuentes y ramas. Derecho como sistema y como hecho social.', x: 80, y: 60, meta: ['§ 01', '6 lecturas'] },
      { id: 'jer', tag: 'II · Jerarquía', title: 'Jerarquía normativa', body: 'Constitución, tratados, leyes, reglamentos. Pirámide de Kelsen revisada.', x: 80, y: 320, meta: ['§ 02', 'esquema'] },
      { id: 'inter', kind: 'accent', tag: 'III · Hermenéutica', title: 'Interpretación jurídica', body: 'Literal, sistemática, teleológica, histórica. Técnicas y límites.', x: 460, y: 60, meta: ['§ 03', 'taller'] },
      { id: 'der', tag: 'IV · Garantías', title: 'Derechos fundamentales', body: 'Catálogo, eficacia horizontal y mecanismos de tutela.', x: 460, y: 480, meta: ['§ 04', 'casos'] },
      { id: 'arg', kind: 'accent', tag: 'V · Retórica', title: 'Argumentación jurídica', body: 'Toulmin, Alexy, MacCormick. Construir y refutar premisas.', x: 1280, y: 80, meta: ['§ 05', 'seminario'] },
      { id: 'caso', tag: 'VI · Praxis', title: 'Resolución de casos', body: 'Método del caso, ratio decidendi, analogía y precedente.', x: 1280, y: 460, meta: ['§ 06', 'lab'] },
    ],
    edges: [
      { from: 'intro', to: 'root' },
      { from: 'jer', to: 'root' },
      { from: 'inter', to: 'root', flow: true },
      { from: 'der', to: 'root' },
      { from: 'arg', to: 'root', flow: true },
      { from: 'caso', to: 'root' },
      { from: 'jer', to: 'inter' },
      { from: 'der', to: 'caso' },
      { from: 'arg', to: 'caso', flow: true },
    ],
  };

  /* ---------- METODOLOGÍA data ---------- */
  const methodusData = {
    nodes: [
      { id: 'prob', kind: 'root', tag: 'M · Origen', title: 'Problema de investigación', body: 'Brecha epistémica delimitada. Pregunta central que articula el estudio.', x: 80, y: 220, meta: ['¿qué?', '01'] },
      { id: 'obj', tag: 'Propósito', title: 'Objetivos', body: 'General y específicos. Verbos operacionales en infinitivo.', x: 420, y: 60, meta: ['¿para qué?', '02'] },
      { id: 'hip', kind: 'accent', tag: 'Conjetura', title: 'Hipótesis', body: 'Relación tentativa entre variables — verificable y refutable.', x: 420, y: 380, meta: ['¿qué se espera?', '03'] },
      { id: 'var', tag: 'Constructos', title: 'Variables', body: 'Independiente · dependiente · interviniente. Definición conceptual.', x: 780, y: 60, meta: ['unidad', '04'] },
      { id: 'oper', tag: 'Medición', title: 'Operacionalización', body: 'Dimensiones, indicadores e instrumentos de medida.', x: 780, y: 380, meta: ['matriz', '05'] },
      { id: 'marco', tag: 'Teoría', title: 'Marco teórico', body: 'Estado del arte, bases teóricas y posicionamiento del autor.', x: 1140, y: 60, meta: ['fuentes', '06'] },
      { id: 'meto', kind: 'accent', tag: 'Diseño', title: 'Metodología', body: 'Enfoque, alcance, diseño, muestra y técnicas.', x: 1140, y: 380, meta: ['protocolo', '07'] },
      { id: 'res', tag: 'Salida', title: 'Resultados', body: 'Hallazgos, discusión, contraste con la hipótesis y aportes.', x: 1480, y: 220, meta: ['conclusión', '08'] },
    ],
    edges: [
      { from: 'prob', to: 'obj', flow: true },
      { from: 'prob', to: 'hip', flow: true },
      { from: 'obj', to: 'var' },
      { from: 'hip', to: 'var' },
      { from: 'hip', to: 'oper' },
      { from: 'var', to: 'oper' },
      { from: 'var', to: 'marco' },
      { from: 'oper', to: 'meto', flow: true },
      { from: 'marco', to: 'meto' },
      { from: 'meto', to: 'res', flow: true },
    ],
  };

  document.querySelectorAll('[data-canvas="derecho"]').forEach(el => initCanvas(el, derechoData));
  document.querySelectorAll('[data-canvas="methodus"]').forEach(el => initCanvas(el, methodusData));

  /* ============================================================
     HYBRID FLOW STEPPER
     ============================================================ */
  const flowSteps = document.querySelectorAll('.flow-step');
  const flowPanel = document.querySelector('[data-flow-detail]');
  const flowContent = {
    'prob': {
      eyebrow: '01 · Origen',
      title: 'Problema jurídico',
      body: 'Toda investigación jurídica aplicada arranca de una fricción: una norma ambigua, una laguna, un conflicto entre principios. Aquí el caso real se convierte en pregunta investigable.',
      a: { k: 'Pregunta central', v: '¿Cómo opera la <span class="gold">tutela</span> cuando dos derechos colisionan?' },
      b: { k: 'Tipo de fricción', v: 'Antinomia · principio vs. regla' },
    },
    'norm': {
      eyebrow: '02 · Fuentes positivas',
      title: 'Marco normativo',
      body: 'Mapa de las fuentes formales aplicables ordenadas por jerarquía y vigencia: constitución, tratados, leyes, reglamentos y precedente vinculante.',
      a: { k: 'Bloque de constitucionalidad', v: '<span class="gold">04</span> instrumentos' },
      b: { k: 'Precedentes citados', v: '12 sentencias · 3 votos disidentes' },
    },
    'doct': {
      eyebrow: '03 · Pensamiento',
      title: 'Marco doctrinal',
      body: 'Estado del arte de la dogmática y la teoría. Aquí se elige el autor de referencia, se contrasta con la tradición y se posiciona el investigador.',
      a: { k: 'Corriente principal', v: 'Neoconstitucionalismo <span class="gold">/</span> Alexy' },
      b: { k: 'Contraste crítico', v: 'Positivismo metodológico' },
    },
    'meto': {
      eyebrow: '04 · Diseño',
      title: 'Diseño metodológico',
      body: 'Triangulación: análisis dogmático, exégesis jurisprudencial y, si aplica, trabajo empírico (entrevistas a operadores, análisis de expedientes).',
      a: { k: 'Enfoque', v: 'Cualitativo · <span class="gold">hermenéutico</span>' },
      b: { k: 'Técnicas', v: 'Análisis de discurso · matriz' },
    },
    'res': {
      eyebrow: '05 · Hallazgos',
      title: 'Resultados',
      body: 'Síntesis ordenada de los hallazgos. Se contrasta cada objetivo específico contra los datos recogidos, evidenciando coherencia interna.',
      a: { k: 'Objetivos cubiertos', v: '<span class="gold">5 / 5</span>' },
      b: { k: 'Coherencia interna', v: '0.92 · alta' },
    },
    'concl': {
      eyebrow: '06 · Tesis',
      title: 'Conclusión jurídica',
      body: 'Cierre argumentativo que articula problema, marco, diseño y hallazgos en una tesis defendible. Recomendaciones de lege ferenda o de política pública.',
      a: { k: 'Tesis sostenida', v: 'Test de <span class="gold">proporcionalidad</span> reforzado' },
      b: { k: 'Aporte', v: 'Doctrinal + jurisprudencial' },
    },
  };

  function activateStep(id) {
    flowSteps.forEach(s => s.classList.toggle('is-active', s.dataset.step === id));
    const d = flowContent[id];
    if (!d || !flowPanel) return;
    flowPanel.innerHTML = `
      <div class="canvas-label"><span>${d.eyebrow}</span><span>Coherencia <b style="color:var(--gold)">●</b> alta</span></div>
      <h3 class="detail-title">${d.title}</h3>
      <p class="detail-body">${d.body}</p>
      <div class="detail-blocks">
        <div class="b"><div class="k">${d.a.k}</div><div class="v">${d.a.v}</div></div>
        <div class="b"><div class="k">${d.b.k}</div><div class="v">${d.b.v}</div></div>
      </div>
      <svg class="flow-svg" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
        <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.5"/>
        <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" stroke-width="0.5"/>
        <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" stroke-width="0.3" opacity="0.4"/>
        <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" stroke-width="0.3" opacity="0.4"/>
      </svg>
    `;
  }
  flowSteps.forEach(s => s.addEventListener('mouseenter', () => activateStep(s.dataset.step)));
  flowSteps.forEach(s => s.addEventListener('click', () => activateStep(s.dataset.step)));
  if (flowSteps[0]) activateStep(flowSteps[0].dataset.step);

})();
