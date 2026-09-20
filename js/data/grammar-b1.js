/* ============================================================
   data/grammar-b1.js — Unidades nivel B1
   ============================================================ */
(function (App) {
  'use strict';
  const G = App.grammar;

  G.add({
    id: 'g09', level: 'B1', title: 'Present Perfect Continuous · for / since',
    titleEs: 'Presente perfecto continuo · for / since',
    why: 'Para contar cuánto hace que hacés algo: "Llevo tres años estudiando inglés". Aparece en toda entrevista.',
    explain: `
      <p><code>have/has been + verbo-ing</code> → acción que empezó en el pasado y <b>sigue</b>,
      con foco en la <b>duración</b>.</p>
      <p><code><b>for</b></code> + período (for three years, for two hours)<br>
      <code><b>since</b></code> + punto de inicio (since 2021, since Monday, since I was ten)</p>
      <p><b>Perfect Simple vs Continuous:</b><br>
      <code>I've read three reports.</code> → resultado, cantidad terminada<br>
      <code>I've been reading all morning.</code> → duración, quizá sin terminar</p>`,
    examples: [
      { en: 'I have been studying English for six years.', es: 'Hace seis años que estudio inglés.' },
      { en: 'They have been waiting for the container since Tuesday.', es: 'Esperan el contenedor desde el martes.' },
      { en: 'How long have you been working here?', es: '¿Cuánto hace que trabajás acá?' },
    ],
    pitfall: 'En español usamos presente: "Hace seis años que estudio". En inglés NO se dice "I study English for six years"; hay que usar el perfecto.',
    exercises: [
      { t: 'fill', q: 'We ___ (wait) for their reply since Monday.', a: ['have been waiting', 'have waited'] },
      { t: 'fill', q: 'She has worked here ___ 2019.', a: ['since'] },
      { t: 'fill', q: 'They have been negotiating ___ three hours.', a: ['for'] },
      { t: 'choice', q: 'How long ___ you ___ Spanish?', o: ['do / study', 'have / been studying', 'are / studying'], a: 1 },
      { t: 'order', w: ['been', 'the', 'have', 'they', 'for', 'container', 'waiting', 'for', 'weeks'], a: 'They have been waiting for the container for weeks' },
      { t: 'transform', q: 'I study English since 2020.', ins: 'Corregí el error', a: ['i have studied english since 2020', 'i have been studying english since 2020', "i've been studying english since 2020"] },
    ],
  });

  G.add({
    id: 'g10', level: 'B1', title: 'Past Continuous vs Past Simple · when / while',
    titleEs: 'Pasado continuo vs. pasado simple · when / while',
    why: 'Narrar incidentes: "Estábamos cargando el camión cuando llegó la inspección". Indispensable en informes.',
    explain: `
      <p><b>Past Continuous</b> (<code>was/were + -ing</code>) → acción larga de fondo, en progreso.<br>
      <b>Past Simple</b> → acción corta que interrumpe.</p>
      <p><code><b>while</b></code> + acción larga (continuo) · <code><b>when</b></code> + acción corta (simple)</p>
      <p><code>While we <b>were loading</b> the truck, the inspector <b>arrived</b>.</code></p>`,
    examples: [
      { en: 'I was checking the invoice when I noticed the error.', es: 'Estaba revisando la factura cuando noté el error.' },
      { en: 'While they were discussing the price, the client left.', es: 'Mientras discutían el precio, el cliente se fue.' },
      { en: 'It was raining heavily, so the ship stayed in port.', es: 'Llovía fuerte, así que el barco quedó en puerto.' },
    ],
    pitfall: 'No pongas las dos en continuo salvo que sean simultáneas y ambas largas. La interrupción SIEMPRE va en pasado simple.',
    exercises: [
      { t: 'fill', q: 'I ___ (drive) to the port when they ___ (call) me.', a: ['was driving / called', 'was driving called'], hint: 'largo + corto' },
      { t: 'choice', q: '___ we were unloading, the power went out.', o: ['When', 'While', 'During'], a: 1 },
      { t: 'fill', q: 'What ___ you ___ (do) at 9 p.m. yesterday?', a: ['were doing', 'were / doing'] },
      { t: 'choice', q: 'She ___ the report while he ___ the client.', o: ['wrote / was calling', 'was writing / called', 'was writing / was calling'], a: 2 },
      { t: 'order', w: ['while', 'arrived', 'we', 'inspector', 'were', 'the', 'loading'], a: 'While we were loading, the inspector arrived' },
      { t: 'transform', q: 'When I arrived, they discussed the terms.', ins: 'Poné la acción de fondo en pasado continuo', a: ['when i arrived, they were discussing the terms', 'when i arrived they were discussing the terms'] },
    ],
  });

  G.add({
    id: 'g11', level: 'B1', title: 'First and Second Conditional',
    titleEs: 'Primer y segundo condicional',
    why: 'Negociar es puro condicional: "Si aumentan el volumen, les bajamos el precio".',
    explain: `
      <p><b>First (real, futuro posible):</b><br>
      <code>If + present simple, ... will + infinitivo</code><br>
      <code>If you order 500 units, we <b>will</b> give you a discount.</code></p>
      <p><b>Second (hipotético, improbable o irreal):</b><br>
      <code>If + past simple, ... would + infinitivo</code><br>
      <code>If I <b>had</b> more capital, I <b>would</b> open my own company.</code></p>
      <p class="warn">Nunca va <code>will</code> ni <code>would</code> dentro del "if". Con el verbo <i>be</i>
      en segundo condicional se usa <code>were</code> para todas las personas: <code>If I were you…</code></p>`,
    examples: [
      { en: 'If the payment clears today, we will ship tomorrow.', es: 'Si el pago se acredita hoy, despachamos mañana.' },
      { en: 'If I were you, I would accept the offer.', es: 'Si yo fuera vos, aceptaría la oferta.' },
      { en: 'We would expand if the market were more stable.', es: 'Nos expandiríamos si el mercado fuera más estable.' },
    ],
    pitfall: 'El error clásico: "If I will have time…". En inglés el "if" va en presente: "If I have time, I will call you".',
    exercises: [
      { t: 'fill', q: 'If you ___ (increase) the volume, we ___ (reduce) the price.', a: ['increase / will reduce', 'increase will reduce'] },
      { t: 'fill', q: 'If I ___ (be) you, I would read the contract twice.', a: ['were', 'was'] },
      { t: 'choice', q: 'If the tariff ___, exports would collapse.', o: ['will rise', 'rose', 'would rise'], a: 1 },
      { t: 'choice', q: 'We ___ ship on Friday if the documents arrive.', o: ['would', 'will', 'were'], a: 1 },
      { t: 'order', w: ['we', 'if', 'the', 'had', 'would', 'accept', 'budget,', 'we', 'it'], a: 'If we had the budget, we would accept it' },
      { t: 'transform', q: 'If I will see him, I will tell him.', ins: 'Corregí el error', a: ['if i see him, i will tell him', 'if i see him i will tell him', "if i see him, i'll tell him"] },
    ],
  });

  G.add({
    id: 'g12', level: 'B1', title: 'Gerunds vs Infinitives',
    titleEs: 'Gerundio vs. infinitivo',
    why: 'Elegir mal entre "-ing" y "to" es el error que más delata a un hispanohablante en un texto escrito.',
    explain: `
      <p><b>Siempre gerundio (-ing)</b> después de: enjoy, avoid, suggest, consider, finish,
      mind, practise, recommend, risk, keep, look forward to, be worth, y <b>toda preposición</b>.</p>
      <p><b>Siempre infinitivo (to + verbo)</b> después de: want, need, decide, hope, plan,
      agree, afford, manage, offer, promise, refuse, learn, seem.</p>
      <p><b>Cambian de significado:</b><br>
      <code>stop <b>smoking</b></code> = dejar de fumar · <code>stop <b>to smoke</b></code> = parar para fumar<br>
      <code>remember <b>locking</b></code> = recordar haber cerrado · <code>remember <b>to lock</b></code> = acordarse de cerrar</p>`,
    examples: [
      { en: 'We look forward to hearing from you.', es: 'Quedamos a la espera de su respuesta. (¡preposición "to" + -ing!)' },
      { en: 'They decided to postpone the meeting.', es: 'Decidieron posponer la reunión.' },
      { en: "It's worth checking the Incoterm again.", es: 'Vale la pena revisar el Incoterm otra vez.' },
    ],
    pitfall: '"I look forward to hear from you" está MAL y es el error más común en emails comerciales. Ese "to" es preposición: "to hearing".',
    exercises: [
      { t: 'fill', q: 'We look forward to ___ (hear) from you.', a: ['hearing'] },
      { t: 'fill', q: 'They agreed ___ (lower) the price by 5%.', a: ['to lower'] },
      { t: 'choice', q: 'I suggest ___ a different supplier.', o: ['to contact', 'contacting', 'contact'], a: 1 },
      { t: 'choice', q: "Don't forget ___ the invoice before Friday.", o: ['sending', 'to send', 'send'], a: 1 },
      { t: 'fill', q: 'She is interested in ___ (work) abroad.', a: ['working'] },
      { t: 'transform', q: 'We managed finishing the audit on time.', ins: 'Corregí el error', a: ['we managed to finish the audit on time'] },
    ],
  });

  G.add({
    id: 'g13', level: 'B1', title: 'Passive Voice',
    titleEs: 'Voz pasiva',
    why: 'Los documentos comerciales están en pasiva: "The goods were shipped", "Payment is to be made by L/C". Es el registro formal por defecto.',
    explain: `
      <p><code>be (en el tiempo correspondiente) + participio pasado</code></p>
      <table class="mini">
        <tr><th>Activa</th><th>Pasiva</th></tr>
        <tr><td>They ship the goods.</td><td>The goods <b>are shipped</b>.</td></tr>
        <tr><td>They shipped the goods.</td><td>The goods <b>were shipped</b>.</td></tr>
        <tr><td>They have shipped it.</td><td>It <b>has been shipped</b>.</td></tr>
        <tr><td>They will ship it.</td><td>It <b>will be shipped</b>.</td></tr>
        <tr><td>They must ship it.</td><td>It <b>must be shipped</b>.</td></tr>
      </table>
      <p>El agente se agrega con <code>by</code> solo si es relevante: <code>signed <b>by</b> the CEO</code>.</p>`,
    examples: [
      { en: 'The container was inspected at customs.', es: 'El contenedor fue inspeccionado en la aduana.' },
      { en: 'Payment must be made within 30 days.', es: 'El pago debe realizarse dentro de los 30 días.' },
      { en: 'Your order has been processed.', es: 'Su pedido fue procesado.' },
    ],
    pitfall: 'No confundas el participio con el pasado simple en verbos irregulares: "was wrote" está mal, es "was written".',
    exercises: [
      { t: 'transform', q: 'They deliver the goods on Fridays.', ins: 'Pasá a voz pasiva', a: ['the goods are delivered on fridays'] },
      { t: 'transform', q: 'Customs inspected the container.', ins: 'Pasá a voz pasiva', a: ['the container was inspected by customs', 'the container was inspected'] },
      { t: 'fill', q: 'The contract ___ (sign) last week.', a: ['was signed'] },
      { t: 'fill', q: 'Payment must ___ (make) in advance.', a: ['be made'] },
      { t: 'choice', q: 'Your order ___ already ___.', o: ['has / been shipped', 'has / shipped', 'was / been shipped'], a: 0 },
      { t: 'order', w: ['30', 'the', 'within', 'invoice', 'be', 'must', 'days', 'paid'], a: 'The invoice must be paid within 30 days' },
    ],
  });

  G.add({
    id: 'g14', level: 'B1', title: 'Relative Clauses',
    titleEs: 'Oraciones de relativo',
    why: 'Sirven para definir y precisar: "el proveedor que nos falló", "la cláusula cuyo texto es ambiguo". Suben mucho el nivel de tu escritura.',
    explain: `
      <p><code>who</code> personas · <code>which</code> cosas · <code>that</code> ambas (informal) ·
      <code>whose</code> posesión · <code>where</code> lugar · <code>when</code> tiempo</p>
      <p><b>Defining</b> (info esencial, sin comas):<br>
      <code>The supplier <b>who</b> called us is from Chile.</code></p>
      <p><b>Non-defining</b> (info extra, entre comas, NO admite "that"):<br>
      <code>Our supplier, <b>who</b> is from Chile, called us.</code></p>
      <p>Si el relativo es el <b>objeto</b>, se puede omitir:
      <code>The report (that) I sent you…</code></p>`,
    examples: [
      { en: 'The company that we work with is based in Rotterdam.', es: 'La empresa con la que trabajamos está en Róterdam.' },
      { en: 'Mr. Díaz, who heads logistics, will join us.', es: 'El Sr. Díaz, que dirige logística, se sumará.' },
      { en: 'This is the clause whose wording is ambiguous.', es: 'Esta es la cláusula cuya redacción es ambigua.' },
    ],
    pitfall: 'En inglés NO se repite el pronombre: "The man who I saw him" está mal. Y en non-defining nunca uses "that".',
    exercises: [
      { t: 'fill', q: 'The supplier ___ sent the quote is from Brazil.', a: ['who', 'that'] },
      { t: 'fill', q: 'This is the warehouse ___ we store the containers.', a: ['where'] },
      { t: 'fill', q: 'The client ___ order was cancelled called again.', a: ['whose'] },
      { t: 'choice', q: 'Our CEO, ___ joined in 2020, speaks four languages.', o: ['that', 'who', 'which'], a: 1 },
      { t: 'order', w: ['the', 'we', 'signed', 'contract', 'clear', 'is', 'very'], a: 'The contract we signed is very clear' },
      { t: 'transform', q: 'The report which I sent it yesterday was wrong.', ins: 'Corregí el error', a: ['the report which i sent yesterday was wrong', 'the report i sent yesterday was wrong', 'the report that i sent yesterday was wrong'] },
    ],
  });

  G.add({
    id: 'g15', level: 'B1', title: 'Reported Speech',
    titleEs: 'Estilo indirecto',
    why: 'Reportar lo que dijo un cliente o un proveedor es tarea diaria: "Dijeron que el envío se demoraría".',
    explain: `
      <p>Al reportar en pasado, los tiempos <b>retroceden un paso</b>:</p>
      <table class="mini">
        <tr><td>present → past</td><td>"I <b>need</b> it" → He said he <b>needed</b> it</td></tr>
        <tr><td>past → past perfect</td><td>"I <b>sent</b> it" → He said he <b>had sent</b> it</td></tr>
        <tr><td>will → would</td><td>"I <b>will</b> call" → He said he <b>would</b> call</td></tr>
        <tr><td>can → could</td><td>"I <b>can</b> help" → He said he <b>could</b> help</td></tr>
      </table>
      <p>También cambian: <code>today → that day</code>, <code>tomorrow → the next day</code>,
      <code>here → there</code>, <code>this → that</code>.</p>
      <p><b>Preguntas reportadas</b> pierden el orden interrogativo:<br>
      <code>"Where is it?" → He asked where it <b>was</b>.</code> (no <s>where was it</s>)</p>`,
    examples: [
      { en: 'They said the shipment would be delayed.', es: 'Dijeron que el envío se demoraría.' },
      { en: 'She asked whether we had received the invoice.', es: 'Preguntó si habíamos recibido la factura.' },
      { en: 'He told me he could not lower the price.', es: 'Me dijo que no podía bajar el precio.' },
    ],
    pitfall: '"say" no lleva objeto directo de persona; "tell" sí. Es "He said to me" o "He told me", nunca "He said me".',
    exercises: [
      { t: 'transform', q: '"We need the documents today."', ins: 'Reportá con: They said…', a: ['they said they needed the documents that day', 'they said that they needed the documents that day'] },
      { t: 'transform', q: '"I will send the quote tomorrow."', ins: 'Reportá con: He said…', a: ['he said he would send the quote the next day', 'he said that he would send the quote the next day'] },
      { t: 'choice', q: 'She ___ me that the order was ready.', o: ['said', 'told', 'asked'], a: 1 },
      { t: 'choice', q: 'He asked where the container ___.', o: ['was', 'is', 'were'], a: 0 },
      { t: 'fill', q: '"Have you paid?" → She asked ___ we had paid.', a: ['if', 'whether'] },
      { t: 'transform', q: 'He said me he was busy.', ins: 'Corregí el error', a: ['he told me he was busy', 'he said to me he was busy'] },
    ],
  });

  G.add({
    id: 'g16', level: 'B1', title: 'used to / be used to / get used to',
    titleEs: 'used to / be used to / get used to',
    why: 'Tres estructuras que se parecen y significan cosas distintas. Caen sí o sí en exámenes.',
    explain: `
      <p><code><b>used to</b> + infinitivo</code> → hábito del pasado que ya no ocurre.<br>
      <code>I used to study with flashcards.</code> = antes estudiaba así.</p>
      <p><code><b>be used to</b> + -ing / sustantivo</code> → estar acostumbrado.<br>
      <code>I am used to working under pressure.</code></p>
      <p><code><b>get used to</b> + -ing</code> → el proceso de acostumbrarse.<br>
      <code>You will get used to the schedule.</code></p>
      <p><code><b>would</b></code> también sirve para hábitos pasados, pero NO para estados:
      <code>We would meet every Friday</code> ✔ · <s>I would live in Rosario</s> ✘ (ahí va <code>used to</code>).</p>`,
    examples: [
      { en: "I didn't use to like English, but now I enjoy it.", es: 'Antes no me gustaba el inglés, pero ahora lo disfruto.' },
      { en: 'She is used to dealing with foreign clients.', es: 'Está acostumbrada a tratar con clientes del exterior.' },
      { en: "You'll get used to the new system quickly.", es: 'Te vas a acostumbrar rápido al sistema nuevo.' },
    ],
    pitfall: 'En negativo y pregunta se pierde la -d: "I didn\'t use to" / "Did you use to…?", no "didn\'t used to".',
    exercises: [
      { t: 'fill', q: 'I ___ (soler, en el pasado) play football every Sunday.', a: ['used to'] },
      { t: 'fill', q: 'He is used to ___ (work) long hours.', a: ['working'] },
      { t: 'choice', q: "It was hard at first, but I ___ it.", o: ['used to', 'got used to', 'am used'], a: 1 },
      { t: 'choice', q: '___ you ___ live in Córdoba?', o: ['Did / used to', 'Did / use to', 'Do / use to'], a: 1 },
      { t: 'order', w: ['to', 'with', 'used', 'she', 'clients', 'dealing', 'is', 'foreign'], a: 'She is used to dealing with foreign clients' },
      { t: 'transform', q: 'I am used to work under pressure.', ins: 'Corregí el error', a: ['i am used to working under pressure'] },
    ],
  });

  G.add({
    id: 'g17', level: 'B1', title: 'Phrasal Verbs: separable or not',
    titleEs: 'Phrasal verbs: separables o no',
    why: 'Los nativos los usan constantemente. Entenderlos es la diferencia entre seguir una reunión o perderte.',
    explain: `
      <p><b>Separables</b> → el objeto puede ir en el medio, y si es <b>pronombre DEBE</b> ir en el medio:<br>
      <code>turn down the offer</code> ✔ · <code>turn the offer down</code> ✔ · <code>turn <b>it</b> down</code> ✔ ·
      <s>turn down it</s> ✘</p>
      <p><b>Inseparables</b> → nunca se parten:<br>
      <code>look after the client</code> ✔ · <s>look the client after</s> ✘</p>
      <p><b>Los 10 imprescindibles para negocios:</b> follow up, carry out, set up, take over,
      call off, put off, look into, come up with, turn down, point out.</p>`,
    examples: [
      { en: 'They turned our proposal down.', es: 'Rechazaron nuestra propuesta.' },
      { en: 'We need to look into the delay.', es: 'Tenemos que investigar la demora.' },
      { en: 'The meeting was called off.', es: 'La reunión se suspendió.' },
    ],
    pitfall: 'Con pronombre (it, them, him) el phrasal separable SE PARTE obligatoriamente: "call it off", nunca "call off it".',
    exercises: [
      { t: 'choice', q: 'The meeting was cancelled. They ___.', o: ['called off it', 'called it off', 'called off'], a: 1 },
      { t: 'fill', q: 'We will ___ ___ the issue and report back. (investigar)', a: ['look into'] },
      { t: 'fill', q: 'She ___ ___ ___ a great solution. (ideó)', a: ['came up with'] },
      { t: 'choice', q: 'I will ___ with the supplier tomorrow.', o: ['follow up', 'follow it up', 'follow'], a: 0 },
      { t: 'order', w: ['down', 'they', 'offer', 'our', 'turned'], a: 'They turned our offer down' },
      { t: 'transform', q: 'Please put off it until Monday.', ins: 'Corregí el error', a: ['please put it off until monday'] },
    ],
  });
})(window.App);
