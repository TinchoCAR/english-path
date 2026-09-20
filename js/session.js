/* ============================================================
   session.js — Constructor de la sesión diaria
   La semilla es la fecha: si recargás la página seguís en la
   misma sesión, pero mañana el contenido es otro.
   ============================================================ */
(function (App) {
  'use strict';
  const { store, todayKey, weekdayOf, makeRng } = App.core;

  /* Rotación por día de la semana: nunca dos días iguales seguidos */
  const ROTATION = {
    1: 'reading',      // lunes
    2: 'listening',    // martes
    3: 'writing',      // miércoles
    4: 'speaking',     // jueves
    5: 'translation',  // viernes
    6: 'roleplay',     // sábado
    0: 'boss',         // domingo: repaso general
  };

  const BLOCK_META = {
    vocab: { title: 'Vocabulario', icon: '🧠', desc: 'Repaso espaciado de palabras', min: 6 },
    grammar: { title: 'Gramática', icon: '📐', desc: 'Teoría + práctica', min: 8 },
    reading: { title: 'Lectura', icon: '📖', desc: 'Texto y comprensión', min: 8 },
    listening: { title: 'Escucha', icon: '🎧', desc: 'Diálogo con audio', min: 8 },
    writing: { title: 'Escritura', icon: '✍️', desc: 'Redacción corregida por IA', min: 10 },
    speaking: { title: 'Pronunciación', icon: '🎤', desc: 'Hablar y que te escuche', min: 8 },
    translation: { title: 'Traducción', icon: '🔄', desc: 'Español → inglés contrarreloj', min: 7 },
    roleplay: { title: 'Conversación', icon: '💬', desc: 'Diálogo en vivo con la IA', min: 10 },
    boss: { title: 'Desafío semanal', icon: '⚔️', desc: 'Todo lo de la semana, mezclado', min: 10 },
  };

  // Para destrezas productivas (gramática, traducción) el nivel manda:
  // escribir mal una estructura que no dominás no enseña nada.
  function levelLadder(level) {
    return { A2: ['A2'], B1: ['A2', 'B1'], B2: ['B1', 'B2'] }[level] || ['A2'];
  }

  // Para destrezas receptivas (leer, escuchar) conviene un escalón por encima:
  // el input algo más difícil, con glosario y audio repetible, es lo que hace subir de nivel.
  function receptiveLadder(level) {
    return { A2: ['A2', 'B1'], B1: ['A2', 'B1', 'B2'], B2: ['B1', 'B2'] }[level] || ['A2'];
  }

  function pickByProfile(list, rng, p) {
    const levels = levelLadder(p.level);
    const topics = p.topics && p.topics.length ? p.topics.concat('core') : null;
    let pool = list.filter((x) => levels.includes(x.level) && (!topics || topics.includes(x.topic)));
    if (!pool.length) pool = list.filter((x) => levels.includes(x.level));
    if (!pool.length) pool = list;
    return rng.pick(pool);
  }

  /* --- Evita repetir el mismo material dos veces en pocos días --- */
  function recentlyUsed(kind) {
    return store.get('used.' + kind, []);
  }
  function markUsed(kind, id, keep) {
    const arr = recentlyUsed(kind).filter((x) => x !== id);
    arr.unshift(id);
    store.set('used.' + kind, arr.slice(0, keep || 6));
  }
  // kind receptivo ('reading' / 'listening') usa el rango ampliado.
  const RECEPTIVE = ['reading', 'listening'];

  function pickFresh(list, rng, p, kind) {
    const used = recentlyUsed(kind);
    const levels = RECEPTIVE.includes(kind) ? receptiveLadder(p.level) : levelLadder(p.level);
    const topics = p.topics && p.topics.length ? p.topics.concat('core') : null;

    let pool = list.filter((x) => levels.includes(x.level) && (!topics || topics.includes(x.topic)));
    if (!pool.length) pool = list.filter((x) => levels.includes(x.level));
    if (!pool.length) pool = list;

    const fresh = pool.filter((x) => !used.includes(x.id));
    return rng.pick(fresh.length ? fresh : pool);
  }

  /* ---------- Constructores de bloque ---------- */

  function buildVocab(rng, p, size) {
    const cards = App.srs.buildSession(size, rng);
    return { type: 'vocab', cards: cards.map((c) => ({ id: c.id, isNew: !!c.isNew })) };
  }

  function buildGrammar(rng, p, count) {
    const unit = App.state.nextUnit();
    if (!unit) return null;
    // Mezclamos el orden de los ejercicios para que no se memorice la secuencia.
    const idx = rng.shuffle(unit.exercises.map((_, i) => i)).slice(0, count);
    return { type: 'grammar', unitId: unit.id, exercises: idx };
  }

  function buildReading(rng, p) {
    const r = pickFresh(App.content.READINGS, rng, p, 'reading');
    markUsed('reading', r.id, 6);
    return { type: 'reading', readingId: r.id };
  }

  function buildListening(rng, p) {
    const d = pickFresh(App.content.DIALOGUES, rng, p, 'listening');
    markUsed('listening', d.id, 5);
    return { type: 'listening', dialogueId: d.id };
  }

  function buildWriting(rng, p) {
    const w = pickFresh(App.content.WRITING, rng, p, 'writing');
    markUsed('writing', w.id, 8);
    return { type: 'writing', promptId: w.id };
  }

  function buildSpeaking(rng, p) {
    const rp = pickFresh(App.content.ROLEPLAYS, rng, p, 'speaking');
    // Palabras para el drill de pronunciación: las que más te cuestan, o nuevas.
    const hard = App.srs.hardest(12).map((h) => h.item);
    const levels = levelLadder(p.level);
    const fallback = App.vocab.ITEMS.filter((v) => levels.includes(v.level));
    const words = rng.sample(hard.length >= 5 ? hard : fallback, 6).map((v) => v.id);
    markUsed('speaking', rp.id, 6);
    return { type: 'speaking', roleplayId: rp.id, words };
  }

  function buildTranslation(rng, p, count) {
    let pool = App.content.TRANSLATIONS.filter((t) => levelLadder(p.level).includes(t.level));
    // Si no alcanza, ampliamos UN escalón. Antes caíamos a todo el banco y a
    // un alumno de A2 le podían tocar traducciones de B2.
    if (pool.length < count) {
      const wider = receptiveLadder(p.level);
      pool = App.content.TRANSLATIONS.filter((t) => wider.includes(t.level));
    }
    const items = rng.sample(pool, Math.min(count, pool.length));
    return { type: 'translation', items: items.map((t) => App.content.TRANSLATIONS.indexOf(t)) };
  }

  function buildRoleplay(rng, p) {
    const rp = pickFresh(App.content.ROLEPLAYS, rng, p, 'roleplay');
    markUsed('roleplay', rp.id, 8);
    return { type: 'roleplay', roleplayId: rp.id };
  }

  /* Desafío semanal: mezcla de gramática ya vista, vocabulario y traducción */
  function buildBoss(rng, p) {
    const prof = App.state.get();
    const doneUnits = App.grammar.UNITS.filter((u) => prof.units[u.id] && prof.units[u.id].attempts > 0);
    const units = doneUnits.length ? doneUnits : App.grammar.byLevel(p.level).slice(0, 3);

    const qs = [];
    rng.sample(units, Math.min(4, units.length)).forEach((u) => {
      const ex = rng.pick(u.exercises);
      qs.push({ kind: 'grammar', unitId: u.id, exIndex: u.exercises.indexOf(ex) });
    });

    // Vocabulario: palabras ya vistas, en formato multiple choice
    const seen = Object.keys(App.srs.deck()).map((id) => App.vocab.byId(id)).filter(Boolean);
    const vocabPool = seen.length >= 4 ? seen : App.vocab.filter({ levels: levelLadder(p.level) });
    rng.sample(vocabPool, Math.min(4, vocabPool.length)).forEach((v) => {
      qs.push({ kind: 'vocab', id: v.id });
    });

    const levels = levelLadder(p.level);
    let tp = App.content.TRANSLATIONS.filter((t) => levels.includes(t.level));
    if (tp.length < 3) tp = App.content.TRANSLATIONS;
    rng.sample(tp, 3).forEach((t) => {
      qs.push({ kind: 'translation', index: App.content.TRANSLATIONS.indexOf(t) });
    });

    return { type: 'boss', questions: rng.shuffle(qs) };
  }

  /* ---------- Plan del día ---------- */

  /* override: { seed, skill } — lo usa el botón de rehacer la sesión para
     obtener contenido distinto del que ya salió hoy. */
  function buildPlan(dateKey, override) {
    const date = dateKey || todayKey();
    const p = App.state.get();
    const o = override || {};
    const rng = makeRng(o.seed || (date + '|' + p.level + '|' + (p.topics || []).join(',')));
    const mins = p.dailyMinutes || 25;

    // Cuántos bloques y de qué tamaño según el tiempo disponible
    const size = mins <= 15 ? 'S' : mins <= 30 ? 'M' : 'L';
    const cfg = {
      S: { vocab: 8, grammarEx: 4, translation: 5, extras: 0 },
      M: { vocab: 12, grammarEx: 6, translation: 8, extras: 1 },
      L: { vocab: 18, grammarEx: 6, translation: 10, extras: 2 },
    }[size];

    const blocks = [];
    blocks.push(buildVocab(rng, p, cfg.vocab));

    const g = buildGrammar(rng, p, cfg.grammarEx);
    if (g) blocks.push(g);

    const skill = o.skill || ROTATION[weekdayOf(date)];
    const builders = {
      reading: () => buildReading(rng, p),
      listening: () => buildListening(rng, p),
      writing: () => buildWriting(rng, p),
      speaking: () => buildSpeaking(rng, p),
      translation: () => buildTranslation(rng, p, cfg.translation),
      roleplay: () => buildRoleplay(rng, p),
      boss: () => buildBoss(rng, p),
    };
    blocks.push(builders[skill]());

    // Bloques extra para sesiones largas: se elige otro skill distinto al del día
    if (cfg.extras > 0) {
      const others = Object.keys(builders).filter((k) => k !== skill && k !== 'boss');
      rng.sample(others, cfg.extras).forEach((k) => blocks.push(builders[k]()));
    }

    return {
      date,
      size,
      skill,
      blocks: blocks.filter(Boolean).map((b, i) => ({ ...b, index: i, done: false, score: null })),
      createdAt: Date.now(),
    };
  }

  /* ---------- Persistencia de la sesión en curso ---------- */

  function current() {
    const saved = store.get('session', null);
    if (saved && saved.date === todayKey()) return saved;
    const plan = buildPlan();
    store.set('session', plan);
    return plan;
  }

  function save(plan) { store.set('session', plan); }

  function markBlockDone(index, score) {
    const s = current();
    if (s.blocks[index]) {
      s.blocks[index].done = true;
      s.blocks[index].score = score;
    }
    save(s);
    return s;
  }

  function progress() {
    const s = current();
    const done = s.blocks.filter((b) => b.done).length;
    return { done, total: s.blocks.length, complete: done === s.blocks.length, pct: done / s.blocks.length };
  }

  /* Regenera la sesión del día con contenido distinto.
     Hay que pasarle otra semilla Y otra destreza: con la semilla de la fecha
     el plan sale idéntico, que es justo lo que este botón promete evitar. */
  function reroll() {
    const actual = current();
    const rng = makeRng('reroll|' + Date.now());
    const otras = ['reading', 'listening', 'writing', 'speaking', 'translation', 'roleplay']
      .filter((x) => x !== actual.skill);
    const plan = buildPlan(todayKey(), {
      seed: 'reroll|' + todayKey() + '|' + Date.now(),
      skill: rng.pick(otras),
    });
    store.set('session', plan);
    return plan;
  }

  App.session = {
    ROTATION, BLOCK_META,
    buildPlan, current, save, markBlockDone, progress, reroll,
    levelLadder, receptiveLadder,
  };
})(window.App);
