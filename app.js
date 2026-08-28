
(() => {
  'use strict';

  const STORAGE_KEY = 'compitocheck_ai_v1_students';
  const EXAMS_KEY = 'compitocheck_ai_v3_exams';
  const SUBMISSIONS_KEY = 'compitocheck_ai_v3_submissions';
  const $ = (id) => document.getElementById(id);

  const els = {
    studentSelect: $('studentSelect'),
    newStudentBtn: $('newStudentBtn'),
    deleteStudentBtn: $('deleteStudentBtn'),
    studentInfo: $('studentInfo'),
    referenceText: $('referenceText'),
    referenceFileInput: $('referenceFileInput'),
    referenceCameraBtn: $('referenceCameraBtn'),
    referencePhotoInput: $('referencePhotoInput'),
    referenceFileName: $('referenceFileName'),
    referenceOcrStatus: $('referenceOcrStatus'),
    saveReferenceBtn: $('saveReferenceBtn'),
    saveAsReferenceBtn: $('saveAsReferenceBtn'),
    manageReferencesBtn: $('manageReferencesBtn'),
    referenceCount: $('referenceCount'),
    languageSelect: $('languageSelect'),
    fileInput: $('fileInput'),
    essayCameraBtn: $('essayCameraBtn'),
    essayPhotoInput: $('essayPhotoInput'),
    fileName: $('fileName'),
    essayOcrStatus: $('essayOcrStatus'),
    essayText: $('essayText'),
    analyzeBtn: $('analyzeBtn'),
    clearBtn: $('clearBtn'),
    validation: $('validation'),
    results: $('results'),
    detectedLanguage: $('detectedLanguage'),
    aiScore: $('aiScore'),
    aiMeter: $('aiMeter'),
    styleScore: $('styleScore'),
    styleMeter: $('styleMeter'),
    cefrScore: $('cefrScore'),
    signalsList: $('signalsList'),
    gradingBox: $('gradingBox'),
    highlightedText: $('highlightedText'),
    correctionsList: $('correctionsList'),
    questionsList: $('questionsList'),
    statsTable: $('statsTable'),
    reportText: $('reportText'),
    exportBtn: $('exportBtn'),
    studentDialog: $('studentDialog'),
    studentForm: $('studentForm'),
    studentName: $('studentName'),
    cancelStudentBtn: $('cancelStudentBtn'),
    confirmStudentBtn: $('confirmStudentBtn'),
    referencesDialog: $('referencesDialog'),
    referencesList: $('referencesList'),
    cameraDialog: $('cameraDialog'),
    cameraVideo: $('cameraVideo'),
    cameraCanvas: $('cameraCanvas'),
    cameraPreview: $('cameraPreview'),
    cameraMessage: $('cameraMessage'),
    capturePhotoBtn: $('capturePhotoBtn'),
    retakePhotoBtn: $('retakePhotoBtn'),
    usePhotoBtn: $('usePhotoBtn'),
    fallbackPhotoBtn: $('fallbackPhotoBtn'),
    closeCameraBtn: $('closeCameraBtn'),
    closeReferencesBtn: $('closeReferencesBtn'),
    installBtn: $('installBtn'),
    classroomToggle: $('classroomToggle'),
    classroomPanel: $('classroomPanel'),
    startSessionBtn: $('startSessionBtn'),
    pauseSessionBtn: $('pauseSessionBtn'),
    finishSessionBtn: $('finishSessionBtn'),
    resetSessionBtn: $('resetSessionBtn'),
    sessionState: $('sessionState'),
    sessionTimer: $('sessionTimer'),
    typedChars: $('typedChars'),
    pastedChars: $('pastedChars'),
    deletedChars: $('deletedChars'),
    longPauses: $('longPauses'),
    typedPct: $('typedPct'),
    pastedPct: $('pastedPct'),
    typedPctMeter: $('typedPctMeter'),
    pastedPctMeter: $('pastedPctMeter'),
    pasteAssessment: $('pasteAssessment'),
    eventTimeline: $('eventTimeline'),
    exportSessionBtn: $('exportSessionBtn'),
    teacherModeBtn: $('teacherModeBtn'),
    studentModeBtn: $('studentModeBtn'),
    teacherMain: $('teacherMain'),
    studentMain: $('studentMain'),
    examTitle: $('examTitle'),
    examLanguage: $('examLanguage'),
    examPrompt: $('examPrompt'),
    examDuration: $('examDuration'),
    examClass: $('examClass'),
    createExamBtn: $('createExamBtn'),
    closeExamBtn: $('closeExamBtn'),
    activeExamBadge: $('activeExamBadge'),
    examCodeBox: $('examCodeBox'),
    examCode: $('examCode'),
    examSummary: $('examSummary'),
    submissionsList: $('submissionsList'),
    exportAllSubmissionsBtn: $('exportAllSubmissionsBtn'),
    studentJoinPanel: $('studentJoinPanel'),
    studentExamPanel: $('studentExamPanel'),
    studentDonePanel: $('studentDonePanel'),
    studentExamCode: $('studentExamCode'),
    studentDisplayName: $('studentDisplayName'),
    joinExamBtn: $('joinExamBtn'),
    studentJoinMessage: $('studentJoinMessage'),
    studentExamTitle: $('studentExamTitle'),
    studentExamMeta: $('studentExamMeta'),
    studentSessionTimer: $('studentSessionTimer'),
    studentExamPrompt: $('studentExamPrompt'),
    studentEssay: $('studentEssay'),
    studentTypedChars: $('studentTypedChars'),
    studentPastedChars: $('studentPastedChars'),
    studentDeletedChars: $('studentDeletedChars'),
    submitExamBtn: $('submitExamBtn'),
    leaveExamBtn: $('leaveExamBtn'),
    studentExamMessage: $('studentExamMessage'),
    studentNewSessionBtn: $('studentNewSessionBtn')
  };

  let students = loadStudents();
  let lastAnalysis = null;
  let deferredPrompt = null;
  let exams = loadJson(EXAMS_KEY, []);
  let submissions = loadJson(SUBMISSIONS_KEY, []);
  let currentStudentExam = null;
  let studentSession = null;
  let studentTimerId = null;

  let classroom = {
    state: 'idle',
    startedAt: null,
    elapsedBeforePause: 0,
    pauseStartedAt: null,
    timerId: null,
    typedChars: 0,
    pastedChars: 0,
    deletedChars: 0,
    longPauses: 0,
    events: [],
    lastInputAt: null,
    lastValue: '',
    pasteGuard: false
  };


  let cameraState = {
    stream: null,
    target: null,       // 'essay' | 'reference'
    capturedBlob: null
  };

  function loadJson(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || 'null');
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadStudents() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveStudents() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    renderStudentSelect();
  renderClassroom();
  renderActiveExam();
  renderSubmissions();
  switchMode('teacher');
  }

  function uid() {
    return (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2));
  }

  function currentStudent() {
    return students.find(s => s.id === els.studentSelect.value) || null;
  }

  function renderStudentSelect(preferredId) {
    const current = preferredId || els.studentSelect.value;
    els.studentSelect.innerHTML = '';
    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = 'Nessuno studente selezionato';
    els.studentSelect.appendChild(empty);
    students.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.name;
      els.studentSelect.appendChild(o);
    });
    if (students.some(s => s.id === current)) els.studentSelect.value = current;
    renderStudentInfo();
  }

  function renderStudentInfo() {
    const s = currentStudent();
    if (!s) {
      els.studentInfo.textContent = 'Seleziona uno studente per usare il confronto stilistico.';
      els.referenceCount.textContent = '0 campioni';
      return;
    }
    const count = (s.references || []).length;
    els.studentInfo.textContent = `${s.name} • ${count} campion${count === 1 ? 'e' : 'i'} salvati`;
    els.referenceCount.textContent = `${count} campion${count === 1 ? 'e' : 'i'}`;
  }

  function addReference(text) {
    const s = currentStudent();
    if (!s) return showValidation('Seleziona o crea prima uno studente.');
    const clean = normalizeText(text);
    if (clean.length < 120) return showValidation('Il campione è troppo corto. Inserisci almeno circa 120 caratteri.');
    s.references = s.references || [];
    if (s.references.length >= 10) return showValidation('Hai raggiunto il limite di 10 campioni per questo studente.');
    s.references.push({ id: uid(), text: clean, createdAt: new Date().toISOString() });
    saveStudents();
    els.referenceText.value = '';
    showValidation('', false);
  }

  function showValidation(message, isError = true) {
    els.validation.textContent = message;
    els.validation.style.color = isError ? '#b42318' : '#067647';
  }

  function normalizeText(text) {
    return (text || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  }

  function splitSentences(text) {
    const cleaned = normalizeText(text).replace(/\n+/g, ' ');
    const parts = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    return parts.map(s => s.trim()).filter(s => s.length > 2);
  }

  function words(text) {
    return (text.toLowerCase().match(/[a-zà-öø-ÿ'’-]+/gi) || []).map(w => w.replace(/[’]/g, "'"));
  }

  function avg(arr) {
    return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
  }

  function std(arr) {
    if (arr.length < 2) return 0;
    const m = avg(arr);
    return Math.sqrt(avg(arr.map(x => (x-m)**2)));
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function pct(n) {
    return Math.round(clamp(n, 0, 100));
  }

  const stopIT = new Set('il lo la i gli le un uno una di a da in con su per tra fra e o ma che non come più si del dello della dei degli delle al allo alla ai agli alle nel nello nella nei negli nelle è sono era essere anche questo questa questi queste'.split(' '));
  const stopEN = new Set('the a an and or but of to in on for with from by at as is are was were be been being that this these those it its he she they we you i not do does did have has had can could would should will may might'.split(' '));

  function detectLanguage(text) {
    const ws = words(text);
    if (!ws.length) return 'it';
    let it = 0, en = 0;
    ws.forEach(w => {
      if (stopIT.has(w)) it++;
      if (stopEN.has(w)) en++;
    });
    const italianMarkers = (text.match(/[àèéìòù]/gi) || []).length;
    it += italianMarkers * 1.8;
    return en > it ? 'en' : 'it';
  }

  const transitions = {
    it: ['inoltre','tuttavia','pertanto','in conclusione','in sintesi','d’altra parte','d\'altra parte','di conseguenza','in primo luogo','in secondo luogo','complessivamente','è importante sottolineare','alla luce di ciò','in definitiva'],
    en: ['moreover','furthermore','however','therefore','in conclusion','in summary','on the other hand','consequently','firstly','secondly','overall','it is important to note','in light of this','ultimately','additionally']
  };

  const advancedEN = new Set('notwithstanding consequently moreover furthermore profound invaluable substantial compelling intricate comprehensive facilitate enhance demonstrate significant perspective sustainability socioeconomic nevertheless predominantly considerably arguably inherently increasingly implication paradigm multifaceted'.split(' '));

  function basicStats(text, lang) {
    const ss = splitSentences(text);
    const ws = words(text);
    const lengths = ss.map(s => words(s).length).filter(Boolean);
    const unique = new Set(ws);
    const stop = lang === 'en' ? stopEN : stopIT;
    const contentWords = ws.filter(w => !stop.has(w) && w.length > 2);
    const longWords = ws.filter(w => w.length >= 8).length;
    const commas = (text.match(/,/g) || []).length;
    const semicolons = (text.match(/;/g) || []).length;
    const exclamations = (text.match(/!/g) || []).length;
    const questions = (text.match(/\?/g) || []).length;
    const paragraphs = normalizeText(text).split(/\n\s*\n/).filter(Boolean).length;
    const firstPersonTokens = lang === 'en'
      ? ws.filter(w => ['i','me','my','mine','we','us','our','ours'].includes(w)).length
      : ws.filter(w => ['io','me','mio','mia','miei','mie','noi','nostro','nostra','nostri','nostre'].includes(w)).length;
    const transCount = transitions[lang].reduce((n, t) => n + ((text.toLowerCase().match(new RegExp('\\b' + escapeRegex(t) + '\\b','g')) || []).length), 0);

    return {
      chars: text.length,
      words: ws.length,
      sentences: ss.length,
      paragraphs,
      avgSentence: avg(lengths),
      sentenceStd: std(lengths),
      lexicalDiversity: ws.length ? unique.size / ws.length : 0,
      longWordRatio: ws.length ? longWords / ws.length : 0,
      commaPerSentence: ss.length ? commas / ss.length : 0,
      semicolons,
      exclamations,
      questions,
      firstPersonRatio: ws.length ? firstPersonTokens / ws.length : 0,
      transitionRatio: ss.length ? transCount / ss.length : 0,
      contentWords
    };
  }

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function repeatedNgramRate(text, n=3) {
    const ws = words(text);
    if (ws.length < n*2) return 0;
    const map = new Map();
    for (let i=0; i<=ws.length-n; i++) {
      const gram = ws.slice(i,i+n).join(' ');
      map.set(gram, (map.get(gram)||0)+1);
    }
    let repeated = 0;
    for (const c of map.values()) if (c > 1) repeated += c-1;
    return repeated / Math.max(1, ws.length-n+1);
  }

  function spellingSignals(text, lang) {
    const issues = [];
    if (lang === 'en') {
      const rules = [
        [/\bi am agree\b/gi, 'I agree', 'In inglese non si usa “am” con “agree”.'],
        [/\bpeople is\b/gi, 'people are', '“People” richiede il verbo al plurale.'],
        [/\bhe have\b/gi, 'he has', 'Alla terza persona singolare si usa “has”.'],
        [/\bshe have\b/gi, 'she has', 'Alla terza persona singolare si usa “has”.'],
        [/\byesterday\s+I\s+go\b/gi, 'yesterday I went', 'Con “yesterday” qui serve il past simple.'],
        [/\bdid\s+\w+\s+\w+ed\b/gi, null, 'Dopo “did” il verbo principale normalmente torna alla forma base.'],
        [/\bmore better\b/gi, 'better', '“Better” è già comparativo.'],
        [/\badvices\b/gi, 'advice', '“Advice” è normalmente non numerabile.'],
        [/\binformations\b/gi, 'information', '“Information” è non numerabile.']
      ];
      rules.forEach(([re, fixed, reason]) => {
        const m = text.match(re);
        if (m) issues.push({original:m[0], fixed:fixed || 'Controllare la forma verbale', reason});
      });
    } else {
      const rules = [
        [/\bqual'è\b/gi, "qual è", '“Qual è” si scrive senza apostrofo.'],
        [/\bun pò\b/gi, "un po'", 'La forma corretta è “un po’”.'],
        [/\bperchè\b/gi, 'perché', 'Nell’uso standard si scrive “perché”.'],
        [/\bse stesso\b/gi, 'sé stesso', 'Il pronome tonico “sé” richiede l’accento.']
      ];
      rules.forEach(([re, fixed, reason]) => {
        const m = text.match(re);
        if (m) issues.push({original:m[0], fixed, reason});
      });
    }
    return issues.slice(0,12);
  }

  function aiHeuristic(text, lang, stats) {
    const signals = [];
    let score = 18;

    if (stats.words < 80) {
      signals.push({level:'low', title:'Testo breve', desc:'Su testi molto brevi qualsiasi stima è particolarmente incerta.', weight:-5});
      score -= 5;
    }

    if (stats.sentences >= 5 && stats.sentenceStd < 5.2) {
      score += 15;
      signals.push({level:'high', title:'Bassa variabilità delle frasi', desc:'Le frasi hanno lunghezze piuttosto uniformi, caratteristica che può comparire in testi molto regolari.', weight:15});
    } else if (stats.sentenceStd < 8) {
      score += 7;
      signals.push({level:'mid', title:'Variabilità moderata delle frasi', desc:'La struttura delle frasi è abbastanza regolare.', weight:7});
    } else {
      signals.push({level:'low', title:'Buona variabilità delle frasi', desc:'La lunghezza delle frasi varia in modo naturale.', weight:-5});
      score -= 5;
    }

    if (stats.transitionRatio > 0.22) {
      score += 16;
      signals.push({level:'high', title:'Molti connettivi formali', desc:'Il testo usa frequentemente formule di raccordo tipiche della prosa strutturata.', weight:16});
    } else if (stats.transitionRatio > 0.10) {
      score += 7;
      signals.push({level:'mid', title:'Connettivi presenti', desc:'Il testo presenta una discreta densità di connettivi logici.', weight:7});
    }

    if (stats.lexicalDiversity > 0.58 && stats.words > 120) {
      score += 8;
      signals.push({level:'mid', title:'Lessico molto vario', desc:'La varietà lessicale è elevata rispetto alla lunghezza del testo.', weight:8});
    }

    if (stats.firstPersonRatio < 0.005 && stats.words > 130) {
      score += 7;
      signals.push({level:'mid', title:'Voce personale poco presente', desc:'Il testo contiene pochissimi riferimenti in prima persona.', weight:7});
    }

    const rep = repeatedNgramRate(text, 3);
    if (rep < 0.012 && stats.words > 150) {
      score += 6;
      signals.push({level:'mid', title:'Poche ripetizioni locali', desc:'La prosa evita quasi del tutto ripetizioni di sequenze di parole.', weight:6});
    } else if (rep > 0.04) {
      score -= 4;
      signals.push({level:'low', title:'Ripetizioni presenti', desc:'Sono presenti ripetizioni che rendono il testo meno uniformemente rifinito.', weight:-4});
    }

    if (stats.longWordRatio > 0.16) {
      score += 8;
      signals.push({level:'mid', title:'Vocabolario complesso', desc:'È presente una quota alta di parole lunghe o formali.', weight:8});
    }

    if (lang === 'en') {
      const ws = words(text);
      const adv = ws.filter(w => advancedEN.has(w)).length;
      const ratio = ws.length ? adv/ws.length : 0;
      if (ratio > .025) {
        score += 9;
        signals.push({level:'high', title:'Lessico inglese avanzato', desc:'Diverse parole appartengono a un registro accademico o avanzato.', weight:9});
      }
    }

    const corrections = spellingSignals(text, lang);
    if (corrections.length === 0 && stats.words > 180) {
      score += 5;
      signals.push({level:'mid', title:'Nessun errore semplice rilevato', desc:'Il controllo euristico non ha trovato alcuni errori scolastici comuni. Non significa che il testo sia privo di errori.', weight:5});
    }

    const suspiciousSentences = scoreSuspiciousSentences(text, lang);
    score += Math.min(8, suspiciousSentences.filter(x => x.score >= 2).length * 1.5);

    return {score:pct(score), signals, suspiciousSentences, corrections};
  }

  function scoreSuspiciousSentences(text, lang) {
    const ss = splitSentences(text);
    const trans = transitions[lang];
    return ss.map((sentence, index) => {
      const ws = words(sentence);
      let s = 0;
      const low = sentence.toLowerCase();
      if (ws.length >= 24) s++;
      if (ws.length >= 34) s++;
      if (trans.some(t => low.includes(t))) s++;
      if ((sentence.match(/,/g)||[]).length >= 3) s++;
      if (lang === 'en' && ws.filter(w => advancedEN.has(w)).length >= 2) s++;
      if (lang === 'it' && /\b(complessivamente|pertanto|inoltre|tuttavia|significativamente|fondamentale|evidenzia|sottolineare)\b/i.test(sentence)) s++;
      return {sentence, score:s, index};
    });
  }

  function styleVector(stats) {
    return [
      stats.avgSentence,
      stats.sentenceStd,
      stats.lexicalDiversity * 100,
      stats.longWordRatio * 100,
      stats.commaPerSentence,
      stats.firstPersonRatio * 100,
      stats.transitionRatio * 100
    ];
  }

  function styleSimilarity(text, lang, references) {
    if (!references || references.length === 0) return null;
    const cur = styleVector(basicStats(text, lang));
    const vectors = references.map(r => styleVector(basicStats(r.text, detectLanguage(r.text))));
    const mean = cur.map((_,i) => avg(vectors.map(v => v[i])));
    const scales = [12, 9, 20, 10, 1.5, 4, 20];
    const dist = Math.sqrt(avg(cur.map((v,i) => ((v-mean[i])/scales[i])**2)));
    return pct(100 * Math.exp(-1.25 * dist));
  }

  function estimateCEFR(text, stats) {
    const ws = words(text);
    if (!ws.length) return '—';
    const adv = ws.filter(w => advancedEN.has(w)).length / ws.length;
    let p = 0;
    if (stats.avgSentence > 10) p++;
    if (stats.avgSentence > 16) p++;
    if (stats.avgSentence > 23) p++;
    if (stats.lexicalDiversity > .48) p++;
    if (stats.lexicalDiversity > .62) p++;
    if (stats.longWordRatio > .10) p++;
    if (stats.longWordRatio > .17) p++;
    if (adv > .008) p++;
    if (adv > .025) p++;
    if (stats.transitionRatio > .08) p++;
    if (p <= 2) return 'A2';
    if (p <= 4) return 'B1';
    if (p <= 7) return 'B2';
    return 'C1';
  }

  function gradeText(text, lang, stats, corrections) {
    const lengthScore = clamp(stats.words / 220 * 10, 4, 10);
    const coherence = clamp(6 + Math.min(2, stats.transitionRatio*8) + Math.min(1.5, stats.paragraphs/4) - (stats.sentences < 3 ? 2:0), 4, 10);
    const vocabulary = clamp(5 + stats.lexicalDiversity*4 + stats.longWordRatio*6, 4, 10);
    const grammar = clamp(9 - corrections.length*0.7, 4, 10);
    const structure = clamp(5.5 + Math.min(2, stats.paragraphs*0.7) + Math.min(2, stats.sentences/7), 4, 10);
    const overall = avg([lengthScore, coherence, vocabulary, grammar, structure]);
    return {
      grammatica: grammar,
      lessico: vocabulary,
      coerenza: coherence,
      struttura: structure,
      completezza: lengthScore,
      voto: overall
    };
  }

  function questionGenerator(text, lang, suspicious) {
    const candidates = suspicious.filter(x=>x.score>=2).slice(0,3);
    const ss = splitSentences(text);
    while (candidates.length < 3 && ss[candidates.length]) {
      const idx = Math.floor((candidates.length+1)*ss.length/4);
      candidates.push({sentence:ss[Math.min(idx, ss.length-1)],score:0});
    }
    const out = [];
    candidates.slice(0,3).forEach((x, i) => {
      const excerpt = x.sentence.length > 130 ? x.sentence.slice(0,127)+'…' : x.sentence;
      if (lang === 'en') {
        const templates = [
          `Explain in your own words what you mean by: “${excerpt}”`,
          `Rewrite this idea using simpler English: “${excerpt}”`,
          `Give a concrete example that supports this statement: “${excerpt}”`
        ];
        out.push(templates[i % templates.length]);
      } else {
        const templates = [
          `Spiega con parole tue cosa intendi quando scrivi: “${excerpt}”`,
          `Riformula in modo più semplice questa idea: “${excerpt}”`,
          `Fai un esempio concreto che dimostri questa affermazione: “${excerpt}”`
        ];
        out.push(templates[i % templates.length]);
      }
    });
    return out;
  }

  function analyze() {
    showValidation('', false);
    const text = normalizeText(els.essayText.value);
    if (text.length < 120) return showValidation('Inserisci un testo più lungo: servono almeno circa 120 caratteri per un’analisi utile.');
    const selectedLang = els.languageSelect.value;
    const lang = selectedLang === 'auto' ? detectLanguage(text) : selectedLang;
    const stats = basicStats(text, lang);
    const ai = aiHeuristic(text, lang, stats);
    const student = currentStudent();
    const similarity = student ? styleSimilarity(text, lang, student.references || []) : null;
    const cefr = lang === 'en' ? estimateCEFR(text, stats) : 'N/D';
    const grades = gradeText(text, lang, stats, ai.corrections);
    const questions = questionGenerator(text, lang, ai.suspiciousSentences);

    lastAnalysis = {text, lang, stats, ai, similarity, cefr, grades, questions, studentName: student?.name || 'Non selezionato', createdAt:new Date().toLocaleString('it-IT')};
    renderAnalysis(lastAnalysis);
  }

  function renderAnalysis(a) {
    els.results.hidden = false;
    els.detectedLanguage.textContent = a.lang === 'en' ? 'English' : 'Italiano';
    els.aiScore.textContent = `${a.ai.score}%`;
    els.aiMeter.style.width = `${a.ai.score}%`;
    els.styleScore.textContent = a.similarity === null ? 'N/D' : `${a.similarity}%`;
    els.styleMeter.style.width = `${a.similarity ?? 0}%`;
    els.cefrScore.textContent = a.cefr;

    els.signalsList.innerHTML = '';
    a.ai.signals.forEach(s => {
      const div = document.createElement('div');
      div.className = 'signal';
      const badgeClass = s.level === 'high' ? 'high' : s.level === 'mid' ? 'mid' : 'low';
      const badgeText = s.level === 'high' ? 'Forte' : s.level === 'mid' ? 'Moderato' : 'Debole';
      div.innerHTML = `<div class="title"><span>${escapeHtml(s.title)}</span><span class="badge ${badgeClass}">${badgeText}</span></div><div class="desc">${escapeHtml(s.desc)}</div>`;
      els.signalsList.appendChild(div);
    });
    if (a.similarity !== null && a.similarity < 45) {
      const div = document.createElement('div');
      div.className = 'signal';
      div.innerHTML = `<div class="title"><span>Scostamento dallo stile storico</span><span class="badge high">Da verificare</span></div><div class="desc">Il profilo linguistico del testo è poco compatibile con i campioni salvati dello studente.</div>`;
      els.signalsList.prepend(div);
    }

    const labels = {
      grammatica: a.lang === 'en' ? 'Grammar' : 'Grammatica',
      lessico: a.lang === 'en' ? 'Vocabulary' : 'Lessico',
      coerenza: a.lang === 'en' ? 'Coherence' : 'Coerenza',
      struttura: a.lang === 'en' ? 'Structure' : 'Struttura',
      completezza: a.lang === 'en' ? 'Task development' : 'Sviluppo',
      voto: a.lang === 'en' ? 'Suggested grade' : 'Voto indicativo'
    };
    els.gradingBox.innerHTML = Object.entries(a.grades).map(([k,v]) =>
      `<div class="grade-line"><span>${labels[k]}</span><strong>${v.toFixed(1)}/10</strong></div>`
    ).join('');

    renderHighlighted(a.text, a.ai.suspiciousSentences);

    els.correctionsList.innerHTML = '';
    if (!a.ai.corrections.length) {
      els.correctionsList.innerHTML = '<p class="muted small">Nessuna delle regole di correzione di base ha rilevato errori. La V1 non sostituisce un correttore grammaticale completo.</p>';
    } else {
      a.ai.corrections.forEach(c => {
        const div = document.createElement('div');
        div.className = 'correction';
        div.innerHTML = `<div><span class="original">${escapeHtml(c.original)}</span> → <span class="fixed">${escapeHtml(c.fixed)}</span></div><div class="muted small">${escapeHtml(c.reason)}</div>`;
        els.correctionsList.appendChild(div);
      });
    }

    els.questionsList.innerHTML = '';
    a.questions.forEach(q => {
      const li = document.createElement('li');
      li.textContent = q;
      els.questionsList.appendChild(li);
    });

    const statItems = [
      ['Parole', a.stats.words],
      ['Frasi', a.stats.sentences],
      ['Paragrafi', a.stats.paragraphs],
      ['Parole/frase', a.stats.avgSentence.toFixed(1)],
      ['Variabilità frasi', a.stats.sentenceStd.toFixed(1)],
      ['Diversità lessicale', Math.round(a.stats.lexicalDiversity*100)+'%'],
      ['Parole lunghe', Math.round(a.stats.longWordRatio*100)+'%'],
      ['Connettivi/frase', a.stats.transitionRatio.toFixed(2)]
    ];
    els.statsTable.innerHTML = statItems.map(([k,v]) => `<div class="stat"><span>${escapeHtml(k)}</span><strong>${escapeHtml(String(v))}</strong></div>`).join('');

    els.reportText.value = buildReport(a);
    els.results.scrollIntoView({behavior:'smooth', block:'start'});
  }

  function renderHighlighted(text, suspicious) {
    const sentenceMap = new Map(suspicious.map(x => [x.sentence, x.score]));
    const ss = splitSentences(text);
    els.highlightedText.innerHTML = ss.map(s => {
      const score = sentenceMap.get(s) || 0;
      const cls = score >= 3 ? 'suspect-high' : score >= 2 ? 'suspect-mid' : '';
      return cls ? `<span class="${cls}" title="Passaggio da verificare">${escapeHtml(s)}</span>` : escapeHtml(s);
    }).join(' ');
  }

  function buildReport(a) {
    const lines = [];
    lines.push('COMPITOCHECK AI — REPORT DI SUPPORTO');
    lines.push('===================================');
    lines.push(`Data: ${a.createdAt}`);
    lines.push(`Studente: ${a.studentName}`);
    lines.push(`Lingua: ${a.lang === 'en' ? 'English' : 'Italiano'}`);
    lines.push(`Indicatore IA: ${a.ai.score}%`);
    lines.push(`Compatibilità con stile storico: ${a.similarity === null ? 'N/D' : a.similarity + '%'}`);
    if (a.lang === 'en') lines.push(`Livello inglese stimato: ${a.cefr}`);
    lines.push('');
    lines.push('VALUTAZIONE DIDATTICA');
    lines.push(`Grammatica: ${a.grades.grammatica.toFixed(1)}/10`);
    lines.push(`Lessico: ${a.grades.lessico.toFixed(1)}/10`);
    lines.push(`Coerenza: ${a.grades.coerenza.toFixed(1)}/10`);
    lines.push(`Struttura: ${a.grades.struttura.toFixed(1)}/10`);
    lines.push(`Sviluppo: ${a.grades.completezza.toFixed(1)}/10`);
    lines.push(`Voto indicativo: ${a.grades.voto.toFixed(1)}/10`);
    lines.push('');
    lines.push('INDICATORI');
    a.ai.signals.forEach(s => lines.push(`- ${s.title}: ${s.desc}`));
    lines.push('');
    lines.push('DOMANDE PER VERIFICA ORALE');
    a.questions.forEach((q,i)=>lines.push(`${i+1}. ${q}`));
    lines.push('');
    lines.push('AVVERTENZA');
    lines.push('L’indicatore IA è euristico e non dimostra che un testo sia stato generato da un sistema di intelligenza artificiale. Deve essere usato insieme ad altri elementi didattici.');
    return lines.join('\n');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }


  function stopCameraStream() {
    if (cameraState.stream) {
      cameraState.stream.getTracks().forEach(track => track.stop());
      cameraState.stream = null;
    }
    if (els.cameraVideo) els.cameraVideo.srcObject = null;
  }

  function resetCameraUi() {
    cameraState.capturedBlob = null;
    els.cameraPreview.hidden = true;
    els.cameraPreview.removeAttribute('src');
    els.cameraVideo.hidden = false;
    els.capturePhotoBtn.hidden = false;
    els.retakePhotoBtn.hidden = true;
    els.usePhotoBtn.hidden = true;
    setOcrStatus(els.cameraMessage, '');
  }

  async function openCamera(target) {
    cameraState.target = target;
    resetCameraUi();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setOcrStatus(
        els.cameraMessage,
        'La fotocamera diretta non è supportata da questo browser. Usa “Scegli immagine”.',
        'error'
      );
      els.capturePhotoBtn.hidden = true;
      els.cameraDialog.showModal();
      return;
    }

    els.cameraDialog.showModal();
    setOcrStatus(els.cameraMessage, 'Apertura fotocamera...', 'working');

    try {
      stopCameraStream();

      // Preferisce la fotocamera posteriore; se non disponibile il browser sceglie quella utilizzabile.
      const constraints = {
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraState.stream = stream;
      els.cameraVideo.srcObject = stream;

      await new Promise(resolve => {
        if (els.cameraVideo.readyState >= 2) return resolve();
        els.cameraVideo.onloadedmetadata = () => resolve();
      });

      try { await els.cameraVideo.play(); } catch {}
      setOcrStatus(els.cameraMessage, 'Fotocamera pronta.', 'success');
    } catch (err) {
      console.error('Camera error:', err);
      stopCameraStream();
      els.capturePhotoBtn.hidden = true;

      let msg = 'Non riesco ad aprire la fotocamera.';
      if (err?.name === 'NotAllowedError') {
        msg = 'Permesso fotocamera negato. Consenti l’accesso alla fotocamera nelle impostazioni del browser oppure usa “Scegli immagine”.';
      } else if (err?.name === 'NotFoundError') {
        msg = 'Nessuna fotocamera disponibile su questo dispositivo. Usa “Scegli immagine”.';
      } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        msg = 'La fotocamera diretta richiede HTTPS. Pubblica l’app su GitHub Pages oppure usa “Scegli immagine”.';
      }
      setOcrStatus(els.cameraMessage, msg, 'error');
    }
  }

  function captureCameraFrame() {
    const video = els.cameraVideo;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setOcrStatus(els.cameraMessage, 'La fotocamera non è ancora pronta.', 'error');
      return;
    }

    const canvas = els.cameraCanvas;
    const maxWidth = 2200;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);

    const ctx = canvas.getContext('2d', { alpha:false });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) {
        setOcrStatus(els.cameraMessage, 'Impossibile acquisire la foto.', 'error');
        return;
      }

      cameraState.capturedBlob = blob;
      const url = URL.createObjectURL(blob);
      const old = els.cameraPreview.dataset.objectUrl;
      if (old) URL.revokeObjectURL(old);

      els.cameraPreview.dataset.objectUrl = url;
      els.cameraPreview.src = url;
      els.cameraPreview.hidden = false;
      els.cameraVideo.hidden = true;
      els.capturePhotoBtn.hidden = true;
      els.retakePhotoBtn.hidden = false;
      els.usePhotoBtn.hidden = false;
      setOcrStatus(els.cameraMessage, 'Foto scattata. Controllala prima di usarla.', 'success');
    }, 'image/jpeg', 0.92);
  }

  async function retakeCameraPhoto() {
    cameraState.capturedBlob = null;
    els.cameraPreview.hidden = true;
    els.cameraVideo.hidden = false;
    els.capturePhotoBtn.hidden = false;
    els.retakePhotoBtn.hidden = true;
    els.usePhotoBtn.hidden = true;
    setOcrStatus(els.cameraMessage, 'Inquadra nuovamente il foglio.', 'working');

    if (!cameraState.stream) {
      await openCamera(cameraState.target);
    }
  }

  async function useCapturedPhoto() {
    const blob = cameraState.capturedBlob;
    if (!blob) return;

    const target = cameraState.target;
    const targetEl = target === 'reference' ? els.referenceText : els.essayText;
    const statusEl = target === 'reference' ? els.referenceOcrStatus : els.essayOcrStatus;
    const lang = target === 'reference' ? 'ita+eng' : ocrLanguageForEssay();

    stopCameraStream();
    els.cameraDialog.close();

    await recognizePhoto(blob, targetEl, statusEl, lang);
  }

  function closeCameraDialog() {
    stopCameraStream();
    if (els.cameraPreview.dataset.objectUrl) {
      URL.revokeObjectURL(els.cameraPreview.dataset.objectUrl);
      delete els.cameraPreview.dataset.objectUrl;
    }
    cameraState.capturedBlob = null;
    try { els.cameraDialog.close(); } catch {}
  }

  function openFallbackImagePicker() {
    const input = cameraState.target === 'reference'
      ? els.referencePhotoInput
      : els.essayPhotoInput;

    closeCameraDialog();
    input?.click();
  }


  async function extractDocumentText(file) {
    if (!file) return '';
    const ext = (file.name || '').toLowerCase().split('.').pop();

    if (ext === 'txt' || ext === 'md') {
      return await file.text();
    }

    if (ext === 'docx') {
      if (!window.mammoth) {
        throw new Error('Modulo DOCX non disponibile. Controlla la connessione Internet.');
      }
      const buffer = await file.arrayBuffer();
      const result = await window.mammoth.extractRawText({arrayBuffer:buffer});
      return result.value || '';
    }

    if (ext === 'pdf') {
      if (!window.pdfjsLib) {
        throw new Error('Modulo PDF non disponibile. Riprova tra qualche secondo o controlla la connessione.');
      }
      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await window.pdfjsLib.getDocument({data}).promise;
      let text = '';
      const maxPages = Math.min(pdf.numPages, 50);

      for (let p = 1; p <= maxPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        text += content.items.map(i => i.str).join(' ') + '\n\n';
      }
      return text.trim();
    }

    throw new Error('Formato non supportato. Usa TXT, MD, DOCX o PDF.');
  }

  async function handleDocumentFile(file, targetEl, nameEl, statusEl) {
    if (!file) return;
    if (nameEl) nameEl.textContent = file.name;

    setOcrStatus(statusEl, 'Caricamento file...', 'working');
    try {
      const text = await extractDocumentText(file);
      if (!normalizeText(text)) {
        throw new Error('Il file non contiene testo leggibile. Se è una scansione o una foto, usa “Scatta foto”.');
      }
      targetEl.value = text.trim();
      setOcrStatus(statusEl, 'File caricato: il testo è stato inserito automaticamente.', 'success');
    } catch (err) {
      setOcrStatus(statusEl, err.message || 'Impossibile leggere il file.', 'error');
    }
  }

  function setOcrStatus(el, message, state='') {
    if (!el) return;
    el.textContent = message || '';
    el.className = 'ocr-status muted small' + (state ? ' ' + state : '');
  }

  function ocrLanguageForEssay() {
    const selected = els.languageSelect?.value || 'auto';
    if (selected === 'it') return 'ita';
    if (selected === 'en') return 'eng';
    return 'ita+eng';
  }

  async function recognizePhoto(file, targetEl, statusEl, lang='ita+eng') {
    if (!file) return;

    if (!window.Tesseract) {
      setOcrStatus(
        statusEl,
        'Modulo OCR non disponibile. Controlla la connessione Internet e ricarica la pagina.',
        'error'
      );
      return;
    }

    setOcrStatus(statusEl, 'Preparazione OCR...', 'working');

    try {
      const result = await window.Tesseract.recognize(file, lang, {
        logger: message => {
          if (!message) return;

          if (message.status === 'recognizing text' && typeof message.progress === 'number') {
            const percent = Math.round(message.progress * 100);
            setOcrStatus(statusEl, `Lettura della foto: ${percent}%`, 'working');
          } else if (message.status) {
            const friendly = {
              'loading tesseract core': 'Caricamento motore OCR...',
              'initializing tesseract': 'Inizializzazione OCR...',
              'loading language traineddata': 'Caricamento lingua OCR...',
              'initializing api': 'Preparazione riconoscimento...'
            };
            if (friendly[message.status]) {
              setOcrStatus(statusEl, friendly[message.status], 'working');
            }
          }
        }
      });

      const recognized = normalizeText(result?.data?.text || '');
      if (!recognized) {
        throw new Error('Non sono riuscito a riconoscere testo nella foto. Prova con più luce e una foto più diritta.');
      }

      // Se è già presente una pagina, aggiunge la nuova foto in fondo.
      const existing = targetEl.value.trim();
      targetEl.value = existing ? `${existing}\n\n${recognized}` : recognized;

      setOcrStatus(
        statusEl,
        'Foto letta. Controlla il testo riconosciuto e correggi eventuali errori OCR.',
        'success'
      );
      targetEl.focus();
    } catch (err) {
      console.error('OCR error:', err);
      setOcrStatus(
        statusEl,
        err?.message || 'Errore durante il riconoscimento della foto.',
        'error'
      );
    }
  }


  function renderReferences() {
    const s = currentStudent();
    els.referencesList.innerHTML = '';
    if (!s || !s.references?.length) {
      els.referencesList.innerHTML = '<p class="muted">Nessun campione salvato.</p>';
      return;
    }
    s.references.forEach((r, idx) => {
      const div = document.createElement('div');
      div.className = 'ref-item';
      div.innerHTML = `<div class="ref-head"><strong>Campione ${idx+1}</strong><button class="btn danger-outline" data-remove="${r.id}">Elimina</button></div><p>${escapeHtml(r.text.slice(0,550))}${r.text.length>550?'…':''}</p>`;
      els.referencesList.appendChild(div);
    });
    els.referencesList.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const s2 = currentStudent();
        if (!s2) return;
        s2.references = s2.references.filter(r => r.id !== btn.dataset.remove);
        saveStudents();
        renderReferences();
      });
    });
  }



  function switchMode(mode) {
    const teacher = mode === 'teacher';
    els.teacherMain.hidden = !teacher;
    els.studentMain.hidden = teacher;
    els.teacherModeBtn.classList.toggle('active', teacher);
    els.studentModeBtn.classList.toggle('active', !teacher);
    if (teacher) {
      renderActiveExam();
      renderSubmissions();
    }
  }

  function generateExamCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
    } while (exams.some(e => e.code === code && e.active));
    return code;
  }

  function activeExam() {
    return exams.find(e => e.active) || null;
  }

  function createExam() {
    const title = els.examTitle.value.trim();
    const prompt = els.examPrompt.value.trim();
    const lang = els.examLanguage.value;
    const duration = clamp(parseInt(els.examDuration.value || '60', 10), 10, 300);
    const className = els.examClass.value.trim();

    if (!title) return showValidation('Inserisci il titolo della prova.');
    if (!prompt) return showValidation('Inserisci la traccia della prova.');

    exams.forEach(e => e.active = false);
    const exam = {
      id: uid(),
      code: generateExamCode(),
      title,
      prompt,
      lang,
      duration,
      className,
      active: true,
      createdAt: new Date().toISOString()
    };
    exams.push(exam);
    saveJson(EXAMS_KEY, exams);
    renderActiveExam();
    showValidation('Prova creata correttamente.', false);
  }

  function closeExam() {
    const exam = activeExam();
    if (!exam) return;
    exam.active = false;
    exam.closedAt = new Date().toISOString();
    saveJson(EXAMS_KEY, exams);
    renderActiveExam();
  }

  function renderActiveExam() {
    const exam = activeExam();
    if (!exam) {
      els.activeExamBadge.textContent = 'Nessuna prova attiva';
      els.examCodeBox.hidden = true;
      els.closeExamBtn.disabled = true;
      return;
    }
    els.activeExamBadge.textContent = 'Prova attiva';
    els.examCodeBox.hidden = false;
    els.examCode.textContent = exam.code;
    els.examSummary.textContent = `${exam.title}${exam.className ? ' • ' + exam.className : ''} • ${exam.lang === 'en' ? 'English' : 'Italiano'} • ${exam.duration} min`;
    els.closeExamBtn.disabled = false;
  }

  function findExamByCode(code) {
    const normalized = (code || '').trim().toUpperCase();
    return exams.find(e => e.code === normalized && e.active) || null;
  }

  function joinExam() {
    const code = els.studentExamCode.value.trim().toUpperCase();
    const name = els.studentDisplayName.value.trim();
    const exam = findExamByCode(code);

    if (!code || !name) {
      els.studentJoinMessage.textContent = 'Inserisci codice prova e nome/codice studente.';
      return;
    }
    if (!exam) {
      els.studentJoinMessage.textContent = 'Codice non valido oppure prova già chiusa.';
      return;
    }

    currentStudentExam = exam;
    studentSession = {
      startedAt: Date.now(),
      typedChars: 0,
      pastedChars: 0,
      deletedChars: 0,
      events: [],
      lastValue: '',
      lastInputAt: Date.now(),
      pasteGuard: false
    };
    els.studentEssay.value = '';
    els.studentJoinMessage.textContent = '';
    els.studentExamMessage.textContent = '';
    els.studentJoinPanel.hidden = true;
    els.studentDonePanel.hidden = true;
    els.studentExamPanel.hidden = false;

    els.studentExamTitle.textContent = exam.title;
    els.studentExamMeta.textContent = `${exam.className ? exam.className + ' • ' : ''}${exam.lang === 'en' ? 'English' : 'Italiano'} • durata indicativa ${exam.duration} min`;
    els.studentExamPrompt.textContent = exam.prompt;

    clearInterval(studentTimerId);
    studentTimerId = setInterval(renderStudentSession, 1000);
    renderStudentSession();
    els.studentEssay.focus();
  }

  function studentElapsed() {
    return studentSession ? Date.now() - studentSession.startedAt : 0;
  }

  function addStudentEvent(type, message, extra={}) {
    if (!studentSession) return;
    studentSession.events.push({
      type, message, elapsed: studentElapsed(), at: new Date().toISOString(), ...extra
    });
    if (studentSession.events.length > 300) studentSession.events.shift();
  }

  function studentBeforeInput(e) {
    if (!studentSession) return;
    const type = e.inputType || '';
    if (type.startsWith('delete')) {
      const selectionLen = Math.max(0, els.studentEssay.selectionEnd - els.studentEssay.selectionStart);
      studentSession.deletedChars += Math.max(1, selectionLen);
    }
    studentSession.lastInputAt = Date.now();
  }

  function studentInput() {
    if (!studentSession) return;
    const current = els.studentEssay.value;
    const prev = studentSession.lastValue || '';
    const delta = current.length - prev.length;
    if (!studentSession.pasteGuard && delta > 0) {
      studentSession.typedChars += delta;
      if (delta >= 80) addStudentEvent('burst', `Inserimento rapido di ${delta} caratteri`, {chars:delta});
    }
    studentSession.lastValue = current;
    studentSession.pasteGuard = false;
    studentSession.lastInputAt = Date.now();
    renderStudentSession();
  }

  function studentPaste(e) {
    if (!studentSession) return;
    const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    const len = pasted.length;
    studentSession.pastedChars += len;
    studentSession.pasteGuard = true;
    addStudentEvent('paste', `Incollati ${len} caratteri`, {chars:len});
    setTimeout(() => {
      if (!studentSession) return;
      studentSession.lastValue = els.studentEssay.value;
      studentSession.pasteGuard = false;
      renderStudentSession();
    }, 0);
  }

  function renderStudentSession() {
    if (!studentSession) return;
    els.studentSessionTimer.textContent = formatElapsed(studentElapsed());
    els.studentTypedChars.textContent = studentSession.typedChars;
    els.studentPastedChars.textContent = studentSession.pastedChars;
    els.studentDeletedChars.textContent = studentSession.deletedChars;
  }

  function leaveExam() {
    if (els.studentEssay.value.trim() && !confirm('Uscire senza consegnare? Il testo verrà perso.')) return;
    clearInterval(studentTimerId);
    studentTimerId = null;
    currentStudentExam = null;
    studentSession = null;
    els.studentExamPanel.hidden = true;
    els.studentDonePanel.hidden = true;
    els.studentJoinPanel.hidden = false;
  }

  function submitExam() {
    if (!currentStudentExam || !studentSession) return;
    const text = normalizeText(els.studentEssay.value);
    if (text.length < 30) {
      els.studentExamMessage.textContent = 'Il compito è troppo breve per essere consegnato.';
      return;
    }
    const name = els.studentDisplayName.value.trim();
    const total = studentSession.typedChars + studentSession.pastedChars;
    const typedPct = total ? Math.round(studentSession.typedChars / total * 100) : 0;
    const pastedPct = total ? 100 - typedPct : 0;

    const lang = currentStudentExam.lang;
    const stats = basicStats(text, lang);
    const ai = aiHeuristic(text, lang, stats);
    const cefr = lang === 'en' ? estimateCEFR(text, stats) : 'N/D';
    const corrections = ai.corrections;
    const grades = gradeText(text, lang, stats, corrections);

    const submission = {
      id: uid(),
      examId: currentStudentExam.id,
      examCode: currentStudentExam.code,
      examTitle: currentStudentExam.title,
      className: currentStudentExam.className,
      studentName: name,
      lang,
      text,
      submittedAt: new Date().toISOString(),
      durationMs: studentElapsed(),
      typedChars: studentSession.typedChars,
      pastedChars: studentSession.pastedChars,
      deletedChars: studentSession.deletedChars,
      typedPct,
      pastedPct,
      events: studentSession.events,
      aiScore: ai.score,
      cefr,
      grades
    };

    submissions.push(submission);
    saveJson(SUBMISSIONS_KEY, submissions);

    clearInterval(studentTimerId);
    studentTimerId = null;
    currentStudentExam = null;
    studentSession = null;
    els.studentExamPanel.hidden = true;
    els.studentJoinPanel.hidden = true;
    els.studentDonePanel.hidden = false;
  }

  function studentResetAccess() {
    els.studentExamCode.value = '';
    els.studentEssay.value = '';
    els.studentExamPanel.hidden = true;
    els.studentDonePanel.hidden = true;
    els.studentJoinPanel.hidden = false;
    els.studentJoinMessage.textContent = '';
    els.studentExamMessage.textContent = '';
  }

  function submissionSummary(s) {
    return `${s.lang === 'en' ? 'English' : 'Italiano'} • ${formatElapsed(s.durationMs)} • IA ${s.aiScore}% • incollato ${s.pastedPct}%${s.cefr && s.cefr !== 'N/D' ? ' • ' + s.cefr : ''}`;
  }

  function renderSubmissions() {
    if (!submissions.length) {
      els.submissionsList.innerHTML = '<p class="muted">Nessuna consegna registrata.</p>';
      return;
    }

    const sorted = submissions.slice().sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    els.submissionsList.innerHTML = sorted.map(s => `
      <article class="submission-item">
        <div class="submission-head">
          <div>
            <strong>${escapeHtml(s.studentName)}</strong>
            <div class="submission-meta">${escapeHtml(s.examTitle)}${s.className ? ' • ' + escapeHtml(s.className) : ''} • ${new Date(s.submittedAt).toLocaleString('it-IT')}</div>
            <div class="submission-meta">${escapeHtml(submissionSummary(s))}</div>
          </div>
          <span class="badge ${s.pastedPct >= 50 ? 'high' : s.pastedPct >= 20 ? 'mid' : 'low'}">${s.pastedPct}% incollato</span>
        </div>
        <div class="submission-actions">
          <button type="button" class="btn" data-view-submission="${s.id}">Apri</button>
          <button type="button" class="btn" data-export-submission="${s.id}">Esporta</button>
          <button type="button" class="btn danger-outline" data-delete-submission="${s.id}">Elimina</button>
        </div>
        <div id="detail-${s.id}" class="submission-detail" hidden></div>
      </article>
    `).join('');

    els.submissionsList.querySelectorAll('[data-view-submission]').forEach(btn => {
      btn.addEventListener('click', () => toggleSubmissionDetail(btn.dataset.viewSubmission));
    });
    els.submissionsList.querySelectorAll('[data-export-submission]').forEach(btn => {
      btn.addEventListener('click', () => exportSubmission(btn.dataset.exportSubmission));
    });
    els.submissionsList.querySelectorAll('[data-delete-submission]').forEach(btn => {
      btn.addEventListener('click', () => deleteSubmission(btn.dataset.deleteSubmission));
    });
  }

  function toggleSubmissionDetail(id) {
    const s = submissions.find(x => x.id === id);
    const box = document.getElementById(`detail-${id}`);
    if (!s || !box) return;
    if (!box.hidden) {
      box.hidden = true;
      return;
    }
    box.innerHTML = `
      <strong>Testo consegnato</strong>
      <pre>${escapeHtml(s.text)}</pre>
      <div class="stats-table">
        <div class="stat"><span>Durata</span><strong>${formatElapsed(s.durationMs)}</strong></div>
        <div class="stat"><span>Digitato</span><strong>${s.typedPct}%</strong></div>
        <div class="stat"><span>Incollato</span><strong>${s.pastedPct}%</strong></div>
        <div class="stat"><span>Indicatore IA</span><strong>${s.aiScore}%</strong></div>
      </div>
    `;
    box.hidden = false;
  }

  function deleteSubmission(id) {
    const s = submissions.find(x => x.id === id);
    if (!s) return;
    if (!confirm(`Eliminare la consegna di ${s.studentName}?`)) return;
    submissions = submissions.filter(x => x.id !== id);
    saveJson(SUBMISSIONS_KEY, submissions);
    renderSubmissions();
  }

  function submissionReport(s) {
    const lines = [
      'COMPITOCHECK AI — CONSEGNA STUDENTE',
      '===================================',
      `Studente: ${s.studentName}`,
      `Prova: ${s.examTitle}`,
      `Classe: ${s.className || '-'}`,
      `Codice prova: ${s.examCode}`,
      `Data consegna: ${new Date(s.submittedAt).toLocaleString('it-IT')}`,
      `Durata: ${formatElapsed(s.durationMs)}`,
      `Digitato: ${s.typedPct}% (${s.typedChars} caratteri)`,
      `Incollato: ${s.pastedPct}% (${s.pastedChars} caratteri)`,
      `Cancellazioni stimate: ${s.deletedChars}`,
      `Indicatore IA: ${s.aiScore}%`,
      `Livello inglese: ${s.cefr || 'N/D'}`,
      `Voto indicativo: ${s.grades?.voto?.toFixed ? s.grades.voto.toFixed(1) + '/10' : 'N/D'}`,
      '',
      'TESTO',
      s.text,
      '',
      'CRONOLOGIA'
    ];
    (s.events || []).forEach(ev => lines.push(`${formatElapsed(ev.elapsed)} — ${ev.message}`));
    lines.push('', 'NOTA: questi dati sono indicatori di supporto e non costituiscono prova automatica dell’uso di IA.');
    return lines.join('\n');
  }

  function exportSubmission(id) {
    const s = submissions.find(x => x.id === id);
    if (!s) return;
    const blob = new Blob([submissionReport(s)], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consegna-${s.studentName.toLowerCase().replace(/[^a-z0-9à-ÿ]+/gi,'-') || 'studente'}-${s.examCode}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportAllSubmissions() {
    const lines = ['COMPITOCHECK AI — REGISTRO CONSEGNE','================================',''];
    submissions.slice().sort((a,b)=>new Date(a.submittedAt)-new Date(b.submittedAt)).forEach((s,i) => {
      lines.push(`${i+1}. ${s.studentName} | ${s.examTitle} | ${new Date(s.submittedAt).toLocaleString('it-IT')} | IA ${s.aiScore}% | incollato ${s.pastedPct}% | durata ${formatElapsed(s.durationMs)}`);
    });
    if (!submissions.length) lines.push('Nessuna consegna.');
    const blob = new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compitocheck-registro-consegne.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }


  function nowMs() { return Date.now(); }

  function formatElapsed(ms) {
    const sec = Math.max(0, Math.floor(ms / 1000));
    const m = String(Math.floor(sec / 60)).padStart(2,'0');
    const s = String(sec % 60).padStart(2,'0');
    return `${m}:${s}`;
  }

  function sessionElapsed() {
    if (!classroom.startedAt) return 0;
    if (classroom.state === 'running') return classroom.elapsedBeforePause + (nowMs() - classroom.startedAt);
    return classroom.elapsedBeforePause;
  }

  function addClassroomEvent(type, message, extra = {}) {
    const event = {
      type,
      message,
      at: new Date().toISOString(),
      elapsed: sessionElapsed(),
      ...extra
    };
    classroom.events.push(event);
    if (classroom.events.length > 250) classroom.events.shift();
    renderClassroom();
  }

  function setSessionState(state) {
    classroom.state = state;
    els.sessionState.className = `status-dot ${state === 'running' ? 'running' : state === 'paused' ? 'paused' : state === 'finished' ? 'finished' : 'idle'}`;
    els.sessionState.textContent =
      state === 'running' ? 'Sessione in corso' :
      state === 'paused' ? 'Sessione in pausa' :
      state === 'finished' ? 'Sessione terminata' : 'Non avviata';

    els.startSessionBtn.disabled = state === 'running' || state === 'paused';
    els.pauseSessionBtn.disabled = !(state === 'running' || state === 'paused');
    els.pauseSessionBtn.textContent = state === 'paused' ? 'Riprendi' : 'Pausa';
    els.finishSessionBtn.disabled = !(state === 'running' || state === 'paused');
    els.exportSessionBtn.disabled = classroom.events.length === 0;
  }

  function startSession() {
    if (classroom.state === 'running' || classroom.state === 'paused') return;
    classroom = {
      state: 'running',
      startedAt: nowMs(),
      elapsedBeforePause: 0,
      pauseStartedAt: null,
      timerId: classroom.timerId,
      typedChars: 0,
      pastedChars: 0,
      deletedChars: 0,
      longPauses: 0,
      events: [],
      lastInputAt: nowMs(),
      lastValue: els.essayText.value || '',
      pasteGuard: false
    };
    setSessionState('running');
    addClassroomEvent('start', 'Sessione avviata');
    clearInterval(classroom.timerId);
    classroom.timerId = setInterval(() => {
      if (classroom.state === 'running') els.sessionTimer.textContent = formatElapsed(sessionElapsed());
    }, 1000);
    renderClassroom();
  }

  function togglePauseSession() {
    if (classroom.state === 'running') {
      classroom.elapsedBeforePause += nowMs() - classroom.startedAt;
      classroom.startedAt = null;
      classroom.state = 'paused';
      addClassroomEvent('pause', 'Sessione messa in pausa');
      setSessionState('paused');
    } else if (classroom.state === 'paused') {
      classroom.startedAt = nowMs();
      classroom.lastInputAt = nowMs();
      classroom.state = 'running';
      addClassroomEvent('resume', 'Sessione ripresa');
      setSessionState('running');
    }
    renderClassroom();
  }

  function finishSession() {
    if (classroom.state === 'running') {
      classroom.elapsedBeforePause += nowMs() - classroom.startedAt;
      classroom.startedAt = null;
    }
    if (classroom.state === 'running' || classroom.state === 'paused') {
      classroom.state = 'finished';
      addClassroomEvent('finish', 'Sessione terminata');
      setSessionState('finished');
      clearInterval(classroom.timerId);
      classroom.timerId = null;
      renderClassroom();
    }
  }

  function resetSession() {
    clearInterval(classroom.timerId);
    classroom = {
      state:'idle', startedAt:null, elapsedBeforePause:0, pauseStartedAt:null, timerId:null,
      typedChars:0, pastedChars:0, deletedChars:0, longPauses:0, events:[],
      lastInputAt:null, lastValue:els.essayText.value || '', pasteGuard:false
    };
    setSessionState('idle');
    renderClassroom();
  }

  function recordLongPauseIfNeeded() {
    if (classroom.state !== 'running' || !classroom.lastInputAt) return;
    const gap = nowMs() - classroom.lastInputAt;
    if (gap >= 20000) {
      classroom.longPauses++;
      addClassroomEvent('pause', `Pausa di ${Math.round(gap/1000)} secondi prima della ripresa`);
    }
  }

  function onEssayBeforeInput(e) {
    if (classroom.state !== 'running') return;
    recordLongPauseIfNeeded();

    const type = e.inputType || '';
    if (type.startsWith('delete')) {
      const selectionLen = Math.max(0, els.essayText.selectionEnd - els.essayText.selectionStart);
      classroom.deletedChars += Math.max(1, selectionLen);
    }
    classroom.lastInputAt = nowMs();
  }

  function onEssayInput(e) {
    if (classroom.state !== 'running') return;
    const current = els.essayText.value;
    const prev = classroom.lastValue || '';
    const delta = current.length - prev.length;

    if (!classroom.pasteGuard && delta > 0) {
      classroom.typedChars += delta;
      if (delta >= 80) {
        addClassroomEvent('burst', `Inserimento rapido di ${delta} caratteri`);
      }
    }
    classroom.lastValue = current;
    classroom.lastInputAt = nowMs();
    classroom.pasteGuard = false;
    renderClassroom();
  }

  function onEssayPaste(e) {
    if (classroom.state !== 'running') return;
    recordLongPauseIfNeeded();
    const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    const len = pasted.length;
    classroom.pastedChars += len;
    classroom.pasteGuard = true;
    classroom.lastInputAt = nowMs();
    addClassroomEvent('paste', `Incollati ${len} caratteri`, {chars:len});
    setTimeout(() => {
      classroom.lastValue = els.essayText.value;
      classroom.pasteGuard = false;
      renderClassroom();
    }, 0);
  }

  function renderClassroom() {
    if (!els.classroomPanel) return;
    els.classroomPanel.hidden = !els.classroomToggle.checked;
    setSessionState(classroom.state);
    els.sessionTimer.textContent = formatElapsed(sessionElapsed());
    els.typedChars.textContent = classroom.typedChars;
    els.pastedChars.textContent = classroom.pastedChars;
    els.deletedChars.textContent = classroom.deletedChars;
    els.longPauses.textContent = classroom.longPauses;

    const total = classroom.typedChars + classroom.pastedChars;
    const tp = total ? Math.round(classroom.typedChars / total * 100) : 0;
    const pp = total ? 100 - tp : 0;
    els.typedPct.textContent = `${tp}%`;
    els.pastedPct.textContent = `${pp}%`;
    els.typedPctMeter.style.width = `${tp}%`;
    els.pastedPctMeter.style.width = `${pp}%`;

    if (!total) {
      els.pasteAssessment.textContent = 'Nessun dato di scrittura ancora disponibile.';
    } else if (pp >= 60) {
      els.pasteAssessment.textContent = 'Quota di testo incollato molto elevata: verificare l’origine del contenuto.';
    } else if (pp >= 25) {
      els.pasteAssessment.textContent = 'È presente una quota significativa di testo incollato.';
    } else if (pp > 0) {
      els.pasteAssessment.textContent = 'Sono stati rilevati alcuni incolla, ma la maggior parte del testo risulta digitata.';
    } else {
      els.pasteAssessment.textContent = 'Nessun testo incollato rilevato durante la sessione.';
    }

    if (!classroom.events.length) {
      els.eventTimeline.innerHTML = '<div class="timeline-empty">La cronologia comparirà qui durante la sessione.</div>';
    } else {
      els.eventTimeline.innerHTML = classroom.events.slice().reverse().map(ev => {
        const cls = ev.type === 'paste' ? 'paste' : ev.type === 'pause' ? 'pause' : '';
        return `<div class="timeline-item ${cls}">
          <span class="timeline-time">${formatElapsed(ev.elapsed)}</span>
          <span class="timeline-text">${escapeHtml(ev.message)}</span>
        </div>`;
      }).join('');
    }
    els.exportSessionBtn.disabled = classroom.events.length === 0;
  }

  function exportSession() {
    if (!classroom.events.length) return;
    const student = currentStudent()?.name || 'studente';
    const total = classroom.typedChars + classroom.pastedChars;
    const typedPct = total ? Math.round(classroom.typedChars/total*100) : 0;
    const pastedPct = total ? 100-typedPct : 0;

    const lines = [
      'COMPITOCHECK AI — CRONOLOGIA COMPITO IN CLASSE',
      '==============================================',
      `Studente: ${student}`,
      `Durata: ${formatElapsed(sessionElapsed())}`,
      `Caratteri digitati: ${classroom.typedChars}`,
      `Caratteri incollati: ${classroom.pastedChars}`,
      `Percentuale digitata: ${typedPct}%`,
      `Percentuale incollata: ${pastedPct}%`,
      `Cancellazioni stimate: ${classroom.deletedChars}`,
      `Pause oltre 20 secondi: ${classroom.longPauses}`,
      '',
      'CRONOLOGIA'
    ];
    classroom.events.forEach(ev => lines.push(`${formatElapsed(ev.elapsed)} — ${ev.message}`));
    lines.push('', 'NOTA: la cronologia documenta il processo di scrittura ma, da sola, non dimostra l’uso di strumenti di intelligenza artificiale.');

    const blob = new Blob([lines.join('\n')], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compitocheck-sessione-${student.toLowerCase().replace(/[^a-z0-9à-ÿ]+/gi,'-') || 'studente'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }


  function exportReport() {
    if (!lastAnalysis) return;
    const student = currentStudent()?.name || 'studente';
    const safe = student.toLowerCase().replace(/[^a-z0-9à-ÿ]+/gi,'-').replace(/^-|-$/g,'') || 'studente';
    const blob = new Blob([els.reportText.value], {type:'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compitocheck-${safe}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  els.newStudentBtn.addEventListener('click', () => {
    els.studentName.value = '';
    els.studentDialog.showModal();
    setTimeout(()=>els.studentName.focus(),30);
  });

  els.cancelStudentBtn.addEventListener('click', () => {
    els.studentDialog.close();
  });

  els.studentDialog.addEventListener('click', (e) => {
    if (e.target === els.studentDialog) els.studentDialog.close();
  });

  els.studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = els.studentName.value.trim();
    if (!name) return;
    const s = {id:uid(), name, references:[], createdAt:new Date().toISOString()};
    students.push(s);
    saveStudents();
    renderStudentSelect(s.id);
    els.studentDialog.close();
  });

  els.deleteStudentBtn.addEventListener('click', () => {
    const s = currentStudent();
    if (!s) return showValidation('Nessuno studente selezionato.');
    if (!confirm(`Eliminare "${s.name}" e tutti i suoi campioni?`)) return;
    students = students.filter(x => x.id !== s.id);
    saveStudents();
    renderStudentSelect();
  });

  els.studentSelect.addEventListener('change', renderStudentInfo);
  els.saveReferenceBtn.addEventListener('click', () => addReference(els.referenceText.value));
  els.saveAsReferenceBtn.addEventListener('click', () => addReference(els.essayText.value));
  els.manageReferencesBtn.addEventListener('click', () => {
    renderReferences();
    els.referencesDialog.showModal();
  });
  els.closeReferencesBtn.addEventListener('click', () => els.referencesDialog.close());

  els.essayCameraBtn.addEventListener('click', () => openCamera('essay'));
  els.referenceCameraBtn.addEventListener('click', () => openCamera('reference'));

  els.capturePhotoBtn.addEventListener('click', captureCameraFrame);
  els.retakePhotoBtn.addEventListener('click', retakeCameraPhoto);
  els.usePhotoBtn.addEventListener('click', useCapturedPhoto);
  els.fallbackPhotoBtn.addEventListener('click', openFallbackImagePicker);
  els.closeCameraBtn.addEventListener('click', closeCameraDialog);

  els.cameraDialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeCameraDialog();
  });

  els.cameraDialog.addEventListener('click', (e) => {
    if (e.target === els.cameraDialog) closeCameraDialog();
  });


  els.fileInput.addEventListener('change', async () => {
    await handleDocumentFile(
      els.fileInput.files?.[0],
      els.essayText,
      els.fileName,
      els.essayOcrStatus
    );
    els.fileInput.value = '';
  });

  els.essayPhotoInput.addEventListener('change', async () => {
    const file = els.essayPhotoInput.files?.[0];
    if (file) {
      els.fileName.textContent = file.name || 'Foto acquisita';
      await recognizePhoto(file, els.essayText, els.essayOcrStatus, ocrLanguageForEssay());
    }
    els.essayPhotoInput.value = '';
  });

  els.referenceFileInput.addEventListener('change', async () => {
    await handleDocumentFile(
      els.referenceFileInput.files?.[0],
      els.referenceText,
      els.referenceFileName,
      els.referenceOcrStatus
    );
    els.referenceFileInput.value = '';
  });

  els.referencePhotoInput.addEventListener('change', async () => {
    const file = els.referencePhotoInput.files?.[0];
    if (file) {
      els.referenceFileName.textContent = file.name || 'Foto acquisita';
      await recognizePhoto(file, els.referenceText, els.referenceOcrStatus, 'ita+eng');
    }
    els.referencePhotoInput.value = '';
  });
  els.analyzeBtn.addEventListener('click', analyze);
  els.clearBtn.addEventListener('click', () => {
    els.essayText.value = '';
    els.fileInput.value = '';
    els.fileName.textContent = 'Nessun file caricato';
    setOcrStatus(els.essayOcrStatus, '');
    els.results.hidden = true;
    lastAnalysis = null;
    showValidation('', false);
  });
  els.exportBtn.addEventListener('click', exportReport);

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    els.installBtn.hidden = false;
  });
  els.installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    els.installBtn.hidden = true;
  });



  els.teacherModeBtn.addEventListener('click', () => switchMode('teacher'));
  els.studentModeBtn.addEventListener('click', () => switchMode('student'));

  els.createExamBtn.addEventListener('click', createExam);
  els.closeExamBtn.addEventListener('click', closeExam);
  els.exportAllSubmissionsBtn.addEventListener('click', exportAllSubmissions);

  els.joinExamBtn.addEventListener('click', joinExam);
  els.studentEssay.addEventListener('beforeinput', studentBeforeInput);
  els.studentEssay.addEventListener('input', studentInput);
  els.studentEssay.addEventListener('paste', studentPaste);
  els.submitExamBtn.addEventListener('click', submitExam);
  els.leaveExamBtn.addEventListener('click', leaveExam);
  els.studentNewSessionBtn.addEventListener('click', studentResetAccess);


  els.classroomToggle.addEventListener('change', () => {
    els.classroomPanel.hidden = !els.classroomToggle.checked;
    renderClassroom();
  });
  els.startSessionBtn.addEventListener('click', startSession);
  els.pauseSessionBtn.addEventListener('click', togglePauseSession);
  els.finishSessionBtn.addEventListener('click', finishSession);
  els.resetSessionBtn.addEventListener('click', () => {
    if (classroom.events.length && !confirm('Azzerare tutta la cronologia della sessione?')) return;
    resetSession();
  });
  els.exportSessionBtn.addEventListener('click', exportSession);

  els.essayText.addEventListener('beforeinput', onEssayBeforeInput);
  els.essayText.addEventListener('input', onEssayInput);
  els.essayText.addEventListener('paste', onEssayPaste);


  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }

  renderStudentSelect();
  renderClassroom();
  renderActiveExam();
  renderSubmissions();
  switchMode('teacher');
})();
