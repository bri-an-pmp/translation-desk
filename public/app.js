// Translation Desk page. All text is built with textContent, never innerHTML.

const T = {
  en: {
    skip: 'Skip to content', tagline: 'Museum translation, English → Spanish. You approve every word.',
    tabProjects: 'Projects', tabGlossary: 'Glossary',
    newTitle: 'New project', name: 'Name', namePh: 'e.g. Spring exhibition 2027', file: 'Document',
    fileHint: 'Word (.docx), PDF, text (.txt, .md) or a label sheet (.csv with a “text” column and optional “max” column for character limits). PDFs, including scans, are read by Claude for a few cents.',
    offline: "The app isn't responding. Double-click Translation Desk on your Desktop to start it again, then reload this page.",
    reading: 'Reading the file…', readingPdf: 'Claude is reading the PDF… (about 30 seconds)',
    orPaste: 'Or paste the text', pasteLabel: 'Text to translate', pastePh: 'Leave a blank line between paragraphs. Start a heading with #.',
    settings: 'Settings', variant: 'Spanish for', vUs: 'Visitors in the U.S. (Mexican and Central American roots)', vNeutral: 'All of Latin America (neutral)', vMexican: 'Mexico', vCastilian: 'Spain',
    register: 'Speak to visitors as', rImpersonal: 'neither (impersonal)',
    titles: 'Artwork and exhibition titles', tGloss: 'Keep original + [Spanish in brackets]', tEnglish: 'Translate English titles only', tKeep: 'Keep all titles as written', tAll: 'Translate all titles',
    styleNotes: 'Museum style notes (optional)', styleNotesPh: 'e.g. Use “Latine”. Write “exposición”, not “muestra”.',
    create: 'Create project', yourProjects: 'Your projects', noProjects: 'No projects yet. Create one on the left.',
    back: '← All projects', download: 'Download:', expBilingual: 'Review table (.docx)', expSpanish: 'Spanish only (.docx)',
    show: 'Show', fAll: 'All segments', fAttention: 'Needs attention', fUnapproved: 'Not approved yet',
    glossaryTitle: 'Glossary', glossaryHint: "Terms Claude must always use. The checker warns when a translation doesn't.",
    gEnglish: 'English', gSpanish: 'Spanish', gNote: 'Note', gActions: 'Actions', gAdd: '+ Add term', gSave: 'Save glossary', gImport: 'Import CSV', gRemove: 'Remove',
    gSaved: 'Glossary saved.', gImported: (n) => `Glossary imported: ${n} terms.`,
    keyOk: 'Claude API key found', keyMissing: 'No API key yet: see the README', fake: 'Sample mode (no Claude)',
    english: 'English', spanish: 'Spanish', approve: 'Approved', saved: 'Saved', claudeNote: 'Claude', check: { error: 'Fix', warning: 'Check', note: 'Note' },
    translate: (n, cost) => `Translate ${n} segment${n === 1 ? '' : 's'}${cost ? ` (about ${cost})` : ''}`,
    allDone: 'All segments translated', translating: (b, n) => `Translating part ${b} of ${n}…`, translated: (n) => `Translated ${n} segments. Review each one, edit if needed, and tick Approved.`,
    meta: (p) => `${p.segments.length} segments · ${p.segments.filter((s) => s.target).length} translated · ${p.segments.filter((s) => s.approved).length} approved · Claude cost so far $${p.usage.costUsd.toFixed(2)}`,
    info: (p) => `${p.translated}/${p.total} translated · ${p.approved} approved`,
    counts: (n, all) => `${n} of ${all} shown`,
    created: 'Project created.', needFile: 'Choose a document or paste some text first.', confirmTranslate: (cost) => `This sends the text to Claude and costs about ${cost}. Continue?`,
    chars: (n, max) => (max ? `${n}/${max} characters` : `${n} characters`), problems: 'Some segments need another try:',
    kinds: { exhibition_title: 'title', heading: 'heading', wall_text: 'wall text', label: 'label', caption: 'caption', credit: 'credit', body: 'text', other: 'other' },
    error: 'Something went wrong: ',
  },
  es: {
    skip: 'Ir al contenido', tagline: 'Traducción para museos, del inglés al español. Usted aprueba cada palabra.',
    tabProjects: 'Proyectos', tabGlossary: 'Glosario',
    newTitle: 'Proyecto nuevo', name: 'Nombre', namePh: 'p. ej., Exposición de primavera 2027', file: 'Documento',
    fileHint: 'Word (.docx), PDF, texto (.txt, .md) o una hoja de cédulas (.csv con una columna “text” y, si quiere, una columna “max” con el límite de caracteres). Claude lee los PDF, incluso los escaneados, por unos centavos.',
    offline: 'La aplicación no responde. Haga doble clic en Translation Desk en su escritorio para iniciarla de nuevo y vuelva a cargar esta página.',
    reading: 'Leyendo el archivo…', readingPdf: 'Claude está leyendo el PDF… (unos 30 segundos)',
    orPaste: 'O pegue el texto', pasteLabel: 'Texto para traducir', pastePh: 'Deje una línea en blanco entre párrafos. Empiece un título con #.',
    settings: 'Configuración', variant: 'Español para', vUs: 'Visitantes en EE. UU. (raíces mexicanas y centroamericanas)', vNeutral: 'Toda América Latina (neutro)', vMexican: 'México', vCastilian: 'España',
    register: 'Dirigirse al visitante de', rImpersonal: 'ninguno (impersonal)',
    titles: 'Títulos de obras y exposiciones', tGloss: 'Conservar el original + [español entre corchetes]', tEnglish: 'Traducir solo los títulos en inglés', tKeep: 'Conservar todos los títulos', tAll: 'Traducir todos los títulos',
    styleNotes: 'Notas de estilo del museo (opcional)', styleNotesPh: 'p. ej., Usar “latine”. Escribir “exposición”, no “muestra”.',
    create: 'Crear proyecto', yourProjects: 'Sus proyectos', noProjects: 'Todavía no hay proyectos. Cree uno a la izquierda.',
    back: '← Todos los proyectos', download: 'Descargar:', expBilingual: 'Tabla de revisión (.docx)', expSpanish: 'Solo español (.docx)',
    show: 'Mostrar', fAll: 'Todos los segmentos', fAttention: 'Requieren atención', fUnapproved: 'Sin aprobar',
    glossaryTitle: 'Glosario', glossaryHint: 'Términos que Claude siempre debe usar. El verificador avisa cuando una traducción no los usa.',
    gEnglish: 'Inglés', gSpanish: 'Español', gNote: 'Nota', gActions: 'Acciones', gAdd: '+ Agregar término', gSave: 'Guardar glosario', gImport: 'Importar CSV', gRemove: 'Quitar',
    gSaved: 'Glosario guardado.', gImported: (n) => `Glosario importado: ${n} términos.`,
    keyOk: 'Clave de API de Claude encontrada', keyMissing: 'Falta la clave de API: vea el README', fake: 'Modo de prueba (sin Claude)',
    english: 'Inglés', spanish: 'Español', approve: 'Aprobado', saved: 'Guardado', claudeNote: 'Claude', check: { error: 'Corregir', warning: 'Revisar', note: 'Nota' },
    translate: (n, cost) => `Traducir ${n} segmento${n === 1 ? '' : 's'}${cost ? ` (aprox. ${cost})` : ''}`,
    allDone: 'Todos los segmentos están traducidos', translating: (b, n) => `Traduciendo la parte ${b} de ${n}…`, translated: (n) => `Se tradujeron ${n} segmentos. Revise cada uno, corríjalo si hace falta y marque Aprobado.`,
    meta: (p) => `${p.segments.length} segmentos · ${p.segments.filter((s) => s.target).length} traducidos · ${p.segments.filter((s) => s.approved).length} aprobados · Costo de Claude hasta ahora: USD ${p.usage.costUsd.toFixed(2)}`,
    info: (p) => `${p.translated}/${p.total} traducidos · ${p.approved} aprobados`,
    counts: (n, all) => `Se muestran ${n} de ${all}`,
    created: 'Proyecto creado.', needFile: 'Primero elija un documento o pegue el texto.', confirmTranslate: (cost) => `Esto envía el texto a Claude y cuesta aproximadamente ${cost}. ¿Desea continuar?`,
    chars: (n, max) => (max ? `${n}/${max} caracteres` : `${n} caracteres`), problems: 'Algunos segmentos necesitan otro intento:',
    kinds: { exhibition_title: 'título', heading: 'encabezado', wall_text: 'texto de sala', label: 'cédula', caption: 'pie', credit: 'créditos', body: 'texto', other: 'otro' },
    error: 'Algo salió mal: ',
  },
};

let lang = (() => { try { return localStorage.getItem('td_lang') === 'es' ? 'es' : 'en'; } catch { return 'en'; } })();
const t = (k, ...a) => { const v = T[lang][k] ?? T.en[k]; return typeof v === 'function' ? v(...a) : v; };
const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null && v !== false) n.setAttribute(k, v === true ? '' : v);
  }
  n.append(...kids.filter((x) => x !== null && x !== undefined));
  return n;
};
const money = (n) => (n < 0.01 ? '<$0.01' : `$${n.toFixed(2)}`);
const visible = (s) => s.replace(/\*\*|\*/g, '').length;

let state = { status: null, project: null, glossary: [], filter: 'all' };

function say(msg, isError = false) {
  const live = $('#live');
  live.textContent = msg;
  live.classList.toggle('error', isError);
}

async function api(path, opts = {}) {
  let res;
  try {
    res = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  } catch {
    throw new Error(t('offline'));
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// "*Title*" → <em>Title</em>, built as DOM nodes
function marked(text) {
  const frag = document.createDocumentFragment();
  let last = 0;
  for (const m of text.matchAll(/\*\*([^*]+)\*\*|\*([^*]+)\*/g)) {
    if (m.index > last) frag.append(text.slice(last, m.index));
    frag.append(m[1] !== undefined ? el('strong', { text: m[1] }) : el('em', { text: m[2] }));
    last = m.index + m[0].length;
  }
  frag.append(text.slice(last));
  return frag;
}

function applyLang() {
  document.documentElement.lang = lang;
  for (const n of document.querySelectorAll('[data-t]')) n.textContent = t(n.dataset.t);
  for (const n of document.querySelectorAll('[data-t-placeholder]')) n.placeholder = t(n.dataset.tPlaceholder);
  $('#langBtn').textContent = lang === 'en' ? 'ES' : 'EN';
  $('#langBtn').setAttribute('aria-label', lang === 'en' ? 'Ver en español' : 'View in English');
  renderStatus();
  if (!$('#view-project').hidden && state.project) renderProject();
  if (!$('#view-projects').hidden) loadProjects();
}

function renderStatus() {
  const s = state.status;
  const pill = $('#keyStatus');
  if (!s) return;
  pill.textContent = s.fake ? t('fake') : s.keyFound ? t('keyOk') : t('keyMissing');
  pill.classList.toggle('ok', s.keyFound && !s.fake);
}

function show(view) {
  for (const v of ['projects', 'project', 'glossary']) $(`#view-${v}`).hidden = v !== view;
  for (const b of document.querySelectorAll('.tab')) {
    const on = b.dataset.view === view || (view === 'project' && b.dataset.view === 'projects');
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }
}

// ---------- projects

async function loadProjects() {
  const list = $('#projectList');
  try {
    const items = await api('/api/projects');
    list.replaceChildren(
      ...(items.length
        ? items.map((p) => el('li', {}, el('button', { type: 'button', onclick: () => openProject(p.id) },
            el('span', { class: 'pname', text: p.name }),
            el('span', { class: 'pinfo', text: p.broken ? '⚠' : t('info', p) }))))
        : [el('li', { class: 'empty', text: t('noProjects') })]),
    );
  } catch (err) { say(err.message, true); }
}

async function loadSettings() {
  try {
    const s = await api('/api/settings');
    $('#sVariant').value = s.variant; $('#sRegister').value = s.register; $('#sTitles').value = s.titles; $('#sNotes').value = s.styleNotes;
  } catch { /* defaults in the form are fine */ }
}

const readAsBase64 = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1] || '');
  r.onerror = () => reject(r.error);
  r.readAsDataURL(file);
});

$('#newForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = $('#pFile').files[0];
  const text = $('#pText').value.trim();
  if (!file && !text) return say(t('needFile'), true);
  const settings = { variant: $('#sVariant').value, register: $('#sRegister').value, titles: $('#sTitles').value, styleNotes: $('#sNotes').value };
  const btn = e.submitter || $('#newForm button[type=submit]');
  btn.disabled = true;
  try {
    api('/api/settings', { method: 'PUT', body: JSON.stringify(settings) }).catch(() => {});
    const body = { name: $('#pName').value.trim() || file?.name?.replace(/\.[^.]+$/, ''), settings };
    say(file && /\.pdf$/i.test(file.name) ? t('readingPdf') : t('reading'));
    if (file) Object.assign(body, { fileName: file.name, fileBase64: await readAsBase64(file) });
    else body.text = text;
    const p = await api('/api/projects', { method: 'POST', body: JSON.stringify(body) });
    $('#newForm').reset(); loadSettings();
    say(t('created'));
    openProject(p.id);
  } catch (err) { say(err.message, true); }
  finally { btn.disabled = false; }
});

async function openProject(id) {
  try {
    state.project = await api(`/api/projects/${id}`);
    show('project');
    renderProject();
    $('#pTitle').focus?.();
  } catch (err) { say(err.message, true); }
}

function needsAttention(s) {
  return !s.target || s.flags.length || s.checks.some((c) => c.level !== 'note');
}

function renderProject() {
  const p = state.project;
  $('#pTitle').textContent = p.name;
  $('#pMeta').textContent = t('meta', p);
  const todo = p.segments.filter((s) => !s.target && !s.approved && !s.flags.some((f) => f.type === 'duplicate')).length;
  const btn = $('#translateBtn');
  btn.textContent = todo ? t('translate', todo, p.estimate ? money(p.estimate) : '') : t('allDone');
  btn.disabled = !todo || p.translating;
  for (const [id, kind] of [['#expBilingual', 'bilingual'], ['#expSpanish', 'spanish'], ['#expCsv', 'csv']]) $(id).href = `/api/projects/${p.id}/export/${kind}`;

  const shown = p.segments.filter((s) => state.filter === 'all' || (state.filter === 'attention' ? needsAttention(s) : !s.approved));
  $('#counts').textContent = t('counts', shown.length, p.segments.length);
  $('#segments').replaceChildren(...shown.map(segmentView));
}

function segmentView(s) {
  const levels = s.checks.map((c) => c.level);
  const li = el('li', { class: `seg${s.approved ? ' approved' : levels.includes('error') ? ' has-error' : levels.includes('warning') || s.flags.length ? ' has-warning' : ''}`, id: `seg-${s.id}` });
  const count = el('span', { class: `count${s.maxChars && visible(s.target) > s.maxChars ? ' over' : ''}`, text: t('chars', visible(s.target), s.maxChars) });
  const taId = `ta-${s.id}`;
  const ta = el('textarea', { id: taId, rows: Math.min(14, Math.max(3, Math.ceil(s.source.length / 70) + 1)) });
  ta.value = s.target;
  const status = el('span', { class: 'saved', 'aria-live': 'polite' });
  ta.addEventListener('input', () => {
    count.textContent = t('chars', visible(ta.value), s.maxChars);
    count.classList.toggle('over', Boolean(s.maxChars && visible(ta.value) > s.maxChars));
  });
  ta.addEventListener('change', () => saveSegment(s.id, { target: ta.value }, status));
  const box = el('input', { type: 'checkbox', checked: s.approved, disabled: !s.target, onchange: (e) => saveSegment(s.id, { target: ta.value, approved: e.target.checked }, status) });

  const issues = el('ul', { class: 'issues' },
    ...s.checks.map((c) => el('li', { class: c.level }, el('b', { text: `${t('check')[c.level]}:` }), c.message)),
    ...s.flags.map((f) => el('li', { class: 'flag' }, el('b', { text: `${t('claudeNote')}:` }), f.span ? `“${f.span}”: ` : '', f.note)));

  li.append(...[
    el('div', { class: 'seg-head' }, el('span', { class: 'seg-id', text: s.id }), el('span', { class: 'kind', text: t('kinds')[s.kind] || s.kind }), count),
    el('div', { class: 'pair' },
      el('div', {}, el('p', { class: 'src-label', text: t('english') }), el('p', { class: 'src', lang: 'en' }, marked(s.source))),
      el('div', { class: 'tgt' }, el('label', { class: 'src-label', for: taId, text: `${t('spanish')} (${s.id})` }), ta)),
    issues.childElementCount ? issues : null,
    el('div', { class: 'seg-actions' }, el('label', { class: 'approve' }, box, t('approve')), status),
  ].filter(Boolean));
  ta.lang = 'es';
  return li;
}

async function saveSegment(sid, patch, status) {
  try {
    state.project = { ...(await api(`/api/projects/${state.project.id}/segments/${sid}`, { method: 'PATCH', body: JSON.stringify(patch) })), estimate: state.project.estimate };
    const focusId = document.activeElement?.id;
    renderProject();
    if (focusId) document.getElementById(focusId)?.focus();
    const st = document.querySelector(`#seg-${sid} .saved`);
    if (st) st.textContent = t('saved');
  } catch (err) {
    if (status) status.textContent = '';
    say(err.message, true);
  }
}

$('#translateBtn').addEventListener('click', async () => {
  const p = state.project;
  if (p.estimate && !state.status.fake && !confirm(t('confirmTranslate', money(p.estimate)))) return;
  const btn = $('#translateBtn');
  btn.disabled = true;
  $('#progressWrap').hidden = false;
  try {
    const res = await fetch(`/api/projects/${p.id}/translate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
        const type = chunk.match(/^event: (.*)$/m)?.[1];
        const data = JSON.parse(chunk.match(/^data: (.*)$/m)?.[1] || '{}');
        if (type === 'progress') {
          $('#progress').value = data.total ? Math.round((data.done / data.total) * 100) : 0;
          $('#progressText').textContent = t('translating', data.batch, data.batches);
          say(t('translating', data.batch, data.batches));
        } else if (type === 'done') {
          say(data.problems.length ? `${t('translated', data.translated)} ${t('problems')} ${data.problems.join(' ')}` : t('translated', data.translated), data.problems.length > 0);
        } else if (type === 'failed') {
          say(data.message, true);
        }
      }
    }
  } catch (err) {
    say(err.message, true);
  } finally {
    $('#progressWrap').hidden = true;
    await openProject(p.id);
  }
});

$('#filter').addEventListener('change', (e) => { state.filter = e.target.value; renderProject(); });
$('#backBtn').addEventListener('click', () => { show('projects'); loadProjects(); });

// ---------- glossary

function glossaryRow(g = { source: '', target: '', note: '' }) {
  const field = (k, label) => { const i = el('input', { type: 'text', 'aria-label': label }); i.value = g[k] || ''; i.dataset.k = k; return el('td', {}, i); };
  const tr = el('tr', {}, field('source', t('gEnglish')), field('target', t('gSpanish')), field('note', t('gNote')));
  tr.append(el('td', {}, el('button', { type: 'button', class: 'ghost', text: t('gRemove'), onclick: () => tr.remove() })));
  return tr;
}

async function loadGlossary() {
  try {
    state.glossary = await api('/api/glossary');
    $('#gBody').replaceChildren(...(state.glossary.length ? state.glossary : [undefined]).map(glossaryRow));
  } catch (err) { say(err.message, true); }
}

$('#gAdd').addEventListener('click', () => { const r = glossaryRow(); $('#gBody').append(r); r.querySelector('input').focus(); });
$('#gSave').addEventListener('click', async () => {
  const rows = [...$('#gBody').querySelectorAll('tr')].map((tr) => Object.fromEntries([...tr.querySelectorAll('input')].map((i) => [i.dataset.k, i.value.trim()])));
  try {
    await api('/api/glossary', { method: 'PUT', body: JSON.stringify(rows.filter((r) => r.source && r.target)) });
    await loadGlossary();
    say(t('gSaved'));
  } catch (err) { say(err.message, true); }
});
$('#gImport').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const g = await api('/api/glossary/import', { method: 'POST', body: JSON.stringify({ csv: await file.text() }) });
    await loadGlossary();
    say(t('gImported', g.length));
  } catch (err) { say(err.message, true); }
  e.target.value = '';
});

// ---------- start

for (const b of document.querySelectorAll('.tab')) {
  b.addEventListener('click', () => {
    show(b.dataset.view);
    if (b.dataset.view === 'glossary') loadGlossary(); else loadProjects();
  });
}
$('#langBtn').addEventListener('click', () => {
  lang = lang === 'en' ? 'es' : 'en';
  try { localStorage.setItem('td_lang', lang); } catch { /* private mode */ }
  applyLang();
});

(async () => {
  try { state.status = await api('/api/status'); } catch (err) { say(err.message, true); }
  show('projects');
  applyLang();
  loadSettings();
})();
