/* ============================================================
   data/content.js — Banco de contenido offline
   Lecturas, diálogos (para TTS), consignas de escritura,
   roleplays y frases de traducción.
   ============================================================ */
window.App = window.App || {};

(function (App) {
  'use strict';

  /* ================== READINGS ================== */
  const READINGS = [
    {
      id: 'r01', topic: 'business', level: 'A2',
      title: 'A Day at the Port',
      text: `Every morning, thousands of containers move through the port of Buenos Aires. Trucks arrive early, sometimes before sunrise, and drivers wait in long queues to deliver their cargo.

Lucía works as a customs assistant. Her job is to check that every shipment has the correct documents. If one paper is missing, the container cannot leave the port. "People think the hard part is moving the boxes," she says. "Actually, the hard part is the paperwork."

A single mistake on an invoice can delay a shipment for a week. That is expensive: the company pays storage for every extra day. Because of this, Lucía reads every document twice before she signs it.

She studied international trade at university and learned English because most of the documents she sees are written in English. "You don't need perfect English," she explains, "but you do need to understand exactly what a contract says."`,
      glossary: [
        ['queue', 'fila / cola'], ['cargo', 'carga'], ['paperwork', 'papeleo'],
        ['storage', 'almacenamiento'], ['delay', 'demorar / demora'],
      ],
      questions: [
        { q: 'According to Lucía, what is the hardest part of the job?', o: ['Moving the containers', 'The paperwork', 'Driving the trucks'], a: 1 },
        { q: 'What happens if a document is missing?', o: ['The container cannot leave', 'The company pays a fine', 'The truck returns empty'], a: 0 },
        { q: 'Why did Lucía learn English?', o: ['To travel abroad', 'Because the documents are in English', 'To get a promotion'], a: 1 },
      ],
    },
    {
      id: 'r02', topic: 'business', level: 'B1',
      title: 'What Incoterms Really Mean',
      text: `When two companies from different countries sign a contract, one question always comes up: who pays for what, and who takes the risk if something goes wrong? Incoterms exist to answer that question in three letters.

Take FOB, or "Free On Board". Under FOB, the seller is responsible for the goods until they are loaded onto the ship. From that moment, the risk passes to the buyer. If the vessel sinks halfway across the Atlantic, the buyer, not the seller, bears the loss.

Compare that with DDP, "Delivered Duty Paid". Here the seller assumes almost everything: transport, insurance, customs duties, and delivery to the buyer's door. It is convenient for the buyer, but the price will be considerably higher, because the seller has priced in all of those costs and risks.

Many disputes between exporters and importers are not really about money. They stem from a misunderstanding about which Incoterm was agreed. Experienced traders therefore write the Incoterm, the version year, and the exact place in the contract: for example, "FOB Buenos Aires, Incoterms 2020". Three letters, one city, one year — and a great deal of potential litigation avoided.`,
      glossary: [
        ['bear the loss', 'asumir la pérdida'], ['vessel', 'buque'], ['duties', 'derechos aduaneros'],
        ['stem from', 'originarse en'], ['litigation', 'litigio'], ['price in', 'incorporar al precio'],
      ],
      questions: [
        { q: 'Under FOB, when does risk pass to the buyer?', o: ['When the contract is signed', 'When goods are loaded onto the ship', 'When goods arrive at the port'], a: 1 },
        { q: 'Why is DDP more expensive?', o: ['Because the seller covers costs and risks', 'Because ships are slower', 'Because customs charge more'], a: 0 },
        { q: 'What causes many disputes according to the text?', o: ['Currency fluctuations', 'Misunderstanding which Incoterm applies', 'Late payments'], a: 1 },
      ],
    },
    {
      id: 'r03', topic: 'business', level: 'B2',
      title: 'The Hidden Cost of a Cheap Supplier',
      text: `Procurement teams are routinely judged on a single number: unit price. It is easy to measure, easy to compare, and easy to defend in a meeting. Yet the cheapest supplier is frequently the most expensive one, once the full picture emerges.

Consider a manufacturer that switches to a supplier offering a 12% discount. On paper, the saving is substantial. In practice, the new supplier has a lead time three weeks longer, which forces the manufacturer to hold additional inventory. Its defect rate is marginally higher, generating warranty claims months later. And because it operates in a jurisdiction with volatile customs procedures, roughly one shipment in ten is held for inspection.

None of these costs appear on the invoice. They surface in working capital, in customer complaints, and in the overtime paid by the logistics team. Analysts call this the total cost of ownership, and studies suggest it can exceed the purchase price by 20 to 40 per cent in cross-border sourcing.

The lesson is not that cheap suppliers should be avoided. It is that price is a single variable in a multivariable problem. Firms that negotiate well tend to negotiate the whole package — lead time, quality thresholds, payment terms, penalty clauses — rather than haggling over a percentage that may prove illusory.`,
      glossary: [
        ['procurement', 'compras / abastecimiento'], ['lead time', 'plazo de entrega'],
        ['defect rate', 'tasa de defectos'], ['working capital', 'capital de trabajo'],
        ['threshold', 'umbral'], ['haggle', 'regatear'], ['illusory', 'ilusorio'],
      ],
      questions: [
        { q: 'What is the main argument of the text?', o: ['Cheap suppliers should always be avoided', 'Unit price alone is a misleading measure', 'Customs procedures are the biggest cost'], a: 1 },
        { q: 'Which cost does NOT appear on the invoice?', o: ['The unit price', 'The discount', 'Extra inventory holding'], a: 2 },
        { q: 'What do good negotiators focus on?', o: ['The whole package of terms', 'Only the percentage discount', 'Changing supplier frequently'], a: 0 },
      ],
    },
    {
      id: 'r04', topic: 'tech', level: 'A2',
      title: 'Why Your Game Lags',
      text: `You are in the final round. You press the button, but your character moves half a second later. You lose. Most players blame their internet, but the real reason is often more complicated.

Lag has three main causes. The first is distance: if the server is in Europe and you are in Argentina, your signal travels thousands of kilometres and back. That takes time, and no connection can beat physics.

The second cause is your own network. If someone at home is streaming video in 4K, there is less bandwidth available for your game. The third is your hardware: an old graphics card produces fewer frames per second, which feels like lag even when the connection is perfect.

There are simple fixes. Use a cable instead of Wi-Fi if you can. Choose a server close to your region. Close background applications before playing. These will not make you a better player, but at least you will lose for the right reasons.`,
      glossary: [
        ['lag', 'lag / retraso'], ['bandwidth', 'ancho de banda'], ['frames per second', 'cuadros por segundo'],
        ['background', 'en segundo plano'], ['blame', 'culpar'],
      ],
      questions: [
        { q: 'What is the first cause of lag mentioned?', o: ['Old hardware', 'Distance to the server', 'Too many players'], a: 1 },
        { q: 'What does the text recommend?', o: ['Buying a new computer', 'Using a cable instead of Wi-Fi', 'Playing at night'], a: 1 },
        { q: 'What does "background applications" mean?', o: ['Apps running behind the game', 'Apps you deleted', 'Apps on your phone'], a: 0 },
      ],
    },
    {
      id: 'r05', topic: 'tech', level: 'B1',
      title: 'Can a Machine Translate a Contract?',
      text: `Machine translation has improved dramatically. A tool that produced comic results ten years ago can now translate a news article almost perfectly. So why do law firms and trade companies still pay human translators?

The answer lies in consequences. In a news article, a small error changes nothing important. In a contract, a single word can shift millions of dollars. Consider the English phrase "the seller shall deliver". In legal English, "shall" creates an obligation. A machine may translate it as a simple future, and the obligation quietly disappears.

There is also the problem of false friends. The Spanish word "eventualmente" does not mean "eventually"; it means "possibly". "Actualmente" is not "actually" but "currently". Machines are getting better at these, yet they still fail when the context is ambiguous.

Most professionals now use a hybrid approach. The machine produces a first draft in seconds, and a human reviews it, focusing on the clauses where money and liability are involved. The technology has not replaced the translator; it has changed what the translator spends time on.`,
      glossary: [
        ['shall', 'deberá (obligación legal)'], ['shift', 'desplazar / cambiar'],
        ['false friend', 'falso amigo'], ['draft', 'borrador'], ['liability', 'responsabilidad'],
      ],
      questions: [
        { q: 'Why is a translation error worse in a contract?', o: ['Contracts are longer', 'A word can shift millions of dollars', 'Machines cannot read contracts'], a: 1 },
        { q: 'What does "actualmente" really mean in English?', o: ['actually', 'currently', 'eventually'], a: 1 },
        { q: 'What is the hybrid approach?', o: ['Two machines working together', 'Machine drafts, human reviews', 'Human drafts, machine reviews'], a: 1 },
      ],
    },
    {
      id: 'r06', topic: 'pop', level: 'A2',
      title: 'Why Subtitles Changed Everything',
      text: `Ten years ago, most people in Argentina watched foreign series dubbed into Spanish. Today, many prefer the original version with subtitles. Something changed, and it was not only technology.

Streaming platforms made switching easy. One click and you have English audio with Spanish subtitles, or English audio with English subtitles. Teachers noticed the effect quickly: students who watch with English subtitles learn vocabulary without studying.

The trick is to change the subtitles as your level improves. At the beginning, Spanish subtitles help you follow the story. Later, English subtitles connect the sound with the written word. Finally, you turn them off completely.

It does not work for everyone, and it is not a replacement for grammar. But thirty minutes of a series you actually enjoy will teach you more than thirty minutes of a textbook you hate.`,
      glossary: [
        ['dubbed', 'doblado'], ['switch', 'cambiar'], ['subtitles', 'subtítulos'],
        ['replacement', 'reemplazo'], ['textbook', 'libro de texto'],
      ],
      questions: [
        { q: 'What should you do as your level improves?', o: ['Watch faster', 'Change subtitles from Spanish to English', 'Stop watching series'], a: 1 },
        { q: 'What does the text say about grammar?', o: ['Series replace grammar study', 'Series are not a replacement for grammar', 'Grammar is useless'], a: 1 },
        { q: 'What is the final step?', o: ['Turn subtitles off', 'Use Spanish audio', 'Read the script'], a: 0 },
      ],
    },
    {
      id: 'r07', topic: 'pop', level: 'B2',
      title: 'The Economics of a Global Hit',
      text: `When a song becomes a worldwide hit, the money it generates travels through a chain that most listeners never see. A stream pays a fraction of a cent. Multiply that by a billion and the figure becomes serious — but it is divided among the label, the distributor, the publisher, the songwriters and, somewhere near the end of the queue, the performer.

This is why touring has become the real business. Recorded music functions increasingly as marketing for live performance, reversing the logic of the twentieth century, when tours promoted albums. Stadium tours now generate revenues that dwarf streaming income, which explains why artists tour for two years on the strength of a single record.

There is a geographical dimension too. Streaming pays different rates in different markets, so a million plays in Norway are worth considerably more than a million plays in Indonesia. Artists with large audiences in lower-paying markets can be globally famous and financially modest at the same time.

For anyone studying international trade, the music industry is a useful case study: an intangible product, licensed rather than sold, priced differently in every jurisdiction, and dependent on contracts that almost nobody reads carefully enough.`,
      glossary: [
        ['label', 'sello discográfico'], ['publisher', 'editorial musical'],
        ['dwarf', 'empequeñecer / superar ampliamente'], ['intangible', 'intangible'],
        ['jurisdiction', 'jurisdicción'], ['on the strength of', 'sobre la base de'],
      ],
      questions: [
        { q: 'Why has touring become the main business?', o: ['Concerts are cheaper to produce', 'Streaming pays relatively little per play', 'Albums are no longer recorded'], a: 1 },
        { q: 'What reversal does the text describe?', o: ['Tours now promote albums', 'Recorded music now promotes tours', 'Labels now pay artists first'], a: 1 },
        { q: 'Why can an artist be famous but not rich?', o: ['They refuse to tour', 'Their audience is in lower-paying markets', 'They do not sign contracts'], a: 1 },
      ],
    },
    {
      id: 'r08', topic: 'sports', level: 'B1',
      title: 'The Transfer That Moves an Economy',
      text: `When a football club sells a player for forty million euros, the headline focuses on the athlete. Economists focus on something else: where the money goes.

A significant part never reaches the selling club. Agents take a commission. The player's previous clubs may be entitled to a training compensation, a mechanism designed to reward the academies that developed him. Taxes are paid in at least two countries, and the transfer fee is often paid in instalments over three or four years, which means the selling club records revenue it has not yet received.

For South American clubs, these transfers are frequently the main source of income. A single sale can fund a stadium renovation or clear years of debt. This creates a structural dependency: clubs develop talent not primarily to win titles but to export it, much as a country might export a commodity.

Critics argue that this weakens local competitions, since the best players leave at twenty. Defenders reply that without transfer income, many clubs would simply not survive. Both are describing the same trade balance from opposite sides.`,
      glossary: [
        ['transfer fee', 'monto del pase'], ['entitled to', 'con derecho a'],
        ['instalments', 'cuotas'], ['academy', 'cantera / inferiores'],
        ['commodity', 'materia prima'], ['clear debt', 'saldar deuda'],
      ],
      questions: [
        { q: 'What is training compensation for?', o: ['To reward the clubs that developed the player', 'To pay the agent', 'To cover taxes'], a: 0 },
        { q: 'Why do South American clubs depend on transfers?', o: ['They win more titles that way', 'It is often their main source of income', 'It is required by regulations'], a: 1 },
        { q: 'What comparison does the text make?', o: ['Players are like commodities a country exports', 'Clubs are like banks', 'Agents are like customs officers'], a: 0 },
      ],
    },
    {
      id: 'r09', topic: 'sports', level: 'B2',
      title: 'When a Drought Reaches the Trade Balance',
      text: `A drought begins as a weather event and ends as a macroeconomic one. In an economy where a handful of agricultural commodities generate the bulk of foreign currency, the link is unusually direct.

The sequence is predictable. Rainfall falls below average during the critical growth window. Yields decline, sometimes by a third. Exportable volume shrinks, and with it the dollars entering the country. Because those dollars fund imports of energy, machinery and industrial inputs, the shortage propagates into sectors that have nothing to do with agriculture. A factory in the suburbs of Buenos Aires may reduce production because a field in Córdoba did not receive rain in January.

Governments typically respond with currency controls, which mitigate the immediate pressure but introduce distortions of their own: parallel exchange rates, delayed import authorisations, and incentives for exporters to withhold their harvest in anticipation of a devaluation.

What makes this cycle so difficult to escape is not the weather, which is beyond anyone's control, but the concentration of export revenue in a narrow range of products. Diversification is the standard prescription. It is also, for structural reasons, the slowest possible remedy — measured in decades rather than harvests.`,
      glossary: [
        ['drought', 'sequía'], ['yield', 'rendimiento (de cultivo)'], ['shrink', 'reducirse'],
        ['propagate', 'propagarse'], ['withhold', 'retener'], ['harvest', 'cosecha'],
        ['prescription', 'receta / recomendación'],
      ],
      questions: [
        { q: 'How does a drought affect a factory in Buenos Aires?', o: ['It cannot get water', 'Fewer export dollars limit imported inputs', 'Workers move to the countryside'], a: 1 },
        { q: 'What side effect of currency controls is mentioned?', o: ['Higher yields', 'Parallel exchange rates', 'Lower taxes'], a: 1 },
        { q: 'What does the author identify as the real problem?', o: ['The weather', 'Concentration of export revenue', 'Government incompetence'], a: 1 },
      ],
    },
    {
      id: 'r10', topic: 'core', level: 'A2',
      title: 'How to Learn a Language Without Quitting',
      text: `Most people who start learning a language stop within two months. The reason is rarely lack of talent. It is that they design a plan they cannot sustain.

The first mistake is doing too much at the beginning. Three hours on Sunday feels productive, but you forget most of it by Wednesday. Twenty minutes every day is less impressive and much more effective, because memory works by repetition over time, not by intensity.

The second mistake is studying only material you find boring. If you hate the topic, you will find an excuse to skip it. If you study with content you actually enjoy — a series, a sport, a subject you care about — the effort feels smaller.

The third mistake is measuring the wrong thing. Do not measure hours. Measure days in a row. A streak is easier to protect than a schedule, and protecting it becomes a habit.

You do not need motivation every day. You need a system that works on the days when you have none.`,
      glossary: [
        ['quit', 'abandonar'], ['sustain', 'sostener'], ['skip', 'saltear'],
        ['streak', 'racha'], ['in a row', 'seguidos'],
      ],
      questions: [
        { q: 'What does the text recommend instead of long sessions?', o: ['Twenty minutes every day', 'Three hours on Sunday', 'One hour twice a week'], a: 0 },
        { q: 'What should you measure?', o: ['Hours studied', 'Days in a row', 'Words learned'], a: 1 },
        { q: 'What is the main idea of the last paragraph?', o: ['Motivation is essential', 'A system matters more than motivation', 'Talent decides everything'], a: 1 },
      ],
    },
    {
      id: 'r11', topic: 'business', level: 'A2',
      title: 'The Email That Cost a Contract',
      text: `Martín works in a small export company in Rosario. Last March, he sent a price list to a client in Canada. He wrote the prices in the usual way: 1.500 for one thousand five hundred.

In Argentina, a dot separates thousands. In Canada, a dot is a decimal point. The client read "1.500" as one dollar and fifty cents.

The client placed a very large order. When Martín saw it, he was happy. Then he checked the numbers and understood the problem. The client was angry. He said the price list was clear and he wanted the price on the document.

In the end, the company did not lose money, because Martín's manager called the client and explained the mistake politely. But they lost the contract, and the client bought from a company in Chile.

Now Martín writes prices like this: USD 1,500.00. It takes three more seconds, and it has never happened again.`,
      glossary: [
        ['price list', 'lista de precios'], ['decimal point', 'punto decimal'],
        ['place an order', 'hacer un pedido'], ['angry', 'enojado'], ['mistake', 'error'],
      ],
      questions: [
        { q: 'What did the client understand?', o: ['One dollar fifty', 'Fifteen hundred dollars', 'Fifteen dollars'], a: 0 },
        { q: 'What happened in the end?', o: ['They lost money', 'They lost the contract', 'The client apologised'], a: 1 },
        { q: 'What does Martín do now?', o: ['He writes USD 1,500.00', 'He calls every client', 'He does not export'], a: 0 },
      ],
    },
    {
      id: 'r12', topic: 'sports', level: 'A2',
      title: 'The Stadium Nobody Uses',
      text: `When a country hosts a World Cup or an Olympic Games, it builds new stadiums. Some of them are beautiful. Some of them are enormous. And some of them are empty two years later.

Experts call these buildings "white elephants". They cost millions to build and thousands every month to maintain. The grass needs water. The lights need electricity. Security guards need salaries. But nobody plays there.

The problem is simple: a city may need a stadium for sixty thousand people during one month, but only for five thousand people during the other years.

Some countries have found solutions. They build temporary stands and remove them after the event. Others plan the future use before construction starts: a university campus, a concert venue, or apartments.

The lesson is not that big events are bad. It is that the interesting question is not "what do we need in July?" but "what do we need in ten years?"`,
      glossary: [
        ['host', 'ser sede de'], ['empty', 'vacío'], ['maintain', 'mantener'],
        ['stands', 'tribunas'], ['venue', 'sede / recinto'],
      ],
      questions: [
        { q: 'What is a "white elephant"?', o: ['A rare animal', 'An expensive, useless building', 'A type of stadium seat'], a: 1 },
        { q: 'What is one solution mentioned?', o: ['Temporary stands', 'Smaller events', 'Higher ticket prices'], a: 0 },
        { q: 'What is the main lesson?', o: ['Plan for the long term', 'Avoid hosting events', 'Build cheaper stadiums'], a: 0 },
      ],
    },
    {
      id: 'r13', topic: 'tech', level: 'B1',
      title: 'Why Everything Is a Subscription Now',
      text: `Twenty years ago you bought software once. You owned a disc, you installed it, and it was yours. Today you rent almost everything: music, films, storage, even the programs you use to study.

For companies, the logic is obvious. A single sale of one hundred dollars produces one hundred dollars. A subscription of ten dollars a month produces one hundred and twenty a year, every year, and it makes revenue predictable. Investors value predictable revenue far more highly than occasional sales.

For users, the picture is mixed. Subscriptions lower the entry cost: you can access a professional tool for the price of a coffee. But the total cost over five years is usually much higher, and you never own anything. If you stop paying, the files may remain but the program that opens them does not.

There is also a quieter effect. When a product is sold once, the company must convince you at the moment of purchase. When it is rented, the company must keep you slightly worried about cancelling. That is a different kind of design, and not always a better one for the person using it.`,
      glossary: [
        ['own', 'poseer / ser dueño de'], ['revenue', 'ingresos'], ['predictable', 'predecible'],
        ['entry cost', 'costo de entrada'], ['cancel', 'dar de baja'],
      ],
      questions: [
        { q: 'Why do investors prefer subscriptions?', o: ['They are cheaper to run', 'Revenue is predictable', 'They need less marketing'], a: 1 },
        { q: 'What is the advantage for users?', o: ['Lower entry cost', 'Lower total cost', 'They own the software'], a: 0 },
        { q: 'What "quieter effect" does the author describe?', o: ['Products get worse quickly', 'Design aims to prevent cancellation', 'Prices rise every year'], a: 1 },
      ],
    },
    {
      id: 'r14', topic: 'pop', level: 'B1',
      title: 'The Accent Problem',
      text: `Many students spend years worrying about their accent. They want to sound American, or British, and they feel embarrassed when someone notices they are foreign. This worry is understandable, and mostly unnecessary.

Research on communication is fairly clear: what makes speech easy to understand is not accent but clarity. Word stress matters enormously. If you say "COMfortable" instead of "comFORtable", a listener may hesitate, even if every sound is correct. Rhythm matters too: English compresses unstressed syllables, so speakers who pronounce every vowel fully sound slower and, oddly, harder to follow.

Meanwhile, the actual accent — whether your "r" sounds Argentine or Texan — affects comprehension far less than people imagine. Most international business is conducted between non-native speakers anyway. In a meeting between a Korean supplier, a German buyer and an Argentine agent, nobody sounds like the BBC.

The practical advice is therefore unglamorous. Work on stress and rhythm, record yourself occasionally, and stop apologising. An accent is not an error. It is information about where you are from.`,
      glossary: [
        ['embarrassed', 'avergonzado'], ['word stress', 'acento de la palabra'],
        ['hesitate', 'dudar'], ['unstressed', 'átono / sin acento'], ['unglamorous', 'poco atractivo'],
      ],
      questions: [
        { q: 'What matters most for being understood?', o: ['A native accent', 'Stress and rhythm', 'Speaking slowly'], a: 1 },
        { q: 'Why is accent less important in business?', o: ['Everyone speaks English natively', 'Most speakers are non-native', 'Meetings are usually written'], a: 1 },
        { q: 'What is the author’s advice?', o: ['Work on stress and stop apologising', 'Imitate the BBC', 'Avoid speaking until fluent'], a: 0 },
      ],
    },
  ];

  /* ================== DIALOGUES (listening con TTS) ================== */
  const DIALOGUES = [
    {
      id: 'd01', topic: 'business', level: 'A2', title: 'Placing an Order',
      lines: [
        { s: 'Buyer', t: 'Good morning. I would like to place an order for five hundred units.' },
        { s: 'Seller', t: 'Certainly. Which model are you interested in?' },
        { s: 'Buyer', t: 'The standard model. What is your lead time?' },
        { s: 'Seller', t: 'Four weeks from confirmation of payment.' },
        { s: 'Buyer', t: 'That is a bit long. Could you deliver in three?' },
        { s: 'Seller', t: 'If you confirm today, I can try. But I cannot promise.' },
        { s: 'Buyer', t: 'Understood. And do you offer a discount for that volume?' },
        { s: 'Seller', t: 'For five hundred units, we can offer five per cent.' },
      ],
      questions: [
        { q: 'How many units does the buyer want?', o: ['50', '500', '5000'], a: 1 },
        { q: 'What is the standard lead time?', o: ['Three weeks', 'Four weeks', 'Two months'], a: 1 },
        { q: 'What discount is offered?', o: ['3%', '5%', '10%'], a: 1 },
      ],
    },
    {
      id: 'd02', topic: 'business', level: 'B1', title: 'A Problem with the Shipment',
      lines: [
        { s: 'Client', t: 'I am calling about order 4471. Three boxes arrived damaged.' },
        { s: 'Supplier', t: 'I am very sorry to hear that. Could you send us photographs?' },
        { s: 'Client', t: 'I have already emailed them. The packaging was clearly crushed.' },
        { s: 'Supplier', t: 'Let me look into it. Was the damage noted on the delivery receipt?' },
        { s: 'Client', t: 'Yes, the driver signed it. We noted it immediately.' },
        { s: 'Supplier', t: 'That helps a great deal. We will file a claim with the carrier.' },
        { s: 'Client', t: 'And the replacement? We need those units by the fifteenth.' },
        { s: 'Supplier', t: 'I will dispatch replacements tomorrow at our own cost.' },
        { s: 'Client', t: 'I appreciate that. Please confirm by email.' },
      ],
      questions: [
        { q: 'What is the problem?', o: ['Late delivery', 'Three damaged boxes', 'Wrong model'], a: 1 },
        { q: 'Why is the delivery receipt important?', o: ['It proves the damage was noted', 'It shows the price', 'It confirms the address'], a: 0 },
        { q: 'Who pays for the replacements?', o: ['The client', 'The supplier', 'The carrier'], a: 1 },
      ],
    },
    {
      id: 'd03', topic: 'business', level: 'B2', title: 'Negotiating Payment Terms',
      lines: [
        { s: 'Exporter', t: 'We were rather hoping for payment in advance on the first shipment.' },
        { s: 'Importer', t: 'I understand the concern, but that is difficult for our cash flow.' },
        { s: 'Exporter', t: 'What did you have in mind?' },
        { s: 'Importer', t: 'Thirty per cent on order, the balance against documents.' },
        { s: 'Exporter', t: 'That might work if we use an irrevocable letter of credit.' },
        { s: 'Importer', t: 'Our bank charges are quite high for letters of credit.' },
        { s: 'Exporter', t: 'They are, but they protect both of us on a first transaction.' },
        { s: 'Importer', t: 'Would you consider fifty per cent in advance instead, without the L/C?' },
        { s: 'Exporter', t: 'Let me discuss it internally and revert to you by Thursday.' },
      ],
      questions: [
        { q: 'What did the exporter originally want?', o: ['Payment in advance', 'A letter of credit only', 'Payment in instalments'], a: 0 },
        { q: 'Why does the importer dislike the L/C?', o: ['It is slow', 'Bank charges are high', 'Their bank refuses'], a: 1 },
        { q: 'How does the conversation end?', o: ['They sign the deal', 'The exporter will check internally', 'Negotiations break down'], a: 1 },
      ],
    },
    {
      id: 'd04', topic: 'business', level: 'B1', title: 'A Job Interview',
      lines: [
        { s: 'Interviewer', t: 'Thanks for coming in. Tell me a little about your background.' },
        { s: 'Candidate', t: 'I have just finished secondary school and I am starting a degree in international trade.' },
        { s: 'Interviewer', t: 'What made you choose that field?' },
        { s: 'Candidate', t: 'I have always been interested in how products move between countries.' },
        { s: 'Interviewer', t: 'How would you describe your level of English?' },
        { s: 'Candidate', t: 'I would say upper intermediate. I read technical texts comfortably and I am working on fluency.' },
        { s: 'Interviewer', t: 'This role involves a lot of email with suppliers in Asia.' },
        { s: 'Candidate', t: 'That is exactly the kind of practice I am looking for.' },
      ],
      questions: [
        { q: 'What is the candidate about to study?', o: ['Accounting', 'International trade', 'Engineering'], a: 1 },
        { q: 'How does the candidate describe their English?', o: ['Basic', 'Upper intermediate', 'Native'], a: 1 },
        { q: 'What does the role involve?', o: ['Travelling to Asia', 'Emailing suppliers in Asia', 'Managing a warehouse'], a: 1 },
      ],
    },
    {
      id: 'd05', topic: 'pop', level: 'A2', title: 'What Should We Watch?',
      lines: [
        { s: 'Ana', t: 'Have you seen that new series everyone is talking about?' },
        { s: 'Tom', t: 'Not yet. Is it any good, or is it just hype?' },
        { s: 'Ana', t: 'The first three episodes are slow, but then it gets really good.' },
        { s: 'Tom', t: 'I hate shows that take three episodes to start.' },
        { s: 'Ana', t: 'Fair enough. What about that documentary instead?' },
        { s: 'Tom', t: 'The one about the music industry? I am into that.' },
        { s: 'Ana', t: 'Perfect. And no spoilers this time, please.' },
        { s: 'Tom', t: 'That was one time, and it was your fault for arriving late.' },
      ],
      questions: [
        { q: 'What does Tom dislike?', o: ['Documentaries', 'Shows with a slow start', 'Long episodes'], a: 1 },
        { q: 'What do they finally choose?', o: ['The new series', 'A documentary', 'A film'], a: 1 },
        { q: 'What does "I am into that" mean?', o: ['I like that', 'I am inside that', 'I am confused'], a: 0 },
      ],
    },
    {
      id: 'd06', topic: 'tech', level: 'B1', title: 'Reporting a Bug',
      lines: [
        { s: 'User', t: 'Hi, the app crashes every time I try to upload a file.' },
        { s: 'Support', t: 'Sorry about that. Which version are you running?' },
        { s: 'User', t: 'Version 4.2. I updated it yesterday.' },
        { s: 'Support', t: 'That is the latest one. Does it happen with all file types?' },
        { s: 'User', t: 'Only with PDFs. Images upload fine.' },
        { s: 'Support', t: 'That is useful. There is a known issue with large PDFs.' },
        { s: 'User', t: 'Is there a workaround in the meantime?' },
        { s: 'Support', t: 'Compress the file below ten megabytes. We are rolling out a patch on Friday.' },
      ],
      questions: [
        { q: 'When does the app crash?', o: ['When uploading PDFs', 'When opening images', 'When logging in'], a: 0 },
        { q: 'What is the temporary workaround?', o: ['Reinstall the app', 'Compress the file', 'Use another device'], a: 1 },
        { q: 'When is the patch coming?', o: ['Tomorrow', 'Friday', 'Next month'], a: 1 },
      ],
    },
    {
      id: 'd07', topic: 'sports', level: 'B1', title: 'After the Match',
      lines: [
        { s: 'Reporter', t: 'That was a difficult defeat. What went wrong?' },
        { s: 'Coach', t: 'We lost momentum after the red card. It changed the whole game.' },
        { s: 'Reporter', t: 'Some fans are saying the substitutions came too late.' },
        { s: 'Coach', t: 'I understand the criticism. I would make the same decision again.' },
        { s: 'Reporter', t: 'Is there any update on the injury?' },
        { s: 'Coach', t: 'We are waiting for the scan. It could be three weeks.' },
        { s: 'Reporter', t: 'And the transfer rumours?' },
        { s: 'Coach', t: 'I am not going to comment on speculation before the window opens.' },
      ],
      questions: [
        { q: 'What changed the game according to the coach?', o: ['The weather', 'The red card', 'The substitutions'], a: 1 },
        { q: 'How does the coach respond to criticism?', o: ['He apologises', 'He defends his decision', 'He blames the players'], a: 1 },
        { q: 'What does he say about transfers?', o: ['He confirms a signing', 'He refuses to comment', 'He denies everything'], a: 1 },
      ],
    },
    {
      id: 'd08', topic: 'business', level: 'B2', title: 'A Meeting About Delays',
      lines: [
        { s: 'Manager', t: 'Right, let us get started. Our on-time delivery rate dropped to seventy per cent.' },
        { s: 'Logistics', t: 'Most of that stems from the customs bottleneck in September.' },
        { s: 'Manager', t: 'Is that a one-off, or should we expect it to continue?' },
        { s: 'Logistics', t: 'It is likely to continue while the inspection rules stay in force.' },
        { s: 'Sales', t: 'Two clients have already threatened to switch suppliers.' },
        { s: 'Manager', t: 'Then we need a contingency plan, not an explanation.' },
        { s: 'Logistics', t: 'We could pre-clear documentation and hold buffer stock locally.' },
        { s: 'Manager', t: 'Cost that out and bring me figures by Thursday.' },
        { s: 'Sales', t: 'In the meantime, I will manage the clients’ expectations.' },
      ],
      questions: [
        { q: 'What is the main problem?', o: ['Falling sales', 'Late deliveries', 'High costs'], a: 1 },
        { q: 'What does the manager ask for?', o: ['An explanation', 'A contingency plan with figures', 'New suppliers'], a: 1 },
        { q: 'What solution does Logistics propose?', o: ['Pre-clear documents and hold buffer stock', 'Change carrier', 'Raise prices'], a: 0 },
      ],
    },
    {
      id: 'd09', topic: 'tech', level: 'A2', title: 'Buying a Laptop',
      lines: [
        { s: 'Customer', t: 'Hi, I am looking for a laptop for university.' },
        { s: 'Assistant', t: 'Of course. What are you going to study?' },
        { s: 'Customer', t: 'International trade. So mostly documents and spreadsheets.' },
        { s: 'Assistant', t: 'Then you do not need a powerful graphics card. Battery life is more important.' },
        { s: 'Customer', t: 'How long does this one last?' },
        { s: 'Assistant', t: 'About nine hours with normal use.' },
        { s: 'Customer', t: 'And what is the warranty?' },
        { s: 'Assistant', t: 'Two years. You can extend it to three for a small fee.' },
      ],
      questions: [
        { q: 'What will the customer study?', o: ['Engineering', 'International trade', 'Design'], a: 1 },
        { q: 'What does the assistant say is important?', o: ['Graphics card', 'Battery life', 'Screen size'], a: 1 },
        { q: 'How long is the standard warranty?', o: ['One year', 'Two years', 'Three years'], a: 1 },
      ],
    },
    {
      id: 'd10', topic: 'core', level: 'A2', title: 'Making Plans',
      lines: [
        { s: 'Sofía', t: 'Are you free on Saturday afternoon?' },
        { s: 'Lucas', t: 'I think so. Why, what is happening?' },
        { s: 'Sofía', t: 'There is a language exchange at the library. English and Spanish.' },
        { s: 'Lucas', t: 'That sounds useful, but my English is not very good.' },
        { s: 'Sofía', t: 'That is exactly the point. Nobody there is perfect.' },
        { s: 'Lucas', t: 'Fair enough. What time does it start?' },
        { s: 'Sofía', t: 'Four o’clock. We could meet at three thirty.' },
        { s: 'Lucas', t: 'Perfect. See you at the corner.' },
      ],
      questions: [
        { q: 'What is happening on Saturday?', o: ['A language exchange', 'An English exam', 'A library opening'], a: 0 },
        { q: 'Why does Lucas hesitate?', o: ['He is busy', 'He thinks his English is weak', 'The library is far'], a: 1 },
        { q: 'What time will they meet?', o: ['Three thirty', 'Four o’clock', 'Four thirty'], a: 0 },
      ],
    },
    {
      id: 'd11', topic: 'business', level: 'B1', title: 'Asking for a Quote',
      lines: [
        { s: 'Buyer', t: 'Good afternoon. We are interested in your stainless steel fittings.' },
        { s: 'Seller', t: 'Thank you for reaching out. What quantity did you have in mind?' },
        { s: 'Buyer', t: 'Around two thousand units for a first trial order.' },
        { s: 'Seller', t: 'Understood. Which Incoterm would you prefer?' },
        { s: 'Buyer', t: 'FOB Shanghai, if possible. We handle the freight ourselves.' },
        { s: 'Seller', t: 'That is fine. Could you confirm the exact specification?' },
        { s: 'Buyer', t: 'I will email the technical sheet this afternoon.' },
        { s: 'Seller', t: 'Great. We will send a formal quotation within two working days.' },
        { s: 'Buyer', t: 'And could you include the lead time and payment terms?' },
      ],
      questions: [
        { q: 'What quantity does the buyer want?', o: ['Two hundred', 'Two thousand', 'Twenty thousand'], a: 1 },
        { q: 'Which Incoterm does the buyer prefer?', o: ['DDP', 'CIF', 'FOB'], a: 2 },
        { q: 'What will the seller send?', o: ['A technical sheet', 'A formal quotation', 'An invoice'], a: 1 },
      ],
    },
  ];

  /* ================== WRITING PROMPTS ================== */
  const WRITING = [
    { id: 'w01', level: 'A2', topic: 'business', words: 60, task: 'Escribí un email corto a un proveedor preguntando el precio y el plazo de entrega de 200 unidades.', must: ['a greeting', 'the quantity', 'a question about lead time', 'a polite closing'] },
    { id: 'w02', level: 'A2', topic: 'core', words: 70, task: 'Describí tu rutina de estudio típica de un día de semana. Usá present simple y adverbios de frecuencia.', must: ['present simple', 'at least 3 frequency adverbs', 'a time expression'] },
    { id: 'w03', level: 'A2', topic: 'pop', words: 70, task: 'Escribí una reseña corta de una serie o película que viste hace poco. ¿La recomendarías?', must: ['past simple', 'an opinion', 'a recommendation'] },
    { id: 'w04', level: 'B1', topic: 'business', words: 90, task: 'Un envío llegó con 5 días de demora. Escribí un email de queja formal pidiendo una explicación y una compensación.', must: ['formal greeting', 'the facts with dates', 'a clear request', 'formal closing'] },
    { id: 'w05', level: 'B1', topic: 'business', words: 100, task: 'Escribí una carta de presentación para una pasantía en una empresa de comercio exterior. Mencioná por qué elegiste la carrera.', must: ['why you chose the field', 'one strength', 'your availability', 'formal register'] },
    { id: 'w06', level: 'B1', topic: 'core', words: 100, task: 'Describí un error que cometiste y qué aprendiste de él. Usá past simple y present perfect.', must: ['past simple', 'present perfect', 'a lesson learned'] },
    { id: 'w07', level: 'B1', topic: 'tech', words: 90, task: 'Escribí un reporte de bug a soporte técnico: qué pasa, cuándo pasa, qué probaste.', must: ['the problem', 'steps to reproduce', 'what you already tried'] },
    { id: 'w08', level: 'B1', topic: 'sports', words: 100, task: 'Escribí una noticia breve sobre un evento deportivo reciente, en estilo periodístico.', must: ['a headline', 'past tenses', 'one quoted statement'] },
    { id: 'w09', level: 'B1', topic: 'pop', words: 100, task: '¿Es mejor mirar series subtituladas o dobladas? Defendé tu postura.', must: ['a clear position', 'two arguments', 'a linking word'] },
    { id: 'w10', level: 'B2', topic: 'business', words: 130, task: 'Un cliente pide un descuento del 20% que no podés otorgar. Escribí un email rechazándolo diplomáticamente y ofreciendo una alternativa.', must: ['hedging language', 'a clear but polite refusal', 'an alternative offer', 'no blunt negatives'] },
    { id: 'w11', level: 'B2', topic: 'business', words: 150, task: 'Escribí un informe breve comparando dos proveedores: uno más barato con plazos largos, otro más caro y rápido. Recomendá uno.', must: ['a comparison', 'at least 3 linking words', 'a justified recommendation'] },
    { id: 'w12', level: 'B2', topic: 'business', words: 140, task: 'Explicá en un email a un colega qué significa FOB y por qué conviene especificar el puerto y el año de los Incoterms.', must: ['a clear definition', 'an example', 'a practical warning'] },
    { id: 'w13', level: 'B2', topic: 'core', words: 150, task: '¿Deberían las empresas priorizar el precio o la sostenibilidad al elegir proveedores? Ensayo argumentativo.', must: ['introduction', 'arguments on both sides', 'conclusion', 'formal register'] },
    { id: 'w14', level: 'B2', topic: 'tech', words: 140, task: '¿La inteligencia artificial va a reemplazar a los traductores profesionales? Argumentá.', must: ['a thesis', 'a counterargument', 'concession language (although, while)'] },
    { id: 'w15', level: 'B2', topic: 'sports', words: 140, task: 'Analizá cómo un evento deportivo internacional impacta la economía de la ciudad anfitriona.', must: ['cause and effect language', 'at least one passive construction', 'a balanced conclusion'] },
    { id: 'w16', level: 'B2', topic: 'business', words: 120, task: 'Escribí el acta (minutes) de una reunión sobre demoras logísticas: puntos tratados, decisiones y responsables.', must: ['impersonal/passive style', 'action items with owners', 'a deadline'] },
    { id: 'w17', level: 'B1', topic: 'business', words: 90, task: 'Escribí un email pidiendo una prórroga de plazo de pago de 30 a 60 días, justificando el pedido.', must: ['polite request', 'a reason', 'a commitment'] },
    { id: 'w18', level: 'B2', topic: 'core', words: 130, task: 'Escribí una respuesta a esta afirmación: "Aprender idiomas ya no tiene sentido porque los traductores automáticos son perfectos".', must: ['a clear stance', 'a concession', 'a strong closing argument'] },
  ];

  /* ================== ROLEPLAYS (conversación con la IA) ================== */
  const ROLEPLAYS = [
    { id: 'p01', level: 'A2', topic: 'business', title: 'Ordering from a supplier', role: 'Sos un comprador. La IA es un vendedor.', goal: 'Conseguir precio, plazo de entrega y un descuento por volumen.', ai: 'You are a polite sales representative at a manufacturing company. The student is a buyer. Quote prices, mention a 4-week lead time, and resist giving more than 7% discount.' },
    { id: 'p02', level: 'A2', topic: 'core', title: 'At the airport', role: 'Estás haciendo el check-in de un vuelo internacional.', goal: 'Resolver un problema con el equipaje y pedir asiento de pasillo.', ai: 'You are an airline check-in agent. The student has an overweight bag. Be helpful but apply the rules.' },
    { id: 'p03', level: 'B1', topic: 'business', title: 'Complaining about a late shipment', role: 'Sos el cliente. Tu pedido llegó 5 días tarde.', goal: 'Obtener una explicación y alguna compensación, sin perder la relación comercial.', ai: 'You are a supplier account manager. The shipment was late because of a customs inspection. Apologise, explain, but avoid offering a refund immediately.' },
    { id: 'p04', level: 'B1', topic: 'business', title: 'Job interview for an internship', role: 'Sos candidato a una pasantía en comercio exterior.', goal: 'Presentarte, explicar por qué elegiste la carrera y hacer dos preguntas.', ai: 'You are an HR interviewer at a trading company. Ask about background, motivation, English level and availability. Ask one difficult follow-up question.' },
    { id: 'p05', level: 'B1', topic: 'pop', title: 'Arguing about a film', role: 'Estás discutiendo una película con un amigo.', goal: 'Defender tu opinión y usar lenguaje de acuerdo y desacuerdo.', ai: 'You are a friend with strong, slightly annoying opinions about films. Disagree with the student politely but firmly. Use casual English.' },
    { id: 'p06', level: 'B1', topic: 'tech', title: 'Calling tech support', role: 'Tu cuenta quedó bloqueada y necesitás recuperarla.', goal: 'Explicar el problema con claridad y seguir instrucciones.', ai: 'You are a tech support agent. Verify identity, ask diagnostic questions, and guide the student through a reset process.' },
    { id: 'p07', level: 'B2', topic: 'business', title: 'Negotiating payment terms', role: 'Sos el exportador. Querés pago anticipado.', goal: 'Llegar a un acuerdo usando lenguaje diplomático, sin ceder todo.', ai: 'You are an importer with cash-flow constraints. Push for 30 days credit. Negotiate hard but courteously. Do not accept full prepayment.' },
    { id: 'p08', level: 'B2', topic: 'business', title: 'Presenting a market entry plan', role: 'Presentás a un directorio un plan para entrar al mercado chileno.', goal: 'Estructurar la presentación y responder objeciones.', ai: 'You are a skeptical board member. Ask about costs, risks, competitors and timeline. Challenge weak answers.' },
    { id: 'p09', level: 'B2', topic: 'business', title: 'Resolving a contract dispute', role: 'Hay desacuerdo sobre qué Incoterm se pactó.', goal: 'Defender tu interpretación y proponer una salida.', ai: 'You are the other party in a contract dispute. You believe the terms were DDP, not FOB. Be firm but open to a compromise.' },
    { id: 'p10', level: 'B2', topic: 'sports', title: 'Press conference', role: 'Sos el entrenador tras una derrota.', goal: 'Responder preguntas difíciles sin comprometerte de más.', ai: 'You are a persistent sports journalist. Ask pointed questions about tactics, substitutions and the future of the coach.' },
    { id: 'p11', level: 'B1', topic: 'core', title: 'Renting a flat abroad', role: 'Estás por mudarte a otro país para estudiar.', goal: 'Preguntar por condiciones, precio y contrato.', ai: 'You are a landlord. Be friendly but vague about maintenance costs until the student asks directly.' },
    { id: 'p12', level: 'B2', topic: 'tech', title: 'Pitching an app idea', role: 'Presentás tu idea de app a un inversor.', goal: 'Explicar el problema, la solución y el modelo de negocio en 3 minutos.', ai: 'You are an investor. Ask about the market size, the competition and how it makes money. Be direct.' },
    { id: 'p13', level: 'A2', topic: 'pop', title: 'Meeting someone new', role: 'Conocés a alguien en un intercambio estudiantil.', goal: 'Presentarte, preguntar por sus intereses y proponer un plan.', ai: 'You are a friendly exchange student from Canada. Keep the language simple and ask lots of questions.' },
    { id: 'p14', level: 'B2', topic: 'business', title: 'Trade fair small talk', role: 'Estás en una feria internacional en Alemania.', goal: 'Romper el hielo, presentar tu empresa y conseguir una reunión.', ai: 'You are a potential distributor visiting the stand. Be politely curious but busy — the student must earn your attention.' },
  ];

  /* ================== TRADUCCIÓN ES → EN ================== */
  const TRANSLATIONS = [
    { es: 'Hace tres años que estudio inglés.', en: ['I have been studying English for three years', 'I have studied English for three years'], level: 'B1', focus: 'present perfect + for' },
    { es: '¿Ya enviaste la factura?', en: ['Have you sent the invoice yet', 'Did you send the invoice yet'], level: 'B1', focus: 'present perfect' },
    { es: 'Si aumentan el volumen, les bajamos el precio.', en: ['If you increase the volume, we will lower the price', 'If they increase the volume, we will lower the price'], level: 'B1', focus: 'first conditional' },
    { es: 'El contenedor fue inspeccionado en la aduana.', en: ['The container was inspected at customs'], level: 'B1', focus: 'pasiva' },
    { es: 'No podemos darnos el lujo de perder este cliente.', en: ["We cannot afford to lose this client", "We can't afford to lose this customer"], level: 'B1', focus: 'afford to' },
    { es: 'Quedamos a la espera de su respuesta.', en: ['We look forward to hearing from you'], level: 'B1', focus: 'look forward to + ing' },
    { es: 'Me temo que ese plazo es un poco ajustado.', en: ["I am afraid that deadline is a little tight", "I'm afraid that deadline is a bit tight"], level: 'B2', focus: 'hedging' },
    { es: 'Se espera que las exportaciones crezcan un 4%.', en: ['Exports are expected to grow by 4%', 'Exports are expected to rise by 4%'], level: 'B2', focus: 'pasiva impersonal' },
    { es: 'Si hubiéramos leído la cláusula, no habríamos firmado.', en: ['If we had read the clause, we would not have signed', "If we had read the clause, we wouldn't have signed"], level: 'B2', focus: 'third conditional' },
    { es: 'Deberías revisar el Incoterm antes de firmar.', en: ['You should check the Incoterm before signing', 'You should review the Incoterm before signing'], level: 'B1', focus: 'should + gerundio tras preposición' },
    { es: 'A pesar de la demora, la mercadería llegó intacta.', en: ['Despite the delay, the goods arrived intact', 'In spite of the delay, the goods arrived intact'], level: 'B2', focus: 'despite' },
    { es: 'Dijeron que el envío se demoraría.', en: ['They said the shipment would be delayed', 'They said that the shipment would be delayed'], level: 'B1', focus: 'reported speech' },
    { es: 'Estaba revisando la factura cuando noté el error.', en: ['I was checking the invoice when I noticed the error'], level: 'B1', focus: 'past continuous' },
    { es: '¿Te importaría enviarme la cotización revisada?', en: ['Would you mind sending me the revised quote', 'Would you mind sending me the revised quotation'], level: 'B2', focus: 'would you mind + ing' },
    { es: 'El pago debe realizarse dentro de los 30 días.', en: ['Payment must be made within 30 days'], level: 'B1', focus: 'pasiva con modal' },
    { es: 'Ojalá hubiera estudiado antes.', en: ['I wish I had studied earlier', 'I wish I had studied before'], level: 'B2', focus: 'wish + past perfect' },
    { es: 'Seguro que quedó retenido en la aduana.', en: ['It must have been held at customs'], level: 'B2', focus: 'modal de deducción' },
    { es: 'Estoy acostumbrado a trabajar bajo presión.', en: ['I am used to working under pressure', "I'm used to working under pressure"], level: 'B1', focus: 'be used to + ing' },
    { es: 'Rechazaron nuestra propuesta.', en: ['They turned down our proposal', 'They turned our proposal down', 'They rejected our proposal'], level: 'B1', focus: 'phrasal verb' },
    { es: 'Cuanto más pedís, mayor es el descuento.', en: ['The more you order, the bigger the discount', 'The more you order, the greater the discount'], level: 'B1', focus: 'the more… the more' },
    { es: 'No solo llegó tarde, sino que además envió el modelo equivocado.', en: ['Not only did he arrive late, but he also sent the wrong model', 'Not only did they arrive late, but they also sent the wrong model'], level: 'B2', focus: 'inversión' },
    { es: 'Nos gustaría que confirmara antes del viernes.', en: ['We would appreciate it if you could confirm by Friday', 'We would like you to confirm by Friday'], level: 'B2', focus: 'registro formal' },
    { es: 'La demora se origina en un problema aduanero.', en: ['The delay stems from a customs issue', 'The delay stems from a customs problem'], level: 'B2', focus: 'stem from' },
    { es: 'Tenemos que investigar qué pasó.', en: ['We need to look into what happened', 'We have to look into what happened'], level: 'B1', focus: 'look into' },
    { es: 'Antes no me gustaba el inglés.', en: ["I didn't use to like English", 'I did not use to like English'], level: 'B1', focus: 'used to' },
    { es: 'Prefiero discutir esto en persona.', en: ['I would rather discuss this in person', "I'd rather discuss this in person"], level: 'B2', focus: 'would rather' },
    { es: 'Hicimos revisar el contrato por un abogado.', en: ['We had the contract reviewed by a lawyer'], level: 'B2', focus: 'have something done' },
    { es: 'El tipo de cambio afecta nuestros márgenes.', en: ['The exchange rate affects our margins'], level: 'B1', focus: 'vocabulario' },
    { es: 'Bajo ninguna circunstancia debe abrirse el contenedor.', en: ['Under no circumstances should the container be opened'], level: 'B2', focus: 'inversión + pasiva' },
    { es: 'Lo que necesitamos es un socio confiable.', en: ['What we need is a reliable partner'], level: 'B2', focus: 'cleft sentence' },
    { es: 'Le pedí que me enviara el conocimiento de embarque.', en: ['I asked him to send me the bill of lading', 'I asked her to send me the bill of lading'], level: 'B2', focus: 'ask someone to' },
    { es: 'Nunca estuve en una feria internacional.', en: ['I have never been to an international trade fair', "I've never been to an international trade fair"], level: 'B1', focus: 'present perfect' },
    { es: 'Depende del tipo de cambio.', en: ['It depends on the exchange rate'], level: 'A2', focus: 'depend on' },
    { es: 'Me dio algunos consejos muy útiles.', en: ['He gave me some very useful advice', 'She gave me some very useful advice'], level: 'A2', focus: 'incontables' },
    { es: 'El partido se suspendió por lluvia.', en: ['The match was called off because of the rain', 'The match was called off due to rain'], level: 'B1', focus: 'call off + pasiva' },
    { es: 'Voy a abrir una sucursal en Chile.', en: ['I am going to open a branch in Chile', "I'm going to open a branch in Chile"], level: 'A2', focus: 'going to' },
    { es: 'Te llamo apenas llegue.', en: ['I will call you as soon as I arrive', "I'll call you as soon as I get there"], level: 'A2', focus: 'as soon as + presente' },
    { es: 'Esta es la cláusula cuya redacción es ambigua.', en: ['This is the clause whose wording is ambiguous'], level: 'B2', focus: 'whose' },
    { es: 'La empresa con la que trabajamos está en Róterdam.', en: ['The company we work with is based in Rotterdam', 'The company that we work with is based in Rotterdam'], level: 'B1', focus: 'relative clause' },
    { es: 'Se estima que el 30% de los contenedores se demora.', en: ['It is estimated that 30% of containers are delayed'], level: 'B2', focus: 'it is estimated that' },
    { es: 'No hace falta que vengas, es opcional.', en: ["You don't have to come, it is optional", 'You do not have to come, it is optional'], level: 'A2', focus: "don't have to" },
    { es: 'Nos quedamos sin tiempo.', en: ['We ran out of time'], level: 'B1', focus: 'run out of' },
    { es: 'Agilizamos el proceso aduanero.', en: ['We streamlined the customs process'], level: 'B2', focus: 'streamline' },
    { es: 'Ella está a cargo de logística.', en: ['She is in charge of logistics'], level: 'B1', focus: 'in charge of' },
    { es: 'El acuerdo se cayó a último momento.', en: ['The deal fell through at the last minute'], level: 'B2', focus: 'fall through' },
    { es: 'Deberíamos tener en cuenta la inflación.', en: ['We should take inflation into account', 'We should bear inflation in mind'], level: 'B2', focus: 'take into account' },
    { es: 'Mientras cargábamos el camión, llegó el inspector.', en: ['While we were loading the truck, the inspector arrived'], level: 'B1', focus: 'while + past continuous' },
    { es: 'Su oferta no es tan competitiva como la nuestra.', en: ['Their offer is not as competitive as ours'], level: 'B1', focus: 'not as… as' },
    { es: 'Me preguntaba si podría extender el plazo.', en: ['I was wondering whether you could extend the deadline', 'I was wondering if you could extend the deadline'], level: 'B2', focus: 'hedging' },
    { es: 'Todos los exportadores deben cumplir con la normativa.', en: ['All exporters must comply with the regulations'], level: 'B2', focus: 'comply with' },
  ];

  App.content = { READINGS, DIALOGUES, WRITING, ROLEPLAYS, TRANSLATIONS };
})(window.App);
