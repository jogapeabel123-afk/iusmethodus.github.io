/* ============================================================
   IUS METHODUS · Plantillas
   Cuatro plantillas reales editables que se abren en un visor
   lateral. Persisten en localStorage. Imprimibles.
   ============================================================ */

(function() {
  'use strict';

  const TEMPLATES = {

    /* ---------------------------------------------------------
       1 · MATRIZ DE CONSISTENCIA
       --------------------------------------------------------- */
    matriz: {
      num: 'R · 01',
      cat: 'Metodología de la investigación',
      title: 'Matriz de consistencia',
      render() {
        const cols = [
          { k: 'problema',   t: 'Problema',                    ph: 'Pregunta general · ¿Cómo…?' },
          { k: 'objetivos',  t: 'Objetivos',                   ph: 'Verbo en infinitivo · resultado esperado' },
          { k: 'hipotesis',  t: 'Hipótesis',                   ph: 'Relación entre variables — verificable' },
          { k: 'variables',  t: 'Variables',                   ph: 'Independiente · dependiente · interviniente' },
          { k: 'indicadores',t: 'Indicadores',                 ph: 'Dimensión · indicador · instrumento' },
          { k: 'metodologia',t: 'Metodología',                 ph: 'Enfoque · diseño · técnica · muestra' },
        ];
        const rows = [
          { label: 'General',        ph: 'Pregunta / objetivo principal' },
          { label: 'Específico I',   ph: 'Sub-pregunta vinculada' },
          { label: 'Específico II',  ph: 'Sub-pregunta vinculada' },
          { label: 'Específico III', ph: 'Sub-pregunta vinculada' },
        ];

        return `
          <div class="sheet">
            <p class="sheet-intro">Tabla canónica que asegura la trazabilidad entre problema, objetivos, hipótesis, variables, indicadores y diseño metodológico. Edita cada celda — el contenido queda guardado en este navegador.</p>

            <div class="sheet-section">
              <h3><span class="num">01</span>Identificación</h3>
              <div class="field-row">
                <div class="field"><label>Título de la investigación</label><input data-tpl-field="titulo" placeholder="Título tentativo de la tesis o artículo" /></div>
                <div class="field"><label>Línea / área</label><input data-tpl-field="linea" placeholder="Derecho constitucional · penal · laboral…" /></div>
              </div>
              <div class="field-row">
                <div class="field"><label>Investigador(a)</label><input data-tpl-field="autor" placeholder="Nombre y apellidos" /></div>
                <div class="field"><label>Fecha</label><input data-tpl-field="fecha" placeholder="DD · MM · AAAA" /></div>
              </div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">02</span>Matriz</h3>
              <p class="hint">Cada fila articula un objetivo con su hipótesis, variables, indicadores y método.</p>
              <div class="matriz" role="table">
                ${cols.map(c => `<div class="mh">${c.t}</div>`).join('')}
                ${rows.map((r, ri) => cols.map(c => `
                  <div class="mc" contenteditable="true" data-tpl-cell="${ri}.${c.k}" data-ph="${ri === 0 ? c.ph : (c.k === 'problema' ? r.ph : '—')}"></div>
                `).join('')).join('')}
              </div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">03</span>Coherencia argumental</h3>
              <div class="field"><label>Observaciones del asesor / autocrítica</label><textarea data-tpl-field="obs" placeholder="¿Hay alineación vertical (problema → objetivo → hipótesis)?"></textarea></div>
            </div>
          </div>
        `;
      }
    },

    /* ---------------------------------------------------------
       2 · FICHA JURISPRUDENCIAL
       --------------------------------------------------------- */
    ficha: {
      num: 'R · 02',
      cat: 'Análisis jurisprudencial',
      title: 'Ficha jurisprudencial',
      render() {
        return `
          <div class="sheet">
            <p class="sheet-intro">Ficha estructurada para analizar una sentencia: distingue hechos, problema jurídico, ratio decidendi, obiter dicta y permite construir un comentario crítico fundamentado.</p>

            <div class="sheet-section">
              <h3><span class="num">01</span>Identificación del fallo</h3>
              <div class="ficha-grid">
                <div class="field"><label>Tribunal / Corte</label><input data-tpl-field="tribunal" placeholder="Corte Suprema · Tribunal Constitucional…" /></div>
                <div class="field"><label>N.º de expediente</label><input data-tpl-field="exp" placeholder="EXP. N.º 000-0000-AA/TC" /></div>
                <div class="field"><label>Fecha</label><input data-tpl-field="fecha" placeholder="DD/MM/AAAA" /></div>
                <div class="field"><label>Materia</label><input data-tpl-field="materia" placeholder="Acción de amparo · habeas corpus…" /></div>
                <div class="field span-2"><label>Partes</label><input data-tpl-field="partes" placeholder="Demandante c. Demandado" /></div>
                <div class="field span-2"><label>Ponente</label><input data-tpl-field="ponente" placeholder="Magistrado(a) ponente" /></div>
              </div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">02</span>Hechos relevantes</h3>
              <p class="hint">Selecciona los hechos jurídicamente determinantes. Evita lo accesorio.</p>
              <div class="field"><label>Resumen de los hechos</label><textarea rows="5" data-tpl-field="hechos" placeholder="Narración objetiva, cronológica, sin valoración…"></textarea></div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">03</span>Problema jurídico</h3>
              <div class="field"><label>Pregunta(s) que resuelve el tribunal</label><textarea rows="3" data-tpl-field="problema" placeholder="¿Vulnera la norma X el derecho Y reconocido en el artículo Z?"></textarea></div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">04</span>Fundamentos de derecho</h3>
              <div class="field"><label>Normas aplicadas</label><textarea rows="3" data-tpl-field="normas" placeholder="Constitución, tratados, leyes, reglamentos invocados"></textarea></div>
              <div class="field"><label>Precedentes citados</label><textarea rows="3" data-tpl-field="precedentes" placeholder="Sentencias previas referenciadas por el tribunal"></textarea></div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">05</span>Ratio decidendi <em style="color:var(--ink-mute);font-weight:400;font-size:13px">— la razón de decidir</em></h3>
              <div class="field"><label>Regla jurídica vinculante</label><textarea rows="4" data-tpl-field="ratio" placeholder="Principio o regla creada/aplicada para resolver el caso"></textarea></div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">06</span>Obiter dicta <em style="color:var(--ink-mute);font-weight:400;font-size:13px">— dicho de paso</em></h3>
              <div class="field"><label>Consideraciones complementarias</label><textarea rows="3" data-tpl-field="obiter" placeholder="Argumentos accesorios, no vinculantes"></textarea></div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">07</span>Decisión</h3>
              <div class="field"><label>Fallo y votos</label><textarea rows="3" data-tpl-field="fallo" placeholder="Funda/Infunda · votos singulares · votos disidentes"></textarea></div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">08</span>Comentario crítico</h3>
              <div class="field"><label>Análisis personal</label><textarea rows="5" data-tpl-field="critica" placeholder="¿La argumentación es sólida? ¿Se aparta del precedente? ¿Qué consecuencias trae?"></textarea></div>
            </div>
          </div>
        `;
      }
    },

    /* ---------------------------------------------------------
       3 · TEORÍA DEL CASO
       --------------------------------------------------------- */
    caso: {
      num: 'R · 03',
      cat: 'Litigación · Teoría del caso',
      title: 'Teoría del caso',
      render() {
        return `
          <div class="sheet">
            <p class="sheet-intro">Estructura clásica de la teoría del caso: una historia persuasiva sostenida por tres fundamentos (fáctico, jurídico, probatorio) y una proposición conclusiva que el operador puede defender en audiencia.</p>

            <div class="sheet-section">
              <h3><span class="num">01</span>Datos generales</h3>
              <div class="ficha-grid">
                <div class="field"><label>Operador jurídico</label><input data-tpl-field="rol" placeholder="Defensa · Fiscalía · Querellante" /></div>
                <div class="field"><label>Materia</label><input data-tpl-field="materia" placeholder="Penal · civil · laboral · administrativo" /></div>
                <div class="field span-2"><label>Cliente / parte representada</label><input data-tpl-field="cliente" placeholder="Nombre y posición procesal" /></div>
              </div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">02</span>Proposición fáctica <em style="color:var(--ink-mute);font-weight:400;font-size:13px">— la historia</em></h3>
              <p class="hint">Una historia única, sencilla, coherente, creíble y verificable.</p>
              <div class="field"><label>Relato del caso (un párrafo)</label><textarea rows="5" data-tpl-field="historia" placeholder="El día X, en el lugar Y, ocurrió Z…"></textarea></div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">03</span>Fundamento fáctico</h3>
              <p class="hint">Cada hecho relevante debe poder probarse y vincularse a la norma.</p>
              <div class="field"><label>Hecho 1</label><textarea rows="2" data-tpl-field="hecho1" placeholder="Hecho jurídicamente relevante"></textarea></div>
              <div class="field"><label>Hecho 2</label><textarea rows="2" data-tpl-field="hecho2" placeholder="Hecho jurídicamente relevante"></textarea></div>
              <div class="field"><label>Hecho 3</label><textarea rows="2" data-tpl-field="hecho3" placeholder="Hecho jurídicamente relevante"></textarea></div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">04</span>Fundamento jurídico</h3>
              <div class="field"><label>Tipo / norma aplicable</label><textarea rows="3" data-tpl-field="tipo" placeholder="Art. X del Código… · concordancias · jurisprudencia"></textarea></div>
              <div class="field"><label>Elementos del tipo / supuesto de hecho</label><textarea rows="3" data-tpl-field="elementos" placeholder="Descomponer el tipo: sujeto, conducta, resultado, nexo, dolo…"></textarea></div>
              <div class="field"><label>Subsunción</label><textarea rows="3" data-tpl-field="subsuncion" placeholder="Cómo se ajustan los hechos a cada elemento del tipo"></textarea></div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">05</span>Fundamento probatorio</h3>
              <p class="hint">Cada hecho ↔ medio de prueba. Anticipa la cadena.</p>
              <div class="matriz" role="table" style="grid-template-columns: 1.2fr 1fr 1fr 0.8fr;">
                <div class="mh">Hecho a probar</div>
                <div class="mh">Medio de prueba</div>
                <div class="mh">Órgano / testigo</div>
                <div class="mh">Pertinencia</div>
                ${[0,1,2,3].map(i => `
                  <div class="mc" contenteditable="true" data-tpl-cell="p${i}.hecho" data-ph="—"></div>
                  <div class="mc" contenteditable="true" data-tpl-cell="p${i}.medio" data-ph="documental · pericial · testimonial"></div>
                  <div class="mc" contenteditable="true" data-tpl-cell="p${i}.organo" data-ph="—"></div>
                  <div class="mc" contenteditable="true" data-tpl-cell="p${i}.pert" data-ph="alta · media · baja"></div>
                `).join('')}
              </div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">06</span>Pretensión y conclusión</h3>
              <div class="field"><label>Petitorio</label><textarea rows="2" data-tpl-field="petitorio" placeholder="Solicito que se declare…"></textarea></div>
              <div class="field"><label>Frase tema (theme) — una sola línea memorable</label><input data-tpl-field="tema" placeholder='"Este no es un caso sobre X, es un caso sobre Y."' /></div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">07</span>Anticipación del adversario</h3>
              <div class="field"><label>Argumentos contrarios probables</label><textarea rows="3" data-tpl-field="contra" placeholder="¿Qué dirá la contraparte? ¿Cómo respondemos?"></textarea></div>
            </div>
          </div>
        `;
      }
    },

    /* ---------------------------------------------------------
       4 · ANÁLISIS NORMATIVO · Criterios de interpretación
       --------------------------------------------------------- */
    interp: {
      num: 'R · 04',
      cat: 'Hermenéutica jurídica',
      title: 'Análisis normativo · criterios de interpretación',
      render() {
        const criterios = [
          { n: 'I',   k: 'literal',   t: 'Literal o gramatical',     s: 'Sentido natural y obvio de las palabras de la norma.', q: 'Definir términos. ¿Hay ambigüedad léxica?' },
          { n: 'II',  k: 'sistematica', t: 'Sistemática',            s: 'La norma como parte de un todo: concordancias internas y externas.', q: 'Concordar con la Constitución, tratados, otras normas del mismo cuerpo.' },
          { n: 'III', k: 'teleologica', t: 'Teleológica · finalista',s: 'Fin u objeto que persigue la norma.', q: '¿Cuál es la mens legis? ¿Qué problema soluciona?' },
          { n: 'IV',  k: 'historica',  t: 'Histórica',                s: 'Antecedentes legislativos y contexto de creación.', q: 'Trabajos preparatorios, debate parlamentario, exposición de motivos.' },
          { n: 'V',   k: 'sociologica',t: 'Sociológica · evolutiva', s: 'Realidad social actual a la que se aplica la norma.', q: '¿La interpretación es funcional al contexto presente?' },
          { n: 'VI',  k: 'autentica', t: 'Auténtica',                 s: 'Interpretación realizada por el propio órgano emisor.', q: 'Leyes interpretativas, exposición oficial.' },
          { n: 'VII', k: 'conforme',  t: 'Conforme a la Constitución',s: 'Elegir el sentido compatible con la norma fundamental.', q: 'Test de proporcionalidad · principio pro homine.' },
        ];

        return `
          <div class="sheet">
            <p class="sheet-intro">Analiza una norma desde los siete criterios clásicos de la hermenéutica jurídica. Cada criterio se expande para registrar el análisis y, al final, se sintetiza la interpretación más sólida.</p>

            <div class="sheet-section">
              <h3><span class="num">01</span>Identificación de la norma</h3>
              <div class="ficha-grid">
                <div class="field span-2"><label>Norma a interpretar (transcripción literal)</label><textarea rows="3" data-tpl-field="norma" placeholder='"Artículo X.- …"'></textarea></div>
                <div class="field"><label>Cuerpo normativo</label><input data-tpl-field="cuerpo" placeholder="Código Civil · Ley N.º…" /></div>
                <div class="field"><label>Fecha de vigencia</label><input data-tpl-field="vigencia" placeholder="DD/MM/AAAA" /></div>
              </div>
              <div class="field"><label>Problema interpretativo</label><textarea rows="2" data-tpl-field="problema" placeholder="¿Qué duda concreta plantea la norma? ¿Por qué su sentido no es evidente?"></textarea></div>
            </div>

            <div class="sheet-section">
              <h3><span class="num">02</span>Criterios de interpretación</h3>
              <p class="hint">Despliega cada criterio para registrar el análisis. Marca al final cuál(es) consideras dirimente(s).</p>
              ${criterios.map((c, i) => `
                <details class="criterio" ${i === 0 ? 'open' : ''}>
                  <summary>
                    <span class="c-num">${c.n}</span>
                    <span class="c-title">${c.t}<span class="c-sub">${c.s}</span></span>
                    <svg class="c-chev" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.4"/></svg>
                  </summary>
                  <div class="c-body">
                    <div class="field"><label>Análisis desde este criterio</label><textarea rows="4" data-tpl-field="${c.k}" placeholder="${c.q}"></textarea></div>
                    <div class="field"><label>Resultado interpretativo</label><input data-tpl-field="${c.k}-res" placeholder="Una línea — ¿qué dice la norma desde este ángulo?" /></div>
                  </div>
                </details>
              `).join('')}
            </div>

            <div class="sheet-section">
              <h3><span class="num">03</span>Síntesis interpretativa</h3>
              <div class="field"><label>Criterio(s) dirimente(s) y justificación</label><textarea rows="3" data-tpl-field="dirimente" placeholder="¿Cuál criterio prevalece y por qué? ¿Hay tensión entre criterios?"></textarea></div>
              <div class="field"><label>Interpretación sostenida</label><textarea rows="4" data-tpl-field="conclusion" placeholder="La norma debe entenderse en el sentido de que…"></textarea></div>
            </div>
          </div>
        `;
      }
    },
  };

  /* ---------- VIEWER ---------- */
  const viewer = document.querySelector('.tpl-viewer');
  const scrim = document.querySelector('.tpl-scrim');
  const body = viewer.querySelector('[data-tpl-body]');
  const elNum = viewer.querySelector('.tpl-num');
  const elCat = viewer.querySelector('.tpl-cat');
  const elTitle = viewer.querySelector('.tpl-title');

  let currentKey = null;

  function open(key) {
    const t = TEMPLATES[key];
    if (!t) return;
    currentKey = key;
    elNum.textContent = t.num;
    elCat.textContent = t.cat;
    elTitle.textContent = t.title;
    body.innerHTML = t.render();
    viewer.classList.add('open');
    scrim.classList.add('show');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    restore(key);
    bindPersist(key);
    body.scrollTop = 0;
  }
  function close() {
    viewer.classList.remove('open');
    scrim.classList.remove('show');
    viewer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentKey = null;
  }

  // bind triggers
  document.querySelectorAll('[data-template]').forEach(el => {
    el.addEventListener('click', () => open(el.dataset.template));
  });
  document.querySelectorAll('[data-open-template]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); open(el.dataset.openTemplate); });
  });
  document.querySelectorAll('[data-tpl-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && currentKey) close(); });

  // actions
  viewer.querySelector('[data-tpl-action="print"]').addEventListener('click', () => window.print());
  viewer.querySelector('[data-tpl-action="reset"]').addEventListener('click', () => {
    if (!currentKey) return;
    if (!confirm('¿Restablecer esta plantilla? Se perderá lo escrito.')) return;
    localStorage.removeItem(storeKey(currentKey));
    open(currentKey);
  });

  /* ---------- PERSISTENCE ---------- */
  function storeKey(k) { return 'ius-tpl::' + k; }
  function readStore(k) {
    try { return JSON.parse(localStorage.getItem(storeKey(k)) || '{}'); }
    catch { return {}; }
  }
  function writeStore(k, data) {
    localStorage.setItem(storeKey(k), JSON.stringify(data));
  }

  function bindPersist(k) {
    const data = readStore(k);
    body.querySelectorAll('[data-tpl-field], [data-tpl-cell]').forEach(el => {
      const id = el.dataset.tplField || el.dataset.tplCell;
      const handler = () => {
        const d = readStore(k);
        d[id] = el.matches('[contenteditable]') ? el.innerHTML : el.value;
        writeStore(k, d);
      };
      if (el.matches('[contenteditable]')) el.addEventListener('input', handler);
      else el.addEventListener('input', handler);
    });
  }

  function restore(k) {
    const data = readStore(k);
    body.querySelectorAll('[data-tpl-field], [data-tpl-cell]').forEach(el => {
      const id = el.dataset.tplField || el.dataset.tplCell;
      const val = data[id];
      if (val == null) return;
      if (el.matches('[contenteditable]')) el.innerHTML = val;
      else el.value = val;
    });
  }

})();
