/* ============================================================
   games.js — Juegos del modo Examen
   Firma común: render(exam, container, onDone)
   onDone({ correct, total, extra })  — se guarda SOLO dentro del
   examen: ningún juego escribe en el progreso general.
   ============================================================ */
(function (App) {
  'use strict';
  const { el, escapeHtml, makeRng, normalize, answerMatches, clamp } = App.core;
  const UI = App.ui;

  const CATALOG = [
    { id: 'memory', icon: '🃏', name: 'Memoria', desc: 'Emparejá cada palabra con su traducción', needs: 'vocab', min: 4 },
    { id: 'speed', icon: '⚡', name: 'Contrarreloj', desc: '60 segundos, todas las que puedas', needs: 'any', min: 4 },
    { id: 'hangman', icon: '🔤', name: 'Ahorcado', desc: 'Adiviná la palabra letra por letra', needs: 'vocab', min: 3 },
    { id: 'cards', icon: '📇', name: 'Fichas', desc: 'Repaso rápido para el día antes', needs: 'vocab', min: 3 },
    { id: 'practice', icon: '✏️', name: 'Práctica', desc: 'Ejercicios con explicación', needs: 'questions', min: 3 },
    { id: 'mock', icon: '📝', name: 'Simulacro', desc: 'Como la prueba: sin ayudas y con nota', needs: 'any', min: 6 },
  ];

  function available(exam) {
    const nv = (exam.vocab || []).length;
    const nq = (exam.questions || []).length;
    return CATALOG.filter((g) => {
      if (g.needs === 'vocab') return nv >= g.min;
      if (g.needs === 'questions') return nq >= g.min || nv >= 4;
      return nq + nv >= g.min;
    });
  }

  /* Pantalla de cierre compartida */
  function finish(container, title, lines, score, onDone, extraNode) {
    container.innerHTML = '';
    const pct = score.total ? score.correct / score.total : 0;
    container.appendChild(UI.resultRing(pct));
    container.appendChild(el('h2', { class: 'center' }, title));
    lines.filter(Boolean).forEach((l) => container.appendChild(el('p', { class: 'center muted' }, l)));
    if (extraNode) container.appendChild(extraNode);
    if (pct === 1 && score.total >= 4) UI.confetti(50);

    const b = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Volver');
    b.addEventListener('click', () => onDone(score));
    container.appendChild(b);

    const again = el('button', { class: 'btn btn-ghost btn-lg mt' }, 'Jugar de nuevo');
    again.addEventListener('click', () => onDone(score, true));
    container.appendChild(again);
  }

  /* ============================================================
     MEMORIA — emparejar palabra e idioma
     ============================================================ */
  function memory(exam, container, onDone) {
    const rng = makeRng('mem' + Date.now());
    const pares = rng.sample(exam.vocab, Math.min(8, exam.vocab.length));
    const cartas = rng.shuffle(pares.flatMap((p, i) => ([
      { pair: i, text: p.en, side: 'en' },
      { pair: i, text: p.es, side: 'es' },
    ])));

    let volteadas = [], resueltas = 0, intentos = 0;
    const inicio = Date.now();

    container.innerHTML = '';
    const head = el('div', { class: 'row spread', style: 'margin-bottom:14px' }, [
      el('span', { class: 'faint' }, `${pares.length} pares`),
      el('span', { class: 'pill' }, '0 intentos'),
    ]);
    container.appendChild(head);

    const grid = el('div', { class: 'memory-grid' });
    container.appendChild(grid);

    const nodos = cartas.map((c) => {
      const btn = el('button', { class: 'mem-card' + (c.side === 'en' ? ' en' : '') },
        el('span', {}, c.text));
      btn.addEventListener('click', () => voltear(c, btn));
      grid.appendChild(btn);
      return btn;
    });

    function voltear(carta, btn) {
      if (btn.classList.contains('ok') || btn.classList.contains('up')) return;
      if (volteadas.length === 2) return;

      btn.classList.add('up');
      volteadas.push({ carta, btn });
      if (volteadas.length < 2) return;

      intentos++;
      head.lastChild.textContent = intentos + ' intento' + (intentos === 1 ? '' : 's');

      const [a, b] = volteadas;
      if (a.carta.pair === b.carta.pair && a.carta.side !== b.carta.side) {
        a.btn.classList.add('ok'); b.btn.classList.add('ok');
        a.btn.classList.remove('up'); b.btn.classList.remove('up');
        volteadas = [];
        resueltas++;
        if (resueltas === pares.length) setTimeout(terminar, 450);
      } else {
        a.btn.classList.add('no'); b.btn.classList.add('no');
        setTimeout(() => {
          [a, b].forEach((x) => x.btn.classList.remove('up', 'no'));
          volteadas = [];
        }, 750);
      }
    }

    function terminar() {
      const seg = Math.round((Date.now() - inicio) / 1000);
      // El mínimo posible de intentos es la cantidad de pares
      const eficiencia = clamp(pares.length / Math.max(intentos, 1), 0, 1);
      finish(container, '¡Todos los pares!',
        [`${intentos} intentos · ${seg} segundos`,
         eficiencia > 0.8 ? 'Memoria de elefante.' : eficiencia > 0.55 ? 'Muy bien.' : 'Probá de nuevo y vas a bajar los intentos.'],
        { correct: Math.round(eficiencia * pares.length), total: pares.length }, onDone);
    }
  }

  /* ============================================================
     CONTRARRELOJ — 60 segundos
     ============================================================ */
  function speed(exam, container, onDone) {
    const rng = makeRng('spd' + Date.now());
    let pool = App.exams.allQuestions(exam, rng).filter((q) => q.kind === 'choice');
    if (pool.length < 4) pool = pool.concat(App.exams.questionsFromVocab(exam, rng, 12));
    if (!pool.length) return onDone({ correct: 0, total: 0 });

    const DURACION = 60;
    let i = 0, aciertos = 0, fallos = 0, combo = 0, mejorCombo = 0, puntos = 0;
    let restante = DURACION, reloj = null, terminado = false;

    container.innerHTML = '';
    const barra = el('div', { class: 'xpbar-track', style: 'height:8px;margin-bottom:6px' },
      el('div', { class: 'xpbar-fill', id: 'spd-bar', style: 'width:100%;transition:width 1s linear' }));
    const marcador = el('div', { class: 'row spread', style: 'margin-bottom:14px' }, [
      el('span', { class: 'pill' }, '⏱ 60s'),
      el('span', { class: 'pill xp' }, '0 pts'),
      el('span', { class: 'pill streak' }, '×1'),
    ]);
    container.appendChild(barra);
    container.appendChild(marcador);
    const zona = el('div', {});
    container.appendChild(zona);

    reloj = setInterval(() => {
      restante--;
      marcador.children[0].textContent = '⏱ ' + restante + 's';
      const bar = container.querySelector('#spd-bar');
      if (bar) bar.style.width = (restante / DURACION * 100) + '%';
      if (restante <= 0) terminar();
    }, 1000);

    function pregunta() {
      if (terminado) return;
      const q = pool[i % pool.length];
      i++;
      zona.innerHTML = '';
      zona.appendChild(UI.promptWithGap(q.prompt));
      const box = el('div', { class: 'options' });
      q.options.forEach((opt, idx) => {
        const btn = el('button', { class: 'option' }, [
          el('span', { class: 'option-key' }, String.fromCharCode(65 + idx)),
          el('span', {}, opt),
        ]);
        btn.addEventListener('click', () => responder(idx === q.correct, btn, box, q));
        box.appendChild(btn);
      });
      zona.appendChild(box);
    }

    function responder(ok, btn, box, q) {
      Array.from(box.children).forEach((c) => { c.disabled = true; });
      if (ok) {
        aciertos++; combo++;
        mejorCombo = Math.max(mejorCombo, combo);
        puntos += 10 * Math.min(combo, 5);
        btn.classList.add('correct');
      } else {
        fallos++; combo = 0;
        btn.classList.add('wrong');
        box.children[q.correct].classList.add('correct');
      }
      marcador.children[1].textContent = puntos + ' pts';
      marcador.children[2].textContent = '×' + Math.min(Math.max(combo, 1), 5);
      setTimeout(pregunta, ok ? 260 : 900);
    }

    function terminar() {
      if (terminado) return;
      terminado = true;
      clearInterval(reloj);
      const total = aciertos + fallos;
      finish(container, '¡Se acabó el tiempo!',
        [`${puntos} puntos`,
         `${aciertos} de ${total} correctas · mejor combo ×${Math.min(mejorCombo, 5)}`],
        { correct: aciertos, total: total || 1 }, onDone);
    }

    pregunta();
  }

  /* ============================================================
     AHORCADO — con teclado en pantalla (para el celular)
     ============================================================ */
  function hangman(exam, container, onDone) {
    const rng = makeRng('hang' + Date.now());
    // Sólo palabras de una sola palabra y de largo razonable
    const aptas = exam.vocab.filter((v) => /^[a-zA-Z' -]{3,14}$/.test(v.en));
    const ronda = rng.sample(aptas.length >= 3 ? aptas : exam.vocab, Math.min(5, exam.vocab.length));
    if (!ronda.length) return onDone({ correct: 0, total: 0 });

    let idx = 0, ganadas = 0;

    function jugar() {
      if (idx >= ronda.length) {
        return finish(container, ganadas === ronda.length ? '¡Todas!' : 'Fin del juego',
          [`${ganadas} de ${ronda.length} palabras adivinadas`],
          { correct: ganadas, total: ronda.length }, onDone);
      }

      const item = ronda[idx];
      const palabra = item.en.toUpperCase();
      const letras = new Set(palabra.split('').filter((c) => /[A-Z]/.test(c)));
      const adivinadas = new Set();
      let vidas = 6;

      container.innerHTML = '';
      container.appendChild(el('div', { class: 'row spread', style: 'margin-bottom:12px' }, [
        el('span', { class: 'faint' }, `Palabra ${idx + 1} de ${ronda.length}`),
        el('span', { class: 'pill', id: 'vidas' }, '❤️'.repeat(vidas)),
      ]));

      container.appendChild(el('div', { class: 'theory center', style: 'margin-bottom:14px' }, [
        el('div', { class: 'faint' }, 'Significa:'),
        el('div', { style: 'font-size:1.25rem;font-weight:650;color:var(--accent)' }, item.es),
      ]));

      const display = el('div', { class: 'hangman-word' });
      container.appendChild(display);

      const pista = el('div', { class: 'center faint', style: 'margin:10px 0' },
        item.example ? '' : '');
      container.appendChild(pista);

      const teclado = el('div', { class: 'keyboard' });
      const teclas = {};
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((L) => {
        const k = el('button', { class: 'key' }, L);
        k.addEventListener('click', () => probar(L));
        teclas[L] = k;
        teclado.appendChild(k);
      });
      container.appendChild(teclado);

      function pintar() {
        display.innerHTML = '';
        palabra.split('').forEach((c) => {
          if (!/[A-Z]/.test(c)) {
            display.appendChild(el('span', { class: 'hm-slot space' }, c === ' ' ? ' ' : c));
          } else {
            display.appendChild(el('span', { class: 'hm-slot' + (adivinadas.has(c) ? ' on' : '') },
              adivinadas.has(c) ? c : ''));
          }
        });
      }

      function probar(L) {
        if (teclas[L].disabled) return;
        teclas[L].disabled = true;
        if (letras.has(L)) {
          adivinadas.add(L);
          teclas[L].classList.add('hit');
          pintar();
          if ([...letras].every((c) => adivinadas.has(c))) return acabar(true);
        } else {
          vidas--;
          teclas[L].classList.add('miss');
          const v = container.querySelector('#vidas');
          if (v) v.textContent = '❤️'.repeat(Math.max(vidas, 0)) + '🖤'.repeat(6 - Math.max(vidas, 0));
          if (vidas <= 0) return acabar(false);
        }
      }

      function acabar(gano) {
        if (gano) ganadas++;
        letras.forEach((c) => adivinadas.add(c));
        pintar();
        Object.values(teclas).forEach((k) => { k.disabled = true; });

        const fb = el('div', { class: 'feedback ' + (gano ? 'ok' : 'bad') + ' mt' });
        fb.innerHTML = gano
          ? `<b>¡Bien!</b> ${escapeHtml(item.en)}`
          : `Era <b>${escapeHtml(item.en)}</b>` + (item.example ? `<div class="faint" style="margin-top:6px">${escapeHtml(item.example)}</div>` : '');
        container.appendChild(fb);

        const sp = UI.speakButton(item.en, '🔊 Escuchar');
        if (sp) { sp.className = 'btn btn-ghost btn-sm mt'; container.appendChild(sp); }

        const next = el('button', { class: 'btn btn-primary btn-lg mt' },
          idx === ronda.length - 1 ? 'Ver resultado' : 'Siguiente palabra →');
        next.addEventListener('click', () => { idx++; jugar(); });
        container.appendChild(next);
      }

      pintar();
    }
    jugar();
  }

  /* ============================================================
     FICHAS — repaso rápido, sin repetición espaciada
     ============================================================ */
  function cards(exam, container, onDone) {
    const rng = makeRng('cards' + Date.now());
    let cola = rng.shuffle(exam.vocab.slice());
    const pendientes = [];
    let sabidas = 0, vuelta = 1;
    const MAX_VUELTAS = 3;
    const total = cola.length;

    function mostrar() {
      if (!cola.length) {
        // Tope de vueltas: sin esto, marcar siempre "no la sabía" haría que
        // el juego no termine nunca y no haya forma de ver el resultado.
        if (pendientes.length && vuelta < MAX_VUELTAS) {
          vuelta++;
          cola = pendientes.splice(0, pendientes.length);
          UI.toast(`Vuelta ${vuelta}: repasamos las ${cola.length} que te costaron`, 'info', 2200);
        } else {
          return finish(container, 'Fichas terminadas',
            [`${sabidas} de ${total} sabidas a la primera`,
             pendientes.length ? `${pendientes.length} quedaron para repasar de nuevo` : null],
            { correct: sabidas, total }, onDone);
        }
      }

      const item = cola.shift();
      container.innerHTML = '';
      container.appendChild(el('div', { class: 'row spread', style: 'margin-bottom:12px' }, [
        el('span', { class: 'faint' }, `Quedan ${cola.length + pendientes.length + 1}`),
        el('span', { class: 'pill xp' }, `${sabidas} sabidas`),
      ]));

      const card = el('div', { class: 'flashcard' }, [
        el('div', { class: 'fc-word' }, item.en),
      ]);
      container.appendChild(card);

      const row = el('div', { class: 'row', style: 'justify-content:center' });
      const sp = UI.speakButton(item.en, '🔊');
      if (sp) row.appendChild(sp);
      container.appendChild(row);

      const ver = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Ver significado');
      ver.addEventListener('click', () => {
        card.appendChild(el('div', { class: 'fc-es' }, item.es));
        if (item.example) {
          card.appendChild(el('div', { class: 'fc-example' }, item.example));
        }
        ver.remove();

        const acciones = el('div', { class: 'row mt' }, [
          (() => {
            const b = el('button', { class: 'btn grow', style: 'border-color:var(--bad);color:var(--bad)' }, 'No la sabía');
            b.addEventListener('click', () => { pendientes.push(item); mostrar(); });
            return b;
          })(),
          (() => {
            const b = el('button', { class: 'btn btn-primary grow' }, 'La sabía');
            b.addEventListener('click', () => { sabidas++; mostrar(); });
            return b;
          })(),
        ]);
        container.appendChild(acciones);
      });
      container.appendChild(ver);
    }
    mostrar();
  }

  /* ============================================================
     PRÁCTICA — ejercicios con explicación (motor compartido)
     ============================================================ */
  function practice(exam, container, onDone) {
    const rng = makeRng('prac' + Date.now());
    const qs = App.exams.allQuestions(exam, rng).slice(0, 12);
    if (!qs.length) return onDone({ correct: 0, total: 0 });

    App.activities.runQuiz(container, qs, (res) => {
      finish(container, res.correct === res.total ? '¡Perfecto!' : 'Práctica terminada',
        [`${res.correct} de ${res.total} correctas`], res, onDone);
    });
  }

  /* ============================================================
     SIMULACRO — sin feedback hasta el final, como una prueba
     ============================================================ */
  function mock(exam, container, onDone) {
    const rng = makeRng('mock' + Date.now());
    const qs = App.exams.allQuestions(exam, rng).slice(0, 15);
    if (qs.length < 3) return onDone({ correct: 0, total: 0 });

    let i = 0;
    const respuestas = [];
    const inicio = Date.now();

    function paso() {
      if (i >= qs.length) return corregir();
      const q = qs[i];

      container.innerHTML = '';
      container.appendChild(UI.progressDots(qs.length, i));
      container.appendChild(el('div', { class: 'row spread', style: 'margin-bottom:10px' }, [
        el('span', { class: 'faint' }, `Consigna ${i + 1} de ${qs.length}`),
        el('span', { class: 'pill' }, '📝 Simulacro'),
      ]));
      if (q.instruction) container.appendChild(el('div', { class: 'ex-hint' }, '➜ ' + q.instruction));
      container.appendChild(UI.promptWithGap(q.prompt));

      if (q.kind === 'choice') {
        const box = el('div', { class: 'options' });
        q.options.forEach((opt, idx) => {
          const btn = el('button', { class: 'option' }, [
            el('span', { class: 'option-key' }, String.fromCharCode(65 + idx)),
            el('span', {}, opt),
          ]);
          // Sin corregir en el momento: es una prueba, no una práctica
          btn.addEventListener('click', () => { respuestas.push({ q, dado: idx, ok: idx === q.correct }); i++; paso(); });
          box.appendChild(btn);
        });
        container.appendChild(box);
        return;
      }

      if (q.kind === 'order') {
        const strip = el('div', { class: 'answer-strip' });
        const bank = el('div', { class: 'word-bank' });
        const elegidas = [];
        makeRng(q.answer).shuffle(q.words).forEach((w) => {
          const t = el('button', { class: 'word-tile' }, w);
          t.addEventListener('click', () => {
            if (t.classList.contains('used')) return;
            t.classList.add('used');
            elegidas.push(w);
            const p = el('button', { class: 'word-tile' }, w);
            p.addEventListener('click', () => {
              t.classList.remove('used');
              elegidas.splice(elegidas.indexOf(w), 1);
              p.remove();
            });
            strip.appendChild(p);
          });
          bank.appendChild(t);
        });
        container.appendChild(strip);
        container.appendChild(bank);
        const b = el('button', { class: 'btn btn-primary btn-lg mt' }, 'Siguiente →');
        b.addEventListener('click', () => {
          const dado = elegidas.join(' ');
          respuestas.push({ q, dado, ok: normalize(dado) === normalize(q.answer) });
          i++; paso();
        });
        container.appendChild(b);
        return;
      }

      const input = el('input', { type: 'text', placeholder: 'Tu respuesta…', autocomplete: 'off', spellcheck: 'false' });
      const b = el('button', { class: 'btn btn-primary' }, 'Siguiente →');
      const enviar = () => {
        const dado = input.value.trim();
        respuestas.push({ q, dado, ok: answerMatches(dado, q.accepted).ok });
        i++; paso();
      };
      b.addEventListener('click', enviar);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') enviar(); });
      container.appendChild(el('div', { class: 'row mt' }, [input, b]));
      setTimeout(() => input.focus(), 50);
    }

    function corregir() {
      const ok = respuestas.filter((r) => r.ok).length;
      const min = Math.round((Date.now() - inicio) / 60000);
      const nota = Math.round(ok / respuestas.length * 10 * 10) / 10;

      const detalle = el('div', { class: 'mt-lg', style: 'text-align:left' });
      detalle.appendChild(el('h3', {}, 'Corrección'));
      respuestas.forEach((r, n) => {
        const correcta = r.q.kind === 'choice' ? r.q.options[r.q.correct]
          : r.q.kind === 'order' ? r.q.answer : r.q.accepted[0];
        const dada = r.q.kind === 'choice' ? (r.q.options[r.dado] || '—') : (r.dado || '—');
        const box = el('div', { class: 'feedback ' + (r.ok ? 'ok' : 'bad'), style: 'margin-bottom:9px' });
        box.innerHTML =
          `<div class="faint" style="margin-bottom:4px">${n + 1}. ${escapeHtml(r.q.prompt)}</div>` +
          (r.ok ? `<b>✓ ${escapeHtml(dada)}</b>`
                : `<s>${escapeHtml(dada)}</s> → <b>${escapeHtml(correcta)}</b>` +
                  (r.q.why ? `<div class="faint" style="margin-top:6px">${escapeHtml(r.q.why)}</div>` : ''));
        detalle.appendChild(box);
      });

      finish(container, `Nota estimada: ${nota}/10`,
        [`${ok} de ${respuestas.length} correctas`, min ? `Tardaste ${min} minuto${min === 1 ? '' : 's'}` : null],
        { correct: ok, total: respuestas.length }, onDone, detalle);
    }

    paso();
  }

  const RENDERERS = { memory, speed, hangman, cards, practice, mock };

  function play(gameId, exam, container, onDone) {
    const fn = RENDERERS[gameId];
    if (!fn) return onDone({ correct: 0, total: 0 });
    App.speech.stop();
    fn(exam, container, onDone);
  }

  App.games = { CATALOG, available, play };
})(window.App);
