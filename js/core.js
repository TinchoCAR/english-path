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
      .replace(/[.,!?;:"“”()\/\-–—]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Distancia de Levenshtein clásica.
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

  /* Variante Damerau (alineación óptima): cuenta el intercambio de dos letras
     contiguas como UN error. Es el typo más común al escribir rápido
     ("recieved" por "received") y sin esto se penalizaba como dos errores. */
  function damerau(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const m = a.length, n = b.length;
    const d = Array.from({ length: m + 1 }, (_, i) => {
      const row = new Array(n + 1).fill(0);
      row[0] = i;
      return row;
    });
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[m][n];
  }

  /* Palabras cuya forma exacta ES lo que evalúan los ejercicios.
     Un "error de tipeo" acá nunca es un descuido: es un error de gramática. */
  const GRAMMAR_WORDS = new Set([
    'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'do', 'does', 'did', 'done', 'have', 'has', 'had', 'having',
    'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
    'a', 'an', 'the', 'this', 'that', 'these', 'those',
    'in', 'on', 'at', 'to', 'of', 'for', 'since', 'from', 'by', 'with', 'about',
    'into', 'over', 'under', 'through', 'during', 'until', 'than', 'then',
    'not', 'no', 'and', 'or', 'but', 'if', 'as', 'so',
    'he', 'she', 'it', 'they', 'we', 'you', 'i', 'him', 'her', 'them', 'us', 'me',
    'his', 'its', 'their', 'our', 'your', 'my',
    'much', 'many', 'few', 'little', 'some', 'any', 'more', 'most', 'less',
    'who', 'whom', 'whose', 'which', 'what', 'where', 'when', 'why', 'how',
  ]);

  /* ¿La diferencia entre dos palabras es una terminación gramatical?
     work/works, study/studied, big/bigger, go/going… Eso no es un typo:
     es exactamente el punto que el ejercicio está evaluando. */
  function isMorphologicalDiff(a, b) {
    const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
    if (!longer.startsWith(shorter.slice(0, Math.max(1, shorter.length - 2)))) {
      // Ni siquiera comparten raíz: es otra palabra, no una terminación.
      if (longer.length - shorter.length > 3) return false;
    }
    const SUFFIXES = ['s', 'es', 'd', 'ed', 'ing', 'er', 'est', 'ies', 'ied', 'en'];
    for (const suf of SUFFIXES) {
      if (longer === shorter + suf) return true;
      // Casos con cambio de raíz: study→studies, big→bigger, make→making
      if (longer === shorter.slice(0, -1) + suf) return true;
      if (longer === shorter + shorter.slice(-1) + suf) return true;
    }
    return false;
  }

  /* ¿Es correcta la respuesta?
     Perdona errores de tipeo en palabras de contenido, pero NUNCA
     diferencias gramaticales: concordancia, terminaciones verbales,
     auxiliares, preposiciones ni artículos. */
  function answerMatches(given, expected) {
    const g = normalize(given);
    const variants = (Array.isArray(expected) ? expected : [expected]).map(normalize);

    for (const v of variants) {
      if (!v) continue;
      if (g === v) return { ok: true, typo: false };

      const gw = g.split(' '), vw = v.split(' ');
      // Distinta cantidad de palabras: falta o sobra algo, no es un typo.
      if (gw.length !== vw.length) continue;

      let typos = 0, rejected = false;
      for (let i = 0; i < vw.length && !rejected; i++) {
        if (gw[i] === vw[i]) continue;

        // Cualquier diferencia en una palabra gramatical invalida la respuesta.
        if (GRAMMAR_WORDS.has(vw[i]) || GRAMMAR_WORDS.has(gw[i])) { rejected = true; break; }
        // Diferencia de terminación: es gramática, no tipeo.
        if (isMorphologicalDiff(gw[i], vw[i])) { rejected = true; break; }

        // Palabra de contenido: perdonamos un desliz proporcional a su largo.
        const budget = vw[i].length >= 9 ? 2 : vw[i].length >= 5 ? 1 : 0;
        if (!budget || damerau(gw[i], vw[i]) > budget) { rejected = true; break; }
        typos++;
      }

      // Como mucho un desliz por respuesta: dos ya no es distracción.
      if (!rejected && typos > 0 && typos <= 1) return { ok: true, typo: true };
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
    damerau, isMorphologicalDiff,
    store,
    normalize, levenshtein, answerMatches, escapeHtml, clamp,
  };
})(window.App);
