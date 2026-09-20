/* ============================================================
   data/grammar-b2.js — Unidades nivel B2
   ============================================================ */
(function (App) {
  'use strict';
  const G = App.grammar;

  G.add({
    id: 'g18', level: 'B2', title: 'Third and Mixed Conditionals',
    titleEs: 'Tercer condicional y condicionales mixtos',
    why: 'Analizar decisiones pasadas: "Si hubiéramos cubierto el tipo de cambio, no habríamos perdido el margen". Puro análisis post-mortem de negocios.',
    explain: `
      <p><b>Third conditional</b> → pasado irreal, arrepentimiento o análisis.<br>
      <code>If + had + participio, ... would have + participio</code><br>
      <code>If we <b>had hedged</b>, we <b>would have saved</b> 20%.</code></p>
      <p><b>Mixed 1</b> (pasado → presente):<br>
      <code>If I <b>had studied</b> more, I <b>would be</b> fluent now.</code></p>
      <p><b>Mixed 2</b> (presente → pasado):<br>
      <code>If I <b>were</b> more organised, I <b>wouldn't have missed</b> the deadline.</code></p>`,
    examples: [
      { en: "If they had confirmed earlier, we wouldn't have lost the slot.", es: 'Si hubieran confirmado antes, no habríamos perdido el cupo.' },
      { en: 'If the contract had been clearer, this dispute would not exist.', es: 'Si el contrato hubiera sido más claro, esta disputa no existiría.' },
    ],
    pitfall: 'Nunca "If I would have…". Dentro del if va SIEMPRE "had + participio".',
    exercises: [
      { t: 'fill', q: 'If we ___ (hedge) the currency, we ___ (not / lose) money.', a: ['had hedged / would not have lost', 'had hedged would not have lost', "had hedged / wouldn't have lost"] },
      { t: 'choice', q: 'If they ___ on time, the deal would have closed.', o: ['would have paid', 'had paid', 'paid'], a: 1 },
      { t: 'choice', q: 'If I had taken that course, I ___ a better job now.', o: ['would have', 'would have had', 'will have'], a: 0 },
      { t: 'transform', q: 'We did not read the clause, so we signed a bad deal.', ins: 'Reescribí en 3rd conditional', a: ['if we had read the clause, we would not have signed a bad deal', "if we had read the clause, we wouldn't have signed a bad deal", 'if we had read the clause we would not have signed a bad deal'] },
      { t: 'order', w: ['had', 'if', 'known,', 'I', 'would', 'have', 'I', 'warned', 'you'], a: 'If I had known, I would have warned you' },
      { t: 'transform', q: 'If I would have known, I would have called.', ins: 'Corregí el error', a: ['if i had known, i would have called', 'if i had known i would have called'] },
    ],
  });

  G.add({
    id: 'g19', level: 'B2', title: 'Modals of Deduction',
    titleEs: 'Modales de deducción',
    why: 'Expresar certeza y probabilidad sin comprometerte: clave al analizar mercados o interpretar la posición de la otra parte.',
    explain: `
      <p><b>Presente:</b><br>
      <code>must be</code> = seguro que es (certeza alta)<br>
      <code>might / may / could be</code> = puede que sea<br>
      <code>can't be</code> = no puede ser (imposibilidad)</p>
      <p><b>Pasado:</b> agregá <code>have + participio</code><br>
      <code>They <b>must have missed</b> the deadline.</code> = seguro se les pasó<br>
      <code>She <b>can't have received</b> it.</code> = no puede haberlo recibido<br>
      <code>It <b>might have been</b> a customs delay.</code> = puede que haya sido demora aduanera</p>
      <p class="warn">Para negar certeza se usa <code>can't</code>, NO <code>mustn't</code>.</p>`,
    examples: [
      { en: 'The container must have been held at customs.', es: 'El contenedor seguro quedó retenido en la aduana.' },
      { en: "They can't have read the whole contract in ten minutes.", es: 'No pueden haber leído todo el contrato en diez minutos.' },
      { en: 'The delay might be due to the strike.', es: 'La demora puede deberse a la huelga.' },
    ],
    pitfall: '"He mustn\'t be at the office" NO significa "no debe estar". Para eso va "He can\'t be at the office".',
    exercises: [
      { t: 'choice', q: 'The lights are off. They ___ closed already.', o: ["mustn't have", 'must have', 'can have'], a: 1 },
      { t: 'choice', q: 'She sent it yesterday, so it ___ lost.', o: ["can't be", "mustn't be", "doesn't be"], a: 0 },
      { t: 'fill', q: 'Nobody answers. They ___ ___ ___ (deber de haber salido) for lunch.', a: ['must have gone', 'must have left'] },
      { t: 'fill', q: 'The delay ___ ___ ___ (puede haber sido) a customs issue.', a: ['might have been', 'may have been', 'could have been'] },
      { t: 'transform', q: 'I am sure they did not receive the invoice.', ins: 'Reescribí con un modal de deducción', a: ["they can't have received the invoice", 'they cannot have received the invoice'] },
      { t: 'order', w: ['have', 'the', 'must', 'been', 'at', 'held', 'container', 'customs'], a: 'The container must have been held at customs' },
    ],
  });

  G.add({
    id: 'g20', level: 'B2', title: 'Advanced Passive and Impersonal Reporting',
    titleEs: 'Pasiva avanzada e informes impersonales',
    why: 'Es el registro de los informes de mercado y la prensa económica: "It is estimated that…", "Exports are expected to rise".',
    explain: `
      <p><b>Dos construcciones equivalentes:</b><br>
      <code><b>It is said that</b> the market is recovering.</code><br>
      <code>The market <b>is said to be</b> recovering.</code></p>
      <p>Verbos típicos: say, believe, report, expect, estimate, consider, know, think, allege.</p>
      <p><b>Si el hecho es anterior</b>, va <code>to have + participio</code>:<br>
      <code>He <b>is believed to have left</b> the country.</code></p>
      <p><b>Have something done</b> (servicio de terceros):<br>
      <code>We <b>had</b> the goods <b>inspected</b>.</code> = hicimos inspeccionar la mercadería</p>`,
    examples: [
      { en: 'Exports are expected to grow by 4% this year.', es: 'Se espera que las exportaciones crezcan un 4% este año.' },
      { en: 'It is estimated that 30% of containers are delayed.', es: 'Se estima que el 30% de los contenedores se demora.' },
      { en: 'We had the contract reviewed by a lawyer.', es: 'Hicimos revisar el contrato por un abogado.' },
    ],
    pitfall: 'En español el impersonal es "se dice que". En inglés NO existe ese "se": hay que usar "It is said that" o la pasiva personal.',
    exercises: [
      { t: 'transform', q: 'People say the company is expanding.', ins: 'Reescribí con "It is said that…"', a: ['it is said that the company is expanding'] },
      { t: 'transform', q: 'It is believed that he resigned.', ins: 'Reescribí con "He is believed…"', a: ['he is believed to have resigned'] },
      { t: 'fill', q: 'Exports ___ ___ ___ (se espera que crezcan) next quarter.', a: ['are expected to grow', 'are expected to rise'] },
      { t: 'choice', q: 'We ___ the goods ___ before shipping.', o: ['had / inspected', 'had / inspect', 'have / inspecting'], a: 0 },
      { t: 'choice', q: 'The figures ___ to be inaccurate.', o: ['are reported', 'reported', 'are reporting'], a: 0 },
      { t: 'order', w: ['that', 'is', 'it', 'will', 'estimated', 'demand', 'fall'], a: 'It is estimated that demand will fall' },
    ],
  });

  G.add({
    id: 'g21', level: 'B2', title: 'wish / if only / would rather',
    titleEs: 'wish / if only / would rather',
    why: 'Expresar lamentos, quejas diplomáticas y preferencias sin sonar agresivo.',
    explain: `
      <p><code>wish + past simple</code> → deseo sobre el presente<br>
      <code>I wish I <b>spoke</b> better English.</code> (ojalá hablara mejor)</p>
      <p><code>wish + past perfect</code> → lamento sobre el pasado<br>
      <code>I wish I <b>had studied</b> earlier.</code> (ojalá hubiera estudiado antes)</p>
      <p><code>wish + would</code> → queja sobre algo molesto que otro hace<br>
      <code>I wish they <b>would reply</b> faster.</code></p>
      <p><code>would rather + infinitivo sin to</code> → preferencia propia<br>
      <code>I'd rather <b>wait</b>.</code><br>
      <code>would rather + sujeto + past</code> → preferencia sobre otro<br>
      <code>I'd rather you <b>didn't</b> mention the price.</code></p>`,
    examples: [
      { en: 'I wish we had negotiated better terms.', es: 'Ojalá hubiéramos negociado mejores condiciones.' },
      { en: 'I would rather discuss this in person.', es: 'Preferiría discutir esto en persona.' },
      { en: "I'd rather you didn't share these figures.", es: 'Preferiría que no compartieras estas cifras.' },
    ],
    pitfall: 'Nunca "I wish I would have". Para el pasado es "I wish I had + participio".',
    exercises: [
      { t: 'fill', q: 'I wish I ___ (speak) Mandarin.', a: ['spoke'] },
      { t: 'fill', q: 'She wishes she ___ (accept) the offer last year.', a: ['had accepted'] },
      { t: 'choice', q: 'I would rather ___ by email.', o: ['to communicate', 'communicate', 'communicating'], a: 1 },
      { t: 'choice', q: "I'd rather you ___ the client directly.", o: ["didn't contact", "don't contact", 'not contact'], a: 0 },
      { t: 'fill', q: 'I wish they ___ (stop) changing the deadline.', a: ['would stop'] },
      { t: 'transform', q: 'I wish I would have known earlier.', ins: 'Corregí el error', a: ['i wish i had known earlier'] },
    ],
  });

  G.add({
    id: 'g22', level: 'B2', title: 'Linking Words for Formal Writing',
    titleEs: 'Conectores para escritura formal',
    why: 'Un informe o un email bien conectado se lee como escrito por un profesional. Es lo que más puntúa en la parte escrita de cualquier examen.',
    explain: `
      <table class="mini">
        <tr><th>Función</th><th>Conectores</th></tr>
        <tr><td>Contraste</td><td>however, nevertheless, nonetheless, whereas, while, although, despite / in spite of + sustantivo</td></tr>
        <tr><td>Causa</td><td>because of, due to, owing to, since, as</td></tr>
        <tr><td>Consecuencia</td><td>therefore, consequently, as a result, thus, hence</td></tr>
        <tr><td>Adición</td><td>moreover, furthermore, in addition, besides</td></tr>
        <tr><td>Ejemplo</td><td>for instance, namely, such as</td></tr>
        <tr><td>Conclusión</td><td>to sum up, in conclusion, overall</td></tr>
      </table>
      <p class="warn"><code>despite / in spite of</code> van con <b>sustantivo o -ing</b>:
      <code>despite the delay</code>, <code>despite being late</code>.<br>
      <code>although</code> va con <b>oración completa</b>: <code>although we were late</code>.</p>`,
    examples: [
      { en: 'Despite the delay, the shipment arrived intact.', es: 'A pesar de la demora, el envío llegó intacto.' },
      { en: 'Costs rose sharply; consequently, margins fell.', es: 'Los costos subieron fuerte; en consecuencia, los márgenes cayeron.' },
      { en: 'Brazil exports coffee, whereas Argentina exports soy.', es: 'Brasil exporta café, mientras que Argentina exporta soja.' },
    ],
    pitfall: '"Despite of" no existe. Es "despite" o "in spite of", nunca la mezcla.',
    exercises: [
      { t: 'choice', q: '___ the high cost, we decided to proceed.', o: ['Although', 'Despite', 'However'], a: 1 },
      { t: 'choice', q: '___ we were warned, we signed anyway.', o: ['Despite', 'In spite of', 'Although'], a: 2 },
      { t: 'fill', q: 'Demand collapsed. ___, we had to cut production. (en consecuencia)', a: ['Therefore', 'Consequently', 'As a result'] },
      { t: 'fill', q: 'The delay was ___ ___ a customs strike. (debido a)', a: ['due to', 'owing to', 'because of'] },
      { t: 'choice', q: 'The offer is attractive. ___, the terms are risky.', o: ['Moreover', 'However', 'Therefore'], a: 1 },
      { t: 'transform', q: 'Despite of the rain, the ship sailed.', ins: 'Corregí el error', a: ['despite the rain, the ship sailed', 'in spite of the rain, the ship sailed', 'despite the rain the ship sailed'] },
    ],
  });

  G.add({
    id: 'g23', level: 'B2', title: 'Inversion and Emphasis',
    titleEs: 'Inversión y énfasis',
    why: 'Recurso de registro alto. Usado con criterio en una presentación o un informe, marca un nivel claramente superior.',
    explain: `
      <p>Cuando una expresión negativa o restrictiva va al principio, el orden se <b>invierte</b>
      como en una pregunta:</p>
      <p><code><b>Never before</b> have we seen such demand.</code><br>
      <code><b>Not only</b> did they deliver late, <b>but they also</b> sent the wrong items.</code><br>
      <code><b>Hardly had</b> we signed <b>when</b> the price changed.</code><br>
      <code><b>Under no circumstances</b> should you disclose these figures.</code><br>
      <code><b>Only after</b> the audit <b>did we</b> discover the error.</code></p>
      <p><b>Cleft sentences</b> para enfatizar:<br>
      <code><b>It was</b> the delay <b>that</b> ruined the deal.</code><br>
      <code><b>What</b> we need <b>is</b> a reliable partner.</code></p>`,
    examples: [
      { en: 'Not only is it cheaper, but it is also faster.', es: 'No solo es más barato, sino que además es más rápido.' },
      { en: 'Under no circumstances should the container be opened.', es: 'Bajo ninguna circunstancia debe abrirse el contenedor.' },
      { en: 'What we really need is better logistics.', es: 'Lo que realmente necesitamos es mejor logística.' },
    ],
    pitfall: 'Si invertís, el verbo auxiliar va ANTES del sujeto. "Never before we have seen" está mal: es "Never before have we seen".',
    exercises: [
      { t: 'transform', q: 'We have never seen such demand before.', ins: 'Empezá con "Never before…"', a: ['never before have we seen such demand'] },
      { t: 'transform', q: 'They not only delivered late but also damaged the goods.', ins: 'Empezá con "Not only…"', a: ['not only did they deliver late but they also damaged the goods', 'not only did they deliver late, but they also damaged the goods'] },
      { t: 'choice', q: 'Under no circumstances ___ disclose these figures.', o: ['you should', 'should you', 'you must'], a: 1 },
      { t: 'choice', q: '___ had we signed when the rules changed.', o: ['Hardly', 'Rarely', 'Seldom'], a: 0 },
      { t: 'transform', q: 'The delay ruined the deal.', ins: 'Enfatizá con "It was … that …"', a: ['it was the delay that ruined the deal'] },
      { t: 'fill', q: '___ we need is a reliable supplier. (Lo que)', a: ['What'] },
    ],
  });

  G.add({
    id: 'g24', level: 'B2', title: 'Hedging and Diplomatic Language',
    titleEs: 'Lenguaje diplomático y atenuación',
    why: 'La unidad más útil de todo el curso para tu carrera. En negociación internacional, decir "no" de forma directa cierra puertas. Esto es la herramienta profesional.',
    explain: `
      <p><b>Atenuadores (hedges)</b> para suavizar afirmaciones:<br>
      <code>It seems / appears that…</code> · <code>There may be a slight problem.</code><br>
      <code>We were rather hoping for…</code> · <code>That could be somewhat difficult.</code></p>
      <p><b>Negativa diplomática:</b><br>
      ✘ <code>That's impossible.</code> → ✔ <code>I'm afraid that might be difficult for us.</code><br>
      ✘ <code>You are wrong.</code> → ✔ <code>I'm not sure I entirely agree.</code><br>
      ✘ <code>We won't pay that.</code> → ✔ <code>That's slightly above what we had in mind.</code></p>
      <p><b>Pedidos formales:</b><br>
      <code>Would you mind sending…?</code> · <code>I was wondering whether you could…</code><br>
      <code>Could you possibly…?</code> · <code>We would appreciate it if you could…</code></p>
      <p><b>Trucos:</b> pasado + continuo suaviza (<code>I was wondering…</code>), y los adverbios
      <code>slightly, a little, somewhat, rather, perhaps</code> bajan la intensidad.</p>`,
    examples: [
      { en: "I'm afraid that deadline might be a little tight for us.", es: 'Me temo que ese plazo podría resultarnos algo ajustado.' },
      { en: 'I was wondering whether you could review the terms.', es: 'Me preguntaba si podría revisar las condiciones.' },
      { en: "We'd appreciate it if you could confirm by Friday.", es: 'Agradeceríamos que pudiera confirmar antes del viernes.' },
    ],
    pitfall: 'Traducir literal del español suena brusco en inglés. "Send me the invoice" es una orden; "Could you send me the invoice?" es profesional.',
    exercises: [
      { t: 'transform', q: 'That price is too high.', ins: 'Suavizalo de forma diplomática', a: ["i'm afraid that price is slightly higher than we expected", 'that price is slightly higher than we expected', "i'm afraid that price might be a little high"] },
      { t: 'choice', q: '___ you mind sending the revised quote?', o: ['Would', 'Could', 'Should'], a: 0 },
      { t: 'choice', q: 'I ___ whether you could extend the deadline.', o: ['wonder', 'was wondering', 'am wondering'], a: 1 },
      { t: 'fill', q: "I'm ___ we cannot accept those terms. (me temo)", a: ['afraid'] },
      { t: 'fill', q: 'We would ___ it if you could confirm today. (agradeceríamos)', a: ['appreciate'] },
      { t: 'transform', q: 'Send me the documents now.', ins: 'Reescribí en registro formal', a: ['could you please send me the documents', 'would you mind sending me the documents', 'could you possibly send me the documents'] },
    ],
  });
})(window.App);
