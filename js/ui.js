/* ============================================================
   ui.js — Helpers de interfaz compartidos
   ============================================================ */
(function (App) {
  'use strict';
  const { el, $, escapeHtml, store } = App.core;

  /* ---------- Iconos (SVG inline, sin dependencias) ---------- */
  const ICONS = {
    home: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    chat: 'M21 12a8 8 0 0 1-8 8H7l-4 3 1.2-4.2A8 8 0 1 1 21 12Z',
    book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z',
    cog: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3Z',
  };

  function icon(name) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    (ICONS[name] || '').split(' M').forEach((d, i) => {
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', (i === 0 ? d : 'M' + d));
      svg.appendChild(path);
    });
    return svg;
  }

  /* ---------- Toasts ---------- */
  function toast(message, kind, ms) {
    let box = $('.toasts');
    if (!box) { box = el('div', { class: 'toasts' }); document.body.appendChild(box); }
    const t = el('div', { class: 'toast ' + (kind || '') }, message);
    box.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
      setTimeout(() => t.remove(), 320);
    }, ms || 2600);
    return t;
  }

  /* ---------- Modal ---------- */
  function modal(contentBuilder, opts) {
    const o = opts || {};
    const back = el('div', { class: 'modal-backdrop' });
    const box = el('div', { class: 'modal' });
    back.appendChild(box);

    const close = () => { back.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape' && !o.persistent) close(); };

    back.addEventListener('click', (e) => { if (e.target === back && !o.persistent) close(); });
    document.addEventListener('keydown', onKey);

    contentBuilder(box, close);
    document.body.appendChild(back);
    return close;
  }

  function confirm(message, onYes, opts) {
    const o = opts || {};
    modal((box, close) => {
      box.appendChild(el('h3', {}, o.title || 'Confirmar'));
      box.appendChild(el('p', { class: 'muted' }, message));
      box.appendChild(el('div', { class: 'row mt' }, [
        el('button', { class: 'btn btn-ghost grow', onClick: close }, o.no || 'Cancelar'),
        el('button', {
          class: 'btn grow ' + (o.danger ? 'btn-danger' : 'btn-primary'),
          onClick: () => { close(); onYes(); },
        }, o.yes || 'Sí, dale'),
      ]));
    });
  }

  /* ---------- Confeti ---------- */
  function confetti(count) {
    const colors = ['#4ade80', '#60a5fa', '#a78bfa', '#fbbf24', '#fb7185'];
    for (let i = 0; i < (count || 45); i++) {
      const c = el('div', { class: 'confetti' });
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      c.style.animationDelay = Math.random() * 0.4 + 's';
      if (Math.random() > 0.5) c.style.borderRadius = '50%';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3600);
    }
  }

  /* ---------- Anillo de resultado ---------- */
  function resultRing(pct) {
    const R = 54, C = 2 * Math.PI * R;
    const color = pct >= 0.8 ? 'var(--accent)' : pct >= 0.5 ? 'var(--amber)' : 'var(--bad)';
    const wrap = el('div', { class: 'result-ring' });
    wrap.innerHTML = `
      <svg width="128" height="128">
        <circle cx="64" cy="64" r="${R}" stroke="var(--surface-2)" stroke-width="10" fill="none"/>
        <circle cx="64" cy="64" r="${R}" stroke="${color}" stroke-width="10" fill="none"
          stroke-linecap="round" stroke-dasharray="${C}"
          stroke-dashoffset="${C * (1 - pct)}" style="transition:stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)"/>
      </svg>
      <div class="result-ring-num">${Math.round(pct * 100)}%</div>`;
    return wrap;
  }

  /* ---------- Puntos de progreso ---------- */
  function progressDots(total, current) {
    const wrap = el('div', { class: 'progress-dots' });
    for (let i = 0; i < total; i++) {
      wrap.appendChild(el('div', {
        class: 'pdot' + (i < current ? ' done' : i === current ? ' current' : ''),
      }));
    }
    return wrap;
  }

  /* ---------- Marcar huecos ___ en una consigna ---------- */
  function promptWithGap(text) {
    const span = el('div', { class: 'ex-prompt' });
    span.innerHTML = escapeHtml(text).replace(/_{2,}/g, '<span class="gap"></span>');
    return span;
  }

  /* ---------- Botón "escuchar" ---------- */
  function speakButton(text, label) {
    if (!App.speech.ttsAvailable()) return null;
    const btn = el('button', { class: 'btn btn-sm btn-ghost', title: 'Escuchar' }, label || '🔊');
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      try { await App.speech.speak(text); }
      catch (e) { toast(e.message, 'bad'); }
      btn.disabled = false;
    });
    return btn;
  }

  /* ---------- Tema ---------- */
  function applyTheme() {
    const t = store.get('theme', 'dark');
    document.documentElement.setAttribute('data-theme', t);
    return t;
  }
  function toggleTheme() {
    const next = store.get('theme', 'dark') === 'dark' ? 'light' : 'dark';
    store.set('theme', next);
    applyTheme();
    return next;
  }

  /* ---------- Estado de carga en un botón ---------- */
  function busy(btn, on, label) {
    if (on) {
      btn.dataset.prev = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '';
      btn.appendChild(el('span', { class: 'spinner' }));
      if (label) btn.appendChild(document.createTextNode(' ' + label));
    } else {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.prev || '';
    }
  }

  /* ---------- Errores de IA con acción útil ---------- */
  function aiError(e) {
    if (e && e.code === 'NO_KEY') {
      toast('Configurá tu API key en Ajustes para usar la IA.', 'bad', 4000);
      return;
    }
    toast((e && e.message) || 'Error al contactar la IA.', 'bad', 4000);
  }

  App.ui = {
    icon, toast, modal, confirm, confetti, resultRing, progressDots,
    promptWithGap, speakButton, applyTheme, toggleTheme, busy, aiError,
  };
})(window.App);
