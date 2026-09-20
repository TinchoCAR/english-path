/* ============================================================
   app.js — Arranque, topbar, navegación
   ============================================================ */
(function (App) {
  'use strict';
  const { el, $, store, todayKey } = App.core;
  const UI = App.ui;

  let currentView = 'home';
  let selfSetHash = null;

  // Vistas que se pueden restaurar desde la URL o con el botón "atrás".
  // Las demás (session, done, practice) dependen de parámetros que la URL
  // no lleva, así que restaurarlas a ciegas mandaría al bloque equivocado.
  const RESTORABLE = ['home', 'progress', 'exams', 'tutor', 'settings'];

  const NAV = [
    { id: 'home', label: 'Hoy', icon: 'home' },
    { id: 'progress', label: 'Progreso', icon: 'chart' },
    { id: 'exams', label: 'Examen', icon: 'exam' },
    { id: 'tutor', label: 'Tutor', icon: 'chat' },
    { id: 'settings', label: 'Ajustes', icon: 'cog' },
  ];

  /* ---------- Barra superior ---------- */
  function renderTopbar() {
    const bar = $('#topbar');
    if (!bar) return;
    const p = App.state.get();
    const rk = App.state.rankFor(p.xp);
    const ss = App.state.streakStatus();

    bar.innerHTML = '';

    const brand = el('button', { class: 'brand', title: 'Ir al inicio' }, [
      el('div', { class: 'brand-mark' }, '🌍'),
      el('span', {}, 'English Path'),
    ]);
    brand.addEventListener('click', () => go('home'));

    const row = el('div', { class: 'topbar-row' }, [
      brand,
      el('span', { class: 'pill streak' + (ss.alive ? '' : ' cold'), title: 'Racha de días seguidos' },
        `🔥 ${ss.streak}`),
      el('span', { class: 'pill xp', title: rk.current.name },
        `${rk.current.icon} ${p.xp}`),
    ]);
    bar.appendChild(row);

    if (rk.next) {
      bar.appendChild(el('div', { class: 'xpbar' }, [
        el('div', { class: 'xpbar-top' }, [
          el('span', {}, rk.current.name),
          el('span', {}, `${rk.toNext} XP → ${rk.next.name}`),
        ]),
        el('div', { class: 'xpbar-track' },
          el('div', { class: 'xpbar-fill', style: `width:${rk.progress * 100}%` })),
      ]));
    }
  }

  /* ---------- Navegación inferior ---------- */
  function renderNav() {
    const nav = $('#nav');
    if (!nav) return;
    nav.innerHTML = '';
    NAV.forEach((item) => {
      const btn = el('button', {
        class: 'nav-btn' + (currentView === item.id ? ' active' : ''),
      }, [UI.icon(item.icon), el('span', {}, item.label)]);
      btn.addEventListener('click', () => go(item.id));
      nav.appendChild(btn);
    });
  }

  /* ---------- Router ---------- */
  function go(viewName, params) {
    const root = $('#view');
    if (!root) return;

    App.speech.stop();

    const view = App.views[viewName];
    if (!view) return go('home');

    currentView = viewName;
    root.innerHTML = '';

    try {
      view(root, params);
    } catch (e) {
      console.error('[view ' + viewName + ']', e);
      root.innerHTML = '';
      root.appendChild(el('div', { class: 'card' }, [
        el('h3', {}, 'Algo se rompió en esta pantalla'),
        el('p', { class: 'muted' }, String(e && e.message || e)),
        (() => {
          const b = el('button', { class: 'btn btn-primary' }, 'Volver al inicio');
          b.addEventListener('click', () => go('home'));
          return b;
        })(),
      ]));
    }

    renderTopbar();
    renderNav();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

    // Sólo las vistas restaurables tocan la URL. Así el botón "atrás" navega
    // entre secciones sin poder caer en una sesión a medias.
    if (RESTORABLE.includes(viewName) && location.hash.slice(1) !== viewName) {
      try {
        selfSetHash = '#' + viewName;
        location.hash = selfSetHash;
      } catch (e) { /* contexto sin historial */ }
    }
  }

  window.addEventListener('hashchange', () => {
    // El evento que dispara nuestro propio cambio de hash llega en diferido.
    // Si no lo descartamos, puede llegar cuando ya navegamos a otra vista
    // y arrastrarnos de vuelta a la anterior.
    if (selfSetHash && location.hash === selfSetHash) { selfSetHash = null; return; }
    selfSetHash = null;

    const v = location.hash.slice(1);
    if (v === currentView) return;
    go(RESTORABLE.includes(v) ? v : 'home');
  });

  /* ---------- Limpieza de cachés viejos ---------- */
  function housekeeping() {
    // El mensaje del tutor se cachea por día: borramos los de días anteriores.
    try {
      const prefix = 'englishpath.v1.brief.';
      const keep = prefix + todayKey();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix) && k !== keep) localStorage.removeItem(k);
      }
    } catch (e) { /* localStorage bloqueado: seguimos igual */ }
  }

  /* ---------- Arranque ---------- */
  let booted = false;
  function boot() {
    if (booted) return;   // arrancar dos veces reiniciaría la vista en curso
    booted = true;

    // La sincronización es opcional: si el archivo no cargó, la app tiene que
    // seguir andando igual en vez de romper Ajustes y el cierre de sesión.
    if (!App.sync) {
      App.sync = {
        isOn: () => false,
        background: () => Promise.resolve(null),
        lastSync: () => null,
        deviceName: () => 'este dispositivo',
        disable: () => {},
        unavailable: true,
      };
    }

    UI.applyTheme();
    App.state.load();
    housekeeping();

    // Aviso si el navegador no deja guardar nada.
    if (!store.set('__probe', 1)) {
      UI.toast('Este navegador no permite guardar datos. Tu progreso no se va a conservar.', 'bad', 6000);
    }
    store.remove('__probe');

    const onboarded = store.get('onboarded', false);
    const fromHash = location.hash.slice(1);
    const start = onboarded
      ? (RESTORABLE.includes(fromHash) ? fromHash : 'home')
      : 'onboarding';
    go(start);

    registerServiceWorker();

    if (onboarded) {
      // Traemos lo que se haya hecho en el otro dispositivo antes de nada.
      App.sync.background('boot');

      const ss = App.state.streakStatus();
      const prog = App.session.progress();
      if (ss.atRisk && !prog.complete) {
        setTimeout(() => UI.toast(`🔥 Tenés una racha de ${ss.streak} días. No la pierdas hoy.`, 'info', 5000), 900);
      }
    }

    // Al volver a la app después de un rato, revisamos si hay cambios.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      const last = App.sync.lastSync();
      if (!last || Date.now() - last.at > 120000) App.sync.background('visible');
    });
  }

  /* Vuelve a dibujar la vista actual (la usa la sincronización cuando
     baja progreso nuevo desde otro dispositivo). */
  function refresh() {
    if (RESTORABLE.includes(currentView)) go(currentView);
    else { renderTopbar(); renderNav(); }
  }

  /* ---------- Service worker (modo app en el celular) ---------- */
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;   // requiere http(s)

    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            UI.toast('Hay una versión nueva. Recargá para aplicarla.', 'info', 6000);
          }
        });
      });
    }).catch(() => { /* sin service worker la app funciona igual */ });
  }

  App.app = { go, renderTopbar, renderNav, refresh, boot };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window.App);
