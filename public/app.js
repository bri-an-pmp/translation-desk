// Translation Desk page. All text is built with textContent, never innerHTML.

const T = {
  en: {
    skip: 'Skip to content', tagline: 'English ⇄ Spanish translation. Claude drafts, you approve every word.',
    tabProjects: 'Projects', tabGlossary: 'Glossary', tabProfile: 'My details',
    newTitle: 'New project', name: 'Name', namePh: 'e.g. Birth certificate – J. Pérez', file: 'Document',
    domain: 'Type of text', dGeneral: 'General', dCertified: 'Certified translation (official documents)', dLegal: 'Legal documents and contracts', dArts: 'Museums, exhibitions and the arts', dBusiness: 'Business and marketing', dTechnical: 'Technical, software and UI text',
    direction: 'Direction', enes: 'English → Spanish', esen: 'Spanish → English',
    fileHint: 'Word (.docx), PDF, a photo of the document (JPEG, PNG, iPhone HEIC), text, or a spreadsheet saved as .csv (a “text” column, and optionally a “max” column with character limits). Claude reads PDFs and photos, including scans, for a few cents.',
    offline: "The app isn't responding. Double-click Translation Desk on your Desktop to start it again, then reload this page.",
    reading: 'Reading the file…', readingClaude: 'Claude is reading the document… (about 30 seconds)',
    orPaste: 'Or paste the text', pasteLabel: 'Text to translate', pastePh: 'Leave a blank line between paragraphs. Start a heading with #.',
    settings: 'Settings', variant: 'Spanish for', vUs: 'Readers in the U.S. (Mexican and Central American roots)', vNeutral: 'All of Latin America (neutral)', vMexican: 'Mexico', vCastilian: 'Spain',
    register: 'Speak to the reader as', rImpersonal: 'neither (impersonal)',
    titles: 'Titles of works (art, books, films)', tGloss: 'Keep original + [translation in brackets]', tEnglish: 'Translate source-language titles only', tKeep: 'Keep all titles as written', tAll: 'Translate all titles',
    notaryBlock: 'Add a notary block to the certificate', notaryHint: "For clients who need the certificate notarized. A notary can't notarize their own signature: if you are a notary, another notary must sign this block.",
    styleNotes: 'Style notes for this client (optional)', styleNotesPh: 'e.g. Use “Latine”. Write “exposición”, not “muestra”.',
    create: 'Create project', yourProjects: 'Your projects', noProjects: 'No projects yet. Create one on the left.',
    back: '← All projects', download: 'Download:', expBilingual: 'Review table (.docx)', expTranslation: (l) => `${l} (.docx)`, expCertified: (l) => `${l} + certificate (.docx)`,
    show: 'Show', fAll: 'All segments', fAttention: 'Needs attention', fUnapproved: 'Not approved yet',
    showOriginal: 'Show original', hideOriginal: 'Hide original', originalTitle: 'Original document',
    deleteProject: 'Delete project', deleteHint: 'Removes the project and its stored original from this Mac. Approved translations stay in your translation memory.',
    confirmDelete: (n) => `Delete “${n}” and its stored original from this Mac? This can't be undone.`, deleted: 'Project deleted.',
    glossaryTitle: 'Glossary', glossaryHint: "Terms Claude must always use, in both directions. The checker warns when a translation doesn't use them.",
    gEnglish: 'English', gSpanish: 'Spanish', gNote: 'Note', gActions: 'Actions', gAdd: '+ Add term', gSave: 'Save glossary', gImport: 'Import CSV', gRemove: 'Remove',
    gSaved: 'Glossary saved.', gImported: (n) => `Glossary imported: ${n} terms.`,
    profileTitle: 'My details', profileHint: 'Printed on the certificate of accuracy for certified translations. Saved only on this Mac.',
    prName: 'Full name', prAddress: 'Address (optional)', prContact: 'Phone or email (optional)', prCredentials: 'Qualifications line (optional)', prCredentialsPh: 'e.g. Professional translator, Spanish ⇄ English, since 2010', prSave: 'Save details', prSaved: 'Your details are saved.',
    keyOk: 'Claude API key found', keyMissing: 'No API key yet: see the README', fake: 'Sample mode (no Claude)',
    langName: { en: 'English', es: 'Spanish' }, approve: 'Approved', saved: 'Saved', claudeNote: 'Claude', check: { error: 'Fix', warning: 'Check', note: 'Note' },
    translate: (n, cost) => `Translate ${n} segment${n === 1 ? '' : 's'}${cost ? ` (about ${cost})` : ''}`,
    allDone: 'All segments translated', translating: (b, n) => `Translating part ${b} of ${n}…`, translated: (n) => `Translated ${n} segments. Review each one, edit if needed, and tick Approved.`,
    meta: (p, d) => `${d} · ${p.segments.length} segments · ${p.segments.filter((s) => s.target).length} translated · ${p.segments.filter((s) => s.approved).length} approved · Claude cost so far $${p.usage.costUsd.toFixed(2)}`,
    info: (p) => `${p.translated}/${p.total} translated · ${p.approved} approved`,
    counts: (n, all) => `${n} of ${all} shown`,
    created: 'Project created.', needFile: 'Choose a document or paste some text first.', confirmTranslate: (cost) => `This sends the text to Claude and costs about ${cost}. Continue?`,
    languageMismatch: 'Claude thinks this document is in the other language. Check the Direction setting: if it is wrong, delete this project and create it again.',
    chars: (n, max) => (max ? `${n}/${max} characters` : `${n} characters`), problems: 'Some segments need another try:',
    certNeedsName: 'Add your name under “My details” before downloading: it goes on the certificate of accuracy.',
    certReady: (name) => `The certificate of accuracy will be signed by ${name}. Check every name, number and date against the original before you sign.`,
    certNotary: "This project adds a notary block. You can't notarize your own signature: another notary must complete it.",
    kinds: { title: 'title', heading: 'heading', paragraph: 'text', label: 'label', caption: 'caption', list_item: 'list item', form_field: 'form field', table_row: 'table row', signature_block: 'signatures', footnote: 'footnote', credit: 'credit', body: 'text', other: 'other' },
  },
  es: {
    skip: 'Ir al contenido', tagline: 'Traducción inglés ⇄ español. Claude redacta y usted aprueba cada palabra.',
    tabProjects: 'Proyectos', tabGlossary: 'Glosario', tabProfile: 'Mis datos',
    newTitle: 'Proyecto nuevo', name: 'Nombre', namePh: 'p. ej., Acta de nacimiento – J. Pérez', file: 'Documento',
    domain: 'Tipo de texto', dGeneral: 'General', dCertified: 'Traducción certificada (documentos oficiales)', dLegal: 'Documentos legales y contratos', dArts: 'Museos, exposiciones y artes', dBusiness: 'Empresa y marketing', dTechnical: 'Textos técnicos, software e interfaces',
    direction: 'Dirección', enes: 'Inglés → español', esen: 'Español → inglés',
    fileHint: 'Word (.docx), PDF, una foto del documento (JPEG, PNG, HEIC de iPhone), texto o una hoja de cálculo guardada como .csv (una columna “text” y, si quiere, una columna “max” con el límite de caracteres). Claude lee los PDF y las fotos, incluso escaneados, por unos centavos.',
    offline: 'La aplicación no responde. Haga doble clic en Translation Desk en su escritorio para iniciarla de nuevo y vuelva a cargar esta página.',
    reading: 'Leyendo el archivo…', readingClaude: 'Claude está leyendo el documento… (unos 30 segundos)',
    orPaste: 'O pegue el texto', pasteLabel: 'Texto para traducir', pastePh: 'Deje una línea en blanco entre párrafos. Empiece un título con #.',
    settings: 'Configuración', variant: 'Español para', vUs: 'Lectores en EE. UU. (raíces mexicanas y centroamericanas)', vNeutral: 'Toda América Latina (neutro)', vMexican: 'México', vCastilian: 'España',
    register: 'Dirigirse al lector de', rImpersonal: 'ninguno (impersonal)',
    titles: 'Títulos de obras (arte, libros, películas)', tGloss: 'Conservar el original + [traducción entre corchetes]', tEnglish: 'Traducir solo los títulos en el idioma de origen', tKeep: 'Conservar todos los títulos', tAll: 'Traducir todos los títulos',
    notaryBlock: 'Agregar un bloque notarial al certificado', notaryHint: 'Para clientes que necesitan el certificado notarizado. Un notario no puede notarizar su propia firma: si usted es notario, otro notario debe firmar este bloque.',
    styleNotes: 'Notas de estilo para este cliente (opcional)', styleNotesPh: 'p. ej., Usar “latine”. Escribir “exposición”, no “muestra”.',
    create: 'Crear proyecto', yourProjects: 'Sus proyectos', noProjects: 'Todavía no hay proyectos. Cree uno a la izquierda.',
    back: '← Todos los proyectos', download: 'Descargar:', expBilingual: 'Tabla de revisión (.docx)', expTranslation: (l) => `${l} (.docx)`, expCertified: (l) => `${l} + certificado (.docx)`,
    show: 'Mostrar', fAll: 'Todos los segmentos', fAttention: 'Requieren atención', fUnapproved: 'Sin aprobar',
    showOriginal: 'Ver el original', hideOriginal: 'Ocultar el original', originalTitle: 'Documento original',
    deleteProject: 'Eliminar proyecto', deleteHint: 'Elimina el proyecto y el original guardado de esta Mac. Las traducciones aprobadas se quedan en su memoria de traducción.',
    confirmDelete: (n) => `¿Eliminar “${n}” y el original guardado de esta Mac? No se puede deshacer.`, deleted: 'Proyecto eliminado.',
    glossaryTitle: 'Glosario', glossaryHint: 'Términos que Claude siempre debe usar, en ambas direcciones. El verificador avisa cuando una traducción no los usa.',
    gEnglish: 'Inglés', gSpanish: 'Español', gNote: 'Nota', gActions: 'Acciones', gAdd: '+ Agregar término', gSave: 'Guardar glosario', gImport: 'Importar CSV', gRemove: 'Quitar',
    gSaved: 'Glosario guardado.', gImported: (n) => `Glosario importado: ${n} términos.`,
    profileTitle: 'Mis datos', profileHint: 'Aparecen en el certificado de exactitud de las traducciones certificadas. Se guardan solo en esta Mac.',
    prName: 'Nombre completo', prAddress: 'Dirección (opcional)', prContact: 'Teléfono o correo (opcional)', prCredentials: 'Línea de credenciales (opcional)', prCredentialsPh: 'p. ej., Traductor profesional, español ⇄ inglés, desde 2010', prSave: 'Guardar datos', prSaved: 'Sus datos están guardados.',
    keyOk: 'Clave de API de Claude encontrada', keyMissing: 'Falta la clave de API: vea el README', fake: 'Modo de prueba (sin Claude)',
    langName: { en: 'Inglés', es: 'Español' }, approve: 'Aprobado', saved: 'Guardado', claudeNote: 'Claude', check: { error: 'Corregir', warning: 'Revisar', note: 'Nota' },
    translate: (n, cost) => `Traducir ${n} segmento${n === 1 ? '' : 's'}${cost ? ` (aprox. ${cost})` : ''}`,
    allDone: 'Todos los segmentos están traducidos', translating: (b, n) => `Traduciendo la parte ${b} de ${n}…`, translated: (n) => `Se tradujeron ${n} segmentos. Revise cada uno, corríjalo si hace falta y marque Aprobado.`,
    meta: (p, d) => `${d} · ${p.segments.length} segmentos · ${p.segments.filter((s) => s.target).length} traducidos · ${p.segments.filter((s) => s.approved).length} aprobados · Costo de Claude hasta ahora: USD ${p.usage.costUsd.toFixed(2)}`,
    info: (p) => `${p.translated}/${p.total} traducidos · ${p.approved} aprobados`,
    counts: (n, all) => `Se muestran ${n} de ${all}`,
    created: 'Proyecto creado.', needFile: 'Primero elija un documento o pegue el texto.', confirmTranslate: (cost) => `Esto envía el texto a Claude y cuesta aproximadamente ${cost}. ¿Desea continuar?`,
    languageMismatch: 'Claude cree que este documento está en el otro idioma. Revise la Dirección: si está mal, elimine este proyecto y créelo de nuevo.',
    chars: (n, max) => (max ? `${n}/${max} caracteres` : `${n} caracteres`), problems: 'Algunos segmentos necesitan otro intento:',
    certNeedsName: 'Agregue su nombre en “Mis datos” antes de descargar: aparece en el certificado de exactitud.',
    certReady: (name) => `El certificado de exactitud lo firmará ${name}. Compare cada nombre, número y fecha con el original antes de firmar.`,
    certNotary: 'Este proyecto agrega un bloque notarial. Usted no puede notarizar su propia firma: otro notario debe completarlo.',
    kinds: { title: 'título', heading: 'encabezado', paragraph: 'texto', label: 'cédula', caption: 'pie', list_item: 'elemento de lista', form_field: 'campo', table_row: 'fila de tabla', signature_block: 'firmas', footnote: 'nota al pie', credit: 'créditos', body: 'texto', other: 'otro' },
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
const langsOf = (settings) => (settings?.direction === 'es-en' ? ['es', 'en'] : ['en', 'es']);
const DOMAIN_KEYS = { general: 'dGeneral', certified: 'dCertified', legal: 'dLegal', arts: 'dArts', business: 'dBusiness', technical: 'dTechnical' };

let state = { status: null, project: null, profile: {}, glossary: [], filter: 'all', notice: '' };

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
  for (const v of ['projects', 'project', 'glossary', 'profile']) $(`#view-${v}`).hidden = v !== view;
  for (const b of document.querySelectorAll('.tab')) {
    const on = b.dataset.view === view || (view === 'project' && b.dataset.view === 'projects');
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }
}

// ---------- new project form

// Show only the settings that apply to the chosen type of text and direction
function updateFormFields() {
  const domain = $('#sDomain').value;
  const toSpanish = $('#sDirection').value === 'en-es';
  const when = {
    'to-spanish': toSpanish,
    register: toSpanish && domain !== 'certified',
    titles: !['certified', 'technical'].includes(domain),
    certified: domain === 'certified',
  };
  for (const n of document.querySelectorAll('[data-when]')) n.hidden = !when[n.dataset.when];
}
$('#sDomain').addEventListener('change', updateFormFields);
$('#sDirection').addEventListener('change', updateFormFields);

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
    $('#sDomain').value = s.domain; $('#sDirection').value = s.direction;
    $('#sVariant').value = s.variant; $('#sRegister').value = s.register; $('#sTitles').value = s.titles;
    $('#sNotary').checked = s.notaryBlock; $('#sNotes').value = '';
  } catch { /* defaults in the form are fine */ }
  updateFormFields();
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
  const settings = {
    domain: $('#sDomain').value, direction: $('#sDirection').value, variant: $('#sVariant').value, register: $('#sRegister').value,
    titles: $('#sTitles').value, notaryBlock: $('#sNotary').checked, styleNotes: $('#sNotes').value,
  };
  const btn = e.submitter || $('#newForm button[type=submit]');
  btn.disabled = true;
  try {
    api('/api/settings', { method: 'PUT', body: JSON.stringify({ ...settings, styleNotes: '' }) }).catch(() => {});
    const body = { name: $('#pName').value.trim() || file?.name?.replace(/\.[^.]+$/, ''), settings };
    say(file && /\.(pdf|jpe?g|png|heic|webp|gif)$/i.test(file.name) ? t('readingClaude') : t('reading'));
    if (file) Object.assign(body, { fileName: file.name, fileBase64: await readAsBase64(file) });
    else body.text = text;
    const p = await api('/api/projects', { method: 'POST', body: JSON.stringify(body) });
    $('#newForm').reset(); loadSettings();
    state.notice = p.notice || '';
    await openProject(p.id);
    say(state.notice ? t(state.notice) : t('created'), Boolean(state.notice));
  } catch (err) { say(err.message, true); }
  finally { btn.disabled = false; }
});

// ---------- one project

async function openProject(id) {
  try {
    [state.project, state.profile] = await Promise.all([api(`/api/projects/${id}`), api('/api/profile').catch(() => ({}))]);
    show('project');
    closeOriginal();
    renderProject();
    $('#pTitle').focus?.();
  } catch (err) { say(err.message, true); }
}

function needsAttention(s) {
  return !s.target || s.flags.length || s.checks.some((c) => c.level !== 'note');
}

function renderProject() {
  const p = state.project;
  const [src, tgt] = langsOf(p.settings);
  $('#pTitle').textContent = p.name;
  $('#pMeta').textContent = t('meta', p, `${t(DOMAIN_KEYS[p.settings.domain] || 'dGeneral')} · ${t(p.settings.direction === 'es-en' ? 'esen' : 'enes')}`);
  const todo = p.segments.filter((s) => !s.target && !s.approved && !s.flags.some((f) => f.type === 'duplicate')).length;
  const btn = $('#translateBtn');
  btn.textContent = todo ? t('translate', todo, p.estimate ? money(p.estimate) : '') : t('allDone');
  btn.disabled = !todo || p.translating;

  const certified = p.settings.domain === 'certified';
  $('#expTranslation').textContent = certified ? t('expCertified', t('langName')[tgt]) : t('expTranslation', t('langName')[tgt]);
  for (const [id, kind] of [['#expBilingual', 'bilingual'], ['#expTranslation', 'translation'], ['#expCsv', 'csv']]) $(id).href = `/api/projects/${p.id}/export/${kind}`;

  const notice = $('#certNotice');
  notice.hidden = !certified;
  if (certified) {
    notice.replaceChildren(
      el('p', { class: state.profile.name ? '' : 'warn', text: state.profile.name ? t('certReady', state.profile.name) : t('certNeedsName') }),
      p.settings.notaryBlock ? el('p', { text: t('certNotary') }) : null,
    );
  }
  $('#originalBtn').hidden = !/\.(pdf|jpe?g|png|webp|gif)$/i.test(p.original || '');

  const shown = p.segments.filter((s) => state.filter === 'all' || (state.filter === 'attention' ? needsAttention(s) : !s.approved));
  $('#counts').textContent = t('counts', shown.length, p.segments.length);
  $('#segments').replaceChildren(...shown.map((s) => segmentView(s, src, tgt)));
}

function segmentView(s, src, tgt) {
  const levels = s.checks.map((c) => c.level);
  const li = el('li', { class: `seg${s.approved ? ' approved' : levels.includes('error') ? ' has-error' : levels.includes('warning') || s.flags.length ? ' has-warning' : ''}`, id: `seg-${s.id}` });
  const count = el('span', { class: `count${s.maxChars && visible(s.target) > s.maxChars ? ' over' : ''}`, text: t('chars', visible(s.target), s.maxChars) });
  const taId = `ta-${s.id}`;
  const ta = el('textarea', { id: taId, lang: tgt, rows: Math.min(14, Math.max(3, Math.ceil(s.source.length / 70) + 1)) });
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
      el('div', {}, el('p', { class: 'src-label', text: t('langName')[src] }), el('p', { class: 'src', lang: src }, marked(s.source))),
      el('div', { class: 'tgt' }, el('label', { class: 'src-label', for: taId, text: `${t('langName')[tgt]} (${s.id})` }), ta)),
    issues.childElementCount ? issues : null,
    el('div', { class: 'seg-actions' }, el('label', { class: 'approve' }, box, t('approve')), status),
  ].filter(Boolean));
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

function closeOriginal() {
  $('#originalPanel').hidden = true;
  $('#originalPanel').replaceChildren();
  $('#originalBtn').setAttribute('aria-expanded', 'false');
  $('#originalBtn').textContent = t('showOriginal');
}

$('#originalBtn').addEventListener('click', () => {
  const panel = $('#originalPanel');
  if (!panel.hidden) return closeOriginal();
  const p = state.project;
  const url = `/api/projects/${p.id}/original`;
  const view = /\.pdf$/i.test(p.original)
    ? el('iframe', { src: url, title: t('originalTitle') })
    : el('img', { src: url, alt: t('originalTitle') });
  panel.replaceChildren(view);
  panel.hidden = false;
  $('#originalBtn').setAttribute('aria-expanded', 'true');
  $('#originalBtn').textContent = t('hideOriginal');
});

$('#deleteBtn').addEventListener('click', async () => {
  const p = state.project;
  if (!confirm(t('confirmDelete', p.name))) return;
  try {
    await api(`/api/projects/${p.id}`, { method: 'DELETE' });
    state.project = null;
    show('projects');
    await loadProjects();
    say(t('deleted'));
  } catch (err) { say(err.message, true); }
});

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
    say(err instanceof TypeError ? t('offline') : err.message, true);
  } finally {
    $('#progressWrap').hidden = true;
    const msg = $('#live').textContent, isErr = $('#live').classList.contains('error');
    await openProject(p.id);
    say(msg, isErr);
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

// ---------- my details

async function loadProfile() {
  try {
    state.profile = await api('/api/profile');
    $('#prName').value = state.profile.name; $('#prAddress').value = state.profile.address;
    $('#prContact').value = state.profile.contact; $('#prCredentials').value = state.profile.credentials;
  } catch (err) { say(err.message, true); }
}

$('#profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    state.profile = await api('/api/profile', { method: 'PUT', body: JSON.stringify({ name: $('#prName').value, address: $('#prAddress').value, contact: $('#prContact').value, credentials: $('#prCredentials').value }) });
    say(t('prSaved'));
  } catch (err) { say(err.message, true); }
});

// ---------- start

for (const b of document.querySelectorAll('.tab')) {
  b.addEventListener('click', () => {
    show(b.dataset.view);
    if (b.dataset.view === 'glossary') loadGlossary();
    else if (b.dataset.view === 'profile') loadProfile();
    else loadProjects();
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
