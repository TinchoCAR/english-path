/* ============================================================
   state.js — Perfil, progreso, XP, racha, rangos y logros
   ============================================================ */
(function (App) {
  'use strict';
  const { store, todayKey, daysBetween, clamp } = App.core;

  /* ---------- Rangos (temática comercio internacional) ---------- */
  const RANKS = [
    { xp: 0, name: 'Intern', es: 'Pasante', icon: '📋' },
    { xp: 400, name: 'Junior Analyst', es: 'Analista Junior', icon: '📊' },
    { xp: 1200, name: 'Trade Assistant', es: 'Asistente de Comercio', icon: '📦' },
    { xp: 2600, name: 'Export Officer', es: 'Oficial de Exportación', icon: '🚢' },
    { xp: 4800, name: 'Account Manager', es: 'Ejecutivo de Cuentas', icon: '🤝' },
    { xp: 8000, name: 'Trade Manager', es: 'Gerente de Comercio', icon: '🧭' },
    { xp: 12500, name: 'Head of Exports', es: 'Jefe de Exportaciones', icon: '🏛️' },
    { xp: 18500, name: 'Trade Director', es: 'Director de Comercio', icon: '💼' },
    { xp: 27000, name: 'Global Strategist', es: 'Estratega Global', icon: '🌍' },
  ];

  /* ---------- Logros ---------- */
  const ACHIEVEMENTS = [
    { id: 'first_day', icon: '🌱', name: 'Primer paso', desc: 'Completaste tu primera sesión.' },
    { id: 'streak_3', icon: '🔥', name: 'Tres seguidos', desc: '3 días consecutivos.' },
    { id: 'streak_7', icon: '🔥', name: 'Semana perfecta', desc: '7 días consecutivos.' },
    { id: 'streak_30', icon: '🏆', name: 'Un mes sin fallar', desc: '30 días consecutivos.' },
    { id: 'streak_100', icon: '💎', name: 'Cien días', desc: '100 días consecutivos.' },
    { id: 'perfect', icon: '🎯', name: 'Sesión perfecta', desc: '100% de aciertos en una sesión.' },
    { id: 'vocab_50', icon: '📖', name: 'Cincuenta palabras', desc: '50 palabras dominadas.' },
    { id: 'vocab_150', icon: '📚', name: 'Ciento cincuenta', desc: '150 palabras dominadas.' },
    { id: 'grammar_a2', icon: '✅', name: 'A2 completo', desc: 'Todas las unidades A2 aprobadas.' },
    { id: 'grammar_b1', icon: '✅', name: 'B1 completo', desc: 'Todas las unidades B1 aprobadas.' },
    { id: 'grammar_b2', icon: '👑', name: 'B2 completo', desc: 'Todas las unidades B2 aprobadas.' },
    { id: 'writer', icon: '✍️', name: 'Redactor', desc: '10 textos escritos y corregidos.' },
    { id: 'speaker', icon: '🎤', name: 'Conversador', desc: '10 roleplays completados.' },
    { id: 'night_owl', icon: '🦉', name: 'Nocturno', desc: 'Estudiaste después de medianoche.' },
    { id: 'early_bird', icon: '🌅', name: 'Madrugador', desc: 'Estudiaste antes de las 7 a.m.' },
    { id: 'comeback', icon: '💪', name: 'Vuelta al ruedo', desc: 'Volviste tras romper una racha.' },
  ];

  const DEFAULT_PROFILE = {
    name: '',
    level: 'A2',            // nivel actual estimado
    target: 'B2',
    topics: ['business', 'pop', 'tech', 'sports'],
    dailyMinutes: 25,
    xp: 0,
    streak: 0,
    longestStreak: 0,
    lastStudyDay: null,
    startedOn: null,
    achievements: [],
    stats: { sessions: 0, correct: 0, answered: 0, writings: 0, roleplays: 0, minutes: 0 },
    units: {},              // { g01: { best: 0.83, done: true, attempts: 2 } }
    createdAt: null,
  };

  let profile = null;

  function load() {
    profile = Object.assign({}, DEFAULT_PROFILE, store.get('profile', {}));
    profile.stats = Object.assign({}, DEFAULT_PROFILE.stats, profile.stats || {});
    profile.units = profile.units || {};
    profile.achievements = profile.achievements || [];
    if (!profile.createdAt) {
      profile.createdAt = todayKey();
      profile.startedOn = todayKey();
    }
    return profile;
  }

  function get() { return profile || load(); }

  /* Vuelve a leer el perfil desde el almacenamiento, descartando la copia
     en memoria. Imprescindible después de sincronizar: si no, el perfil
     viejo que quedó cacheado pisaría lo que se acaba de bajar. */
  function reload() { profile = null; return load(); }

  function save() {
    store.set('profile', profile);
    // Marca de tiempo del último cambio local. La usa la sincronización
    // para decidir qué lado tiene las preferencias más recientes.
    store.set('sync.touchedAt', Date.now());
  }

  function update(patch) {
    Object.assign(get(), patch);
    save();
    return profile;
  }

  /* ---------- Rangos ---------- */
  function rankFor(xp) {
    let current = RANKS[0], next = null;
    for (let i = 0; i < RANKS.length; i++) {
      if (xp >= RANKS[i].xp) { current = RANKS[i]; next = RANKS[i + 1] || null; }
    }
    const span = next ? next.xp - current.xp : 1;
    const into = next ? xp - current.xp : 1;
    return { current, next, progress: next ? clamp(into / span, 0, 1) : 1, toNext: next ? next.xp - xp : 0 };
  }

  /* ---------- XP ---------- */
  function addXp(amount) {
    const p = get();
    const before = rankFor(p.xp).current.name;
    p.xp = Math.max(0, p.xp + Math.round(amount));
    const after = rankFor(p.xp).current;
    save();
    return { xp: p.xp, rankedUp: after.name !== before, rank: after };
  }

  /* ---------- Racha ---------- */
  // Devuelve info del cambio para poder mostrar el cartelito correcto.
  function touchStreak() {
    const p = get();
    const today = todayKey();
    if (p.lastStudyDay === today) return { changed: false, streak: p.streak, broken: false };

    let broken = false;
    if (!p.lastStudyDay) {
      p.streak = 1;
    } else {
      const gap = daysBetween(p.lastStudyDay, today);
      if (gap === 1) p.streak += 1;
      else if (gap > 1) { broken = p.streak >= 3; p.streak = 1; }
      else p.streak = Math.max(1, p.streak); // fecha rara (reloj cambiado)
    }
    p.lastStudyDay = today;
    p.longestStreak = Math.max(p.longestStreak || 0, p.streak);
    save();
    return { changed: true, streak: p.streak, broken };
  }

  // ¿Sigue viva la racha hoy? (sin modificarla)
  function streakStatus() {
    const p = get();
    const today = todayKey();
    if (!p.lastStudyDay) return { alive: false, doneToday: false, streak: 0 };
    const gap = daysBetween(p.lastStudyDay, today);
    return {
      alive: gap <= 1,
      doneToday: gap === 0,
      atRisk: gap === 1,     // estudiaste ayer: hoy hay que sostenerla
      streak: gap <= 1 ? p.streak : 0,
    };
  }

  /* ---------- Logros ---------- */
  function grant(id) {
    const p = get();
    if (p.achievements.includes(id)) return null;
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return null;
    p.achievements.push(id);
    save();
    return def;
  }

  // Revisa todos los logros basados en estado y devuelve los recién obtenidos.
  function checkAchievements(ctx) {
    const p = get();
    const got = [];
    const push = (id) => { const a = grant(id); if (a) got.push(a); };

    if (p.stats.sessions >= 1) push('first_day');
    if (p.streak >= 3) push('streak_3');
    if (p.streak >= 7) push('streak_7');
    if (p.streak >= 30) push('streak_30');
    if (p.streak >= 100) push('streak_100');
    if (p.stats.writings >= 10) push('writer');
    if (p.stats.roleplays >= 10) push('speaker');

    if (ctx && ctx.perfect) push('perfect');
    if (ctx && ctx.comeback) push('comeback');

    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) push('night_owl');
    if (hour >= 5 && hour < 7) push('early_bird');

    const mastered = App.srs ? App.srs.masteredCount() : 0;
    if (mastered >= 50) push('vocab_50');
    if (mastered >= 150) push('vocab_150');

    ['A2', 'B1', 'B2'].forEach((lvl) => {
      const units = App.grammar.byLevel(lvl);
      if (units.length && units.every((u) => p.units[u.id] && p.units[u.id].done)) {
        push('grammar_' + lvl.toLowerCase());
      }
    });

    return got;
  }

  /* ---------- Unidades de gramática ---------- */
  function recordUnit(unitId, accuracy) {
    const p = get();
    const prev = p.units[unitId] || { best: 0, done: false, attempts: 0 };
    prev.attempts += 1;
    prev.best = Math.max(prev.best, accuracy);
    if (accuracy >= 0.75) prev.done = true;
    prev.lastSeen = todayKey();
    p.units[unitId] = prev;
    save();
    return prev;
  }

  // Próxima unidad recomendada: la primera sin aprobar del nivel actual,
  // y si el nivel está completo, sube de nivel automáticamente.
  function nextUnit() {
    const p = get();
    const order = ['A2', 'B1', 'B2'];
    const startIdx = Math.max(0, order.indexOf(p.level));
    for (let i = startIdx; i < order.length; i++) {
      const pending = App.grammar.byLevel(order[i]).find((u) => !(p.units[u.id] && p.units[u.id].done));
      if (pending) {
        if (p.level !== order[i]) update({ level: order[i] });
        return pending;
      }
    }
    // Todo completo: repasamos la unidad con peor desempeño.
    return App.grammar.UNITS.slice().sort(
      (a, b) => (p.units[a.id]?.best || 0) - (p.units[b.id]?.best || 0)
    )[0];
  }

  /* ---------- Historial diario ---------- */
  function logDay(entry) {
    const hist = store.get('history', {});
    const k = todayKey();
    const prev = hist[k] || { xp: 0, correct: 0, answered: 0, minutes: 0, blocks: [] };
    hist[k] = {
      xp: prev.xp + (entry.xp || 0),
      correct: prev.correct + (entry.correct || 0),
      answered: prev.answered + (entry.answered || 0),
      minutes: prev.minutes + (entry.minutes || 0),
      blocks: prev.blocks.concat(entry.blocks || []),
    };
    store.set('history', hist);
    return hist[k];
  }

  function history() { return store.get('history', {}); }

  // Últimos n días como array para el gráfico de actividad.
  function recentDays(n) {
    const hist = history();
    const out = [];
    const today = todayKey();
    for (let i = n - 1; i >= 0; i--) {
      const k = App.core.addDays(today, -i);
      out.push({ date: k, ...(hist[k] || { xp: 0, correct: 0, answered: 0, minutes: 0 }) });
    }
    return out;
  }

  function resetAll() {
    store.remove('profile');
    store.remove('history');
    store.remove('srs');
    store.remove('session');
    store.remove('journal');
    profile = null;
    load();
  }

  App.state = {
    RANKS, ACHIEVEMENTS,
    load, get, reload, save, update,
    rankFor, addXp,
    touchStreak, streakStatus,
    grant, checkAchievements,
    recordUnit, nextUnit,
    logDay, history, recentDays,
    resetAll,
  };
})(window.App);
