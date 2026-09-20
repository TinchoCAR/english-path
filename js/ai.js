/* ============================================================
   ai.js — Cliente de Google Gemini + prompts del tutor
   La API key se guarda SOLO en el navegador (localStorage).
   Nunca se sube a GitHub ni sale hacia ningún otro servidor.
   ============================================================ */
(function (App) {
  'use strict';
  const { store } = App.core;

  const BASE = 'https://generativelanguage.googleapis.com/v1beta';
  const DEFAULT_MODEL = 'gemini-2.5-flash';

  /* ---------- Configuración ---------- */
  function getKey() { return store.get('ai.key', '') || ''; }
  function setKey(k) { store.set('ai.key', (k || '').trim()); }
  function hasKey() { return !!getKey(); }
  function clearKey() { store.remove('ai.key'); }

  function getModel() { return store.get('ai.model', DEFAULT_MODEL); }
  function setModel(m) { store.set('ai.model', m || DEFAULT_MODEL); }

  class AiError extends Error {
    constructor(message, code) { super(message); this.code = code; }
  }

  /* ---------- Llamada base ---------- */
  async function raw(path, options) {
    const key = getKey();
    if (!key) throw new AiError('No hay API key configurada.', 'NO_KEY');

    let res;
    try {
      res = await fetch(`${BASE}${path}${path.includes('?') ? '&' : '?'}key=${encodeURIComponent(key)}`, options);
    } catch (e) {
      throw new AiError('No se pudo conectar. ¿Tenés internet?', 'NETWORK');
    }

    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json())?.error?.message || ''; } catch (e) { /* noop */ }
      if (res.status === 400 && /API key not valid/i.test(detail)) {
        throw new AiError('La API key no es válida. Revisala en Ajustes.', 'BAD_KEY');
      }
      if (res.status === 429) {
        throw new AiError('Superaste el límite gratuito por ahora. Probá en unos minutos.', 'RATE_LIMIT');
      }
      if (res.status === 403) {
        throw new AiError('La key no tiene permiso para este modelo.', 'FORBIDDEN');
      }
      throw new AiError(detail || `Error ${res.status} del servidor de IA.`, 'HTTP_' + res.status);
    }
    return res.json();
  }

  /* ---------- Modelos disponibles (para el selector de Ajustes) ---------- */
  async function listModels() {
    const data = await raw('/models', { method: 'GET' });
    return (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => ({
        id: m.name.replace(/^models\//, ''),
        label: m.displayName || m.name,
      }))
      .filter((m) => /gemini/i.test(m.id));
  }

  /* ---------- Generación de texto ----------
     history: [{role:'user'|'model', text:'...'}]                       */
  async function chat(history, opts) {
    const o = opts || {};
    const body = {
      contents: history.map((h) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }],
      })),
      generationConfig: {
        temperature: o.temperature !== undefined ? o.temperature : 0.8,
        maxOutputTokens: o.maxTokens || 1200,
      },
    };
    if (o.system) body.systemInstruction = { parts: [{ text: o.system }] };
    if (o.json) {
      body.generationConfig.responseMimeType = 'application/json';
      body.generationConfig.temperature = o.temperature !== undefined ? o.temperature : 0.4;
    }

    const data = await raw(`/models/${encodeURIComponent(getModel())}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const cand = data.candidates && data.candidates[0];
    if (!cand) {
      const reason = data.promptFeedback?.blockReason;
      throw new AiError(reason ? `La IA bloqueó la respuesta (${reason}).` : 'La IA no devolvió respuesta.', 'EMPTY');
    }
    const text = (cand.content?.parts || []).map((p) => p.text || '').join('').trim();
    if (!text) throw new AiError('La IA devolvió una respuesta vacía.', 'EMPTY');
    return text;
  }

  async function chatJson(history, opts) {
    const text = await chat(history, Object.assign({}, opts, { json: true }));
    try {
      return JSON.parse(text);
    } catch (e) {
      // A veces envuelve el JSON en ```json ... ```
      const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (m) { try { return JSON.parse(m[0]); } catch (e2) { /* cae abajo */ } }
      throw new AiError('La IA devolvió un formato inesperado.', 'PARSE');
    }
  }

  /* ---------- Contexto del alumno para personalizar ---------- */
  function learnerContext() {
    const p = App.state.get();
    const s = App.srs.stats();
    const hard = App.srs.hardest(8).map((h) => h.item.en).join(', ');
    const weakUnits = App.grammar.UNITS
      .filter((u) => p.units[u.id] && !p.units[u.id].done)
      .slice(0, 3).map((u) => u.title).join('; ');

    return [
      `Perfil del alumno:`,
      `- Nombre: ${p.name || 'sin especificar'}`,
      `- Hispanohablante de Argentina (Buenos Aires), último año de secundaria.`,
      `- Estudiará Comercio Internacional el año próximo: el inglés de negocios le es prioritario.`,
      `- Nivel actual estimado: ${p.level}. Objetivo: ${p.target}.`,
      `- Intereses: ${(p.topics || []).join(', ') || 'generales'}.`,
      `- Palabras que más le cuestan: ${hard || 'todavía no hay datos'}.`,
      weakUnits ? `- Gramática pendiente: ${weakUnits}.` : '',
      `- Racha actual: ${p.streak} días. Vocabulario dominado: ${s.mastered}.`,
    ].filter(Boolean).join('\n');
  }

  const TUTOR_SYSTEM = `Sos un profesor de inglés experto, paciente y directo. Tu alumno es argentino y se prepara para estudiar Comercio Internacional.

Reglas de estilo:
- Explicás SIEMPRE en español rioplatense (usá "vos", no "tú"). Los ejemplos van en inglés.
- Sos concreto y breve. Nada de relleno ni de felicitaciones vacías.
- Cuando corregís, mostrás el error, el porqué, y la versión correcta.
- Comparás con el español cuando eso aclara el error (falsos amigos, calcos, orden de palabras).
- Si el alumno escribe algo bien, decilo en una línea y pasá a lo siguiente.
- Nunca inventes reglas gramaticales. Si algo es una cuestión de registro o uso, decilo así.`;

  /* ---------- Funciones específicas del curso ---------- */

  /* Corrección de un texto escrito */
  async function correctWriting(text, taskDescription, mustInclude) {
    const schema = `Devolvé JSON con esta forma exacta:
{
  "score": <número 0-100>,
  "level_estimate": "<A2|B1|B2|C1>",
  "summary": "<2 frases en español sobre el resultado general>",
  "corrections": [
    {"original":"<fragmento con error>","fixed":"<versión correcta>","why":"<explicación breve en español>","type":"<grammar|vocabulary|register|spelling|structure>"}
  ],
  "improved_version": "<el texto reescrito en inglés natural, manteniendo las ideas del alumno>",
  "next_focus": "<una sola cosa concreta a mejorar la próxima vez, en español>"
}`;

    return chatJson([{
      role: 'user',
      text: `${learnerContext()}

CONSIGNA DADA AL ALUMNO:
${taskDescription}
${mustInclude && mustInclude.length ? `Debía incluir: ${mustInclude.join(', ')}.` : ''}

TEXTO DEL ALUMNO:
"""
${text}
"""

Corregilo. Marcá como mucho las 6 correcciones más importantes: priorizá los errores que se repiten o que afectan la comprensión, no los detalles menores. ${schema}`,
    }], { system: TUTOR_SYSTEM, maxTokens: 2000 });
  }

  /* Generar ejercicios frescos sobre una unidad de gramática */
  async function generateExercises(unit, count) {
    const schema = `Devolvé JSON: {"exercises":[{"t":"choice","q":"<oración con ___>","o":["a","b","c"],"a":<índice correcto>,"why":"<explicación breve en español>"}]}
Podés usar también {"t":"fill","q":"<oración con ___>","a":["respuesta","variante aceptada"],"why":"..."}.`;

    const p = App.state.get();
    const data = await chatJson([{
      role: 'user',
      text: `${learnerContext()}

Generá ${count || 6} ejercicios NUEVOS sobre este punto gramatical:
Tema: ${unit.title} (${unit.titleEs})
Nivel: ${unit.level}

Requisitos:
- Contextos variados, mezclando: comercio internacional, ${(p.topics || []).join(', ')}.
- Que NO sean los ejemplos típicos de libro. Situaciones reales y concretas.
- Dificultad acorde al nivel ${unit.level}.
- Incluí al menos un distractor que apunte al error típico de un hispanohablante.
${schema}`,
    }], { system: TUTOR_SYSTEM, temperature: 1.0, maxTokens: 2000 });

    return (data.exercises || []).filter((e) =>
      e && e.q && (e.t === 'choice' ? Array.isArray(e.o) && typeof e.a === 'number' : Array.isArray(e.a))
    );
  }

  /* Generar un texto de lectura fresco */
  async function generateReading(topic, level) {
    const schema = `Devolvé JSON:
{"title":"<título en inglés>","text":"<texto de 150-220 palabras en inglés, 3-4 párrafos>",
 "glossary":[["<palabra en inglés>","<traducción al español>"]],
 "questions":[{"q":"<pregunta en inglés>","o":["<op1>","<op2>","<op3>"],"a":<índice correcto>}]}
Exactamente 6 entradas de glosario y 3 preguntas.`;

    return chatJson([{
      role: 'user',
      text: `${learnerContext()}

Escribí un texto de lectura original en inglés.
Tema: ${topic}
Nivel: ${level}

Requisitos:
- Interesante de verdad: un dato concreto, una tensión o una idea contraintuitiva. Nada de texto genérico de manual.
- Vocabulario acorde al nivel ${level}, pero con 5-6 palabras que estiren un poco al alumno.
- Si el tema lo permite, conectalo con comercio internacional o con Argentina.
${schema}`,
    }], { system: TUTOR_SYSTEM, temperature: 1.0, maxTokens: 2000 });
  }

  /* Roleplay conversacional: devuelve la respuesta del personaje + feedback */
  async function roleplayTurn(scenario, history, userMessage) {
    const sys = `${TUTOR_SYSTEM}

Estás haciendo un ROLEPLAY. Interpretás este personaje:
${scenario.ai}

Reglas del roleplay:
- Respondé EN INGLÉS, en personaje, 1-3 oraciones. Natural, no robótico.
- Ajustá la dificultad del inglés al nivel del alumno (${App.state.get().level}).
- Hacé avanzar la escena: preguntá, objetá, pedí precisiones. No seas pasivo.
- Después de tu respuesta en personaje, SI el alumno cometió un error importante,
  agregá una corrección breve en español.

Formato de salida JSON estricto:
{"reply":"<tu respuesta en inglés, en personaje>",
 "correction":"<corrección en español, o cadena vacía si no hace falta>",
 "tip":"<una expresión útil en inglés que podría usar en su próximo turno, o cadena vacía>"}`;

    const msgs = history.map((h) => ({ role: h.role, text: h.text }));
    msgs.push({ role: 'user', text: userMessage });

    return chatJson(msgs, { system: sys, temperature: 0.9, maxTokens: 800 });
  }

  /* Evaluar una traducción del alumno */
  async function checkTranslation(spanish, studentEnglish, accepted) {
    return chatJson([{
      role: 'user',
      text: `Frase en español: "${spanish}"
Traducción del alumno: "${studentEnglish}"
Traducciones de referencia: ${accepted.map((a) => `"${a}"`).join(', ')}

¿Es aceptable la traducción del alumno? Puede diferir de las referencias si es correcta y natural.
Devolvé JSON: {"ok":<true|false>,"feedback":"<explicación breve en español>","better":"<versión más natural en inglés, o cadena vacía si la suya ya está bien>"}`,
    }], { system: TUTOR_SYSTEM, temperature: 0.3, maxTokens: 600 });
  }

  /* Preguntas libres al tutor */
  async function ask(question, history) {
    const msgs = (history || []).slice(-10).map((h) => ({ role: h.role, text: h.text }));
    msgs.push({ role: 'user', text: question });
    return chat(msgs, {
      system: `${TUTOR_SYSTEM}\n\n${learnerContext()}\n\nRespondé la consulta del alumno. Si pide una regla, dala con 2-3 ejemplos en inglés y su traducción. Máximo 250 palabras.`,
      temperature: 0.7,
      maxTokens: 1200,
    });
  }

  /* Mensaje de bienvenida del día, personalizado */
  async function dailyBriefing() {
    const p = App.state.get();
    const st = App.srs.stats();
    const plan = App.session.current();
    const skill = App.session.BLOCK_META[plan.skill];

    return chat([{
      role: 'user',
      text: `${learnerContext()}

Hoy la sesión incluye: ${plan.blocks.map((b) => App.session.BLOCK_META[b.type].title).join(', ')}.
El bloque destacado del día es: ${skill ? skill.title : plan.skill}.
Tiene ${st.due} palabras para repasar.

Escribí un mensaje de apertura de 2 a 3 oraciones, en español rioplatense. Directo y con energía, sin exageraciones ni emojis. Mencioná algo concreto de hoy (el bloque destacado o las palabras pendientes). Si la racha es de 3 días o más, reconocelo en media línea.`,
    }], { system: TUTOR_SYSTEM, temperature: 1.0, maxTokens: 300 });
  }

  /* ---------- Modo Examen ----------
     Arma material de práctica a partir de los temas de una prueba
     del colegio. Devuelve un "pack" que la app valida antes de usar. */
  async function generateExamPack(opts) {
    const o = opts || {};
    const p = App.state.get();

    const esquema = `Devolvé JSON con EXACTAMENTE esta forma:
{
  "name": "<nombre corto de la prueba>",
  "topics": ["<tema 1>", "<tema 2>"],
  "notes": "<HTML simple con el repaso teórico: usá <p>, <b>, <code>, <ul>, <li>. Entre 120 y 220 palabras. En español rioplatense, con ejemplos en inglés.>",
  "vocab": [ ["<palabra en inglés>", "<traducción al español>", "<oración de ejemplo en inglés>"] ],
  "questions": [
    {"kind":"choice","prompt":"<oración con ___>","options":["a","b","c"],"correct":<índice>,"why":"<por qué, en español>"},
    {"kind":"text","prompt":"<oración con ___>","accepted":["respuesta","variante"],"hint":"<pista opcional>","why":"<explicación>"},
    {"kind":"order","prompt":"Ordená las palabras:","words":["las","palabras","sueltas"],"answer":"La oración correcta"}
  ]
}`;

    const reglas = `Reglas estrictas:
- 14 a 18 palabras en "vocab", todas del tema. Si el alumno pegó una lista de palabras, usá ESAS.
- 14 a 18 preguntas en "questions", mezclando los tres tipos ("choice", "text", "order").
- En "order", el array "words" debe contener EXACTAMENTE las palabras de "answer", ni una más ni una menos, desordenadas.
- En "choice" las opciones tienen que ser todas distintas, y los distractores deben ser el error típico de un hispanohablante.
- En "text", poné en "accepted" todas las variantes válidas (contracción y forma larga: "don't" y "do not").
- El nivel debe ser el de una prueba de secundaria argentina, no el de un examen internacional.
- Si el tema incluye gramática, que "notes" explique la regla con la comparación contra el español.`;

    const evitar = (o.avoid && o.avoid.length)
      ? `\nNO repitas estas consignas que ya existen:\n${o.avoid.map((x) => '- ' + x).join('\n')}`
      : '';

    return chatJson([{
      role: 'user',
      text: `${learnerContext()}

El alumno tiene una prueba de inglés EN EL COLEGIO y necesita practicar estos temas:

"""
${o.topics}
"""
${o.name ? `Nombre de la prueba: ${o.name}` : ''}
${o.date ? `Fecha: ${o.date}` : ''}
${evitar}

Armá el material de práctica. ${reglas}

${esquema}`,
    }], { system: TUTOR_SYSTEM, temperature: 0.9, maxTokens: 8000 });
  }

  /* Test de nivel adaptativo */
  async function generatePlacementTest() {
    return chatJson([{
      role: 'user',
      text: `Generá un test de nivel de inglés de 12 preguntas de opción múltiple, en dificultad creciente desde A1 hasta C1.
Contextos: vida cotidiana y comercio internacional.
Devolvé JSON: {"questions":[{"q":"<pregunta o frase con ___>","o":["a","b","c","d"],"a":<índice>,"level":"<A1|A2|B1|B2|C1>"}]}`,
    }], { system: TUTOR_SYSTEM, temperature: 0.9, maxTokens: 2500 });
  }

  App.ai = {
    AiError,
    getKey, setKey, hasKey, clearKey, getModel, setModel, DEFAULT_MODEL,
    listModels, chat, chatJson,
    learnerContext, TUTOR_SYSTEM,
    correctWriting, generateExercises, generateReading, roleplayTurn, generateExamPack,
    checkTranslation, ask, dailyBriefing, generatePlacementTest,
  };
})(window.App);
