/* ============================================================
   core.js — utilidades base
   Namespace global: window.App
   Sin módulos ES para que funcione abriendo index.html directo.
   ============================================================ */
window.App = window.App || {};

(function (App) {
  'use strict';

  /* ---------- DOM helpers ---------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k === 'text') node.textContent = attrs[k];
        else if (k.startsWith('on') && typeof attrs[k] === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else if (attrs[k] !== null && attrs[k] !== undefined) {
          node.setAttribute(k, attrs[k]);
        }
      }
    }
    (Array.isArray(children) ? children : children ? [children] : []).forEach((c) => {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  /* ---------- Fechas (zona horaria local, Argentina) ---------- */

  // "2026-09-20" según el reloj local del usuario, no UTC.
  function todayKey(d) {
    const x = d || new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
  }

  function dateFromKey(key) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function daysBetween(keyA, keyB) {
    const a = dateFromKey(keyA), b = dateFromKey(keyB);
    return Math.round((b - a) / 86400000);
  }

  function addDays(key, n) {
    const d = dateFromKey(key);
    d.setDate(d.getDate() + n);
    return todayKey(d);
  }

  // 0 = domingo ... 6 = sábado
  function weekdayOf(key) {
    return dateFromKey(key).getDay();
  }

  const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
    'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  function prettyDate(key) {
    const d = dateFromKey(key);
    return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  }

  /* ---------- RNG determinista ----------
     Misma semilla => misma secuencia. Usamos la fecha como semilla para que
     la sesión del día sea estable (si recargás la página seguís en lo mismo)
     pero distinta cada día.                                            */

  function hashString(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // rng.int(n) -> 0..n-1 | rng.pick(arr) | rng.shuffle(arr) | rng.sample(arr, k)
  function makeRng(seedStr) {
    const next = mulberry32(hashString(String(seedStr)));
    const api = {
      next,
      float: (min, max) => min + next() * (max - min),
      int: (n) => Math.floor(next() * n),
      range: (min, max) => min + Math.floor(next() * (max - min + 1)),
      pick: (arr) => arr[Math.floor(next() * arr.length)],
      shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      },
      sample(arr, k) {
        return api.shuffle(arr).slice(0, Math.min(k, arr.length));
      },
    };
    return api;
  }

  /* ---------- Storage con namespace y tolerancia a fallos ---------- */
  const NS = 'englishpath.v1.';

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(NS + key);
        if (raw === null) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        console.warn('[store] lectura falló:', key, e);
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(NS + key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.warn('[store] escritura falló:', key, e);
        return false;
      }
    },
    remove(key) {
      try { localStorage.removeItem(NS + key); } catch (e) { /* noop */ }
    },
    // Exporta todo el progreso como objeto plano (para backup / mudanza de navegador)
    dump() {
      const out = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(NS)) out[k.slice(NS.length)] = JSON.parse(localStorage.getItem(k));
        }
      } catch (e) { console.warn('[store] dump falló', e); }
      return out;
    },
    restore(obj) {
      let n = 0;
      for (const k in obj) { if (store.set(k, obj[k])) n++; }
      return n;
    },
  };

  /* ---------- Texto ---------- */

  // Normaliza para comparar respuestas: sin acentos, sin puntuación, espacios colapsados.
  function normalize(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[’']/g, "'")
      .replace(/[.,!?;:"“”()\-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Distancia de Levenshtein — para aceptar respuestas con un typo menor.
  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(
          prev[j] + 1,
          cur[j - 1] + 1,
          prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
      prev = cur;
    }
    return prev[b.length];
  }

  // ¿Es correcta la respuesta? Acepta variantes y tolera 1 typo en palabras largas.
  function answerMatches(given, expected) {
    const g = normalize(given);
    const variants = (Array.isArray(expected) ? expected : [expected]).map(normalize);
    for (const v of variants) {
      if (!v) continue;
      if (g === v) return { ok: true, typo: false };
      const tolerance = v.length > 8 ? 2 : v.length > 4 ? 1 : 0;
      if (tolerance && levenshtein(g, v) <= tolerance) return { ok: true, typo: true };
    }
    return { ok: false, typo: false };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

  App.core = {
    $, $$, el,
    todayKey, dateFromKey, daysBetween, addDays, weekdayOf, prettyDate, DIAS, MESES,
    hashString, mulberry32, makeRng,
    store,
    normalize, levenshtein, answerMatches, escapeHtml, clamp,
  };
})(window.App);
