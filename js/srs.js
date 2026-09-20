/* ============================================================
   srs.js — Repetición espaciada (variante de SM-2)
   Cada palabra tiene un intervalo que crece si la recordás y
   se reinicia si la olvidás. Así repasás justo antes de olvidar.
   ============================================================ */
(function (App) {
  'use strict';
  const { store, todayKey, addDays, daysBetween, clamp } = App.core;

  const MASTERED_INTERVAL = 21;   // días: a partir de acá se considera "dominada"
  const EASE_MIN = 1.3, EASE_MAX = 2.8, EASE_START = 2.5;

  function deck() { return store.get('srs', {}); }
  function saveDeck(d) { store.set('srs', d); }

  function newCard() {
    return { ease: EASE_START, interval: 0, due: todayKey(), reps: 0, lapses: 0, seen: 0 };
  }

  function getCard(id) {
    const d = deck();
    return d[id] || null;
  }

  /* grade: 'again' | 'hard' | 'good' | 'easy' */
  function review(id, grade) {
    const d = deck();
    const c = d[id] || newCard();
    c.seen += 1;

    if (grade === 'again') {
      c.lapses += 1;
      c.reps = 0;
      c.interval = 0;                       // vuelve a aparecer en la misma sesión
      c.ease = clamp(c.ease - 0.2, EASE_MIN, EASE_MAX);
      c.due = todayKey();
    } else {
      if (grade === 'hard') c.ease = clamp(c.ease - 0.15, EASE_MIN, EASE_MAX);
      if (grade === 'easy') c.ease = clamp(c.ease + 0.15, EASE_MIN, EASE_MAX);

      c.reps += 1;
      if (c.reps === 1) c.interval = grade === 'easy' ? 2 : 1;
      else if (c.reps === 2) c.interval = grade === 'hard' ? 2 : 4;
      else c.interval = Math.max(1, Math.round(c.interval * c.ease * (grade === 'hard' ? 0.7 : 1)));

      c.interval = Math.min(c.interval, 365);
      c.due = addDays(todayKey(), c.interval);
    }

    c.lastReview = todayKey();
    d[id] = c;
    saveDeck(d);
    return c;
  }

  /* Tarjetas vencidas hoy (las que tocan repasar) */
  function dueToday() {
    const d = deck();
    const today = todayKey();
    return Object.keys(d)
      .filter((id) => daysBetween(d[id].due, today) >= 0)
      .map((id) => ({ id, card: d[id], item: App.vocab.byId(id) }))
      .filter((x) => x.item)
      .sort((a, b) => daysBetween(b.card.due, today) - daysBetween(a.card.due, today));
  }

  /* Palabras que nunca viste, filtradas por nivel y temas del perfil */
  function newPool(rng) {
    const p = App.state.get();
    const d = deck();
    // Incluye el nivel actual y el anterior (refuerzo), nunca dos por encima.
    const ladder = { A2: ['A2'], B1: ['A2', 'B1'], B2: ['B1', 'B2'] };
    const levels = ladder[p.level] || ['A2'];
    const topics = (p.topics && p.topics.length) ? p.topics.concat('core') : null;

    let pool = App.vocab.ITEMS.filter((it) =>
      !d[it.id] && levels.includes(it.level) && (!topics || topics.includes(it.topic))
    );
    // Si se agotó el pool filtrado, abrimos el criterio antes que quedarnos sin nada.
    if (pool.length < 5) {
      pool = App.vocab.ITEMS.filter((it) => !d[it.id] && levels.includes(it.level));
    }
    if (pool.length < 5) pool = App.vocab.ITEMS.filter((it) => !d[it.id]);
    return rng ? rng.shuffle(pool) : pool;
  }

  /* Mazo de la sesión: primero lo vencido, después palabras nuevas */
  function buildSession(size, rng) {
    const due = dueToday();
    const take = due.slice(0, size);
    const remaining = size - take.length;
    if (remaining > 0) {
      newPool(rng).slice(0, remaining).forEach((item) => {
        take.push({ id: item.id, card: null, item, isNew: true });
      });
    }
    return take;
  }

  function masteredCount() {
    const d = deck();
    return Object.values(d).filter((c) => c.interval >= MASTERED_INTERVAL).length;
  }

  function stats() {
    const d = deck();
    const all = Object.values(d);
    const learning = all.filter((c) => c.interval > 0 && c.interval < MASTERED_INTERVAL).length;
    return {
      total: all.length,
      mastered: masteredCount(),
      learning,
      due: dueToday().length,
      remaining: App.vocab.ITEMS.length - all.length,
      accuracy: all.length
        ? 1 - clamp(all.reduce((s, c) => s + c.lapses, 0) / Math.max(1, all.reduce((s, c) => s + c.seen, 0)), 0, 1)
        : 0,
    };
  }

  /* Palabras que más te cuestan — útiles para repasos dirigidos */
  function hardest(n) {
    const d = deck();
    return Object.keys(d)
      .map((id) => ({ id, card: d[id], item: App.vocab.byId(id) }))
      .filter((x) => x.item && x.card.lapses > 0)
      .sort((a, b) => b.card.lapses - a.card.lapses || a.card.ease - b.card.ease)
      .slice(0, n || 10);
  }

  App.srs = {
    MASTERED_INTERVAL,
    getCard, review, dueToday, newPool, buildSession,
    masteredCount, stats, hardest, deck,
  };
})(window.App);
