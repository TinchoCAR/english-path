/* ============================================================
   data/placement.js — Banco del test de nivel (sin IA)
   Escalera adaptativa A1 → C1. Cada pregunta apunta a un punto
   que de verdad discrimina el nivel, no a vocabulario suelto.
   ============================================================ */
window.App = window.App || {};

(function (App) {
  'use strict';

  const BANK = [
    /* ==================== A1 ==================== */
    { level: 'A1', q: 'She ___ a student at my school.', o: ['are', 'is', 'be', 'am'], a: 1 },
    { level: 'A1', q: 'I have ___ brother and two sisters.', o: ['a', 'an', 'the', 'some'], a: 0 },
    { level: 'A1', q: 'They ___ like coffee.', o: ["doesn't", "aren't", "don't", "isn't"], a: 2 },
    { level: 'A1', q: 'Where ___ you from?', o: ['is', 'are', 'do', 'does'], a: 1 },
    { level: 'A1', q: 'My father ___ in an office.', o: ['work', 'working', 'works', 'is work'], a: 2 },
    { level: 'A1', q: 'There are three ___ on the table.', o: ['box', 'boxs', 'boxes', 'boxies'], a: 2 },

    /* ==================== A2 ==================== */
    { level: 'A2', q: 'We ___ to Córdoba last summer.', o: ['go', 'went', 'have gone', 'are going'], a: 1 },
    { level: 'A2', q: '___ you send the invoice yesterday?', o: ['Did', 'Do', 'Have', 'Were'], a: 0 },
    { level: 'A2', q: 'This laptop is ___ than the other one.', o: ['cheapest', 'more cheap', 'cheaper', 'most cheap'], a: 2 },
    { level: 'A2', q: 'How ___ money do we need?', o: ['many', 'much', 'few', 'lot'], a: 1 },
    { level: 'A2', q: 'The meeting is ___ Monday ___ nine.', o: ['in / on', 'on / at', 'at / in', 'on / in'], a: 1 },
    { level: 'A2', q: 'Look at those clouds. It ___ rain.', o: ['will', 'is going to', 'goes to', 'would'], a: 1 },

    /* ==================== B1 ==================== */
    { level: 'B1', q: 'I ___ him three years ago.', o: ['have met', 'met', 'have meet', 'was meeting'], a: 1 },
    { level: 'B1', q: 'We look forward to ___ from you.', o: ['hear', 'hearing', 'be heard', 'have heard'], a: 1 },
    { level: 'B1', q: 'If you confirm today, we ___ on Friday.', o: ['shipped', 'would ship', 'will ship', 'ship'], a: 2 },
    { level: 'B1', q: 'The container ___ at customs yesterday.', o: ['inspected', 'was inspected', 'has inspect', 'is inspecting'], a: 1 },
    { level: 'B1', q: 'The supplier ___ sent the quote is from Brazil.', o: ['which', 'who', 'whose', 'what'], a: 1 },
    { level: 'B1', q: 'She has worked here ___ 2019.', o: ['for', 'from', 'since', 'during'], a: 2 },

    /* ==================== B2 ==================== */
    { level: 'B2', q: 'If we ___ the clause, we would not have signed.', o: ['read', 'had read', 'would read', 'have read'], a: 1 },
    { level: 'B2', q: 'Nobody answers. They ___ already left.', o: ["mustn't have", 'must have', 'can have', 'should have'], a: 1 },
    { level: 'B2', q: '___ the delay, the shipment arrived intact.', o: ['Although', 'Despite of', 'Despite', 'However'], a: 2 },
    { level: 'B2', q: 'Exports ___ to grow by 4% this year.', o: ['are expected', 'expect', 'are expecting', 'expected'], a: 0 },
    { level: 'B2', q: "I'd rather you ___ the client directly.", o: ["don't contact", "didn't contact", 'not contact', "wouldn't contact"], a: 1 },
    { level: 'B2', q: 'I wish I ___ that course last year.', o: ['took', 'would take', 'had taken', 'have taken'], a: 2 },

    /* ==================== C1 ==================== */
    { level: 'C1', q: 'Not only ___ late, but they also sent the wrong model.', o: ['they delivered', 'did they deliver', 'they did deliver', 'delivered they'], a: 1 },
    { level: 'C1', q: 'Under no circumstances ___ these figures.', o: ['you should disclose', 'should you disclose', 'you must disclose', 'disclose you'], a: 1 },
    { level: 'C1', q: 'The delay ___ from a customs bottleneck.', o: ['stems', 'stands', 'steps', 'stops'], a: 0 },
    { level: 'C1', q: 'Had we known about the tariff, we ___ differently.', o: ['would act', 'had acted', 'would have acted', 'will have acted'], a: 2 },
    { level: 'C1', q: 'It was the delay ___ ruined the deal.', o: ['what', 'which it', 'that', 'who'], a: 2 },
    { level: 'C1', q: 'The board was ___ to approve the merger without due diligence.', o: ['reluctant', 'reticent about', 'unwilling of', 'hesitant of'], a: 0 },
  ];

  const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'];

  /* Escalera adaptativa: empieza en A2, sube si acertás y baja si errás.
     Devuelve un controlador con estado; la vista sólo pide la próxima pregunta. */
  function ladder(rng, length, bank) {
    const source = (bank && bank.length) ? bank : BANK;
    const pools = {};
    ORDER.forEach((l) => { pools[l] = rng.shuffle(source.filter((q) => q.level === l)); });

    let cursor = 1;                      // arranca en A2
    const asked = [];
    const perLevel = {};
    ORDER.forEach((l) => { perLevel[l] = { ok: 0, total: 0 }; });

    return {
      total: length || 14,
      get index() { return asked.length; },

      next() {
        if (asked.length >= (length || 14)) return null;
        // Si se agotó el nivel actual, buscamos el más cercano con preguntas.
        let lvl = ORDER[cursor];
        if (!pools[lvl].length) {
          const alt = ORDER.map((l, i) => ({ l, d: Math.abs(i - cursor) }))
            .filter((x) => pools[x.l].length)
            .sort((a, b) => a.d - b.d)[0];
          if (!alt) return null;
          lvl = alt.l;
        }
        const q = pools[lvl].shift();
        asked.push(q);
        return q;
      },

      answer(wasCorrect) {
        const q = asked[asked.length - 1];
        perLevel[q.level].total += 1;
        if (wasCorrect) {
          perLevel[q.level].ok += 1;
          cursor = Math.min(ORDER.length - 1, cursor + 1);
        } else {
          cursor = Math.max(0, cursor - 1);
        }
      },

      /* Nivel final: el más alto donde demostró solvencia (≥60% con al menos
         2 intentos). Si no llega a ninguno, queda A1. */
      result() {
        let best = 'A1';
        ORDER.forEach((l) => {
          const s = perLevel[l];
          if (s.total >= 2 && s.ok / s.total >= 0.6) best = l;
        });
        const totalOk = ORDER.reduce((s, l) => s + perLevel[l].ok, 0);
        const totalQ = ORDER.reduce((s, l) => s + perLevel[l].total, 0);
        return {
          cefr: best,
          appLevel: { A1: 'A2', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'B2' }[best],
          perLevel,
          correct: totalOk,
          total: totalQ,
          accuracy: totalQ ? totalOk / totalQ : 0,
        };
      },
    };
  }

  const DESCRIPTIONS = {
    A1: {
      title: 'A1 · Principiante',
      text: 'Reconocés estructuras muy básicas. Vamos a empezar por los cimientos: presente, pasado simple y vocabulario de uso diario. No es un mal lugar para arrancar — es el lugar donde más rápido se nota el progreso.',
    },
    A2: {
      title: 'A2 · Básico',
      text: 'Manejás las estructuras elementales y te falta consolidar los tiempos verbales y las preposiciones. Es exactamente el punto de partida que esta ruta espera: en seis meses de constancia llegás a B2.',
    },
    B1: {
      title: 'B1 · Intermedio',
      text: 'Ya tenés una base sólida. Vamos a saltear buena parte de A2 y enfocarnos en lo que te falta: condicionales, voz pasiva, estilo indirecto y vocabulario técnico de comercio.',
    },
    B2: {
      title: 'B2 · Intermedio alto',
      text: 'Estás en muy buen nivel para empezar la carrera. El trabajo ahora es de precisión: condicionales mixtos, pasiva impersonal, conectores formales y sobre todo lenguaje diplomático para negociación.',
    },
    C1: {
      title: 'C1 · Avanzado',
      text: 'Nivel alto. Esta app te va a servir sobre todo para mantener y para el inglés específico de comercio internacional: Incoterms, contratos, registro formal y negociación.',
    },
  };

  App.placement = { BANK, ORDER, ladder, DESCRIPTIONS };
})(window.App);
