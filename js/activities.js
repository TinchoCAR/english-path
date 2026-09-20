/* ============================================================
   activities.js — Renderizado y lógica de cada bloque
   API común:  App.activities.render(block, container, onComplete)
   onComplete({ correct, total, xp })
   ============================================================ */
(function (App) {
  'use strict';
  const { el, $, escapeHtml, answerMatches, normalize, makeRng, todayKey } = App.core;
  const UI = App.ui;

  const XP_CORRECT = 10;
  const XP_TRY = 3;
  const XP_BLOCK = 25;

  /* ============================================================
     MOTOR DE QUIZ REUTILIZABLE
     questions: [{kind:'choice'|'text'|'order', ...}]
     ============================================================ */
  function runQuiz(container, questions, onDone, opts) {
    const o = opts || {};
    let i = 0, correct = 0;
    const results = [];

    function next() {
      if (i >= questions.length) {
        onDone({ correct, total: questions.length, results });
        return;
      }
      render(questions[i]);
    }

    function advance(wasCorrect, detail) {
      if (wasCorrect) correct++;
      results.push({ q: questions[i], ok: wasCorrect, detail });
      i++;
      setTimeout(next, wasCorrect ? 750 : 2200);
    }

    function shell() {
      container.innerHTML = '';
      container.appendChild(UI.progressDots(questions.length, i));
      const head = el('div', { class: 'faint', style: 'margin-bottom:10px' },
        `Pregunta ${i + 1} de ${questions.length}`);
      container.appendChild(head);
      return container;
    }

    function feedback(ok, html) {
      const f = el('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') });
      f.innerHTML = html;
      return f;
    }

    function render(q) {
      const root = shell();

      if (q.instruction) {
        root.appendChild(el('div', { class: 'ex-hint' }, '➜ ' + q.instruction));
      }
      root.appendChild(UI.promptWithGap(q.prompt));
      if (q.hint) root.appendChild(el('div', { class: 'ex-hint' }, '💡 ' + q.hint));

      /* ---------- Opción múltiple ---------- */
      if (q.kind === 'choice') {
        const box = el('div', { class: 'options' });
        q.options.forEach((opt, idx) => {
          const btn = el('button', { class: 'option' }, [
            el('span', { class: 'option-key' }, String.fromCharCode(65 + idx)),
            el('span', {}, opt),
          ]);
          btn.addEventListener('click', () => {
            const ok = idx === q.correct;
            Array.from(box.children).forEach((c, ci) => {
              c.disabled = true;
              if (ci === q.correct) c.classList.add('correct');
              else if (ci === idx) c.classList.add('wrong');
            });
            root.appendChild(feedback(ok,
              ok ? `<b>¡Correcto!</b>${q.why ? ' ' + escapeHtml(q.why) : ''}`
                 : `La correcta era <b>${escapeHtml(q.options[q.correct])}</b>.${q.why ? '<br>' + escapeHtml(q.why) : ''}`));
            advance(ok);
          });
          box.appendChild(btn);
        });
        root.appendChild(box);
        return;
      }

      /* ---------- Respuesta escrita ---------- */
      if (q.kind === 'text') {
        const input = el('input', { type: 'text', placeholder: 'Escribí tu respuesta…', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
        const btn = el('button', { class: 'btn btn-primary' }, 'Comprobar');
        const row = el('div', { class: 'row mt' }, [input, btn]);
        root.appendChild(row);

        let checked = false;
        const check = () => {
          if (checked) return;
          const val = input.value.trim();
          if (!val) { input.focus(); return; }
          checked = true;
          input.disabled = true; btn.disabled = true;

          const m = answerMatches(val, q.accepted);
          const shown = Array.isArray(q.accepted) ? q.accepted[0] : q.accepted;
          root.appendChild(feedback(m.ok,
            m.ok
              ? (m.typo
                  ? `<b>Correcto</b>, aunque con un error de tipeo. Se escribe: <b>${escapeHtml(shown)}</b>`
                  : `<b>¡Correcto!</b>${q.why ? ' ' + escapeHtml(q.why) : ''}`)
              : `La respuesta esperada era: <b>${escapeHtml(shown)}</b>${q.why ? '<br>' + escapeHtml(q.why) : ''}`));
          advance(m.ok, val);
        };
        btn.addEventListener('click', check);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
        setTimeout(() => input.focus(), 50);
        return;
      }

      /* ---------- Ordenar palabras ---------- */
      if (q.kind === 'order') {
        const strip = el('div', { class: 'answer-strip' });
        const bank = el('div', { class: 'word-bank' });
        const chosen = [];

        const rng = makeRng(q.answer);
        rng.shuffle(q.words).forEach((w) => {
          const tile = el('button', { class: 'word-tile' }, w);
          tile.addEventListener('click', () => {
            if (tile.classList.contains('used')) return;
            tile.classList.add('used');
            chosen.push({ word: w, tile });
            const picked = el('button', { class: 'word-tile' }, w);
            picked.addEventListener('click', () => {
              tile.classList.remove('used');
              const idx = chosen.findIndex((c) => c.tile === tile);
              if (idx >= 0) chosen.splice(idx, 1);
              picked.remove();
            });
            strip.appendChild(picked);
          });
          bank.appendChild(tile);
        });

        root.appendChild(strip);
        root.appendChild(bank);

        const btn = el('button', { class: 'btn btn-primary' }, 'Comprobar');
        btn.addEventListener('click', () => {
          const given = chosen.map((c) => c.word).join(' ');
          if (!given) return;
          btn.disabled = true;
          Array.from(bank.children).forEach((c) => { c.disabled = true; });
          Array.from(strip.children).forEach((c) => { c.disabled = true; });
          const ok = normalize(given) === normalize(q.answer);
          root.appendChild(feedback(ok,
            ok ? '<b>¡Perfecto!</b>' : `El orden correcto es:<br><b>${escapeHtml(q.answer)}</b>`));
          advance(ok, given);
        });
        root.appendChild(el('div', { class: 'mt' }, btn));
        return;
      }
    }

    next();
  }

  /* Normaliza un ejercicio del banco de gramática al formato del quiz */
  function toQuiz(e) {
    if (e.t === 'choice') return { kind: 'choice', prompt: e.q, options: e.o, correct: e.a, why: e.why };
    if (e.t === 'order') return { kind: 'order', prompt: 'Ordená las palabras:', words: e.w, answer: e.a };
    if (e.t === 'transform') return { kind: 'text', prompt: e.q, instruction: e.ins, accepted: e.a, why: e.why };
    return { kind: 'text', prompt: e.q, accepted: e.a, hint: e.hint, why: e.why };
  }

  /* Pantalla de cierre de bloque */
  function finish(container, res, onComplete, extraXp) {
    const pct = res.total ? res.correct / res.total : 1;
    const xp = Math.round(res.correct * XP_CORRECT + (res.total - res.correct) * XP_TRY + XP_BLOCK + (extraXp || 0));

    container.innerHTML = '';
    container.appendChild(UI.resultRing(pct));
    container.appendChild(el('h2', { class: 'center' },
      pct === 1 ? '¡Impecable!' : pct >= 0.7 ? '¡Muy bien!' : pct >= 0.4 ? 'Bien, a seguir' : 'A repasar esto'));
    container.appendChild(el('p', { class: 'center muted' },
      `${res.correct} de ${res.total} correctas · +${xp} XP`));

    if (pct === 1 && res.total >= 4) UI.confetti();

    const btn = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Continuar');
    btn.addEventListener('click', () => onComplete({ correct: res.correct, total: res.total, xp }));
    container.appendChild(btn);
  }

  /* ============================================================
     BLOQUE: VOCABULARIO (flashcards con SRS)
     ============================================================ */
  function renderVocab(block, container, onComplete) {
    const queue = block.cards.map((c) => ({ ...c, item: App.vocab.byId(c.id) })).filter((c) => c.item);
    if (!queue.length) {
      container.innerHTML = '';
      container.appendChild(el('div', { class: 'empty' }, [
        el('div', { class: 'empty-icon' }, '🎉'),
        el('p', {}, 'No quedan palabras para repasar hoy.'),
      ]));
      const b = el('button', { class: 'btn btn-primary btn-lg' }, 'Continuar');
      b.addEventListener('click', () => onComplete({ correct: 0, total: 0, xp: 0 }));
      container.appendChild(b);
      return;
    }

    let idx = 0, good = 0, reviewed = 0;

    function show() {
      if (idx >= queue.length) {
        const xp = reviewed * 6 + XP_BLOCK;
        container.innerHTML = '';
        container.appendChild(UI.resultRing(reviewed ? good / reviewed : 1));
        container.appendChild(el('h2', { class: 'center' }, 'Vocabulario listo'));
        container.appendChild(el('p', { class: 'center muted' },
          `${reviewed} tarjetas · ${good} recordadas · +${xp} XP`));
        const b = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Continuar');
        b.addEventListener('click', () => onComplete({ correct: good, total: reviewed, xp }));
        container.appendChild(b);
        return;
      }

      const { item, isNew } = queue[idx];
      container.innerHTML = '';
      container.appendChild(UI.progressDots(queue.length, idx));

      const card = el('div', { class: 'flashcard' });
      card.appendChild(el('div', { class: 'fc-badge' },
        `${item.level} · ${App.vocab.TOPIC_LABEL[item.topic]}`));
      if (isNew) card.appendChild(el('div', { class: 'fc-new' }, 'NUEVA'));
      card.appendChild(el('div', { class: 'fc-word' }, item.en));
      card.appendChild(el('div', { class: 'fc-pos' }, App.vocab.POS_LABEL[item.pos] || ''));
      container.appendChild(card);

      const speak = UI.speakButton(item.en, '🔊 Escuchar');
      const actions = el('div', { class: 'row center mt', style: 'justify-content:center' });
      if (speak) actions.appendChild(speak);
      container.appendChild(actions);

      const reveal = el('button', { class: 'btn btn-primary btn-lg mt' }, '¿Qué significa? Mostrar');
      reveal.addEventListener('click', () => {
        card.appendChild(el('div', { class: 'fc-es' }, item.es));
        const ex = el('div', { class: 'fc-example' }, item.example);
        ex.appendChild(el('div', { class: 'fc-example-es' }, item.exampleEs));
        card.appendChild(ex);
        reveal.remove();

        const exSpeak = UI.speakButton(item.example, '🔊 Oración');
        if (exSpeak) actions.appendChild(exSpeak);

        const grades = el('div', { class: 'grade-row mt' });
        [
          ['again', 'No sabía', 'de nuevo', 'grade-again'],
          ['hard', 'Difícil', 'pronto', 'grade-hard'],
          ['good', 'Bien', 'normal', 'grade-good'],
          ['easy', 'Fácil', 'más tarde', 'grade-easy'],
        ].forEach(([g, label, sub, cls]) => {
          const b = el('button', { class: 'grade-btn ' + cls }, [
            el('b', {}, label), el('span', {}, sub),
          ]);
          b.addEventListener('click', () => {
            const card2 = App.srs.review(item.id, g);
            reviewed++;
            if (g !== 'again') good++;
            if (g === 'again') {
              // Vuelve al final de la cola, pero con tope: sin esto, apretar
              // "No sabía" una y otra vez haría que el bloque no termine nunca.
              const entry = queue[idx];
              entry.retries = (entry.retries || 0) + 1;
              if (entry.retries <= 2) queue.push(entry);
              else UI.toast('La dejamos para mañana', 'info', 1600);
            } else {
              const days = card2.interval;
              UI.toast(`Próximo repaso en ${days} día${days === 1 ? '' : 's'}`, 'info', 1400);
            }
            idx++;
            show();
          });
          grades.appendChild(b);
        });
        container.appendChild(grades);
      });
      container.appendChild(reveal);
    }
    show();
  }

  /* ============================================================
     BLOQUE: GRAMÁTICA (teoría + ejercicios)
     ============================================================ */
  function renderGrammar(block, container, onComplete) {
    const unit = App.grammar.byId(block.unitId);
    if (!unit) return onComplete({ correct: 0, total: 0, xp: 0 });

    function theory() {
      container.innerHTML = '';
      container.appendChild(el('div', { class: 'card-head' }, [
        el('div', { class: 'card-icon' }, '📐'),
        el('div', {}, [
          el('h2', { style: 'margin:0' }, unit.title),
          el('div', { class: 'faint' }, `${unit.titleEs} · Nivel ${unit.level}`),
        ]),
      ]));

      container.appendChild(el('div', { class: 'feedback', style: 'margin-bottom:16px' },
        el('span', {}, [el('b', {}, '¿Para qué sirve? '), unit.why])));

      const th = el('div', { class: 'theory' });
      th.innerHTML = unit.explain;
      container.appendChild(th);

      container.appendChild(el('h3', { class: 'mt' }, 'Ejemplos'));
      unit.examples.forEach((ex) => {
        const line = el('div', { class: 'example-line' }, [
          el('div', { class: 'en' }, ex.en),
          el('div', { class: 'es' }, ex.es),
        ]);
        const sp = UI.speakButton(ex.en);
        if (sp) { sp.style.cssText = 'float:right;margin-top:-30px'; line.appendChild(sp); }
        container.appendChild(line);
      });

      if (unit.pitfall) {
        container.appendChild(el('div', { class: 'pitfall mt' },
          el('span', {}, [el('b', {}, '⚠ Error típico del hispanohablante: '), unit.pitfall])));
      }

      const go = el('button', { class: 'btn btn-primary btn-lg mt-lg' }, 'Entendido, a practicar →');
      go.addEventListener('click', () => practice(block.exercises.map((i) => unit.exercises[i]).filter(Boolean)));
      container.appendChild(go);

      if (App.ai.hasKey()) {
        const fresh = el('button', { class: 'btn btn-ghost btn-lg mt' }, [
          el('span', { class: 'ai-badge' }, '✦ IA'),
          document.createTextNode(' Generar ejercicios nuevos'),
        ]);
        fresh.addEventListener('click', async () => {
          UI.busy(fresh, true, 'Generando…');
          try {
            const exs = await App.ai.generateExercises(unit, 6);
            if (!exs.length) throw new Error('La IA no devolvió ejercicios válidos.');
            practice(exs, true);
          } catch (e) { UI.aiError(e); UI.busy(fresh, false); }
        });
        container.appendChild(fresh);
      }
    }

    function practice(exercises, fromAi) {
      container.innerHTML = '';
      if (fromAi) {
        container.appendChild(el('div', { style: 'margin-bottom:12px' },
          el('span', { class: 'ai-badge' }, '✦ Ejercicios generados por IA')));
      }
      const wrap = el('div', {});
      container.appendChild(wrap);
      runQuiz(wrap, exercises.map(toQuiz), (res) => {
        const acc = res.total ? res.correct / res.total : 0;
        App.state.recordUnit(unit.id, acc);
        if (acc >= 0.75) UI.toast(`Unidad "${unit.title}" aprobada ✓`, '', 3000);
        finish(container, res, onComplete);
      });
    }

    theory();
  }

  /* ============================================================
     BLOQUE: LECTURA
     ============================================================ */
  function renderReading(block, container, onComplete) {
    let reading = App.content.READINGS.find((r) => r.id === block.readingId);
    if (!reading) return onComplete({ correct: 0, total: 0, xp: 0 });

    function show(r, fromAi) {
      container.innerHTML = '';
      container.appendChild(el('div', { class: 'card-head' }, [
        el('div', { class: 'card-icon' }, '📖'),
        el('div', {}, [
          el('h2', { style: 'margin:0' }, r.title),
          el('div', { class: 'faint' }, fromAi ? 'Generado por IA' : `Nivel ${r.level}`),
        ]),
      ]));

      const txt = el('div', { class: 'reading-text' });
      String(r.text).split(/\n\n+/).forEach((para) => txt.appendChild(el('p', {}, para.trim())));
      container.appendChild(txt);

      const sp = UI.speakButton(r.text, '🔊 Escuchar el texto');
      if (sp) { sp.className = 'btn btn-ghost'; container.appendChild(sp); }

      container.appendChild(el('hr', { class: 'divider' }));
      container.appendChild(el('h3', {}, 'Glosario'));
      const gl = el('div', { class: 'glossary' });
      (r.glossary || []).forEach(([en, es]) => {
        gl.appendChild(el('div', { class: 'gloss-item' }, [
          el('b', {}, en), el('span', { class: 'muted' }, es),
        ]));
      });
      container.appendChild(gl);

      const go = el('button', { class: 'btn btn-primary btn-lg mt-lg' }, 'Responder las preguntas →');
      go.addEventListener('click', () => {
        container.innerHTML = '';
        const wrap = el('div', {});
        container.appendChild(wrap);
        runQuiz(wrap, (r.questions || []).map((q) => ({
          kind: 'choice', prompt: q.q, options: q.o, correct: q.a,
        })), (res) => finish(container, res, onComplete));
      });
      container.appendChild(go);

      if (App.ai.hasKey() && !fromAi) {
        const fresh = el('button', { class: 'btn btn-ghost btn-lg mt' }, [
          el('span', { class: 'ai-badge' }, '✦ IA'),
          document.createTextNode(' Quiero otro texto'),
        ]);
        fresh.addEventListener('click', async () => {
          UI.busy(fresh, true, 'Escribiendo…');
          const p = App.state.get();
          const topic = App.vocab.TOPIC_LABEL[p.topics[Math.floor(Math.random() * p.topics.length)]] || 'General';
          try {
            const gen = await App.ai.generateReading(topic, p.level);
            if (!gen || !gen.text) throw new Error('Respuesta incompleta de la IA.');
            show(gen, true);
          } catch (e) { UI.aiError(e); UI.busy(fresh, false); }
        });
        container.appendChild(fresh);
      }
    }
    show(reading, false);
  }

  /* ============================================================
     BLOQUE: ESCUCHA
     ============================================================ */
  function renderListening(block, container, onComplete) {
    const d = App.content.DIALOGUES.find((x) => x.id === block.dialogueId);
    if (!d) return onComplete({ correct: 0, total: 0, xp: 0 });

    container.innerHTML = '';
    container.appendChild(el('div', { class: 'card-head' }, [
      el('div', { class: 'card-icon' }, '🎧'),
      el('div', {}, [
        el('h2', { style: 'margin:0' }, d.title),
        el('div', { class: 'faint' }, `Nivel ${d.level} · Escuchá antes de leer`),
      ]),
    ]));

    if (!App.speech.ttsAvailable()) {
      container.appendChild(el('div', { class: 'pitfall' },
        'Tu navegador no soporta audio. Podés leer el diálogo igual.'));
    }

    const lines = el('div', { class: 'dialogue' });
    const nodes = d.lines.map((l) => {
      const node = el('div', { class: 'd-line hidden-text' }, [
        el('div', { class: 'd-speaker' }, l.s),
        el('div', { class: 'd-text' }, l.t),
      ]);
      lines.appendChild(node);
      return node;
    });
    container.appendChild(lines);

    let revealed = false;
    const controls = el('div', { class: 'row mt wrap' });

    const play = el('button', { class: 'btn btn-primary' }, '▶ Reproducir diálogo');
    play.addEventListener('click', async () => {
      play.disabled = true; play.textContent = '⏸ Reproduciendo…';
      try {
        await App.speech.speakDialogue(d.lines, (i) => {
          nodes.forEach((n, ni) => n.classList.toggle('active', ni === i));
        });
      } catch (e) { UI.toast(e.message, 'bad'); }
      nodes.forEach((n) => n.classList.remove('active'));
      play.disabled = false; play.textContent = '▶ Reproducir de nuevo';
    });
    controls.appendChild(play);

    const revealBtn = el('button', { class: 'btn btn-ghost' }, '👁 Mostrar texto');
    revealBtn.addEventListener('click', () => {
      revealed = !revealed;
      nodes.forEach((n) => n.classList.toggle('hidden-text', !revealed));
      revealBtn.textContent = revealed ? '🙈 Ocultar texto' : '👁 Mostrar texto';
    });
    controls.appendChild(revealBtn);

    const slow = el('button', { class: 'btn btn-ghost btn-sm' }, '🐢 Más lento');
    slow.addEventListener('click', () => {
      const r = App.speech.getRate();
      const nr = r > 0.75 ? 0.7 : 1.0;
      App.speech.setRate(nr);
      UI.toast(nr < 0.9 ? 'Velocidad reducida' : 'Velocidad normal', 'info', 1400);
    });
    controls.appendChild(slow);
    container.appendChild(controls);

    const go = el('button', { class: 'btn btn-primary btn-lg mt-lg' }, 'Responder las preguntas →');
    go.addEventListener('click', () => {
      App.speech.stop();
      container.innerHTML = '';
      const wrap = el('div', {});
      container.appendChild(wrap);
      runQuiz(wrap, d.questions.map((q) => ({
        kind: 'choice', prompt: q.q, options: q.o, correct: q.a,
      })), (res) => finish(container, res, onComplete));
    });
    container.appendChild(go);
  }

  /* ============================================================
     BLOQUE: ESCRITURA (corrección con IA)
     ============================================================ */
  function renderWriting(block, container, onComplete) {
    const w = App.content.WRITING.find((x) => x.id === block.promptId);
    if (!w) return onComplete({ correct: 0, total: 0, xp: 0 });

    container.innerHTML = '';
    container.appendChild(el('div', { class: 'card-head' }, [
      el('div', { class: 'card-icon' }, '✍️'),
      el('div', {}, [
        el('h2', { style: 'margin:0' }, 'Escritura'),
        el('div', { class: 'faint' }, `Nivel ${w.level} · ~${w.words} palabras`),
      ]),
    ]));

    container.appendChild(el('div', { class: 'theory' }, [
      el('p', { style: 'font-size:1.05rem;margin-bottom:12px' }, w.task),
      el('div', { class: 'faint' }, 'Tu texto debe incluir:'),
      (() => {
        const ul = el('ul', { style: 'margin:6px 0 0;padding-left:20px;color:var(--text-dim);font-size:.88rem' });
        w.must.forEach((m) => ul.appendChild(el('li', {}, m)));
        return ul;
      })(),
    ]));

    const ta = el('textarea', { placeholder: 'Write in English here…', spellcheck: 'false' });
    container.appendChild(ta);

    const counter = el('div', { class: 'faint', style: 'text-align:right;margin-top:6px' }, '0 palabras');
    container.appendChild(counter);
    ta.addEventListener('input', () => {
      const n = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
      counter.textContent = `${n} palabras` + (n < w.words * 0.6 ? ` · objetivo ~${w.words}` : ' ✓');
      counter.style.color = n >= w.words * 0.6 ? 'var(--accent)' : '';
    });

    const send = el('button', { class: 'btn btn-primary btn-lg mt' }, [
      el('span', { class: 'ai-badge' }, '✦ IA'),
      document.createTextNode(' Corregir mi texto'),
    ]);

    send.addEventListener('click', async () => {
      const text = ta.value.trim();
      if (text.split(/\s+/).length < 15) {
        return UI.toast('Escribí un poco más antes de corregir.', 'bad');
      }
      if (!App.ai.hasKey()) {
        return UI.toast('Necesitás configurar tu API key en Ajustes para la corrección.', 'bad', 4000);
      }
      UI.busy(send, true, 'Corrigiendo…');
      try {
        const r = await App.ai.correctWriting(text, w.task, w.must);
        showCorrection(r, text);
      } catch (e) {
        UI.aiError(e);
        UI.busy(send, false);
      }
    });
    container.appendChild(send);

    // Salida sin IA: guardar el texto y seguir
    const skip = el('button', { class: 'btn btn-ghost mt' }, 'Guardar sin corregir y continuar');
    skip.addEventListener('click', () => {
      saveJournal(w, ta.value.trim(), null);
      onComplete({ correct: 1, total: 1, xp: XP_BLOCK + 10 });
    });
    container.appendChild(skip);

    function showCorrection(r, original) {
      saveJournal(w, original, r);
      const p = App.state.get();
      p.stats.writings = (p.stats.writings || 0) + 1;
      App.state.save();

      container.innerHTML = '';
      const score = Math.max(0, Math.min(100, Number(r.score) || 0));
      container.appendChild(UI.resultRing(score / 100));
      container.appendChild(el('h2', { class: 'center' }, `Nivel estimado: ${r.level_estimate || '—'}`));
      container.appendChild(el('p', { class: 'center muted' }, r.summary || ''));

      if (Array.isArray(r.corrections) && r.corrections.length) {
        container.appendChild(el('h3', { class: 'mt-lg' }, 'Correcciones'));
        r.corrections.forEach((c) => {
          const box = el('div', { class: 'feedback bad', style: 'margin-bottom:10px' });
          box.innerHTML =
            `<div style="margin-bottom:6px"><s>${escapeHtml(c.original || '')}</s> → <b>${escapeHtml(c.fixed || '')}</b></div>` +
            `<div class="faint">${escapeHtml(c.why || '')}</div>`;
          container.appendChild(box);
        });
      } else {
        container.appendChild(el('div', { class: 'feedback ok mt' }, '¡Sin errores importantes! Muy bien.'));
      }

      if (r.improved_version) {
        container.appendChild(el('h3', { class: 'mt-lg' }, 'Versión mejorada'));
        const imp = el('div', { class: 'theory' }, el('p', { style: 'margin:0' }, r.improved_version));
        container.appendChild(imp);
        const sp = UI.speakButton(r.improved_version, '🔊 Escuchar');
        if (sp) container.appendChild(sp);
      }

      if (r.next_focus) {
        container.appendChild(el('div', { class: 'pitfall mt' },
          el('span', {}, [el('b', {}, '🎯 A trabajar la próxima: '), r.next_focus])));
      }

      const xp = Math.round(XP_BLOCK + score * 0.6);
      const done = el('button', { class: 'btn btn-primary btn-lg mt-lg' }, `Continuar (+${xp} XP)`);
      done.addEventListener('click', () => onComplete({ correct: score >= 60 ? 1 : 0, total: 1, xp }));
      container.appendChild(done);
    }
  }

  function saveJournal(prompt, text, correction) {
    const j = App.core.store.get('journal', []);
    j.unshift({
      date: todayKey(), promptId: prompt.id, task: prompt.task,
      text, score: correction ? correction.score : null,
      level: correction ? correction.level_estimate : null,
    });
    App.core.store.set('journal', j.slice(0, 60));
  }

  /* ============================================================
     BLOQUE: PRONUNCIACIÓN + ROLEPLAY CORTO
     ============================================================ */
  function renderSpeaking(block, container, onComplete) {
    const words = (block.words || []).map((id) => App.vocab.byId(id)).filter(Boolean);
    let idx = 0, total = 0, sum = 0;

    if (!App.speech.srAvailable()) {
      container.innerHTML = '';
      container.appendChild(el('div', { class: 'card-head' }, [
        el('div', { class: 'card-icon' }, '🎤'),
        el('h2', { style: 'margin:0' }, 'Pronunciación'),
      ]));
      container.appendChild(el('div', { class: 'pitfall' },
        'Tu navegador no soporta reconocimiento de voz. Necesitás Chrome o Edge, y abrir la app desde https:// o localhost (no funciona con doble clic en el archivo). Igual podés practicar escuchando y repitiendo.'));

      const listWrap = el('div', { class: 'stack mt' });
      words.forEach((wd) => {
        const row = el('div', { class: 'example-line row spread' }, [
          el('div', {}, [el('div', { class: 'en' }, wd.en), el('div', { class: 'es' }, wd.es)]),
        ]);
        const sp = UI.speakButton(wd.example, '🔊');
        if (sp) row.appendChild(sp);
        listWrap.appendChild(row);
      });
      container.appendChild(listWrap);

      const b = el('button', { class: 'btn btn-primary btn-lg mt-lg' }, 'Continuar');
      b.addEventListener('click', () => onComplete({ correct: 0, total: 0, xp: XP_BLOCK }));
      container.appendChild(b);
      return;
    }

    function show() {
      if (idx >= words.length) {
        const avg = total ? sum / total : 0;
        const xp = Math.round(XP_BLOCK + avg * 0.5 * total);
        container.innerHTML = '';
        container.appendChild(UI.resultRing(avg / 100));
        container.appendChild(el('h2', { class: 'center' }, 'Pronunciación'));
        container.appendChild(el('p', { class: 'center muted' },
          `Promedio ${Math.round(avg)}% · +${xp} XP`));
        const b = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Continuar');
        b.addEventListener('click', () => onComplete({ correct: Math.round(avg / 100 * total), total, xp }));
        container.appendChild(b);
        return;
      }

      const wd = words[idx];
      const target = wd.example;

      container.innerHTML = '';
      container.appendChild(UI.progressDots(words.length, idx));
      container.appendChild(el('div', { class: 'card-head' }, [
        el('div', { class: 'card-icon' }, '🎤'),
        el('div', {}, [
          el('h2', { style: 'margin:0' }, 'Repetí la frase'),
          el('div', { class: 'faint' }, 'Escuchá, después tocá el micrófono'),
        ]),
      ]));

      const card = el('div', { class: 'flashcard' }, [
        el('div', { class: 'fc-word', style: 'font-size:1.3rem;line-height:1.5' }, target),
        el('div', { class: 'fc-example-es' }, wd.exampleEs),
      ]);
      container.appendChild(card);

      const row = el('div', { class: 'row mt', style: 'justify-content:center' });
      const sp = UI.speakButton(target, '🔊 Escuchar');
      if (sp) row.appendChild(sp);
      const skip = el('button', { class: 'btn btn-ghost btn-sm' }, 'Saltear →');
      skip.addEventListener('click', () => { idx++; show(); });
      row.appendChild(skip);
      container.appendChild(row);

      const mic = el('div', { class: 'mic-btn mt-lg' }, '🎤');
      container.appendChild(mic);
      const status = el('div', { class: 'center faint mt' }, 'Tocá para grabar');
      container.appendChild(status);

      mic.addEventListener('click', async () => {
        if (mic.classList.contains('rec')) return;
        mic.classList.add('rec');
        status.textContent = 'Escuchando… hablá ahora';
        try {
          const heard = await App.speech.listen({
            onPartial: (t) => { status.textContent = t || 'Escuchando…'; },
            timeout: 10000,
          });
          mic.classList.remove('rec');
          const r = App.speech.scorePronunciation(target, heard);
          total++; sum += r.score;

          const fb = el('div', { class: 'feedback ' + (r.score >= 70 ? 'ok' : 'bad') + ' mt' });
          fb.innerHTML = `<b>${r.score}%</b> — ${escapeHtml(r.verdict)}<br>
            <div class="faint" style="margin-top:8px">Se escuchó: "${escapeHtml(heard || '—')}"</div>
            <div style="margin-top:8px">${r.words.map((w) =>
              `<span class="pron-word ${w.ok ? 'ok' : 'no'}">${escapeHtml(w.word)}</span>`).join('')}</div>`;
          container.appendChild(fb);
          status.textContent = '';

          const next = el('button', { class: 'btn btn-primary btn-lg mt' },
            idx === words.length - 1 ? 'Terminar' : 'Siguiente →');
          next.addEventListener('click', () => { idx++; show(); });
          container.appendChild(next);
        } catch (e) {
          mic.classList.remove('rec');
          status.textContent = '';
          UI.toast(e.message, 'bad', 4000);
        }
      });
    }
    show();
  }

  /* ============================================================
     BLOQUE: TRADUCCIÓN
     ============================================================ */
  function renderTranslation(block, container, onComplete) {
    const items = block.items.map((i) => App.content.TRANSLATIONS[i]).filter(Boolean);
    let idx = 0, correct = 0;

    function show() {
      if (idx >= items.length) {
        return finish(container, { correct, total: items.length }, onComplete);
      }
      const it = items[idx];
      container.innerHTML = '';
      container.appendChild(UI.progressDots(items.length, idx));
      container.appendChild(el('div', { class: 'card-head' }, [
        el('div', { class: 'card-icon' }, '🔄'),
        el('div', {}, [
          el('h2', { style: 'margin:0' }, 'Traducí al inglés'),
          el('div', { class: 'faint' }, it.focus ? `Foco: ${it.focus}` : ''),
        ]),
      ]));

      container.appendChild(el('div', { class: 'flashcard', style: 'min-height:120px' },
        el('div', { class: 'fc-word', style: 'font-size:1.35rem;line-height:1.5' }, it.es)));

      const ta = el('textarea', { placeholder: 'Your translation…', style: 'min-height:80px', spellcheck: 'false' });
      container.appendChild(ta);

      const btn = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Comprobar');
      container.appendChild(btn);
      setTimeout(() => ta.focus(), 50);

      let checked = false;
      async function check() {
        if (checked) return;
        const val = ta.value.trim();
        if (!val) return;
        checked = true;
        ta.disabled = true;
        UI.busy(btn, true, 'Revisando…');

        const local = answerMatches(val, it.en);
        let ok = local.ok, feedbackText = '', better = '';

        // Si la respuesta literal no coincide, la IA decide si igual es válida.
        if (!ok && App.ai.hasKey()) {
          try {
            const r = await App.ai.checkTranslation(it.es, val, it.en);
            ok = !!r.ok;
            feedbackText = r.feedback || '';
            better = r.better || '';
          } catch (e) { /* sin IA seguimos con la comparación literal */ }
        }

        UI.busy(btn, false);
        btn.style.display = 'none';
        if (ok) correct++;

        const fb = el('div', { class: 'feedback ' + (ok ? 'ok' : 'bad') + ' mt' });
        fb.innerHTML = ok
          ? `<b>¡Correcto!</b> ${escapeHtml(feedbackText)}` +
            (better ? `<div class="faint" style="margin-top:6px">Más natural: <b>${escapeHtml(better)}</b></div>` : '')
          : `Referencia: <b>${escapeHtml(it.en[0])}</b>` +
            (feedbackText ? `<div class="faint" style="margin-top:6px">${escapeHtml(feedbackText)}</div>` : '');
        container.appendChild(fb);

        const sp = UI.speakButton(it.en[0], '🔊 Escuchar la referencia');
        if (sp) { sp.className = 'btn btn-ghost btn-sm mt'; container.appendChild(sp); }

        const next = el('button', { class: 'btn btn-primary btn-lg mt' },
          idx === items.length - 1 ? 'Terminar' : 'Siguiente →');
        next.addEventListener('click', () => { idx++; show(); });
        container.appendChild(next);
      }
      btn.addEventListener('click', check);
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) check();
      });
    }
    show();
  }

  /* ============================================================
     BLOQUE: ROLEPLAY CON LA IA
     ============================================================ */
  function renderRoleplay(block, container, onComplete) {
    const rp = App.content.ROLEPLAYS.find((x) => x.id === block.roleplayId);
    if (!rp) return onComplete({ correct: 0, total: 0, xp: 0 });

    container.innerHTML = '';
    container.appendChild(el('div', { class: 'card-head' }, [
      el('div', { class: 'card-icon' }, '💬'),
      el('div', {}, [
        el('h2', { style: 'margin:0' }, rp.title),
        el('div', { class: 'faint' }, `Nivel ${rp.level}`),
      ]),
    ]));

    container.appendChild(el('div', { class: 'theory' }, [
      el('p', {}, [el('b', {}, 'Tu rol: '), rp.role]),
      el('p', { style: 'margin:0' }, [el('b', {}, 'Objetivo: '), rp.goal]),
    ]));

    if (!App.ai.hasKey()) {
      container.appendChild(el('div', { class: 'pitfall mt' },
        'Este bloque necesita la IA. Configurá tu API key de Gemini en Ajustes (es gratis) para conversar.'));
      const b = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Continuar');
      b.addEventListener('click', () => onComplete({ correct: 0, total: 0, xp: 5 }));
      container.appendChild(b);
      return;
    }

    const chat = el('div', { class: 'chat mt' });
    container.appendChild(chat);

    const history = [];
    let turns = 0;
    const MIN_TURNS = 5;

    function bubble(cls, text) {
      const b = el('div', { class: 'bubble ' + cls }, text);
      chat.appendChild(b);
      b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return b;
    }

    function note(cls, text) {
      const b = el('div', { class: cls }, text);
      chat.appendChild(b);
      b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const inputRow = el('div', { class: 'row mt' });
    const input = el('input', { type: 'text', placeholder: 'Type in English…', autocomplete: 'off' });
    const sendBtn = el('button', { class: 'btn btn-primary' }, 'Enviar');
    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);

    if (App.speech.srAvailable()) {
      const micBtn = el('button', { class: 'btn btn-ghost btn-icon', title: 'Hablar' }, '🎤');
      micBtn.addEventListener('click', async () => {
        micBtn.classList.add('rec');
        try {
          const heard = await App.speech.listen({
            onPartial: (t) => { input.value = t; },
            timeout: 12000,
          });
          input.value = heard;
        } catch (e) { UI.toast(e.message, 'bad'); }
        micBtn.classList.remove('rec');
      });
      inputRow.appendChild(micBtn);
    }
    container.appendChild(inputRow);

    const endBtn = el('button', { class: 'btn btn-ghost mt' }, 'Terminar conversación');
    endBtn.addEventListener('click', () => end());
    container.appendChild(endBtn);

    async function send() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      bubble('me', text);
      history.push({ role: 'user', text });
      turns++;

      const typing = el('div', { class: 'bubble ai' },
        el('span', { class: 'typing' }, [el('i'), el('i'), el('i')]));
      chat.appendChild(typing);
      typing.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      sendBtn.disabled = true;

      try {
        const r = await App.ai.roleplayTurn(rp, history.slice(0, -1), text);
        typing.remove();
        bubble('ai', r.reply || '…');
        history.push({ role: 'model', text: r.reply || '' });
        if (r.correction) note('bubble-note', '✏️ ' + r.correction);
        if (r.tip) note('bubble-tip', '💡 ' + r.tip);
        if (App.speech.ttsAvailable() && r.reply) App.speech.speak(r.reply).catch(() => {});
        if (turns >= MIN_TURNS) {
          endBtn.className = 'btn btn-primary mt';
          endBtn.textContent = `Terminar conversación (${turns} turnos) ✓`;
        }
      } catch (e) {
        typing.remove();
        UI.aiError(e);
      }
      sendBtn.disabled = false;
      input.focus();
    }

    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });

    function end() {
      App.speech.stop();
      const p = App.state.get();
      p.stats.roleplays = (p.stats.roleplays || 0) + 1;
      App.state.save();
      const xp = XP_BLOCK + turns * 12;
      container.innerHTML = '';
      container.appendChild(UI.resultRing(Math.min(1, turns / MIN_TURNS)));
      container.appendChild(el('h2', { class: 'center' }, 'Conversación terminada'));
      container.appendChild(el('p', { class: 'center muted' }, `${turns} turnos · +${xp} XP`));
      const b = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Continuar');
      b.addEventListener('click', () => onComplete({ correct: turns, total: Math.max(turns, MIN_TURNS), xp }));
      container.appendChild(b);
    }

    // Arranque: la IA abre la escena
    (async () => {
      const typing = el('div', { class: 'bubble ai' },
        el('span', { class: 'typing' }, [el('i'), el('i'), el('i')]));
      chat.appendChild(typing);
      try {
        const r = await App.ai.roleplayTurn(rp, [], '(The student is ready. Open the scene with a natural first line, in character.)');
        typing.remove();
        bubble('ai', r.reply || 'Hello!');
        history.push({ role: 'model', text: r.reply || 'Hello!' });
        if (App.speech.ttsAvailable() && r.reply) App.speech.speak(r.reply).catch(() => {});
      } catch (e) {
        typing.remove();
        UI.aiError(e);
      }
      input.focus();
    })();
  }

  /* ============================================================
     BLOQUE: DESAFÍO SEMANAL
     ============================================================ */
  function renderBoss(block, container, onComplete) {
    const questions = block.questions.map((q) => {
      if (q.kind === 'grammar') {
        const u = App.grammar.byId(q.unitId);
        const ex = u && u.exercises[q.exIndex];
        return ex ? toQuiz(ex) : null;
      }
      if (q.kind === 'vocab') {
        const item = App.vocab.byId(q.id);
        if (!item) return null;
        const rng = makeRng(todayKey() + item.id);
        const distractors = rng.sample(
          App.vocab.ITEMS.filter((v) => v.id !== item.id && v.pos === item.pos), 3
        ).map((v) => v.es);
        const options = rng.shuffle([item.es].concat(distractors));
        return {
          kind: 'choice',
          prompt: `¿Qué significa "${item.en}"?`,
          options,
          correct: options.indexOf(item.es),
        };
      }
      if (q.kind === 'translation') {
        const t = App.content.TRANSLATIONS[q.index];
        if (!t) return null;
        return { kind: 'text', prompt: t.es, instruction: 'Traducí al inglés', accepted: t.en };
      }
      return null;
    }).filter(Boolean);

    container.innerHTML = '';
    container.appendChild(el('div', { class: 'card-head' }, [
      el('div', { class: 'card-icon' }, '⚔️'),
      el('div', {}, [
        el('h2', { style: 'margin:0' }, 'Desafío semanal'),
        el('div', { class: 'faint' }, 'Todo lo que viste esta semana, mezclado'),
      ]),
    ]));

    const start = el('button', { class: 'btn btn-primary btn-lg mt' },
      `Empezar (${questions.length} preguntas)`);
    start.addEventListener('click', () => {
      container.innerHTML = '';
      const wrap = el('div', {});
      container.appendChild(wrap);
      runQuiz(wrap, questions, (res) => {
        const bonus = res.correct === res.total ? 60 : 0;
        if (bonus) UI.toast('¡Desafío perfecto! +60 XP extra', '', 3500);
        finish(container, res, onComplete, bonus);
      });
    });
    container.appendChild(start);
  }

  /* ============================================================
     DESPACHADOR
     ============================================================ */
  const RENDERERS = {
    vocab: renderVocab,
    grammar: renderGrammar,
    reading: renderReading,
    listening: renderListening,
    writing: renderWriting,
    speaking: renderSpeaking,
    translation: renderTranslation,
    roleplay: renderRoleplay,
    boss: renderBoss,
  };

  function render(block, container, onComplete) {
    const fn = RENDERERS[block.type];
    if (!fn) {
      container.innerHTML = '<p class="muted">Bloque desconocido.</p>';
      return onComplete({ correct: 0, total: 0, xp: 0 });
    }
    App.speech.stop();
    fn(block, container, onComplete);
  }

  App.activities = { render, runQuiz, toQuiz, XP_CORRECT, XP_BLOCK };
})(window.App);
