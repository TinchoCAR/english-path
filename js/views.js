/* ============================================================
   views.js — Pantallas de la aplicación
   ============================================================ */
(function (App) {
  'use strict';
  const { el, $, escapeHtml, store, todayKey, prettyDate, addDays } = App.core;
  const UI = App.ui;

  const views = {};

  /* ============================================================
     ONBOARDING
     ============================================================ */
  views.onboarding = function (root) {
    const draft = {
      name: '',
      level: 'A2',
      topics: ['business', 'pop', 'tech', 'sports'],
      dailyMinutes: 25,
    };
    let step = 0;

    function render() {
      root.innerHTML = '';
      const card = el('div', { class: 'card' });
      root.appendChild(card);

      const steps = 4;
      card.appendChild(UI.progressDots(steps, step));

      if (step === 0) {
        card.appendChild(el('div', { class: 'center', style: 'font-size:46px;margin-bottom:8px' }, '🌍'));
        card.appendChild(el('h1', { class: 'center' }, 'English Path'));
        card.appendChild(el('p', { class: 'center muted' },
          'Tu camino de A2 a B2 en seis meses, pensado para Comercio Internacional. Veinte minutos por día, contenido distinto cada día.'));
        card.appendChild(el('label', { class: 'field mt-lg' }, [
          el('span', {}, '¿Cómo te llamás?'),
          (() => {
            const i = el('input', { type: 'text', placeholder: 'Tu nombre', value: draft.name });
            i.addEventListener('input', () => { draft.name = i.value; });
            i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { step++; render(); } });
            return i;
          })(),
        ]));
      }

      if (step === 1) {
        card.appendChild(el('h2', {}, '¿Cuál es tu nivel hoy?'));
        card.appendChild(el('p', { class: 'muted' },
          'No te preocupes por acertar: la app ajusta el nivel sola según cómo te vaya.'));
        const opts = [
          ['A2', 'Básico', 'Entiendo frases simples, me cuesta armar oraciones largas.'],
          ['B1', 'Intermedio', 'Me manejo en conversaciones y leo textos generales.'],
          ['B2', 'Intermedio alto', 'Leo y escucho bien, busco fluidez y vocabulario técnico.'],
        ];
        const box = el('div', { class: 'options' });
        opts.forEach(([lvl, name, desc]) => {
          const b = el('button', { class: 'option' + (draft.level === lvl ? ' correct' : '') }, [
            el('span', { class: 'option-key' }, lvl),
            el('span', {}, [
              el('div', { style: 'font-weight:650' }, name),
              el('div', { class: 'faint' }, desc),
            ]),
          ]);
          b.addEventListener('click', () => { draft.level = lvl; render(); });
          box.appendChild(b);
        });
        card.appendChild(box);

        if (draft.testedAs) {
          card.appendChild(el('div', { class: 'feedback ok mt' },
            `Tu test dio ${draft.testedAs}. Podés cambiarlo si no te convence.`));
        } else {
          const test = el('button', { class: 'btn btn-ghost btn-lg mt' }, '🎯 No estoy seguro — tomame un test');
          test.addEventListener('click', () => {
            // Se renderiza en el mismo root: el borrador del onboarding
            // vive en este closure, así que no se pierde nada.
            App.views.placement(root, {
              onDone(lvl) {
                if (lvl) { draft.level = lvl; draft.testedAs = lvl; step = 2; }
                render();
              },
            });
          });
          card.appendChild(test);
        }
      }

      if (step === 2) {
        card.appendChild(el('h2', {}, '¿De qué querés que hablen los ejercicios?'));
        card.appendChild(el('p', { class: 'muted' },
          'Elegí al menos uno. Cuantos más elijas, menos repetitivo se vuelve.'));
        const chips = el('div', { class: 'chips' });
        Object.entries(App.vocab.TOPIC_LABEL).forEach(([k, label]) => {
          if (k === 'core') return;
          const c = el('button', { class: 'chip' + (draft.topics.includes(k) ? ' on' : '') }, label);
          c.addEventListener('click', () => {
            const i = draft.topics.indexOf(k);
            if (i >= 0) { if (draft.topics.length > 1) draft.topics.splice(i, 1); }
            else draft.topics.push(k);
            render();
          });
          chips.appendChild(c);
        });
        card.appendChild(chips);
      }

      if (step === 3) {
        card.appendChild(el('h2', {}, '¿Cuánto tiempo por día?'));
        card.appendChild(el('p', { class: 'muted' },
          'Elegí algo que puedas sostener un martes cualquiera a las once de la noche, no tu mejor día.'));
        const box = el('div', { class: 'options' });
        [[15, '15 minutos', 'Micro-sesión: vocabulario + un bloque.'],
         [25, '25 minutos', 'Recomendado: vocabulario, gramática y una destreza.'],
         [45, '45 minutos', 'Sesión larga: agrega dos bloques extra.']].forEach(([m, name, desc]) => {
          const b = el('button', { class: 'option' + (draft.dailyMinutes === m ? ' correct' : '') }, [
            el('span', { class: 'option-key' }, m),
            el('span', {}, [
              el('div', { style: 'font-weight:650' }, name),
              el('div', { class: 'faint' }, desc),
            ]),
          ]);
          b.addEventListener('click', () => { draft.dailyMinutes = m; render(); });
          box.appendChild(b);
        });
        card.appendChild(box);
      }

      const nav = el('div', { class: 'row mt-lg' });
      if (step > 0) {
        const back = el('button', { class: 'btn btn-ghost' }, '← Atrás');
        back.addEventListener('click', () => { step--; render(); });
        nav.appendChild(back);
      }
      const next = el('button', { class: 'btn btn-primary grow' },
        step === 3 ? 'Empezar 🚀' : 'Continuar →');
      next.addEventListener('click', () => {
        if (step < 3) { step++; render(); return; }
        App.state.update({
          name: draft.name.trim(),
          level: draft.level,
          topics: draft.topics,
          dailyMinutes: draft.dailyMinutes,
          startedOn: todayKey(),
        });
        store.set('onboarded', true);
        store.remove('session');
        App.app.go('home');
      });
      nav.appendChild(next);
      card.appendChild(nav);
    }
    render();
  };

  /* ============================================================
     TEST DE NIVEL
     params: { onDone: fn(level), cancelTo: 'home'|'onboarding' }
     ============================================================ */
  views.placement = function (root, params) {
    const o = params || {};
    const finish = (lvl) => { if (o.onDone) o.onDone(lvl); else App.app.go('home'); };

    /* La IA puede devolver cualquier cosa: nos quedamos sólo con lo usable. */
    function sanitize(list) {
      if (!Array.isArray(list)) return [];
      return list.filter((q) =>
        q && typeof q.q === 'string' && q.q.trim() &&
        Array.isArray(q.o) && q.o.length >= 2 && q.o.every((x) => typeof x === 'string' && x.trim()) &&
        Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length &&
        App.placement.ORDER.includes(q.level)
      );
    }

    /* ---------- Portada ---------- */
    function intro() {
      root.innerHTML = '';
      const card = el('div', { class: 'card center' });
      card.appendChild(el('div', { style: 'font-size:46px' }, '🎯'));
      card.appendChild(el('h1', {}, 'Test de nivel'));
      card.appendChild(el('p', { class: 'muted' },
        'Catorce preguntas que se adaptan a vos: si acertás se ponen más difíciles, si errás se ablandan. Son unos cinco minutos.'));
      card.appendChild(el('p', { class: 'faint' },
        'No estudies para esto. Si no sabés una, elegí lo que te suene y seguí: el resultado sirve justamente para no hacerte perder el tiempo con lo que ya sabés.'));

      const start = el('button', { class: 'btn btn-primary btn-lg mt-lg' }, 'Empezar el test');
      start.addEventListener('click', () => run(null));
      card.appendChild(start);

      if (App.ai.hasKey()) {
        const withAi = el('button', { class: 'btn btn-ghost btn-lg mt' }, [
          el('span', { class: 'ai-badge' }, '✦ IA'),
          document.createTextNode(' Generar un test a medida'),
        ]);
        withAi.addEventListener('click', async () => {
          UI.busy(withAi, true, 'Preparando…');
          try {
            const gen = await App.ai.generatePlacementTest();
            const qs = sanitize(gen && gen.questions);
            if (qs.length < 8) throw new Error('pocas preguntas válidas');
            run(qs);
          } catch (e) {
            UI.busy(withAi, false);
            UI.toast('No se pudo generar. Probá con el test estándar.', 'bad', 3500);
          }
        });
        card.appendChild(withAi);
      }

      const skip = el('button', { class: 'btn btn-ghost mt' }, 'Ahora no');
      skip.addEventListener('click', () => {
        if (o.onDone) o.onDone(null);
        else App.app.go(o.cancelTo || 'home');
      });
      card.appendChild(skip);
      root.appendChild(card);
    }

    /* ---------- Preguntas ---------- */
    function run(bank) {
      const rng = App.core.makeRng('placement|' + Date.now());
      const L = App.placement.ladder(rng, 14, bank);

      (function step() {
        const q = L.next();
        if (!q) return result(L.result(), !!bank);

        root.innerHTML = '';
        const card = el('div', { class: 'card' });
        root.appendChild(card);

        card.appendChild(UI.progressDots(L.total, L.index - 1));
        card.appendChild(el('div', { class: 'row spread', style: 'margin-bottom:10px' }, [
          el('span', { class: 'faint' }, `Pregunta ${L.index} de ${L.total}`),
          bank ? el('span', { class: 'ai-badge' }, '✦ IA') : null,
        ]));
        card.appendChild(UI.promptWithGap(q.q));

        const box = el('div', { class: 'options' });
        q.o.forEach((opt, idx) => {
          const btn = el('button', { class: 'option' }, [
            el('span', { class: 'option-key' }, String.fromCharCode(65 + idx)),
            el('span', {}, opt),
          ]);
          btn.addEventListener('click', () => {
            Array.from(box.children).forEach((c) => { c.disabled = true; });
            // No mostramos si estuvo bien: en un test de nivel eso sesga las
            // respuestas siguientes y no enseña nada.
            btn.classList.add('correct');
            L.answer(idx === q.a);
            setTimeout(step, 240);
          });
          box.appendChild(btn);
        });
        card.appendChild(box);
      })();
    }

    /* ---------- Resultado ---------- */
    function result(r, fromAi) {
      const d = App.placement.DESCRIPTIONS[r.cefr];

      root.innerHTML = '';
      const card = el('div', { class: 'card center' });
      card.appendChild(UI.resultRing(r.accuracy));
      card.appendChild(el('div', { style: 'font-size:36px;margin-bottom:4px' }, '🎓'));
      card.appendChild(el('h1', {}, d.title));
      card.appendChild(el('p', { class: 'muted' }, d.text));
      card.appendChild(el('p', { class: 'faint' }, `${r.correct} de ${r.total} correctas`));

      const rows = el('div', { class: 'mt-lg', style: 'text-align:left' });
      rows.appendChild(el('h3', {}, 'Cómo te fue en cada nivel'));
      App.placement.ORDER.forEach((lvl) => {
        const s = r.perLevel[lvl];
        if (!s || !s.total) return;
        const pct = s.ok / s.total;
        rows.appendChild(el('div', { class: 'unit-row' }, [
          el('span', { class: 'lvl-tag' }, lvl),
          el('div', { class: 'grow' },
            el('div', { class: 'xpbar-track' },
              el('div', {
                class: 'xpbar-fill',
                style: `width:${pct * 100}%;background:${pct >= 0.6 ? 'var(--accent)' : 'var(--amber)'}`,
              }))),
          el('span', { class: 'faint' }, `${s.ok}/${s.total}`),
        ]));
      });
      card.appendChild(rows);

      card.appendChild(el('div', { class: 'feedback mt-lg', style: 'text-align:left' },
        `Arrancamos en nivel ${r.appLevel}. Si las primeras sesiones te resultan muy fáciles o muy difíciles, cambialo en Ajustes cuando quieras.`));

      const go = el('button', { class: 'btn btn-primary btn-lg mt' }, `Empezar en ${r.appLevel} →`);
      go.addEventListener('click', () => {
        store.set('placement', {
          date: todayKey(), cefr: r.cefr, correct: r.correct, total: r.total, ai: !!fromAi,
        });
        finish(r.appLevel);
      });
      card.appendChild(go);
      root.appendChild(card);
      UI.confetti(40);
    }

    intro();
  };
  /* ============================================================
     INICIO
     ============================================================ */
  views.home = function (root) {
    const p = App.state.get();
    const plan = App.session.current();
    const prog = App.session.progress();
    const ss = App.state.streakStatus();

    root.innerHTML = '';

    /* --- Saludo --- */
    const hour = new Date().getHours();
    const greet = hour < 6 ? 'Todavía despierto' : hour < 13 ? 'Buen día' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
    root.appendChild(el('h1', {}, p.name ? `${greet}, ${p.name}` : greet));
    root.appendChild(el('p', { class: 'faint', style: 'margin-top:-8px' }, prettyDate(todayKey())));

    /* --- Aviso de racha en riesgo --- */
    if (ss.atRisk && !prog.complete) {
      root.appendChild(el('div', { class: 'pitfall', style: 'margin-bottom:16px' },
        el('span', {}, [el('b', {}, `🔥 Racha de ${p.streak} días en juego. `),
          'Completá la sesión de hoy para no perderla.'])));
    }

    /* --- Mensaje del tutor (IA, opcional) --- */
    const briefKey = 'brief.' + todayKey();
    const cached = store.get(briefKey, null);
    if (cached) {
      root.appendChild(el('div', { class: 'card' }, [
        el('div', { class: 'row', style: 'align-items:flex-start;gap:12px' }, [
          el('div', { class: 'card-icon' }, '🎓'),
          el('div', { class: 'grow' }, [
            el('div', { class: 'ai-badge', style: 'margin-bottom:6px' }, '✦ Tu tutor'),
            el('div', {}, cached),
          ]),
        ]),
      ]));
    } else if (App.ai.hasKey()) {
      const box = el('div', { class: 'card' }, [
        el('div', { class: 'row' }, [
          el('span', { class: 'spinner' }),
          el('span', { class: 'faint' }, 'Tu tutor está preparando el día…'),
        ]),
      ]);
      root.appendChild(box);
      App.ai.dailyBriefing().then((txt) => {
        store.set(briefKey, txt);
        box.innerHTML = '';
        box.appendChild(el('div', { class: 'row', style: 'align-items:flex-start;gap:12px' }, [
          el('div', { class: 'card-icon' }, '🎓'),
          el('div', { class: 'grow' }, [
            el('div', { class: 'ai-badge', style: 'margin-bottom:6px' }, '✦ Tu tutor'),
            el('div', {}, txt),
          ]),
        ]));
      }).catch(() => { box.remove(); });
    }

    /* --- Sesión del día --- */
    const card = el('div', { class: 'card' });
    card.appendChild(el('div', { class: 'row spread', style: 'margin-bottom:14px' }, [
      el('div', {}, [
        el('h2', { style: 'margin:0' }, prog.complete ? '✓ Sesión completa' : 'Sesión de hoy'),
        el('div', { class: 'faint' },
          `${prog.done} de ${prog.total} bloques · ~${p.dailyMinutes} min`),
      ]),
      (() => {
        const b = el('button', { class: 'btn btn-ghost btn-sm', title: 'Generar otro contenido para hoy' }, '🎲');
        b.addEventListener('click', () => {
          UI.confirm('¿Generar una sesión distinta para hoy? Se pierde el progreso de los bloques no terminados.', () => {
            App.session.reroll();
            store.remove(briefKey);
            App.app.go('home');
            UI.toast('Nueva sesión generada', 'info');
          });
        });
        return b;
      })(),
    ]));

    const list = el('div', { class: 'block-list' });
    plan.blocks.forEach((b, i) => {
      const meta = App.session.BLOCK_META[b.type];
      const btn = el('button', { class: 'block' + (b.done ? ' done' : '') }, [
        el('div', { class: 'block-emoji' }, meta.icon),
        el('div', { class: 'block-body' }, [
          el('div', { class: 'block-title' }, meta.title),
          el('div', { class: 'block-desc' }, b.done && b.score
            ? `${b.score.correct}/${b.score.total} · +${b.score.xp} XP`
            : meta.desc),
        ]),
        el('div', { class: 'block-check' }, b.done ? '✓' : '→'),
      ]);
      btn.addEventListener('click', () => App.app.go('session', { index: i }));
      list.appendChild(btn);
    });
    card.appendChild(list);

    if (!prog.complete) {
      const nextIdx = plan.blocks.findIndex((b) => !b.done);
      const go = el('button', { class: 'btn btn-primary btn-lg mt' },
        prog.done === 0 ? 'Empezar la sesión' : 'Continuar donde quedé');
      go.addEventListener('click', () => App.app.go('session', { index: nextIdx }));
      card.appendChild(go);
    } else {
      card.appendChild(el('div', { class: 'feedback ok mt' },
        '¡Listo por hoy! Volvé mañana: el contenido va a ser otro.'));
    }
    root.appendChild(card);

    /* --- Estadísticas rápidas --- */
    const st = App.srs.stats();
    const rk = App.state.rankFor(p.xp);
    root.appendChild(el('div', { class: 'stat-grid' }, [
      stat(String(p.streak), 'días de racha', 'var(--amber)'),
      stat(String(st.mastered), 'palabras dominadas', 'var(--accent)'),
      stat(String(st.due), 'para repasar', 'var(--blue)'),
      stat(p.level, 'nivel actual', 'var(--purple)'),
    ]));

    /* --- Acceso al tutor --- */
    const ask = el('button', { class: 'block mt' }, [
      el('div', { class: 'block-emoji' }, '💬'),
      el('div', { class: 'block-body' }, [
        el('div', { class: 'block-title' }, 'Preguntale al tutor'),
        el('div', { class: 'block-desc' }, 'Cualquier duda de gramática, vocabulario o traducción'),
      ]),
      el('div', { class: 'block-check' }, '→'),
    ]);
    ask.addEventListener('click', () => App.app.go('tutor'));
    root.appendChild(ask);
  };

  function stat(num, label, color) {
    return el('div', { class: 'stat' }, [
      el('div', { class: 'stat-num', style: color ? `color:${color}` : '' }, num),
      el('div', { class: 'stat-label' }, label),
    ]);
  }

  /* ============================================================
     SESIÓN (ejecutar un bloque)
     ============================================================ */
  views.session = function (root, params) {
    // Sin índice no sabemos qué bloque mostrar: mandar al bloque 0 por defecto
    // haría perder el progreso del bloque en curso. Volvemos al inicio.
    if (!params || params.index === undefined) return App.app.go('home');

    const plan = App.session.current();
    const index = params.index;
    const block = plan.blocks[index];

    if (!block) return App.app.go('home');

    root.innerHTML = '';

    const bar = el('div', { class: 'row spread', style: 'margin-bottom:16px' });
    const back = el('button', { class: 'btn btn-ghost btn-sm' }, '← Salir');
    back.addEventListener('click', () => {
      UI.confirm('¿Salir del bloque? Se pierde lo que hiciste en este bloque.', () => {
        App.speech.stop();
        App.app.go('home');
      });
    });
    bar.appendChild(back);
    bar.appendChild(el('span', { class: 'pill' },
      `${App.session.BLOCK_META[block.type].icon} Bloque ${index + 1} de ${plan.blocks.length}`));
    root.appendChild(bar);

    const container = el('div', { class: 'card' });
    root.appendChild(container);

    const started = Date.now();

    App.activities.render(block, container, (score) => {
      const minutes = Math.round((Date.now() - started) / 60000);

      App.session.markBlockDone(index, score);
      const xpRes = App.state.addXp(score.xp);

      const p = App.state.get();
      p.stats.correct += score.correct;
      p.stats.answered += score.total;
      p.stats.minutes += minutes;
      App.state.save();

      App.state.logDay({
        xp: score.xp, correct: score.correct, answered: score.total,
        minutes, blocks: [block.type],
      });

      if (xpRes.rankedUp) {
        UI.confetti(70);
        UI.modal((box, close) => {
          box.appendChild(el('div', { class: 'center', style: 'font-size:54px' }, xpRes.rank.icon));
          box.appendChild(el('h2', { class: 'center' }, '¡Nuevo rango!'));
          box.appendChild(el('p', { class: 'center' }, [
            el('b', {}, xpRes.rank.name), el('br'),
            el('span', { class: 'muted' }, xpRes.rank.es),
          ]));
          const b = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Seguir');
          b.addEventListener('click', close);
          box.appendChild(b);
        });
      }

      const prog = App.session.progress();
      if (prog.complete) return finishSession();

      // Siguiente bloque sin volver al inicio
      const nextIdx = plan.blocks.findIndex((b) => !b.done);
      App.app.go('session', { index: nextIdx });
    });
  };

  function finishSession() {
    const p = App.state.get();
    const plan = App.session.current();
    const streakBefore = p.streak;
    const sres = App.state.touchStreak();

    p.stats.sessions += 1;
    App.state.save();

    const dayTotals = App.state.history()[todayKey()] || { xp: 0, correct: 0, answered: 0 };
    const perfect = dayTotals.answered > 0 && dayTotals.correct === dayTotals.answered;
    const got = App.state.checkAchievements({ perfect, comeback: sres.broken });

    // Subimos enseguida: es el momento en que más duele perder el progreso.
    App.sync.background('session-complete');

    UI.confetti(80);
    App.app.go('done', { streak: sres.streak, achievements: got, perfect, totals: dayTotals });
  }

  views.done = function (root, params) {
    const p = App.state.get();
    const t = (params && params.totals) || { xp: 0, correct: 0, answered: 0 };
    const acc = t.answered ? t.correct / t.answered : 1;

    root.innerHTML = '';
    const card = el('div', { class: 'card center' });
    card.appendChild(el('div', { style: 'font-size:52px' }, '🎉'));
    card.appendChild(el('h1', {}, '¡Sesión completa!'));
    card.appendChild(el('p', { class: 'muted' },
      params && params.perfect ? 'Sin un solo error. Impresionante.' : 'Un día más sumado. Así se construye.'));

    card.appendChild(el('div', { class: 'stat-grid mt-lg' }, [
      stat('+' + t.xp, 'XP ganados', 'var(--accent)'),
      stat(`${Math.round(acc * 100)}%`, 'de aciertos', 'var(--blue)'),
      stat(String(params ? params.streak : p.streak), 'días de racha', 'var(--amber)'),
    ]));

    if (params && params.achievements && params.achievements.length) {
      card.appendChild(el('h3', { class: 'mt-lg' }, 'Logros desbloqueados'));
      const g = el('div', { class: 'ach-grid' });
      params.achievements.forEach((a) => {
        g.appendChild(el('div', { class: 'ach' }, [
          el('div', { class: 'ach-icon' }, a.icon),
          el('div', { class: 'ach-name' }, a.name),
        ]));
      });
      card.appendChild(g);
    }

    const tomorrow = App.session.ROTATION[App.core.weekdayOf(addDays(todayKey(), 1))];
    card.appendChild(el('div', { class: 'feedback mt-lg' },
      `Mañana te toca: ${App.session.BLOCK_META[tomorrow].icon} ${App.session.BLOCK_META[tomorrow].title}`));

    const b = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Volver al inicio');
    b.addEventListener('click', () => App.app.go('home'));
    card.appendChild(b);
    root.appendChild(card);
  };

  /* ============================================================
     PROGRESO
     ============================================================ */
  views.progress = function (root) {
    const p = App.state.get();
    const st = App.srs.stats();
    const rk = App.state.rankFor(p.xp);

    root.innerHTML = '';
    root.appendChild(el('h1', {}, 'Tu progreso'));

    /* --- Rango --- */
    const rankCard = el('div', { class: 'card' }, [
      el('div', { class: 'row' }, [
        el('div', { style: 'font-size:38px' }, rk.current.icon),
        el('div', { class: 'grow' }, [
          el('div', { style: 'font-weight:700;font-size:1.1rem' }, rk.current.name),
          el('div', { class: 'faint' }, rk.current.es),
        ]),
        el('div', { class: 'pill xp' }, `${p.xp} XP`),
      ]),
    ]);
    if (rk.next) {
      rankCard.appendChild(el('div', { class: 'xpbar mt' }, [
        el('div', { class: 'xpbar-top' }, [
          el('span', {}, `Faltan ${rk.toNext} XP`),
          el('span', {}, `→ ${rk.next.icon} ${rk.next.name}`),
        ]),
        el('div', { class: 'xpbar-track' },
          el('div', { class: 'xpbar-fill', style: `width:${rk.progress * 100}%` })),
      ]));
    }
    root.appendChild(rankCard);

    /* --- Números --- */
    root.appendChild(el('div', { class: 'stat-grid' }, [
      stat(String(p.streak), 'racha actual', 'var(--amber)'),
      stat(String(p.longestStreak || 0), 'mejor racha'),
      stat(String(p.stats.sessions), 'sesiones'),
      stat(String(Math.round(p.stats.minutes || 0)), 'minutos totales'),
      stat(String(st.mastered), 'palabras dominadas', 'var(--accent)'),
      stat(p.stats.answered ? Math.round(p.stats.correct / p.stats.answered * 100) + '%' : '—', 'aciertos'),
    ]));

    /* --- Mapa de actividad --- */
    const hmCard = el('div', { class: 'card' });
    hmCard.appendChild(el('h3', {}, 'Últimos 70 días'));
    const days = App.state.recentDays(70);
    const hm = el('div', { class: 'heatmap' });
    days.forEach((d) => {
      const lvl = d.xp === 0 ? '' : d.xp < 60 ? 'l1' : d.xp < 140 ? 'l2' : d.xp < 250 ? 'l3' : 'l4';
      hm.appendChild(el('div', {
        class: 'hm-cell ' + lvl,
        title: `${d.date}: ${d.xp} XP`,
      }));
    });
    hmCard.appendChild(hm);
    hmCard.appendChild(el('div', { class: 'faint mt' },
      `${days.filter((d) => d.xp > 0).length} días activos de los últimos 70`));
    root.appendChild(hmCard);

    /* --- Vocabulario --- */
    const vCard = el('div', { class: 'card' });
    vCard.appendChild(el('h3', {}, 'Vocabulario'));
    vCard.appendChild(el('div', { class: 'xpbar' }, [
      el('div', { class: 'xpbar-top' }, [
        el('span', {}, `${st.mastered} dominadas · ${st.learning} en curso`),
        el('span', {}, `${st.total} de ${App.vocab.ITEMS.length}`),
      ]),
      el('div', { class: 'xpbar-track' },
        el('div', { class: 'xpbar-fill', style: `width:${st.total / App.vocab.ITEMS.length * 100}%` })),
    ]));

    const hard = App.srs.hardest(8);
    if (hard.length) {
      vCard.appendChild(el('h4', { class: 'mt', style: 'font-size:.9rem;color:var(--text-dim)' },
        'Las que más te cuestan'));
      hard.forEach((h) => {
        vCard.appendChild(el('div', { class: 'unit-row' }, [
          el('div', { class: 'grow' }, [
            el('div', { style: 'font-weight:600' }, h.item.en),
            el('div', { class: 'faint' }, h.item.es),
          ]),
          el('span', { class: 'lvl-tag' }, `${h.card.lapses} fallos`),
        ]));
      });
    }
    root.appendChild(vCard);

    /* --- Ruta de gramática --- */
    const gCard = el('div', { class: 'card' });
    gCard.appendChild(el('h3', {}, 'Ruta de gramática'));
    const nextU = App.state.nextUnit();
    ['A2', 'B1', 'B2'].forEach((lvl) => {
      const units = App.grammar.byLevel(lvl);
      const done = units.filter((u) => p.units[u.id] && p.units[u.id].done).length;
      gCard.appendChild(el('div', { class: 'row spread mt', style: 'margin-bottom:4px' }, [
        el('b', {}, `Nivel ${lvl}`),
        el('span', { class: 'faint' }, `${done}/${units.length}`),
      ]));
      units.forEach((u) => {
        const state = p.units[u.id];
        const isNext = nextU && nextU.id === u.id;
        const row = el('div', { class: 'unit-row' }, [
          el('div', { class: 'unit-dot ' + (state && state.done ? 'done' : isNext ? 'current' : '') }),
          el('div', { class: 'grow' }, [
            el('div', { style: 'font-size:.92rem;font-weight:' + (isNext ? '650' : '500') }, u.title),
            el('div', { class: 'faint' }, u.titleEs),
          ]),
          state && state.best
            ? el('span', { class: 'lvl-tag' }, Math.round(state.best * 100) + '%')
            : el('span', { class: 'lvl-tag' }, isNext ? 'siguiente' : '—'),
        ]);
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => openUnit(u));
        gCard.appendChild(row);
      });
    });
    root.appendChild(gCard);

    /* --- Logros --- */
    const aCard = el('div', { class: 'card' });
    aCard.appendChild(el('h3', {}, `Logros (${p.achievements.length}/${App.state.ACHIEVEMENTS.length})`));
    const grid = el('div', { class: 'ach-grid' });
    App.state.ACHIEVEMENTS.forEach((a) => {
      const has = p.achievements.includes(a.id);
      grid.appendChild(el('div', { class: 'ach' + (has ? '' : ' locked'), title: a.desc }, [
        el('div', { class: 'ach-icon' }, a.icon),
        el('div', { class: 'ach-name' }, a.name),
      ]));
    });
    aCard.appendChild(grid);
    root.appendChild(aCard);

    /* --- Textos escritos --- */
    const journal = store.get('journal', []);
    if (journal.length) {
      const jCard = el('div', { class: 'card' });
      jCard.appendChild(el('h3', {}, 'Tus textos'));
      journal.slice(0, 10).forEach((j) => {
        const row = el('div', { class: 'unit-row' }, [
          el('div', { class: 'grow' }, [
            el('div', { style: 'font-size:.9rem' }, j.task.slice(0, 70) + (j.task.length > 70 ? '…' : '')),
            el('div', { class: 'faint' }, j.date),
          ]),
          j.score !== null ? el('span', { class: 'lvl-tag' }, `${j.score} · ${j.level || ''}`) : null,
        ]);
        row.style.cursor = 'pointer';
        row.addEventListener('click', () => {
          UI.modal((box, close) => {
            box.appendChild(el('h3', {}, 'Tu texto'));
            box.appendChild(el('p', { class: 'faint' }, j.task));
            box.appendChild(el('div', { class: 'theory' }, el('p', { style: 'margin:0;white-space:pre-wrap' }, j.text)));
            const b = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Cerrar');
            b.addEventListener('click', close);
            box.appendChild(b);
          });
        });
        jCard.appendChild(row);
      });
      root.appendChild(jCard);
    }
  };

  /* Ver la teoría de una unidad desde el mapa de progreso */
  function openUnit(u) {
    UI.modal((box, close) => {
      box.appendChild(el('h3', {}, u.title));
      box.appendChild(el('div', { class: 'faint', style: 'margin-bottom:12px' }, `${u.titleEs} · ${u.level}`));
      const th = el('div', { class: 'theory' });
      th.innerHTML = u.explain;
      box.appendChild(th);
      if (u.pitfall) {
        box.appendChild(el('div', { class: 'pitfall mt' },
          el('span', {}, [el('b', {}, '⚠ Ojo: '), u.pitfall])));
      }
      const practice = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Practicar esta unidad');
      practice.addEventListener('click', () => {
        close();
        App.app.go('practice', { unitId: u.id });
      });
      box.appendChild(practice);
      const b = el('button', { class: 'btn btn-ghost btn-lg mt' }, 'Cerrar');
      b.addEventListener('click', close);
      box.appendChild(b);
    });
  }

  /* Práctica suelta de una unidad (fuera de la sesión diaria) */
  views.practice = function (root, params) {
    const u = params && App.grammar.byId(params.unitId);
    if (!u) return App.app.go('progress');

    root.innerHTML = '';
    const bar = el('div', { class: 'row spread', style: 'margin-bottom:16px' });
    const back = el('button', { class: 'btn btn-ghost btn-sm' }, '← Volver');
    back.addEventListener('click', () => App.app.go('progress'));
    bar.appendChild(back);
    bar.appendChild(el('span', { class: 'pill' }, `${u.level} · ${u.title}`));
    root.appendChild(bar);

    const container = el('div', { class: 'card' });
    root.appendChild(container);

    App.activities.runQuiz(container, u.exercises.map(App.activities.toQuiz), (res) => {
      const acc = res.total ? res.correct / res.total : 0;
      App.state.recordUnit(u.id, acc);
      const xp = res.correct * 8;
      App.state.addXp(xp);
      App.state.logDay({ xp, correct: res.correct, answered: res.total, blocks: ['practice'] });

      container.innerHTML = '';
      container.appendChild(UI.resultRing(acc));
      container.appendChild(el('h2', { class: 'center' }, `${res.correct} de ${res.total}`));
      container.appendChild(el('p', { class: 'center muted' }, `+${xp} XP`));
      const b = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Volver al progreso');
      b.addEventListener('click', () => App.app.go('progress'));
      container.appendChild(b);
    });
  };

  /* ============================================================
     TUTOR (chat libre)
     ============================================================ */
  views.tutor = function (root) {
    root.innerHTML = '';
    root.appendChild(el('h1', {}, 'Tu tutor'));
    root.appendChild(el('p', { class: 'muted', style: 'margin-top:-8px' },
      'Preguntale lo que sea: una regla, una duda de traducción, cómo se dice algo.'));

    if (!App.ai.hasKey()) {
      root.appendChild(el('div', { class: 'card' }, [
        el('div', { class: 'empty' }, [
          el('div', { class: 'empty-icon' }, '🔑'),
          el('h3', {}, 'Falta tu API key'),
          el('p', { class: 'muted' },
            'El tutor usa Google Gemini, que tiene una capa gratuita. Conseguí tu clave en aistudio.google.com y pegala en Ajustes.'),
          (() => {
            const b = el('button', { class: 'btn btn-primary' }, 'Ir a Ajustes');
            b.addEventListener('click', () => App.app.go('settings'));
            return b;
          })(),
        ]),
      ]));
      return;
    }

    const card = el('div', { class: 'card' });
    const chat = el('div', { class: 'chat' });
    card.appendChild(chat);
    root.appendChild(card);

    const history = store.get('tutor.history', []);
    history.forEach((h) => {
      chat.appendChild(el('div', { class: 'bubble ' + (h.role === 'user' ? 'me' : 'ai') }, h.text));
    });

    if (!history.length) {
      const suggestions = [
        '¿Cuándo uso present perfect y cuándo past simple?',
        '¿Cómo escribo un email formal pidiendo una cotización?',
        '¿Cuál es la diferencia entre "make" y "do"?',
        'Dame 10 frases útiles para negociar en inglés.',
      ];
      const s = el('div', { class: 'stack' });
      s.appendChild(el('div', { class: 'faint' }, 'Probá con alguna de estas:'));
      suggestions.forEach((q) => {
        const b = el('button', { class: 'btn btn-ghost btn-sm', style: 'text-align:left;justify-content:flex-start' }, q);
        b.addEventListener('click', () => { input.value = q; send(); });
        s.appendChild(b);
      });
      chat.appendChild(s);
    }

    const row = el('div', { class: 'row mt' });
    const input = el('input', { type: 'text', placeholder: 'Escribí tu pregunta…' });
    const btn = el('button', { class: 'btn btn-primary' }, 'Enviar');
    row.appendChild(input); row.appendChild(btn);
    card.appendChild(row);

    const clear = el('button', { class: 'btn btn-ghost btn-sm mt' }, 'Borrar conversación');
    clear.addEventListener('click', () => {
      store.set('tutor.history', []);
      App.app.go('tutor');
    });
    card.appendChild(clear);

    async function send() {
      const q = input.value.trim();
      if (!q) return;
      input.value = '';
      const first = chat.querySelector('.stack');
      if (first) first.remove();

      chat.appendChild(el('div', { class: 'bubble me' }, q));
      const typing = el('div', { class: 'bubble ai' },
        el('span', { class: 'typing' }, [el('i'), el('i'), el('i')]));
      chat.appendChild(typing);
      typing.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      btn.disabled = true;

      try {
        const hist = store.get('tutor.history', []);
        const answer = await App.ai.ask(q, hist);
        typing.remove();
        const bubble = el('div', { class: 'bubble ai' });
        bubble.innerHTML = escapeHtml(answer)
          .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
          .replace(/`(.+?)`/g, '<code>$1</code>')
          .replace(/\n/g, '<br>');
        chat.appendChild(bubble);
        bubble.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        hist.push({ role: 'user', text: q }, { role: 'model', text: answer });
        store.set('tutor.history', hist.slice(-30));
      } catch (e) {
        typing.remove();
        UI.aiError(e);
      }
      btn.disabled = false;
      input.focus();
    }

    btn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
    setTimeout(() => input.focus(), 60);
  };

  /* ============================================================
     AJUSTES
     ============================================================ */
  views.settings = function (root) {
    const p = App.state.get();
    root.innerHTML = '';
    root.appendChild(el('h1', {}, 'Ajustes'));

    /* --- IA --- */
    const aiCard = el('div', { class: 'card' });
    aiCard.appendChild(el('div', { class: 'card-head' }, [
      el('div', { class: 'card-icon' }, '✦'),
      el('div', {}, [
        el('h3', { style: 'margin:0' }, 'Tutor con IA'),
        el('div', { class: 'faint' }, 'Google Gemini · capa gratuita'),
      ]),
    ]));

    const keyInput = el('input', {
      type: 'password', placeholder: 'AIza…', value: App.ai.getKey(),
      autocomplete: 'off', spellcheck: 'false',
    });
    aiCard.appendChild(el('label', { class: 'field' }, [
      el('span', {}, 'API key de Google AI Studio'), keyInput,
    ]));

    aiCard.appendChild(el('div', { class: 'faint', style: 'margin-top:-8px;margin-bottom:12px' }, [
      document.createTextNode('Conseguila gratis en '),
      el('a', { href: 'https://aistudio.google.com/apikey', target: '_blank', rel: 'noopener' }, 'aistudio.google.com/apikey'),
      document.createTextNode('. Se guarda solo en este navegador: nunca se sube a GitHub ni sale a ningún otro servidor.'),
    ]));

    const modelSelect = el('select', {});
    modelSelect.appendChild(el('option', { value: App.ai.getModel() }, App.ai.getModel()));
    aiCard.appendChild(el('label', { class: 'field' }, [el('span', {}, 'Modelo'), modelSelect]));

    const testBtn = el('button', { class: 'btn btn-primary grow' }, 'Guardar y probar');
    testBtn.addEventListener('click', async () => {
      App.ai.setKey(keyInput.value);
      if (!keyInput.value.trim()) {
        return UI.toast('Pegá una key primero.', 'bad');
      }
      UI.busy(testBtn, true, 'Probando…');
      try {
        const models = await App.ai.listModels();
        modelSelect.innerHTML = '';
        const current = App.ai.getModel();
        const preferred = models.find((m) => m.id === current)
          || models.find((m) => /2\.5-flash$/.test(m.id))
          || models.find((m) => /flash/.test(m.id))
          || models[0];
        models.forEach((m) => {
          modelSelect.appendChild(el('option', {
            value: m.id, selected: m.id === (preferred && preferred.id) ? 'selected' : null,
          }, m.id));
        });
        if (preferred) App.ai.setModel(preferred.id);
        UI.busy(testBtn, false);
        UI.toast(`✓ Conectado. ${models.length} modelos disponibles.`, '', 3500);
      } catch (e) {
        UI.busy(testBtn, false);
        UI.aiError(e);
      }
    });

    modelSelect.addEventListener('change', () => {
      App.ai.setModel(modelSelect.value);
      UI.toast('Modelo: ' + modelSelect.value, 'info');
    });

    const clearKey = el('button', { class: 'btn btn-ghost' }, 'Borrar key');
    clearKey.addEventListener('click', () => {
      App.ai.clearKey();
      keyInput.value = '';
      UI.toast('Key borrada', 'info');
    });
    aiCard.appendChild(el('div', { class: 'row' }, [testBtn, clearKey]));
    root.appendChild(aiCard);

    /* --- Perfil --- */
    const pCard = el('div', { class: 'card' });
    pCard.appendChild(el('h3', {}, 'Tu perfil'));

    const nameInput = el('input', { type: 'text', value: p.name || '', placeholder: 'Tu nombre' });
    nameInput.addEventListener('change', () => App.state.update({ name: nameInput.value.trim() }));
    pCard.appendChild(el('label', { class: 'field' }, [el('span', {}, 'Nombre'), nameInput]));

    const lvlSel = el('select', {});
    ['A2', 'B1', 'B2'].forEach((l) => {
      lvlSel.appendChild(el('option', { value: l, selected: p.level === l ? 'selected' : null }, l));
    });
    lvlSel.addEventListener('change', () => {
      App.state.update({ level: lvlSel.value });
      store.remove('session');
      UI.toast('Nivel actualizado. La sesión de hoy se regenera.', 'info', 3000);
    });
    pCard.appendChild(el('label', { class: 'field' }, [el('span', {}, 'Nivel actual'), lvlSel]));

    const lastTest = store.get('placement', null);
    const retest = el('button', { class: 'btn btn-ghost btn-sm' }, '🎯 Tomar el test de nivel');
    retest.addEventListener('click', () => {
      App.app.go('placement', {
        cancelTo: 'settings',
        onDone(lvl) {
          if (lvl) {
            App.state.update({ level: lvl });
            store.remove('session');
            UI.toast(`Nivel actualizado a ${lvl}.`, '', 3000);
          }
          App.app.go('settings');
        },
      });
    });
    pCard.appendChild(el('div', { style: 'margin-top:-8px;margin-bottom:14px' }, [
      retest,
      lastTest ? el('div', { class: 'faint', style: 'margin-top:6px' },
        `Último test: ${lastTest.date} · ${lastTest.cefr} (${lastTest.correct}/${lastTest.total})`) : null,
    ]));

    const minSel = el('select', {});
    [[15, '15 minutos'], [25, '25 minutos'], [45, '45 minutos']].forEach(([v, t]) => {
      minSel.appendChild(el('option', { value: v, selected: p.dailyMinutes === v ? 'selected' : null }, t));
    });
    minSel.addEventListener('change', () => {
      App.state.update({ dailyMinutes: Number(minSel.value) });
      store.remove('session');
      UI.toast('Duración actualizada.', 'info');
    });
    pCard.appendChild(el('label', { class: 'field' }, [el('span', {}, 'Tiempo por día'), minSel]));

    pCard.appendChild(el('label', { class: 'field' }, [el('span', {}, 'Temas de interés')]));
    const chips = el('div', { class: 'chips' });
    Object.entries(App.vocab.TOPIC_LABEL).forEach(([k, label]) => {
      if (k === 'core') return;
      const c = el('button', { class: 'chip' + (p.topics.includes(k) ? ' on' : '') }, label);
      c.addEventListener('click', () => {
        const t = p.topics.slice();
        const i = t.indexOf(k);
        if (i >= 0) { if (t.length > 1) t.splice(i, 1); else return UI.toast('Dejá al menos un tema.', 'bad'); }
        else t.push(k);
        App.state.update({ topics: t });
        c.classList.toggle('on');
      });
      chips.appendChild(c);
    });
    pCard.appendChild(chips);
    root.appendChild(pCard);

    /* --- Audio --- */
    const sCard = el('div', { class: 'card' });
    sCard.appendChild(el('h3', {}, 'Audio'));
    const voices = App.speech.englishVoices();
    if (voices.length) {
      const vSel = el('select', {});
      const cur = App.speech.preferredVoice();
      voices.forEach((v) => {
        vSel.appendChild(el('option', {
          value: v.name, selected: cur && v.name === cur.name ? 'selected' : null,
        }, `${v.name} (${v.lang})`));
      });
      vSel.addEventListener('change', () => {
        App.speech.setVoice(vSel.value);
        App.speech.speak('This is how I sound. Nice to meet you.');
      });
      sCard.appendChild(el('label', { class: 'field' }, [el('span', {}, 'Voz'), vSel]));
    } else {
      sCard.appendChild(el('p', { class: 'faint' }, 'No se detectaron voces en inglés en este navegador.'));
    }

    const rate = el('input', { type: 'number', min: '0.5', max: '1.5', step: '0.05', value: App.speech.getRate() });
    rate.addEventListener('change', () => {
      App.speech.setRate(Number(rate.value));
      App.speech.speak('The shipment will arrive on Monday.');
    });
    sCard.appendChild(el('label', { class: 'field' }, [el('span', {}, 'Velocidad (1 = normal)'), rate]));
    sCard.appendChild(el('div', { class: 'faint' },
      App.speech.srAvailable()
        ? '✓ Reconocimiento de voz disponible.'
        : '⚠ Reconocimiento de voz no disponible. Necesitás Chrome o Edge, y abrir la app desde https:// o localhost.'));
    root.appendChild(sCard);

    /* --- Apariencia --- */
    const tCard = el('div', { class: 'card' });
    tCard.appendChild(el('h3', {}, 'Apariencia'));
    const themeBtn = el('button', { class: 'btn' },
      store.get('theme', 'dark') === 'dark' ? '🌙 Tema oscuro' : '☀️ Tema claro');
    themeBtn.addEventListener('click', () => {
      const next = UI.toggleTheme();
      themeBtn.textContent = next === 'dark' ? '🌙 Tema oscuro' : '☀️ Tema claro';
    });
    tCard.appendChild(themeBtn);
    root.appendChild(tCard);

    /* --- Sincronización entre dispositivos --- */
    const syCard = el('div', { class: 'card' });
    syCard.appendChild(el('div', { class: 'card-head' }, [
      el('div', { class: 'card-icon' }, '🔄'),
      el('div', {}, [
        el('h3', { style: 'margin:0' }, 'Celular y computadora'),
        el('div', { class: 'faint' }, 'Sincroniza tu progreso con un Gist privado de GitHub'),
      ]),
    ]));

    if (App.sync.isOn()) {
      const last = App.sync.lastSync();
      syCard.appendChild(el('div', { class: 'feedback ok' }, [
        el('div', {}, [el('b', {}, '✓ Sincronización activa')]),
        el('div', { class: 'faint', style: 'margin-top:6px' },
          `Este dispositivo: ${App.sync.deviceName()}`),
        last ? el('div', { class: 'faint' },
          'Última sincronización: ' + new Date(last.at).toLocaleString('es-AR')) : null,
      ]));

      const syncBtn = el('button', { class: 'btn btn-primary grow' }, '🔄 Sincronizar ahora');
      syncBtn.addEventListener('click', async () => {
        UI.busy(syncBtn, true, 'Sincronizando…');
        try {
          const r = await App.sync.syncNow();
          UI.busy(syncBtn, false);
          UI.toast(r.pulled
            ? `Progreso fusionado con ${r.from || 'el otro dispositivo'}.`
            : 'Todo al día. Progreso subido.', '', 3500);
          if (r.pulled) App.app.go('settings');
        } catch (e) {
          UI.busy(syncBtn, false);
          UI.toast(e.message, 'bad', 5000);
        }
      });

      const offBtn = el('button', { class: 'btn btn-ghost' }, 'Desconectar');
      offBtn.addEventListener('click', () => {
        UI.confirm('Se desconecta este dispositivo. El Gist con tu progreso queda en tu cuenta de GitHub, no se borra.', () => {
          App.sync.disable();
          App.app.go('settings');
          UI.toast('Sincronización desconectada', 'info');
        });
      });
      syCard.appendChild(el('div', { class: 'row mt' }, [syncBtn, offBtn]));

      syCard.appendChild(el('div', { class: 'faint mt' },
        'Se sincroniza sola al abrir la app y al terminar cada sesión.'));

    } else {
      syCard.appendChild(el('p', { class: 'muted' },
        'Sin esto, el progreso del celular y el de la computadora son dos cosas separadas. Configuralo una vez en cada dispositivo y se mantienen iguales solos.'));

      const tokenInput = el('input', {
        type: 'password', placeholder: 'ghp_… o github_pat_…',
        autocomplete: 'off', spellcheck: 'false',
      });
      syCard.appendChild(el('label', { class: 'field' }, [
        el('span', {}, 'Token de GitHub (permiso de Gists)'), tokenInput,
      ]));

      const help = el('details', { style: 'margin:-6px 0 14px' });
      help.appendChild(el('summary', { class: 'faint', style: 'cursor:pointer' }, '¿Cómo saco el token? (2 minutos)'));
      const ol = el('ol', { class: 'faint', style: 'padding-left:20px;margin-top:8px;line-height:1.8' });
      [
        'Entrá a github.com → foto de perfil → Settings',
        'Abajo del todo: Developer settings → Personal access tokens → Tokens (classic)',
        'Generate new token (classic). Ponele de nombre "English Path".',
        'En Expiration elegí "No expiration" (si no, se corta y hay que rehacerlo).',
        'En la lista de permisos marcá SOLO la casilla "gist". Ninguna más.',
        'Generate token, copialo y pegalo acá. GitHub no te lo vuelve a mostrar.',
      ].forEach((t) => ol.appendChild(el('li', {}, t)));
      help.appendChild(ol);
      help.appendChild(el('div', { class: 'faint', style: 'margin-top:8px' },
        'Con sólo el permiso "gist" el token no puede tocar tu código ni tus repositorios.'));
      syCard.appendChild(help);

      const gistInput = el('input', {
        type: 'text', placeholder: 'Dejalo vacío en el primer dispositivo',
        autocomplete: 'off', spellcheck: 'false',
      });
      syCard.appendChild(el('label', { class: 'field' }, [
        el('span', {}, 'ID del Gist (para el segundo dispositivo)'), gistInput,
      ]));

      const connectBtn = el('button', { class: 'btn btn-primary btn-lg' }, 'Conectar');
      connectBtn.addEventListener('click', async () => {
        const tok = tokenInput.value.trim();
        if (!tok) return UI.toast('Pegá el token primero.', 'bad');
        App.sync.setToken(tok);
        UI.busy(connectBtn, true, 'Conectando…');
        try {
          const existing = gistInput.value.trim();
          if (existing) {
            // Segundo dispositivo: nos enganchamos al Gist que ya existe
            App.sync.setGistId(existing.replace(/^.*\//, ''));
            const remote = await App.sync.fetchRemote();
            if (!remote) throw new App.sync.SyncError('Ese Gist no tiene progreso guardado.', 'EMPTY');
            const r = await App.sync.syncNow();
            UI.busy(connectBtn, false);
            UI.toast('Conectado y progreso fusionado ✓', '', 4000);
            setTimeout(() => location.reload(), 1200);
          } else {
            // Primer dispositivo: creamos el Gist
            const id = await App.sync.connect();
            UI.busy(connectBtn, false);
            UI.modal((box, close) => {
              box.appendChild(el('div', { class: 'center', style: 'font-size:42px' }, '🔗'));
              box.appendChild(el('h3', { class: 'center' }, 'Listo, ya se sincroniza'));
              box.appendChild(el('p', { class: 'muted' },
                'Anotá este ID. Lo vas a necesitar para conectar tu otro dispositivo:'));
              const code = el('input', { type: 'text', value: id, readonly: 'readonly' });
              code.style.cssText += 'font-family:var(--mono);text-align:center';
              code.addEventListener('click', () => code.select());
              box.appendChild(code);
              box.appendChild(el('p', { class: 'faint mt' },
                'En el celular: abrí la app, Ajustes → pegá el mismo token y este ID.'));
              const b = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Entendido');
              b.addEventListener('click', () => { close(); App.app.go('settings'); });
              box.appendChild(b);
            }, { persistent: true });
          }
        } catch (e) {
          UI.busy(connectBtn, false);
          App.sync.disable();
          UI.toast(e.message, 'bad', 5000);
        }
      });
      syCard.appendChild(connectBtn);
    }
    root.appendChild(syCard);

    /* --- Datos --- */
    const dCard = el('div', { class: 'card' });
    dCard.appendChild(el('h3', {}, 'Copia de seguridad'));
    dCard.appendChild(el('p', { class: 'faint' },
      App.sync.isOn()
        ? 'Además de la sincronización, podés bajarte una copia en archivo.'
        : 'Tu progreso vive sólo en este navegador. Si borrás los datos del sitio, se pierde. Exportá de vez en cuando.'));

    const exportBtn = el('button', { class: 'btn' }, '⬇ Exportar progreso');
    exportBtn.addEventListener('click', () => {
      const data = JSON.stringify({ v: 1, exported: new Date().toISOString(), data: store.dump() }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = el('a', { href: url, download: `english-path-${todayKey()}.json` });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      UI.toast('Archivo descargado', '');
    });

    const importInput = el('input', { type: 'file', accept: 'application/json', style: 'display:none' });
    importInput.addEventListener('change', () => {
      const f = importInput.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          const payload = parsed.data || parsed;
          UI.confirm('Esto reemplaza tu progreso actual con el del archivo. ¿Seguimos?', () => {
            store.restore(payload);
            UI.toast('Progreso restaurado', '');
            setTimeout(() => location.reload(), 900);
          }, { danger: true, yes: 'Restaurar' });
        } catch (e) {
          UI.toast('El archivo no es válido.', 'bad');
        }
      };
      reader.readAsText(f);
    });
    const importBtn = el('button', { class: 'btn' }, '⬆ Importar progreso');
    importBtn.addEventListener('click', () => importInput.click());

    dCard.appendChild(el('div', { class: 'row wrap' }, [exportBtn, importBtn, importInput]));

    const resetBtn = el('button', { class: 'btn btn-danger mt' }, 'Borrar todo y empezar de cero');
    resetBtn.addEventListener('click', () => {
      UI.confirm('Se borra TODO: racha, XP, vocabulario aprendido y textos. No se puede deshacer.', () => {
        App.state.resetAll();
        store.remove('onboarded');
        location.reload();
      }, { danger: true, yes: 'Sí, borrar todo', title: '¿Seguro?' });
    });
    dCard.appendChild(resetBtn);
    root.appendChild(dCard);

    root.appendChild(el('p', { class: 'faint center mt-lg' },
      'English Path · hecho a medida para tu camino a Comercio Internacional'));
  };

  App.views = views;
})(window.App);
