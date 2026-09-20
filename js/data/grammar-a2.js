/* ============================================================
   data/grammar-a2.js — Registro de unidades + nivel A2
   Tipos de ejercicio:
     {t:'fill',      q:'... ___ ...', a:['resp','variante'], hint:'pista'}
     {t:'choice',    q:'...', o:['a','b','c'], a:1}
     {t:'order',     w:['palabras','sueltas'], a:'oración correcta'}
     {t:'transform', q:'oración', ins:'instrucción', a:['resultado']}
   ============================================================ */
window.App = window.App || {};

(function (App) {
  'use strict';

  App.grammar = App.grammar || {
    UNITS: [],
    add(unit) { this.UNITS.push(unit); return unit; },
    byId(id) { return this.UNITS.find((u) => u.id === id); },
    byLevel(level) { return this.UNITS.filter((u) => u.level === level); },
  };

  const G = App.grammar;

  G.add({
    id: 'g01', level: 'A2', title: 'Present Simple vs Present Continuous',
    titleEs: 'Presente simple vs. presente continuo',
    why: 'Es la base de todo. En una entrevista o un email confundirlos te hace sonar principiante.',
    explain: `
      <p><b>Present Simple</b> → rutinas, hechos permanentes, verdades generales.<br>
      <code>I work / She works</code> · negativo <code>don't / doesn't</code> · pregunta <code>Do / Does</code></p>
      <p><b>Present Continuous</b> → lo que pasa <i>ahora</i> o en un período temporal.<br>
      <code>am/is/are + verbo-ing</code></p>
      <p class="warn"><b>Ojo:</b> los <i>stative verbs</i> (know, want, need, like, believe, own, cost)
      casi nunca van en continuo. Se dice <code>I know</code>, no <s>I am knowing</s>.</p>`,
    examples: [
      { en: 'I study English every morning.', es: 'Estudio inglés todas las mañanas. (rutina)' },
      { en: 'I am studying for the final exam this week.', es: 'Estoy estudiando para el final esta semana. (temporal)' },
      { en: 'The company exports to Brazil.', es: 'La empresa exporta a Brasil. (hecho)' },
      { en: 'We are negotiating a new contract.', es: 'Estamos negociando un contrato nuevo. (en curso)' },
    ],
    pitfall: 'En español decimos "¿Qué hacés?" para ambos casos. En inglés "What do you do?" = ¿de qué trabajás?, mientras que "What are you doing?" = ¿qué estás haciendo ahora?',
    exercises: [
      { t: 'fill', q: 'She ___ (work) for an import company.', a: ['works'], hint: 'rutina/hecho permanente' },
      { t: 'fill', q: 'Be quiet, the manager ___ (talk) to a client right now.', a: ['is talking'], hint: 'ahora mismo' },
      { t: 'choice', q: 'I ___ what you mean.', o: ['am understanding', 'understand', 'understands'], a: 1 },
      { t: 'choice', q: '___ they usually ship on Mondays?', o: ['Are', 'Do', 'Does'], a: 1 },
      { t: 'order', w: ['currently', 'we', 'a', 'are', 'new', 'supplier', 'looking', 'for'], a: 'We are currently looking for a new supplier' },
      { t: 'transform', q: 'He works from home.', ins: 'Pasá a negativo', a: ["he doesn't work from home", 'he does not work from home'] },
    ],
  });

  G.add({
    id: 'g02', level: 'A2', title: 'Past Simple',
    titleEs: 'Pasado simple',
    why: 'Todo relato de experiencia laboral, todo informe de lo que pasó, vive en este tiempo verbal.',
    explain: `
      <p><b>Regulares:</b> verbo + <code>-ed</code> → worked, shipped, negotiated.<br>
      <b>Irregulares:</b> hay que memorizarlos → go/went, buy/bought, send/sent, make/made.</p>
      <p><b>Negativo y pregunta usan <code>did</code> + infinitivo SIN -ed:</b><br>
      <code>I didn't go</code> (no <s>didn't went</s>) · <code>Did you send it?</code> (no <s>Did you sent</s>)</p>
      <p>Marcadores típicos: <code>yesterday, last week, in 2019, two days ago</code>.</p>`,
    examples: [
      { en: 'We signed the agreement last Friday.', es: 'Firmamos el acuerdo el viernes pasado.' },
      { en: 'They didn\'t deliver on time.', es: 'No entregaron a tiempo.' },
      { en: 'Did the shipment arrive yesterday?', es: '¿Llegó el envío ayer?' },
    ],
    pitfall: 'El error nº1 de hispanohablantes: poner el verbo en pasado DESPUÉS de "did". "Did you went?" está mal; es "Did you go?".',
    exercises: [
      { t: 'fill', q: 'We ___ (send) the invoice on Monday.', a: ['sent'], hint: 'irregular' },
      { t: 'fill', q: 'They ___ (not / accept) our offer.', a: ["didn't accept", 'did not accept'] },
      { t: 'choice', q: '___ you ___ the contract?', o: ['Did / read', 'Did / readed', 'Do / read'], a: 0 },
      { t: 'choice', q: 'The price ___ 15% last year.', o: ['rised', 'rose', 'raised up'], a: 1 },
      { t: 'order', w: ['the', 'goods', 'week', 'arrived', 'last', 'damaged'], a: 'The goods arrived damaged last week' },
      { t: 'transform', q: 'She bought the tickets.', ins: 'Pasá a pregunta', a: ['did she buy the tickets'] },
    ],
  });

  G.add({
    id: 'g03', level: 'A2', title: 'Present Perfect vs Past Simple',
    titleEs: 'Presente perfecto vs. pasado simple',
    why: 'La distinción más difícil y más evaluada. En exámenes tipo First / IELTS aparece siempre.',
    explain: `
      <p><b>Past Simple</b> → momento terminado y específico. <code>I sent it yesterday.</code></p>
      <p><b>Present Perfect</b> (<code>have/has + participio</code>) → experiencia sin fecha,
      o algo que conecta con el presente. <code>I have sent it.</code> (y ya está mandado)</p>
      <table class="mini">
        <tr><th>Present Perfect</th><th>Past Simple</th></tr>
        <tr><td>ever, never, already, yet, just, so far, recently</td><td>yesterday, ago, last…, in 2020, when</td></tr>
      </table>
      <p class="warn">Si la oración dice <b>cuándo</b>, va en Past Simple. Sin excepción.</p>`,
    examples: [
      { en: 'I have never been to Europe.', es: 'Nunca estuve en Europa. (experiencia, sin fecha)' },
      { en: 'I went to Brazil in 2023.', es: 'Fui a Brasil en 2023. (fecha concreta)' },
      { en: 'Have you finished the report yet?', es: '¿Ya terminaste el informe?' },
      { en: 'We have just received your email.', es: 'Acabamos de recibir tu correo.' },
    ],
    pitfall: 'En español rioplatense casi siempre usamos el pasado simple ("¿Ya comiste?"). En inglés ahí va present perfect: "Have you eaten yet?".',
    exercises: [
      { t: 'choice', q: 'I ___ him three years ago.', o: ['have met', 'met', 'have meet'], a: 1 },
      { t: 'choice', q: '___ you ever ___ in a trade fair?', o: ['Did / work', 'Have / worked', 'Have / work'], a: 1 },
      { t: 'fill', q: 'We ___ (not / receive) the payment yet.', a: ["haven't received", 'have not received'] },
      { t: 'fill', q: 'She ___ (start) working here in 2021.', a: ['started'], hint: 'hay fecha' },
      { t: 'order', w: ['have', 'already', 'we', 'the', 'signed', 'agreement'], a: 'We have already signed the agreement' },
      { t: 'transform', q: 'I finished the course last month.', ins: 'Reescribí con "just" en present perfect', a: ['i have just finished the course', "i've just finished the course"] },
    ],
  });

  G.add({
    id: 'g04', level: 'A2', title: 'Countable / Uncountable and Quantifiers',
    titleEs: 'Contables, incontables y cuantificadores',
    why: 'En comercio se habla todo el tiempo de cantidades: stock, mercadería, información, dinero. Varios de esos sustantivos son incontables en inglés y contables en español.',
    explain: `
      <p><b>Incontables frecuentes:</b> information, advice, news, money, furniture, equipment,
      luggage, research, feedback, machinery, staff. No llevan <code>-s</code> ni <code>a/an</code>.</p>
      <table class="mini">
        <tr><th></th><th>Contable</th><th>Incontable</th></tr>
        <tr><td>Mucho</td><td>many</td><td>much</td></tr>
        <tr><td>Poco</td><td>a few / few</td><td>a little / little</td></tr>
        <tr><td>Ambos</td><td colspan="2">some, any, a lot of, plenty of</td></tr>
      </table>
      <p><code>a few</code> = algunos (positivo) · <code>few</code> = pocos (negativo, casi ninguno)</p>`,
    examples: [
      { en: 'He gave me some useful advice.', es: 'Me dio algunos consejos útiles.' },
      { en: 'We don\'t have much information about the supplier.', es: 'No tenemos mucha información sobre el proveedor.' },
      { en: 'There are a few options left.', es: 'Quedan algunas opciones.' },
    ],
    pitfall: '"Advices", "informations", "newses" y "equipments" NO existen. Se dice "a piece of advice", "some information".',
    exercises: [
      { t: 'choice', q: 'He gave me a lot of ___.', o: ['advices', 'advice', 'an advice'], a: 1 },
      { t: 'choice', q: 'How ___ money do we need?', o: ['many', 'much', 'few'], a: 1 },
      { t: 'fill', q: 'There are only ___ units left in stock. (algunos)', a: ['a few'] },
      { t: 'fill', q: 'We need ___ more information before deciding. (un poco)', a: ['a little'] },
      { t: 'choice', q: 'The news ___ very good today.', o: ['are', 'is', 'were'], a: 1 },
      { t: 'transform', q: 'We have many equipments.', ins: 'Corregí el error', a: ['we have a lot of equipment', 'we have much equipment', 'we have lots of equipment'] },
    ],
  });

  G.add({
    id: 'g05', level: 'A2', title: 'Comparatives and Superlatives',
    titleEs: 'Comparativos y superlativos',
    why: 'Comparar proveedores, precios y mercados es literalmente el trabajo diario en comercio internacional.',
    explain: `
      <p><b>Cortos (1 sílaba):</b> cheap → cheap<b>er</b> → the cheap<b>est</b><br>
      <b>Largos (2+ sílabas):</b> expensive → <b>more</b> expensive → <b>the most</b> expensive<br>
      <b>Irregulares:</b> good/better/the best · bad/worse/the worst · far/further/the furthest</p>
      <p><b>Estructuras clave:</b><br>
      <code>A is cheaper <b>than</b> B</code><br>
      <code>A is <b>as</b> expensive <b>as</b> B</code> (igual de)<br>
      <code>A is <b>not as</b> expensive <b>as</b> B</code> (no tan)<br>
      <code><b>the</b> more you buy, <b>the</b> cheaper it gets</code> (cuanto más…, más…)</p>`,
    examples: [
      { en: 'Air freight is faster but more expensive than sea freight.', es: 'El flete aéreo es más rápido pero más caro que el marítimo.' },
      { en: 'This is the most reliable supplier we have.', es: 'Es el proveedor más confiable que tenemos.' },
      { en: 'Their offer is not as competitive as ours.', es: 'Su oferta no es tan competitiva como la nuestra.' },
    ],
    pitfall: 'Nunca combines las dos formas: "more cheaper" está mal. Y después de "than" nunca va "that": es "cheaper than", no "cheaper that".',
    exercises: [
      { t: 'fill', q: 'Sea freight is ___ (cheap) than air freight.', a: ['cheaper'] },
      { t: 'fill', q: 'This is ___ (good) offer we received.', a: ['the best'] },
      { t: 'choice', q: 'Their prices are ___ competitive ___ ours.', o: ['as / than', 'as / as', 'more / as'], a: 1 },
      { t: 'choice', q: 'The situation got ___ after the tariff increase.', o: ['worse', 'worst', 'more bad'], a: 0 },
      { t: 'order', w: ['the', 'the', 'you', 'more', 'order,', 'discount', 'bigger', 'the'], a: 'The more you order, the bigger the discount' },
      { t: 'transform', q: 'Brazil is bigger than Argentina.', ins: 'Reescribí con "not as … as" empezando por Argentina', a: ['argentina is not as big as brazil'] },
    ],
  });

  G.add({
    id: 'g06', level: 'A2', title: 'Future: will / going to / present continuous',
    titleEs: 'Futuro: will, going to y presente continuo',
    why: 'Confirmar entregas, prometer plazos y agendar reuniones: cada forma comunica un grado distinto de compromiso.',
    explain: `
      <p><b>will</b> → decisión del momento, promesa, predicción sin evidencia, oferta.<br>
      <code>I'll send it right away.</code></p>
      <p><b>going to</b> → plan ya decidido, o predicción CON evidencia.<br>
      <code>We're going to open a branch in Chile.</code></p>
      <p><b>Present continuous</b> → arreglo fijo con fecha y hora (agenda).<br>
      <code>I'm meeting the client at 3 p.m.</code></p>`,
    examples: [
      { en: "Don't worry, I'll take care of it.", es: 'No te preocupes, yo me encargo. (decisión ahora)' },
      { en: 'We are going to expand into Asia next year.', es: 'Vamos a expandirnos a Asia el año que viene. (plan)' },
      { en: 'The container is arriving on Thursday.', es: 'El contenedor llega el jueves. (agendado)' },
    ],
    pitfall: 'Después de "when", "if", "as soon as", "until" y "before" NO va will: "I\'ll call you when I arrive" (no <s>when I will arrive</s>).',
    exercises: [
      { t: 'choice', q: 'The phone is ringing. — ___ answer it.', o: ["I'm going to", "I'll", 'I answer'], a: 1 },
      { t: 'choice', q: 'Look at those clouds! It ___ rain.', o: ['will', 'is going to', 'is raining'], a: 1 },
      { t: 'fill', q: "I'll email you as soon as the goods ___ (arrive).", a: ['arrive'], hint: 'después de "as soon as" no va will' },
      { t: 'fill', q: 'We ___ (open) a new office in Santiago. It is already decided.', a: ['are going to open'] },
      { t: 'order', w: ['the', 'at', 'meeting', 'am', 'ten', 'client', 'I', 'tomorrow'], a: 'I am meeting the client at ten tomorrow' },
      { t: 'transform', q: 'I will call you when I will get home.', ins: 'Corregí el error', a: ['i will call you when i get home', "i'll call you when i get home"] },
    ],
  });

  G.add({
    id: 'g07', level: 'A2', title: 'Modal verbs: obligation, ability and advice',
    titleEs: 'Verbos modales: obligación, capacidad y consejo',
    why: 'La normativa aduanera y los contratos están escritos con modales: must, shall, may, be required to.',
    explain: `
      <p><code>can / could</code> → capacidad y permiso<br>
      <code>should / ought to</code> → consejo, recomendación<br>
      <code>must</code> → obligación fuerte (interna o de una norma)<br>
      <code>have to</code> → obligación externa (una regla te obliga)<br>
      <code>mustn't</code> → prohibido · <code>don't have to</code> → no es necesario (¡son distintos!)</p>
      <p class="warn">Los modales NO llevan -s en 3ª persona ni "to" después:
      <code>She must go</code>, no <s>She musts to go</s>.</p>`,
    examples: [
      { en: 'All exporters must register with customs.', es: 'Todos los exportadores deben registrarse en la aduana.' },
      { en: "You don't have to come, it's optional.", es: 'No hace falta que vengas, es opcional.' },
      { en: "You mustn't open the container before inspection.", es: 'No debés abrir el contenedor antes de la inspección.' },
      { en: 'You should double-check the Incoterm.', es: 'Deberías verificar el Incoterm.' },
    ],
    pitfall: '"mustn\'t" = prohibición. "don\'t have to" = ausencia de obligación. Confundirlos en un contrato cambia el significado por completo.',
    exercises: [
      { t: 'choice', q: 'Attendance is optional, so you ___ come.', o: ["mustn't", "don't have to", 'must not'], a: 1 },
      { t: 'choice', q: 'Passengers ___ smoke on board.', o: ["don't have to", "mustn't", "shouldn't have to"], a: 1 },
      { t: 'fill', q: 'You ___ (consejo) read the terms before signing.', a: ['should', 'ought to'] },
      { t: 'fill', q: 'She ___ speak three languages fluently. (capacidad)', a: ['can'] },
      { t: 'order', w: ['all', 'comply', 'must', 'exporters', 'the', 'with', 'regulations'], a: 'All exporters must comply with the regulations' },
      { t: 'transform', q: 'She musts to sign the form.', ins: 'Corregí el error', a: ['she must sign the form'] },
    ],
  });

  G.add({
    id: 'g08', level: 'A2', title: 'Prepositions: in / on / at and dependent prepositions',
    titleEs: 'Preposiciones: in / on / at y preposiciones dependientes',
    why: 'Un email comercial con la preposición equivocada se nota al instante. Es detalle puro pero define si sonás profesional.',
    explain: `
      <p><b>Tiempo:</b> <code>in</code> meses, años, siglos (in May, in 2026) ·
      <code>on</code> días y fechas (on Monday, on 5 June) ·
      <code>at</code> horas y momentos puntuales (at 9 a.m., at night).</p>
      <p><b>Lugar:</b> <code>in</code> espacios cerrados/países · <code>on</code> superficies ·
      <code>at</code> puntos concretos (at the airport, at the office).</p>
      <p><b>Dependientes (hay que memorizarlas):</b> depend <b>on</b>, arrive <b>at/in</b>,
      responsible <b>for</b>, interested <b>in</b>, good <b>at</b>, pay <b>for</b>,
      apply <b>for</b> a job, apply <b>to</b> a company, consist <b>of</b>.</p>`,
    examples: [
      { en: 'The meeting is on Monday at 10 a.m. in the main office.', es: 'La reunión es el lunes a las 10 en la oficina central.' },
      { en: 'It depends on the exchange rate.', es: 'Depende del tipo de cambio.' },
      { en: 'She is responsible for logistics.', es: 'Ella es responsable de logística.' },
    ],
    pitfall: 'En español decimos "depende DE". En inglés es "depend ON", nunca "depend of". Igual con "consist of" (constar de).',
    exercises: [
      { t: 'fill', q: 'The shipment leaves ___ 15 March.', a: ['on'] },
      { t: 'fill', q: 'Everything depends ___ the customs clearance.', a: ['on'] },
      { t: 'choice', q: 'We arrived ___ Buenos Aires ___ midnight.', o: ['at / in', 'in / at', 'on / at'], a: 1 },
      { t: 'choice', q: 'She is very good ___ negotiating.', o: ['in', 'at', 'for'], a: 1 },
      { t: 'fill', q: 'I would like to apply ___ the position of trade assistant.', a: ['for'] },
      { t: 'transform', q: 'The price consists in three parts.', ins: 'Corregí el error', a: ['the price consists of three parts'] },
    ],
  });
})(window.App);
