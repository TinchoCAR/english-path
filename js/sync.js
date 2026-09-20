/* ============================================================
   sync.js — Sincronización entre dispositivos vía Gist privado

   Por qué un Gist: no hace falta servidor propio ni otra cuenta,
   y el archivo es privado. El token vive sólo en este navegador.

   Lo importante: NO pisa un lado con el otro. Fusiona campo por
   campo, quedándose siempre con el mejor progreso de cada uno.
   Así podés estudiar en el celular y seguir en la compu el mismo
   día sin perder nada.
   ============================================================ */
(function (App) {
  'use strict';
  const { store, todayKey, daysBetween } = App.core;

  const API = 'https://api.github.com';
  const FILENAME = 'english-path-progress.json';

  /* Claves que se sincronizan. El resto (token, API key, tema, voz)
     es propio de cada dispositivo y no viaja. */
  const SYNCED = [
    'profile', 'history', 'srs', 'journal', 'placement', 'onboarded',
    'session', 'tutor.history', 'exams',
    'used.reading', 'used.listening', 'used.writing', 'used.speaking', 'used.roleplay',
  ];

  /* ---------- Configuración ---------- */
  const getToken  = () => store.get('sync.token', '') || '';
  const setToken  = (t) => store.set('sync.token', (t || '').trim());
  const getGistId = () => store.get('sync.gist', '') || '';
  const setGistId = (id) => store.set('sync.gist', id || '');
  const isOn      = () => !!(getToken() && getGistId());
  const lastSync  = () => store.get('sync.last', null);

  function deviceName() {
    let d = store.get('sync.device', null);
    if (!d) {
      const ua = navigator.userAgent || '';
      const kind = /Android|iPhone|iPad|Mobile/i.test(ua) ? 'Celular' : 'Computadora';
      d = kind + ' · ' + Math.random().toString(36).slice(2, 6);
      store.set('sync.device', d);
    }
    return d;
  }

  function disable() {
    store.remove('sync.token');
    store.remove('sync.gist');
    store.remove('sync.last');
  }

  class SyncError extends Error {
    constructor(msg, code) { super(msg); this.code = code; }
  }

  /* ---------- Llamadas a GitHub ---------- */
  async function api(path, options) {
    const token = getToken();
    if (!token) throw new SyncError('No hay token configurado.', 'NO_TOKEN');

    let res;
    try {
      res = await fetch(API + path, Object.assign({}, options, {
        headers: Object.assign({
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        }, (options || {}).headers),
      }));
    } catch (e) {
      throw new SyncError('Sin conexión.', 'NETWORK');
    }

    if (res.status === 401) throw new SyncError('El token no es válido o expiró.', 'BAD_TOKEN');
    if (res.status === 403) throw new SyncError('El token no tiene permiso de Gists.', 'FORBIDDEN');
    if (res.status === 404) throw new SyncError('No se encontró el Gist. Puede que lo hayas borrado.', 'NOT_FOUND');
    if (!res.ok) {
      let msg = '';
      try { msg = (await res.json()).message || ''; } catch (e) { /* noop */ }
      throw new SyncError(msg || ('Error ' + res.status + ' de GitHub.'), 'HTTP_' + res.status);
    }
    return res.json();
  }

  /* ---------- Empaquetado ---------- */
  function localPayload() {
    const data = {};
    SYNCED.forEach((k) => {
      const v = store.get(k, undefined);
      if (v !== undefined) data[k] = v;
    });
    return {
      v: 1,
      device: deviceName(),
      touchedAt: store.get('sync.touchedAt', 0) || Date.now(),
      savedAt: Date.now(),
      data,
    };
  }

  function applyPayload(data) {
    Object.keys(data).forEach((k) => {
      if (SYNCED.includes(k)) store.set(k, data[k]);
    });
    // state.js guarda el perfil en memoria: sin esto, la copia vieja
    // seguiría viva y el próximo guardado pisaría lo recién bajado.
    if (App.state && App.state.reload) App.state.reload();
  }

  /* ============================================================
     FUSIÓN
     Cada campo tiene su regla. La idea rectora: ante la duda,
     quedarse con el progreso MAYOR, nunca con el menor.
     ============================================================ */

  const maxNum = (a, b) => Math.max(Number(a) || 0, Number(b) || 0);

  function mergeProfile(a, b, aNewer) {
    if (!a) return b; if (!b) return a;
    const recent = aNewer ? a : b;       // lado con cambios más recientes
    const out = Object.assign({}, b, a);

    // Preferencias: las del lado más reciente
    out.name = recent.name || a.name || b.name;
    out.level = recent.level || a.level;
    out.target = recent.target || a.target;
    out.topics = (recent.topics && recent.topics.length) ? recent.topics : (a.topics || b.topics);
    out.dailyMinutes = recent.dailyMinutes || a.dailyMinutes;

    // Progreso acumulado: siempre el mayor
    out.xp = maxNum(a.xp, b.xp);
    out.longestStreak = maxNum(a.longestStreak, b.longestStreak);

    // Racha: la del último día estudiado; si estudió en ambos, la mayor
    const aDay = a.lastStudyDay, bDay = b.lastStudyDay;
    if (aDay && bDay) {
      out.lastStudyDay = aDay >= bDay ? aDay : bDay;
      out.streak = aDay === bDay ? maxNum(a.streak, b.streak) : (aDay > bDay ? a.streak : b.streak);
    } else {
      out.lastStudyDay = aDay || bDay;
      out.streak = maxNum(a.streak, b.streak);
    }
    out.longestStreak = maxNum(out.longestStreak, out.streak);

    // Contadores acumulativos
    out.stats = {};
    const keys = new Set([...Object.keys(a.stats || {}), ...Object.keys(b.stats || {})]);
    keys.forEach((k) => { out.stats[k] = maxNum((a.stats || {})[k], (b.stats || {})[k]); });

    // Unidades: mejor puntaje y aprobado si lo está en cualquiera
    out.units = {};
    new Set([...Object.keys(a.units || {}), ...Object.keys(b.units || {})]).forEach((id) => {
      const ua = (a.units || {})[id], ub = (b.units || {})[id];
      if (!ua) { out.units[id] = ub; return; }
      if (!ub) { out.units[id] = ua; return; }
      out.units[id] = {
        best: Math.max(ua.best || 0, ub.best || 0),
        done: !!(ua.done || ub.done),
        attempts: maxNum(ua.attempts, ub.attempts),
        lastSeen: (ua.lastSeen || '') >= (ub.lastSeen || '') ? ua.lastSeen : ub.lastSeen,
      };
    });

    // Logros: unión
    out.achievements = Array.from(new Set([...(a.achievements || []), ...(b.achievements || [])]));

    // Fecha de inicio: la más antigua
    const starts = [a.startedOn, b.startedOn, a.createdAt, b.createdAt].filter(Boolean).sort();
    if (starts.length) { out.startedOn = starts[0]; out.createdAt = starts[0]; }

    return out;
  }

  /* SRS: por tarjeta, gana la revisada más recientemente. Si empatan,
     la que tenga el intervalo mayor (más avanzada en el aprendizaje). */
  function mergeSrs(a, b) {
    const out = Object.assign({}, b, a);
    Object.keys(b || {}).forEach((id) => {
      const ca = (a || {})[id], cb = b[id];
      if (!ca) { out[id] = cb; return; }
      const da = ca.lastReview || '', db = cb.lastReview || '';
      if (da > db) out[id] = ca;
      else if (db > da) out[id] = cb;
      else out[id] = (ca.interval || 0) >= (cb.interval || 0) ? ca : cb;
    });
    return out;
  }

  /* Historial: por día, el mayor de cada métrica. Si estudió en los dos
     dispositivos el mismo día, sumar duplicaría; tomar el máximo es
     conservador y no infla las estadísticas. */
  function mergeHistory(a, b) {
    const out = {};
    new Set([...Object.keys(a || {}), ...Object.keys(b || {})]).forEach((d) => {
      const ea = (a || {})[d], eb = (b || {})[d];
      if (!ea) { out[d] = eb; return; }
      if (!eb) { out[d] = ea; return; }
      out[d] = {
        xp: maxNum(ea.xp, eb.xp),
        correct: maxNum(ea.correct, eb.correct),
        answered: maxNum(ea.answered, eb.answered),
        minutes: maxNum(ea.minutes, eb.minutes),
        blocks: Array.from(new Set([...(ea.blocks || []), ...(eb.blocks || [])])),
      };
    });
    return out;
  }

  /* Pruebas del colegio: unión por id. Si la misma prueba existe en los dos
     lados, gana la que tenga más material, y las estadísticas de juego se
     quedan con el mejor puntaje de cada uno. */
  function mergeExams(a, b) {
    const porId = new Map();
    [...(a || []), ...(b || [])].forEach((ex) => {
      if (!ex || !ex.id) return;
      const prev = porId.get(ex.id);
      if (!prev) { porId.set(ex.id, ex); return; }

      const peso = (x) => (x.vocab || []).length + (x.questions || []).length;
      const base = peso(ex) > peso(prev) ? ex : prev;
      const otro = base === ex ? prev : ex;

      const best = Object.assign({}, (otro.stats || {}).best, (base.stats || {}).best);
      Object.keys((otro.stats || {}).best || {}).forEach((g) => {
        best[g] = Math.max(best[g] || 0, otro.stats.best[g] || 0);
      });

      porId.set(ex.id, Object.assign({}, base, {
        stats: {
          plays: Math.max((base.stats || {}).plays || 0, (otro.stats || {}).plays || 0),
          lastPlayed: ((base.stats || {}).lastPlayed || '') >= ((otro.stats || {}).lastPlayed || '')
            ? (base.stats || {}).lastPlayed : (otro.stats || {}).lastPlayed,
          best,
        },
      }));
    });
    return Array.from(porId.values());
  }

  /* Textos escritos: unión sin duplicados */
  function mergeJournal(a, b) {
    const seen = new Set();
    return [...(a || []), ...(b || [])]
      .filter((j) => {
        const k = j.date + '|' + j.promptId + '|' + String(j.text || '').slice(0, 40);
        if (seen.has(k)) return false;
        seen.add(k); return true;
      })
      .sort((x, y) => (y.date || '').localeCompare(x.date || ''))
      .slice(0, 60);
  }

  /* Sesión del día: sólo se fusiona si es del mismo día y el mismo plan.
     Los bloques hechos en cualquiera de los dos cuentan como hechos. */
  function mergeSession(a, b) {
    if (!a) return b; if (!b) return a;
    if (a.date !== b.date) return a.date > b.date ? a : b;

    const sameShape = a.blocks && b.blocks && a.blocks.length === b.blocks.length &&
      a.blocks.every((blk, i) => blk.type === b.blocks[i].type);
    if (!sameShape) {
      const da = a.blocks.filter((x) => x.done).length;
      const db = b.blocks.filter((x) => x.done).length;
      return da >= db ? a : b;
    }

    const out = Object.assign({}, a);
    out.blocks = a.blocks.map((blk, i) => {
      const other = b.blocks[i];
      if (blk.done && !other.done) return blk;
      if (other.done && !blk.done) return other;
      if (!blk.done) return blk;
      const sa = (blk.score && blk.score.xp) || 0, sb = (other.score && other.score.xp) || 0;
      return sa >= sb ? blk : other;
    });
    return out;
  }

  function mergeStates(local, remote) {
    const l = local.data || {}, r = remote.data || {};
    const localNewer = (local.touchedAt || 0) >= (remote.touchedAt || 0);

    const out = {};
    out.profile = mergeProfile(l.profile, r.profile, localNewer);
    out.srs = mergeSrs(l.srs || {}, r.srs || {});
    out.history = mergeHistory(l.history || {}, r.history || {});
    out.journal = mergeJournal(l.journal, r.journal);
    out.exams = mergeExams(l.exams, r.exams);
    out.session = mergeSession(l.session, r.session);
    out.onboarded = !!(l.onboarded || r.onboarded);

    // El último test de nivel que se haya tomado
    const pl = l.placement, pr = r.placement;
    out.placement = (!pl || (pr && pr.date > pl.date)) ? (pr || pl) : pl;

    // Historial del tutor y material ya usado: del lado más reciente
    const recent = localNewer ? l : r;
    out['tutor.history'] = recent['tutor.history'] || l['tutor.history'] || r['tutor.history'];
    ['used.reading', 'used.listening', 'used.writing', 'used.speaking', 'used.roleplay'].forEach((k) => {
      const merged = Array.from(new Set([...(l[k] || []), ...(r[k] || [])])).slice(0, 8);
      if (merged.length) out[k] = merged;
    });

    Object.keys(out).forEach((k) => { if (out[k] === undefined) delete out[k]; });
    return out;
  }

  /* ============================================================
     OPERACIONES
     ============================================================ */

  /* Crea el Gist por primera vez y guarda su id */
  async function connect() {
    const payload = localPayload();
    const gist = await api('/gists', {
      method: 'POST',
      body: JSON.stringify({
        description: 'English Path — progreso (privado)',
        public: false,
        files: { [FILENAME]: { content: JSON.stringify(payload, null, 2) } },
      }),
    });
    setGistId(gist.id);
    store.set('sync.last', { at: Date.now(), dir: 'up' });
    return gist.id;
  }

  /* Baja el estado remoto (o null si el Gist está vacío) */
  async function fetchRemote() {
    const gist = await api('/gists/' + getGistId(), { method: 'GET' });
    const file = gist.files && gist.files[FILENAME];
    if (!file) return null;

    let content = file.content;
    if (file.truncated && file.raw_url) {
      const r = await fetch(file.raw_url);
      content = await r.text();
    }
    try { return JSON.parse(content); }
    catch (e) { throw new SyncError('El archivo remoto está corrupto.', 'PARSE'); }
  }

  async function upload(payload) {
    await api('/gists/' + getGistId(), {
      method: 'PATCH',
      body: JSON.stringify({
        files: { [FILENAME]: { content: JSON.stringify(payload, null, 2) } },
      }),
    });
    store.set('sync.last', { at: Date.now(), dir: 'up', device: payload.device });
  }

  /* Sincronización completa: baja, fusiona, aplica y sube.
     Devuelve un resumen de lo que cambió. */
  async function syncNow() {
    if (!isOn()) throw new SyncError('La sincronización no está configurada.', 'OFF');

    const local = localPayload();
    const remote = await fetchRemote();

    if (!remote || !remote.data) {
      await upload(local);
      return { pulled: false, pushed: true, from: null };
    }

    const merged = mergeStates(local, remote);
    const before = JSON.stringify(local.data);
    applyPayload(merged);

    const after = localPayload();
    const changedLocally = JSON.stringify(after.data) !== before;

    after.touchedAt = Date.now();
    store.set('sync.touchedAt', after.touchedAt);
    await upload(after);
    store.set('sync.last', { at: Date.now(), dir: 'both', device: remote.device });

    return { pulled: changedLocally, pushed: true, from: remote.device, remoteAt: remote.savedAt };
  }

  /* Sincronización de fondo: no molesta si falla (p. ej. sin conexión) */
  let pending = null;
  function background(reason) {
    if (!isOn()) return Promise.resolve(null);
    if (pending) return pending;
    pending = syncNow()
      .then((r) => {
        if (r && r.pulled) {
          App.ui.toast('Progreso sincronizado desde ' + (r.from || 'otro dispositivo'), 'info', 3000);
          if (App.app && App.app.refresh) App.app.refresh();
        }
        return r;
      })
      .catch((e) => {
        if (e.code === 'BAD_TOKEN' || e.code === 'NOT_FOUND') {
          App.ui.toast('Sincronización: ' + e.message, 'bad', 5000);
        }
        return null;
      })
      .finally(() => { pending = null; });
    return pending;
  }

  App.sync = {
    SyncError, SYNCED,
    getToken, setToken, getGistId, setGistId, isOn, lastSync, disable, deviceName,
    connect, fetchRemote, syncNow, background,
    localPayload, applyPayload, mergeStates,
    mergeProfile, mergeSrs, mergeHistory, mergeJournal, mergeSession, mergeExams,
  };
})(window.App);
