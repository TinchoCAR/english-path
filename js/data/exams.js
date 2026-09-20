/* ============================================================
   data/exams.js — Modo Examen (pruebas del colegio)

   AISLADO A PROPÓSITO del progreso real:
   - Guarda en su propia clave ('exams'), no toca 'profile' ni 'srs'.
   - No da XP, no mueve la racha, no aprueba unidades, no escribe
     en el historial ni en el sistema de repetición espaciada.
   Lo único que comparte con el resto de la app es el motor de
   preguntas y la sincronización entre dispositivos.
   ============================================================ */
window.App = window.App || {};

(function (App) {
  'use strict';
  const { store, todayKey, daysBetween } = App.core;

  const KEY = 'exams';

  function all() {
    const list = store.get(KEY, []);
    return Array.isArray(list) ? list : [];
  }

  function save(list) { store.set(KEY, list); }

  function byId(id) { return all().find((e) => e.id === id) || null; }

  function newId() {
    return 'ex' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }

  /* ---------- Validación de un pack ----------
     El contenido puede venir de la IA o pegado a mano, así que
     nada se da por sentado: se filtra a lo que realmente sirve. */

  function cleanVocab(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map((v) => {
      // Acepta ["word","traducción","ejemplo"] o {en, es, example}
      if (Array.isArray(v)) return { en: String(v[0] || '').trim(), es: String(v[1] || '').trim(), example: String(v[2] || '').trim() };
      if (v && typeof v === 'object') {
        return {
          en: String(v.en || v.word || '').trim(),
          es: String(v.es || v.translation || '').trim(),
          example: String(v.example || '').trim(),
        };
      }
      return null;
    }).filter((v) => v && v.en && v.es);
  }

  function cleanQuestions(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map((q) => {
      if (!q || typeof q !== 'object') return null;
      const prompt = String(q.prompt || q.q || '').trim();
      if (!prompt) return null;

      const kind = q.kind || q.t ||
        (Array.isArray(q.options || q.o) ? 'choice' : Array.isArray(q.words || q.w) ? 'order' : 'text');

      if (kind === 'choice') {
        const options = (q.options || q.o || []).map((x) => String(x)).filter((x) => x.trim());
        const correct = Number(q.correct !== undefined ? q.correct : q.a);
        if (options.length < 2 || !Number.isInteger(correct) || correct < 0 || correct >= options.length) return null;
        // Opciones repetidas hacen la pregunta ambigua
        if (new Set(options.map((o) => o.toLowerCase().trim())).size !== options.length) return null;
        return { kind: 'choice', prompt, options, correct, why: String(q.why || '').trim() || undefined };
      }

      if (kind === 'order') {
        const words = (q.words || q.w || []).map((x) => String(x).trim()).filter(Boolean);
        const answer = String(q.answer || q.a || '').trim();
        if (words.length < 3 || !answer) return null;
        // Las fichas tienen que poder reconstruir la respuesta
        const norm = (s) => App.core.normalize(s);
        const fichas = words.map(norm).filter(Boolean).sort().join('|');
        const resp = norm(answer).split(' ').filter(Boolean).sort().join('|');
        if (fichas !== resp) return null;
        return { kind: 'order', prompt: prompt || 'Ordená las palabras:', words, answer };
      }

      const accepted = Array.isArray(q.accepted || q.a) ? (q.accepted || q.a).map((x) => String(x).trim()).filter(Boolean)
        : (q.accepted || q.a ? [String(q.accepted || q.a).trim()] : []);
      if (!accepted.length) return null;
      return {
        kind: 'text', prompt, accepted,
        hint: String(q.hint || '').trim() || undefined,
        instruction: String(q.instruction || q.ins || '').trim() || undefined,
        why: String(q.why || '').trim() || undefined,
      };
    }).filter(Boolean);
  }

  /* Convierte cualquier pack (de la IA, pegado a mano o importado)
     en un examen válido. Devuelve { ok, exam, errors } */
  function parsePack(input) {
    let data = input;
    if (typeof input === 'string') {
      const txt = input.trim();
      if (!txt) return { ok: false, errors: ['No pegaste nada.'] };
      // Tolera que venga envuelto en ```json ... ```
      const m = txt.match(/\{[\s\S]*\}/);
      try { data = JSON.parse(m ? m[0] : txt); }
      catch (e) { return { ok: false, errors: ['Eso no es un pack válido: el texto no es JSON.'] }; }
    }
    if (!data || typeof data !== 'object') return { ok: false, errors: ['El pack está vacío.'] };

    const errors = [];
    const name = String(data.name || data.title || '').trim() || 'Examen sin nombre';
    const topics = Array.isArray(data.topics) ? data.topics.map((t) => String(t).trim()).filter(Boolean)
      : String(data.topics || '').split(/[,;\n]/).map((t) => t.trim()).filter(Boolean);

    const vocab = cleanVocab(data.vocab);
    const questions = cleanQuestions(data.questions);

    const vDrop = (Array.isArray(data.vocab) ? data.vocab.length : 0) - vocab.length;
    const qDrop = (Array.isArray(data.questions) ? data.questions.length : 0) - questions.length;
    if (vDrop > 0) errors.push(`${vDrop} palabra(s) se descartaron por estar incompletas.`);
    if (qDrop > 0) errors.push(`${qDrop} pregunta(s) se descartaron por estar mal formadas.`);

    if (!vocab.length && !questions.length) {
      return { ok: false, errors: ['El pack no trae ni vocabulario ni preguntas utilizables.'] };
    }

    let date = String(data.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) date = '';

    return {
      ok: true,
      errors,
      exam: {
        id: newId(),
        name, date, topics,
        notes: String(data.notes || '').trim(),
        vocab, questions,
        createdAt: todayKey(),
        stats: { plays: 0, best: {}, lastPlayed: null },
      },
    };
  }

  /* ---------- CRUD ---------- */

  function add(exam) {
    const list = all();
    list.unshift(exam);
    save(list);
    return exam;
  }

  function update(id, patch) {
    const list = all();
    const i = list.findIndex((e) => e.id === id);
    if (i < 0) return null;
    list[i] = Object.assign({}, list[i], patch);
    save(list);
    return list[i];
  }

  function remove(id) {
    save(all().filter((e) => e.id !== id));
  }

  /* Registra el resultado de un juego. Sólo dentro del examen:
     nunca sale de acá hacia el progreso general. */
  function recordPlay(id, game, score) {
    const ex = byId(id);
    if (!ex) return null;
    const stats = Object.assign({ plays: 0, best: {}, lastPlayed: null }, ex.stats);
    stats.plays += 1;
    stats.lastPlayed = todayKey();
    const prev = stats.best[game];
    const pct = score.total ? score.correct / score.total : 0;
    if (prev === undefined || pct > prev) stats.best[game] = pct;
    return update(id, { stats });
  }

  /* Días que faltan para la prueba (null si no tiene fecha) */
  function daysLeft(exam) {
    if (!exam.date) return null;
    return daysBetween(todayKey(), exam.date);
  }

  /* Ordena: primero los que se vienen, después los pasados */
  function sorted() {
    return all().slice().sort((a, b) => {
      const da = daysLeft(a), db = daysLeft(b);
      const fa = da === null ? 9999 : (da < 0 ? 5000 - da : da);
      const fb = db === null ? 9999 : (db < 0 ? 5000 - db : db);
      return fa - fb;
    });
  }

  /* ---------- Generar preguntas a partir del vocabulario ----------
     Si el pack sólo trae palabras, igual podemos armar un cuestionario. */
  function questionsFromVocab(exam, rng, count) {
    const v = exam.vocab || [];
    if (v.length < 4) return [];
    return rng.sample(v, Math.min(count || 10, v.length)).map((item) => {
      const otras = rng.sample(v.filter((x) => x.en !== item.en), 3).map((x) => x.es);
      const options = rng.shuffle([item.es].concat(otras));
      return {
        kind: 'choice',
        prompt: `¿Qué significa "${item.en}"?`,
        options,
        correct: options.indexOf(item.es),
      };
    });
  }

  /* Todas las preguntas disponibles: las del pack más las derivadas */
  function allQuestions(exam, rng) {
    const propias = (exam.questions || []).slice();
    if (propias.length >= 8) return rng ? rng.shuffle(propias) : propias;
    const extra = rng ? questionsFromVocab(exam, rng, 10 - propias.length) : [];
    return (rng || { shuffle: (x) => x }).shuffle(propias.concat(extra));
  }

  App.exams = {
    KEY,
    all, sorted, byId, add, update, remove, save,
    parsePack, cleanVocab, cleanQuestions,
    recordPlay, daysLeft, questionsFromVocab, allQuestions, newId,
  };
})(window.App);
