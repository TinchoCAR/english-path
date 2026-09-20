/* ============================================================
   speech.js — Text-to-Speech y reconocimiento de voz
   Ambos son APIs nativas del navegador: gratis, sin API key.
   El reconocimiento requiere Chrome/Edge y contexto seguro
   (https:// o localhost). Por file:// suele estar bloqueado.
   ============================================================ */
(function (App) {
  'use strict';
  const { normalize, levenshtein, clamp, store } = App.core;

  /* ==================== TEXT TO SPEECH ==================== */

  let voices = [];
  let voicesReady = false;

  function loadVoices() {
    if (!('speechSynthesis' in window)) return [];
    voices = window.speechSynthesis.getVoices() || [];
    voicesReady = voices.length > 0;
    return voices;
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function englishVoices() {
    if (!voicesReady) loadVoices();
    return voices.filter((v) => /^en([-_]|$)/i.test(v.lang));
  }

  function preferredVoice() {
    const saved = store.get('speech.voice', null);
    const en = englishVoices();
    if (!en.length) return null;
    if (saved) {
      const match = en.find((v) => v.name === saved);
      if (match) return match;
    }
    // Preferimos voces naturales de US/GB si están disponibles.
    const ranked = en.slice().sort((a, b) => score(b) - score(a));
    function score(v) {
      let s = 0;
      if (/en[-_]US/i.test(v.lang)) s += 3;
      if (/en[-_]GB/i.test(v.lang)) s += 2;
      if (/google|natural|premium|neural/i.test(v.name)) s += 4;
      if (v.localService) s += 1;
      return s;
    }
    return ranked[0];
  }

  function setVoice(name) { store.set('speech.voice', name); }
  function getRate() { return store.get('speech.rate', 0.95); }
  function setRate(r) { store.set('speech.rate', clamp(r, 0.5, 1.5)); }

  function isSpeaking() {
    return 'speechSynthesis' in window && window.speechSynthesis.speaking;
  }

  function stop() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  /* Reproduce un texto en inglés. Devuelve una promesa que resuelve al terminar. */
  function speak(text, opts) {
    const o = opts || {};
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        return reject(new Error('Tu navegador no soporta síntesis de voz.'));
      }
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      const v = preferredVoice();
      if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = 'en-US'; }
      u.rate = o.rate !== undefined ? o.rate : getRate();
      u.pitch = o.pitch !== undefined ? o.pitch : 1;

      let settled = false;
      u.onend = () => { if (!settled) { settled = true; resolve(); } };
      u.onerror = (e) => {
        if (settled) return;
        settled = true;
        // 'interrupted' y 'canceled' ocurren al cortar a propósito: no son fallos.
        if (e.error === 'interrupted' || e.error === 'canceled') resolve();
        else reject(new Error('No se pudo reproducir el audio.'));
      };

      window.speechSynthesis.speak(u);

      // Chrome a veces se "duerme" en textos largos: lo despertamos.
      if (text.length > 200) {
        const keepAlive = setInterval(() => {
          if (!window.speechSynthesis.speaking) return clearInterval(keepAlive);
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }, 9000);
        const clear = () => clearInterval(keepAlive);
        u.addEventListener('end', clear);
        u.addEventListener('error', clear);
      }
    });
  }

  /* Reproduce un diálogo línea por línea, alternando tono entre hablantes */
  async function speakDialogue(lines, onLine) {
    const speakers = [...new Set(lines.map((l) => l.s))];
    for (let i = 0; i < lines.length; i++) {
      if (onLine) onLine(i);
      const pitch = speakers.indexOf(lines[i].s) === 0 ? 1.05 : 0.9;
      await speak(lines[i].t, { pitch });
      await new Promise((r) => setTimeout(r, 250));
    }
    if (onLine) onLine(-1);
  }

  const ttsAvailable = () => 'speechSynthesis' in window;

  /* ==================== SPEECH RECOGNITION ==================== */

  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const srAvailable = () => !!SR;

  function listen(opts) {
    const o = opts || {};
    return new Promise((resolve, reject) => {
      if (!SR) {
        return reject(new Error('Tu navegador no soporta reconocimiento de voz. Usá Chrome o Edge.'));
      }
      const rec = new SR();
      rec.lang = o.lang || 'en-US';
      rec.interimResults = true;
      rec.continuous = !!o.continuous;
      rec.maxAlternatives = 3;

      let finalText = '';
      let done = false;
      const finish = (fn, arg) => { if (!done) { done = true; try { rec.stop(); } catch (e) {} fn(arg); } };

      rec.onresult = (ev) => {
        let interim = '';
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const r = ev.results[i];
          if (r.isFinal) finalText += r[0].transcript + ' ';
          else interim += r[0].transcript;
        }
        if (o.onPartial) o.onPartial((finalText + interim).trim());
      };

      rec.onerror = (ev) => {
        const msgs = {
          'no-speech': 'No se detectó ninguna voz. Probá de nuevo.',
          'audio-capture': 'No se encontró micrófono.',
          'not-allowed': 'Permiso de micrófono denegado. Habilitalo en el navegador.',
          'network': 'El reconocimiento de voz necesita conexión a internet.',
          'service-not-allowed': 'El navegador bloqueó el micrófono. Probá en https:// o localhost.',
        };
        finish(reject, new Error(msgs[ev.error] || 'Error de reconocimiento: ' + ev.error));
      };

      rec.onend = () => { if (!done) { done = true; resolve(finalText.trim()); } };

      try { rec.start(); } catch (e) { return reject(new Error('No se pudo iniciar el micrófono.')); }

      // Corte de seguridad por si el navegador no dispara onend.
      if (o.timeout !== 0) {
        setTimeout(() => {
          if (!done) { try { rec.stop(); } catch (e) {} }
        }, o.timeout || 12000);
      }

      if (o.controller) o.controller.stop = () => { try { rec.stop(); } catch (e) {} };
    });
  }

  /* ==================== PUNTAJE DE PRONUNCIACIÓN ==================== */

  /* Compara lo que dijiste con el objetivo. No mide acento —
     mide si el reconocedor entendió las palabras correctas. */
  function scorePronunciation(target, heard) {
    const t = normalize(target);
    const h = normalize(heard);
    if (!h) return { score: 0, words: [], verdict: 'No se escuchó nada.' };

    const dist = levenshtein(t, h);
    const charScore = clamp(1 - dist / Math.max(t.length, 1), 0, 1);

    // Comparación palabra por palabra, para marcar cuáles fallaron.
    const tw = t.split(' '), hw = h.split(' ');
    const words = tw.map((w) => {
      const hit = hw.some((x) => x === w || levenshtein(x, w) <= (w.length > 6 ? 2 : 1));
      return { word: w, ok: hit };
    });
    const wordScore = words.filter((w) => w.ok).length / Math.max(tw.length, 1);

    const score = Math.round((charScore * 0.4 + wordScore * 0.6) * 100);
    const verdict =
      score >= 90 ? '¡Perfecto!' :
      score >= 75 ? 'Muy bien, se entiende claro.' :
      score >= 55 ? 'Se entiende, pero hay palabras que no salieron limpias.' :
      'Probá de nuevo, más despacio y marcando cada palabra.';

    return { score, words, verdict, heard: h };
  }

  App.speech = {
    speak, speakDialogue, stop, isSpeaking, ttsAvailable,
    englishVoices, preferredVoice, setVoice, getRate, setRate,
    listen, srAvailable, scorePronunciation,
  };
})(window.App);
