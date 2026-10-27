// Translation Desk page. All text is built with textContent, never innerHTML.

const T = {
  en: {
    skip: 'Skip to content', tagline: 'English ⇄ Spanish translation. Claude drafts, you approve every word.',
    tabProjects: 'Projects', tabGlossary: 'Glossary', tabClients: 'Clients', tabProfile: 'My details',
    client: 'Client (optional)', clientShort: 'Client',
    newTitle: 'New project', name: 'Name', namePh: 'e.g. Birth certificate – J. Pérez', file: 'Document',
    domain: 'Type of text', dGeneral: 'General', dCertified: 'Certified translation (official documents)', dLegal: 'Legal documents and contracts', dArts: 'Museums, exhibitions and the arts', dBusiness: 'Business and marketing', dTechnical: 'Technical, software and UI text',
    direction: 'Direction', enes: 'English → Spanish', esen: 'Spanish → English',
    fileHint: 'Word (.docx or .doc), RTF, PDF, a photo of the document (JPEG, PNG, iPhone HEIC), text, a spreadsheet saved as .csv (a “text” column, and optionally a “max” column with character limits), or an XLIFF file from Trados, memoQ or Phrase. For a document photographed page by page, choose all the photos at once (up to 20). Claude reads PDFs and photos, including scans, for a few cents. You can also drag files onto this window.',
    filesChosen: (names) => `${names.length} files: they will be read as the pages of one document, in this order: ${names.join(', ')}.`,
    dropHint: 'Drop the document to start a new project', dropped: (n) => (n > 1 ? `${n} files ready. Choose the settings, then press Create project.` : 'File ready. Choose the settings, then press Create project.'),
    offline: "The app isn't responding. Quit Translation Desk and open it again, then reload this page.",
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
    keyOk: 'Claude API key found', keyMissing: 'No API key yet: add it under My details', fake: 'Sample mode (no Claude)',
    langName: { en: 'English', es: 'Spanish' }, approve: 'Approved', saved: 'Saved', claudeNote: 'Claude', check: { error: 'Fix', warning: 'Check', note: 'Note' },
    translate: (n, cost) => `Translate ${n} segment${n === 1 ? '' : 's'}${cost ? ` (about ${cost})` : ''}`,
    allDone: 'All segments translated', translating: (b, n) => `Translating part ${b} of ${n}…`, translated: (n) => `Translated ${n} segments. Review each one, edit if needed, and tick Approved.`,
    meta: (p, d) => `${d} · ${words(p).toLocaleString('en-US')} words · ${p.segments.length} segments · ${p.segments.filter((s) => s.target).length} translated · ${p.segments.filter((s) => s.approved).length} approved · Claude cost so far $${p.usage.costUsd.toFixed(2)}`,
    info: (p) => `${p.translated}/${p.total} translated · ${p.approved} approved`,
    counts: (n, all) => `${n} of ${all} shown`,
    created: 'Project created.', needFile: 'Choose a document or paste some text first.', confirmTranslate: (cost) => `This sends the text to Claude and costs about ${cost}. Continue?`,
    languageMismatch: 'Claude thinks this document is in the other language. Check the Direction setting: if it is wrong, delete this project and create it again.',
    chars: (n, max) => (max ? `${n}/${max} characters` : `${n} characters`), problems: 'Some segments need another try:',
    certNeedsName: 'Add your name under “My details” before downloading: it goes on the certificate of accuracy.',
    certReady: (name) => `The certificate of accuracy will be signed by ${name}. Check every name, number and date against the original before you sign.`,
    certNotary: "This project adds a notary block. You can't notarize your own signature: another notary must complete it.",
    later: (cost) => `Translate later at half price${cost ? ` (about ${cost})` : ''}`,
    laterConfirm: (cost) => `Claude will translate this within 24 hours (usually under an hour) for about ${cost}. You can close the app meanwhile; the translations appear when you open the project. Continue?`,
    laterWaiting: (when) => `Waiting for Claude's half-price translation (sent ${when}). It usually takes under an hour, and this page checks every minute. You can close the app meanwhile.`,
    laterSent: 'Sent to Claude at half price. The translations will appear here when they are ready.',
    laterDone: (n) => `Claude's half-price translation arrived: ${n} segments. Review each one and tick Approved.`,
    laterCancel: 'Cancel and translate now instead', laterCanceled: 'Half-price translation canceled.',
    expXliff: 'Translated XLIFF',
    memTitle: 'Translation memory', memHint: 'Every segment you approve is saved here and offered to Claude when a similar sentence comes up. You can add memories from other tools (Trados, memoQ, Phrase) as TMX files.',
    memImport: 'Import TMX', memExport: 'Download as TMX', memReading: 'Reading the translation memory…',
    memCount: (m) => `${m.total.toLocaleString('en-US')} saved translations (${m.enEs.toLocaleString('en-US')} English → Spanish, ${m.esEn.toLocaleString('en-US')} Spanish → English).`,
    memImported: (r) => `Imported ${r.added} new and updated ${r.updated} existing translations.${r.skipped ? ` ${r.skipped} entries had no English–Spanish pair and were skipped.` : ''}${r.full ? ' The memory is full (50,000 entries), so the rest were not imported.' : ''}`,
    clientsTitle: 'Clients', clientsHint: 'Words, Claude cost and your time for each client, to help with quotes and invoices. Time counts the minutes you are actively working in a project.',
    cClient: 'Client', cProjects: 'Projects', cWords: 'Words', cCost: 'Claude cost', cTime: 'Time', cReport: 'Download report (.csv)', noClient: '(no client)', noClientsYet: 'No projects yet.',
    keyTitle: 'Claude API key', keyHint: 'Create a key at', keyHint2: "It is checked with Claude, then saved in your Mac's Keychain, never in a file.",
    keyLabel: 'Paste your key', keySave: 'Check and save key', keyChecking: 'Checking the key with Claude…', keySaved: 'Key saved in your Keychain. You are ready to translate.',
    keyStateOk: 'A key is saved. Paste a new one here only to replace it.', keyStateMissing: 'No key yet. Translation needs one.', keyEmpty: 'Paste your key first.',
    kinds: { title: 'title', heading: 'heading', paragraph: 'text', label: 'label', caption: 'caption', list_item: 'list item', form_field: 'form field', table_row: 'table row', signature_block: 'signatures', footnote: 'footnote', credit: 'credit', body: 'text', other: 'other' },
  },
  es: {
    skip: 'Ir al contenido', tagline: 'Traducción inglés ⇄ español. Claude redacta y usted aprueba cada palabra.',
    tabProjects: 'Proyectos', tabGlossary: 'Glosario', tabClients: 'Clientes', tabProfile: 'Mis datos',
    client: 'Cliente (opcional)', clientShort: 'Cliente',
    newTitle: 'Proyecto nuevo', name: 'Nombre', namePh: 'p. ej., Acta de nacimiento – J. Pérez', file: 'Documento',
    domain: 'Tipo de texto', dGeneral: 'General', dCertified: 'Traducción certificada (documentos oficiales)', dLegal: 'Documentos legales y contratos', dArts: 'Museos, exposiciones y artes', dBusiness: 'Empresa y marketing', dTechnical: 'Textos técnicos, software e interfaces',
    direction: 'Dirección', enes: 'Inglés → español', esen: 'Español → inglés',
    fileHint: 'Word (.docx o .doc), RTF, PDF, una foto del documento (JPEG, PNG, HEIC de iPhone), texto, una hoja de cálculo guardada como .csv (una columna “text” y, si quiere, una columna “max” con el límite de caracteres) o un archivo XLIFF de Trados, memoQ o Phrase. Si fotografió un documento página por página, elija todas las fotos a la vez (hasta 20). Claude lee los PDF y las fotos, incluso escaneados, por unos centavos. También puede arrastrar archivos a esta ventana.',
    filesChosen: (names) => `${names.length} archivos: se leerán como las páginas de un solo documento, en este orden: ${names.join(', ')}.`,
    dropHint: 'Suelte el documento para empezar un proyecto nuevo', dropped: (n) => (n > 1 ? `${n} archivos listos. Elija la configuración y presione Crear proyecto.` : 'Archivo listo. Elija la configuración y presione Crear proyecto.'),
    offline: 'La aplicación no responde. Cierre Translation Desk, ábrala de nuevo y vuelva a cargar esta página.',
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
    keyOk: 'Clave de API de Claude encontrada', keyMissing: 'Falta la clave de API: agréguela en Mis datos', fake: 'Modo de prueba (sin Claude)',
    langName: { en: 'Inglés', es: 'Español' }, approve: 'Aprobado', saved: 'Guardado', claudeNote: 'Claude', check: { error: 'Corregir', warning: 'Revisar', note: 'Nota' },
    translate: (n, cost) => `Traducir ${n} segmento${n === 1 ? '' : 's'}${cost ? ` (aprox. ${cost})` : ''}`,
    allDone: 'Todos los segmentos están traducidos', translating: (b, n) => `Traduciendo la parte ${b} de ${n}…`, translated: (n) => `Se tradujeron ${n} segmentos. Revise cada uno, corríjalo si hace falta y marque Aprobado.`,
    meta: (p, d) => `${d} · ${words(p).toLocaleString('es-MX')} palabras · ${p.segments.length} segmentos · ${p.segments.filter((s) => s.target).length} traducidos · ${p.segments.filter((s) => s.approved).length} aprobados · Costo de Claude hasta ahora: USD ${p.usage.costUsd.toFixed(2)}`,
    info: (p) => `${p.translated}/${p.total} traducidos · ${p.approved} aprobados`,
    counts: (n, all) => `Se muestran ${n} de ${all}`,
    created: 'Proyecto creado.', needFile: 'Primero elija un documento o pegue el texto.', confirmTranslate: (cost) => `Esto envía el texto a Claude y cuesta aproximadamente ${cost}. ¿Desea continuar?`,
    languageMismatch: 'Claude cree que este documento está en el otro idioma. Revise la Dirección: si está mal, elimine este proyecto y créelo de nuevo.',
    chars: (n, max) => (max ? `${n}/${max} caracteres` : `${n} caracteres`), problems: 'Algunos segmentos necesitan otro intento:',
    certNeedsName: 'Agregue su nombre en “Mis datos” antes de descargar: aparece en el certificado de exactitud.',
    certReady: (name) => `El certificado de exactitud lo firmará ${name}. Compare cada nombre, número y fecha con el original antes de firmar.`,
    certNotary: 'Este proyecto agrega un bloque notarial. Usted no puede notarizar su propia firma: otro notario debe completarlo.',
    later: (cost) => `Traducir más tarde a mitad de precio${cost ? ` (aprox. ${cost})` : ''}`,
    laterConfirm: (cost) => `Claude lo traducirá en menos de 24 horas (normalmente en menos de una hora) por aproximadamente ${cost}. Mientras tanto puede cerrar la aplicación; las traducciones aparecerán cuando abra el proyecto. ¿Desea continuar?`,
    laterWaiting: (when) => `Esperando la traducción a mitad de precio de Claude (enviada ${when}). Normalmente tarda menos de una hora y esta página revisa cada minuto. Mientras tanto puede cerrar la aplicación.`,
    laterSent: 'Se envió a Claude a mitad de precio. Las traducciones aparecerán aquí cuando estén listas.',
    laterDone: (n) => `Llegó la traducción a mitad de precio de Claude: ${n} segmentos. Revise cada uno y marque Aprobado.`,
    laterCancel: 'Cancelar y traducir ahora', laterCanceled: 'Se canceló la traducción a mitad de precio.',
    expXliff: 'XLIFF traducido',
    memTitle: 'Memoria de traducción', memHint: 'Cada segmento que usted aprueba se guarda aquí y se le ofrece a Claude cuando aparece una oración parecida. Puede agregar memorias de otras herramientas (Trados, memoQ, Phrase) como archivos TMX.',
    memImport: 'Importar TMX', memExport: 'Descargar como TMX', memReading: 'Leyendo la memoria de traducción…',
    memCount: (m) => `${m.total.toLocaleString('es-MX')} traducciones guardadas (${m.enEs.toLocaleString('es-MX')} de inglés a español, ${m.esEn.toLocaleString('es-MX')} de español a inglés).`,
    memImported: (r) => `Se importaron ${r.added} traducciones nuevas y se actualizaron ${r.updated}.${r.skipped ? ` ${r.skipped} entradas no tenían un par inglés–español y se omitieron.` : ''}${r.full ? ' La memoria está llena (50 000 entradas), así que el resto no se importó.' : ''}`,
    clientsTitle: 'Clientes', clientsHint: 'Palabras, costo de Claude y su tiempo por cliente, para ayudarle con cotizaciones y facturas. El tiempo cuenta los minutos en que usted trabaja activamente en un proyecto.',
    cClient: 'Cliente', cProjects: 'Proyectos', cWords: 'Palabras', cCost: 'Costo de Claude', cTime: 'Tiempo', cReport: 'Descargar informe (.csv)', noClient: '(sin cliente)', noClientsYet: 'Todavía no hay proyectos.',
    keyTitle: 'Clave de API de Claude', keyHint: 'Cree una clave en', keyHint2: 'Se verifica con Claude y luego se guarda en el Llavero de su Mac, nunca en un archivo.',
    keyLabel: 'Pegue su clave', keySave: 'Verificar y guardar la clave', keyChecking: 'Verificando la clave con Claude…', keySaved: 'La clave se guardó en su Llavero. Ya puede traducir.',
    keyStateOk: 'Ya hay una clave guardada. Pegue una nueva solo si quiere reemplazarla.', keyStateMissing: 'Todavía no hay clave. La necesita para traducir.', keyEmpty: 'Primero pegue su clave.',
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
const money = (n) => (n > 0 && n < 0.01 ? '<$0.01' : `$${n.toFixed(2)}`);
const visible = (s) => s.replace(/\*\*|\*/g, '').length;
const countWords = (s) => (s.replace(/⟨\/?\d+\/?⟩|\*+/g, ' ').match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
const words = (p) => p.segments.reduce((n, s) => n + countWords(s.source), 0);
const duration = (sec) => { const m = Math.round(sec / 60); return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`; };
const PAGE_FILE = /\.(pdf|jpe?g|png|heic|webp|gif)$/i;
const VIEWABLE = /\.(pdf|jpe?g|png|webp|gif)$/i;
const langsOf = (settings) => (settings?.direction === 'es-en' ? ['es', 'en'] : ['en', 'es']);
const DOMAIN_KEYS = { general: 'dGeneral', certified: 'dCertified', legal: 'dLegal', arts: 'dArts', business: 'dBusiness', technical: 'dTechnical' };

let state = { status: null, project: null, profile: {}, glossary: [], filter: 'all', notice: '', poll: null };

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
  for (const v of ['projects', 'project', 'glossary', 'clients', 'profile']) $(`#view-${v}`).hidden = v !== view;
  if (view !== 'project') clearTimeout(state.poll);
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

// Several files are read as the pages of one document: say so, in the order they'll be read
function describeFiles() {
  const files = [...$('#pFile').files];
  $('#fileChosen').textContent = files.length > 1 ? t('filesChosen', files.map((f) => f.name)) : '';
}
$('#pFile').addEventListener('change', describeFiles);

async function loadProjects() {
  const list = $('#projectList');
  try {
    const items = await api('/api/projects');
    state.projects = items;
    $('#clientList').replaceChildren(...[...new Set(items.map((p) => p.client).filter(Boolean))].sort().map((c) => el('option', { value: c })));
    list.replaceChildren(
      ...(items.length
        ? items.map((p) => el('li', {}, el('button', { type: 'button', onclick: () => openProject(p.id) },
            el('span', { class: 'pname', text: p.name }),
            el('span', { class: 'pinfo', text: p.broken ? '⚠' : [p.client, t('info', p), p.waiting ? '⏳' : ''].filter(Boolean).join(' · ') }))))
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
  const files = [...$('#pFile').files];
  const file = files[0];
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
    const body = { name: $('#pName').value.trim() || file?.name?.replace(/\.[^.]+$/, ''), client: $('#pClient').value.trim(), settings };
    say(files.some((f) => PAGE_FILE.test(f.name)) ? t('readingClaude') : t('reading'));
    if (files.length > 1) body.files = await Promise.all(files.map(async (f) => ({ name: f.name, base64: await readAsBase64(f) })));
    else if (file) Object.assign(body, { fileName: file.name, fileBase64: await readAsBase64(file) });
    else body.text = text;
    const p = await api('/api/projects', { method: 'POST', body: JSON.stringify(body) });
    $('#newForm').reset(); describeFiles(); loadSettings();
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
    afterLoad();
  } catch (err) { say(err.message, true); }
}

// A half-price translation that arrived, or is still on its way (checked every minute)
function afterLoad() {
  const p = state.project;
  const c = p.collected;
  if (c?.ended) say(c.problems.length ? `${t('laterDone', c.translated)} ${t('problems')} ${c.problems.join(' ')}` : t('laterDone', c.translated), c.problems.length > 0);
  else if (c?.problems?.length) say(c.problems.join(' '), true);
  clearTimeout(state.poll);
  if (p.pending) state.poll = setTimeout(refreshProject, 60000);
}

async function refreshProject() {
  if ($('#view-project').hidden || !state.project) return;
  try {
    state.project = await api(`/api/projects/${state.project.id}`);
    const focusId = document.activeElement?.id;
    renderProject();
    if (focusId) document.getElementById(focusId)?.focus();
    afterLoad();
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
  btn.disabled = !todo || p.translating || Boolean(p.pending);
  const later = $('#laterBtn');
  later.textContent = t('later', p.estimate ? money(p.estimate / 2) : '');
  later.hidden = !todo || Boolean(p.pending);
  later.disabled = p.translating;
  $('#laterNotice').hidden = !p.pending;
  if (p.pending) $('#laterText').textContent = t('laterWaiting', new Date(p.pending.submitted).toLocaleString(lang === 'es' ? 'es-MX' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }));
  if (document.activeElement !== $('#pClientEdit')) $('#pClientEdit').value = p.client || '';

  const certified = p.settings.domain === 'certified';
  $('#expTranslation').textContent = certified ? t('expCertified', t('langName')[tgt]) : t('expTranslation', t('langName')[tgt]);
  for (const [id, kind] of [['#expBilingual', 'bilingual'], ['#expTranslation', 'translation'], ['#expCsv', 'csv'], ['#expXliff', 'xliff']]) $(id).href = `/api/projects/${p.id}/export/${kind}`;
  $('#expXliff').hidden = !/\.(xlf|xliff|sdlxliff|mqxliff)$/i.test(p.fileName);
  $('#expXliff').textContent = t('expXliff');

  const notice = $('#certNotice');
  notice.hidden = !certified;
  if (certified) {
    notice.replaceChildren(
      el('p', { class: state.profile.name ? '' : 'warn', text: state.profile.name ? t('certReady', state.profile.name) : t('certNeedsName') }),
      p.settings.notaryBlock ? el('p', { text: t('certNotary') }) : null,
    );
  }
  $('#originalBtn').hidden = !p.originals.some((n) => VIEWABLE.test(n));

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
  const pages = p.originals.map((name, i) => [name, `/api/projects/${p.id}/original/${i}`, p.originals.length > 1 ? ` (${i + 1}/${p.originals.length})` : '']).filter(([name]) => VIEWABLE.test(name));
  panel.replaceChildren(...pages.map(([name, url, n]) => (/\.pdf$/i.test(name)
    ? el('iframe', { src: url, title: t('originalTitle') + n })
    : el('img', { src: url, alt: t('originalTitle') + n }))));
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

$('#laterBtn').addEventListener('click', async () => {
  const p = state.project;
  if (p.estimate && !state.status.fake && !confirm(t('laterConfirm', money(p.estimate / 2)))) return;
  $('#laterBtn').disabled = true;
  try {
    state.project = { ...(await api(`/api/projects/${p.id}/later`, { method: 'POST', body: '{}' })), estimate: p.estimate };
    renderProject();
    afterLoad();
    $('#laterCancel').focus();
    say(t('laterSent'));
  } catch (err) { say(err.message, true); renderProject(); }
});

$('#laterCancel').addEventListener('click', async () => {
  try {
    await api(`/api/projects/${state.project.id}/later`, { method: 'DELETE' });
    await openProject(state.project.id);
    $('#translateBtn').focus();
    say(t('laterCanceled'));
  } catch (err) { say(err.message, true); }
});

$('#pClientEdit').addEventListener('change', async (e) => {
  try {
    const p = await api(`/api/projects/${state.project.id}`, { method: 'PATCH', body: JSON.stringify({ client: e.target.value.trim() }) });
    state.project.client = p.client;
    say(t('saved'));
  } catch (err) { say(err.message, true); }
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

// ---------- translation memory

async function loadMemory() {
  try { $('#memCount').textContent = t('memCount', await api('/api/memory')); } catch (err) { say(err.message, true); }
}

$('#mImport').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  say(t('memReading'));
  try {
    const r = await api('/api/memory/import', { method: 'POST', body: JSON.stringify({ tmx: await file.text(), fileName: file.name }) });
    await loadMemory();
    say(t('memImported', r), r.full);
  } catch (err) { say(err.message, true); }
  e.target.value = '';
});

// ---------- clients

async function loadClients() {
  try {
    const items = (await api('/api/projects')).filter((p) => !p.broken);
    const by = new Map();
    for (const p of items) {
      const k = p.client || '';
      const c = by.get(k) || { projects: 0, words: 0, cost: 0, seconds: 0 };
      c.projects++; c.words += p.words; c.cost += p.costUsd; c.seconds += p.seconds;
      by.set(k, c);
    }
    const nf = lang === 'es' ? 'es-MX' : 'en-US';
    $('#cBody').replaceChildren(...(by.size
      ? [...by].sort(([a], [b]) => (!a) - (!b) || a.localeCompare(b)).map(([name, c]) => el('tr', {},
          el('th', { scope: 'row', text: name || t('noClient') }), el('td', { text: c.projects }), el('td', { text: c.words.toLocaleString(nf) }),
          el('td', { text: money(c.cost) }), el('td', { text: duration(c.seconds) })))
      : [el('tr', {}, el('td', { colspan: 5, class: 'empty', text: t('noClientsYet') }))]));
  } catch (err) { say(err.message, true); }
}

// ---------- my details

async function loadProfile() {
  try {
    state.profile = await api('/api/profile');
    $('#prName').value = state.profile.name; $('#prAddress').value = state.profile.address;
    $('#prContact').value = state.profile.contact; $('#prCredentials').value = state.profile.credentials;
  } catch (err) { say(err.message, true); }
}

function renderKeyState() {
  const s = state.status;
  if (s) $('#keyState').textContent = s.fake ? t('fake') : s.keyFound ? t('keyStateOk') : t('keyStateMissing');
}

$('#keyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = $('#keyInput');
  if (!input.value.trim()) { input.focus(); return say(t('keyEmpty'), true); }
  const btn = e.submitter || $('#keyForm button[type=submit]');
  btn.disabled = true;
  say(t('keyChecking'));
  try {
    await api('/api/key', { method: 'PUT', body: JSON.stringify({ key: input.value.trim() }) });
    input.value = '';
    state.status = { ...state.status, keyFound: true };
    renderStatus(); renderKeyState();
    say(t('keySaved'));
  } catch (err) { say(err.message, true); input.focus(); }
  finally { btn.disabled = false; }
});

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
    if (b.dataset.view === 'glossary') { loadGlossary(); loadMemory(); }
    else if (b.dataset.view === 'clients') loadClients();
    else if (b.dataset.view === 'profile') { loadProfile(); renderKeyState(); }
    else loadProjects();
  });
}
$('#langBtn').addEventListener('click', () => {
  lang = lang === 'en' ? 'es' : 'en';
  try { localStorage.setItem('td_lang', lang); } catch { /* private mode */ }
  applyLang();
});

// ---------- drag files onto the window to start a project

let dragDepth = 0;
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
window.addEventListener('dragenter', (e) => { if (hasFiles(e)) { dragDepth++; $('#dropHint').hidden = false; } });
window.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; $('#dropHint').hidden = true; } });
window.addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
window.addEventListener('drop', (e) => {
  if (!hasFiles(e)) return;
  e.preventDefault(); // never let the window open the file itself
  dragDepth = 0;
  $('#dropHint').hidden = true;
  const files = e.dataTransfer.files;
  if (!files.length) return;
  show('projects');
  loadProjects();
  $('#pFile').files = files;
  describeFiles();
  $('#pName').focus();
  say(t('dropped', files.length));
});

// ---------- time spent: a minute counts when the project is open and you did something in it

let lastActivity = 0;
for (const ev of ['keydown', 'pointerdown', 'scroll', 'input']) window.addEventListener(ev, () => { lastActivity = Date.now(); }, { passive: true, capture: true });
setInterval(() => {
  const p = state.project;
  if (!p || $('#view-project').hidden || document.visibilityState !== 'visible' || Date.now() - lastActivity > 120000) return;
  api(`/api/projects/${p.id}/time`, { method: 'POST', body: JSON.stringify({ seconds: 60 }) }).catch(() => {});
}, 60000);

(async () => {
  try { state.status = await api('/api/status'); } catch (err) { say(err.message, true); }
  show('projects');
  applyLang();
  loadSettings();
})();
