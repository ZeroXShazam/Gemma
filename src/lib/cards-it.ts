import type { CardDef, Conjugations, Example, Level } from './types';
import { CARDS_GENERATED_IT } from './cards-generated-it';
import { DEPTH_CARDS_IT } from './cards-it-depth';

const L = 'it' as const;

function verb(
  id: string,
  lv: Level,
  v: string,
  c: Conjugations,
  imperf: string,
  passato: string,
  ex: Example[],
): CardDef {
  return {
    id, language: L, type: 'verb', level: lv, verb: v, conjugations: c,
    praeteritum: imperf, perfekt: passato, examples: ex, source: 'hand',
  };
}

function noun(
  id: string,
  art: string,
  n: string,
  pl: string,
  enN: string,
  ex: Example[],
): CardDef {
  return {
    id, language: L, type: 'noun', level: 'A1', article: art as CardDef['article'],
    noun: n, plural: pl,
    nounForms: { nom: art, akk: art, dat: art },
    examples: ex, source: 'hand',
  };
}

function gram(
  id: string,
  type: CardDef['type'],
  lv: Level,
  rule: string,
  ex: Example[],
  word?: string,
): CardDef {
  return { id, language: L, type, level: lv, rule, examples: ex, word, source: 'hand' };
}

// io/tu/lui stored in ich/du/er; noi/voi/loro in wir/ihr/sie
const VERBS: CardDef[] = [
  verb('it-verb-essere', 'A1', 'essere',
    { ich: 'sono', du: 'sei', er: 'è', wir: 'siamo', ihr: 'siete', sie: 'sono' },
    'era', 'è stato', [
      { de: 'Sono stanco.', en: 'I am tired.', focus: 'Sono', subject: 'ich' },
      { de: 'Lei è medico.', en: 'She is a doctor.', focus: 'è', subject: 'er' },
      { de: 'Siamo a casa.', en: 'We are at home.', focus: 'Siamo', subject: 'wir' },
    ]),
  verb('it-verb-avere', 'A1', 'avere',
    { ich: 'ho', du: 'hai', er: 'ha', wir: 'abbiamo', ihr: 'avete', sie: 'hanno' },
    'aveva', 'ha avuto', [
      { de: 'Ho un cane.', en: 'I have a dog.', focus: 'Ho', subject: 'ich' },
      { de: 'Non ha tempo.', en: 'She has no time.', focus: 'ha', subject: 'er' },
      { de: 'Avete fame?', en: 'Are you hungry?', focus: 'Avete', subject: 'ihr' },
    ]),
  verb('it-verb-andare', 'A1', 'andare',
    { ich: 'vado', du: 'vai', er: 'va', wir: 'andiamo', ihr: 'andate', sie: 'vanno' },
    'andava', 'è andato', [
      { de: 'Vado a casa.', en: 'I am going home.', focus: 'Vado', subject: 'ich' },
      { de: 'Va a scuola.', en: 'He goes to school.', focus: 'Va', subject: 'er' },
      { de: 'Andiamo al parco.', en: 'We go to the park.', focus: 'Andiamo', subject: 'wir' },
    ]),
  verb('it-verb-venire', 'A1', 'venire',
    { ich: 'vengo', du: 'vieni', er: 'viene', wir: 'veniamo', ihr: 'venite', sie: 'vengono' },
    'veniva', 'è venuto', [
      { de: 'Vengo dall\'Italia.', en: 'I come from Italy.', focus: 'Vengo', subject: 'ich' },
      { de: 'Vieni troppo tardi.', en: 'You come too late.', focus: 'Vieni', subject: 'du' },
      { de: 'Vengono domani.', en: 'They are coming tomorrow.', focus: 'Vengono', subject: 'sie' },
    ]),
  verb('it-verb-fare', 'A1', 'fare',
    { ich: 'faccio', du: 'fai', er: 'fa', wir: 'facciamo', ihr: 'fate', sie: 'fanno' },
    'faceva', 'ha fatto', [
      { de: 'Faccio colazione alle otto.', en: 'I have breakfast at eight.', focus: 'Faccio', subject: 'ich' },
      { de: 'Cosa fai stasera?', en: 'What are you doing tonight?', focus: 'fai', subject: 'du' },
      { de: 'Fa freddo oggi.', en: 'It is cold today.', focus: 'Fa', subject: 'er' },
    ]),
  verb('it-verb-mangiare', 'A1', 'mangiare',
    { ich: 'mangio', du: 'mangi', er: 'mangia', wir: 'mangiamo', ihr: 'mangiate', sie: 'mangiano' },
    'mangiava', 'ha mangiato', [
      { de: 'Mangio una mela.', en: 'I eat an apple.', focus: 'Mangio', subject: 'ich' },
      { de: 'Mangia la pizza.', en: 'He eats pizza.', focus: 'Mangia', subject: 'er' },
      { de: 'Mangiamo insieme.', en: 'We eat together.', focus: 'Mangiamo', subject: 'wir' },
    ]),
  verb('it-verb-bere', 'A1', 'bere',
    { ich: 'bevo', du: 'bevi', er: 'beve', wir: 'beviamo', ihr: 'bevete', sie: 'bevono' },
    'beveva', 'ha bevuto', [
      { de: 'Bevo il caffè.', en: 'I drink coffee.', focus: 'Bevo', subject: 'ich' },
      { de: 'Bevi troppo.', en: 'You drink too much.', focus: 'Bevi', subject: 'du' },
      { de: 'Beve un bicchiere d\'acqua.', en: 'He drinks a glass of water.', focus: 'Beve', subject: 'er' },
    ]),
  verb('it-verb-parlare', 'A1', 'parlare',
    { ich: 'parlo', du: 'parli', er: 'parla', wir: 'parliamo', ihr: 'parlate', sie: 'parlano' },
    'parlava', 'ha parlato', [
      { de: 'Parlo italiano.', en: 'I speak Italian.', focus: 'Parlo', subject: 'ich' },
      { de: 'Parla piano.', en: 'He speaks quietly.', focus: 'Parla', subject: 'er' },
      { de: 'Parliamo del problema.', en: 'We talk about the problem.', focus: 'Parliamo', subject: 'wir' },
    ]),
  verb('it-verb-leggere', 'A1', 'leggere',
    { ich: 'leggo', du: 'leggi', er: 'legge', wir: 'leggiamo', ihr: 'leggete', sie: 'leggono' },
    'leggeva', 'ha letto', [
      { de: 'Leggo un libro.', en: 'I read a book.', focus: 'Leggo', subject: 'ich' },
      { de: 'Legge il giornale.', en: 'She reads the newspaper.', focus: 'Legge', subject: 'er' },
      { de: 'Leggiamo romanzi.', en: 'We read novels.', focus: 'Leggiamo', subject: 'wir' },
    ]),
  verb('it-verb-scrivere', 'A1', 'scrivere',
    { ich: 'scrivo', du: 'scrivi', er: 'scrive', wir: 'scriviamo', ihr: 'scrivete', sie: 'scrivono' },
    'scriveva', 'ha scritto', [
      { de: 'Scrivo una email.', en: 'I write an email.', focus: 'Scrivo', subject: 'ich' },
      { de: 'Scrive una lettera.', en: 'He writes a letter.', focus: 'Scrive', subject: 'er' },
      { de: 'Scriviamo un messaggio.', en: 'We write a message.', focus: 'Scriviamo', subject: 'wir' },
    ]),
  verb('it-verb-lavorare', 'A1', 'lavorare',
    { ich: 'lavoro', du: 'lavori', er: 'lavora', wir: 'lavoriamo', ihr: 'lavorate', sie: 'lavorano' },
    'lavorava', 'ha lavorato', [
      { de: 'Lavoro in ufficio.', en: 'I work in an office.', focus: 'Lavoro', subject: 'ich' },
      { de: 'Lavora molto.', en: 'He works a lot.', focus: 'Lavora', subject: 'er' },
      { de: 'Lavoriamo insieme.', en: 'We work together.', focus: 'Lavoriamo', subject: 'wir' },
    ]),
  verb('it-verb-studiare', 'A1', 'studiare',
    { ich: 'studio', du: 'studi', er: 'studia', wir: 'studiamo', ihr: 'studiate', sie: 'studiano' },
    'studiava', 'ha studiato', [
      { de: 'Studio italiano.', en: 'I study Italian.', focus: 'Studio', subject: 'ich' },
      { de: 'Studia medicina.', en: 'She studies medicine.', focus: 'Studia', subject: 'er' },
      { de: 'Studiamo per l\'esame.', en: 'We study for the exam.', focus: 'Studiamo', subject: 'wir' },
    ]),
];

const NOUNS: CardDef[] = [
  noun('it-noun-tempo', 'il', 'tempo', 'tempi', 'time', [
    { de: 'Non ho tempo.', en: 'I have no time.', focus: 'tempo' },
    { de: 'Il tempo vola.', en: 'Time flies.', focus: 'tempo' },
    { de: 'È il momento giusto.', en: 'It is the right moment.', focus: 'momento' },
  ]),
  noun('it-noun-giorno', 'il', 'giorno', 'giorni', 'day', [
    { de: 'Buon giorno!', en: 'Good day!', focus: 'giorno' },
    { de: 'Oggi è un bel giorno.', en: 'Today is a beautiful day.', focus: 'giorno' },
    { de: 'Lavoro ogni giorno.', en: 'I work every day.', focus: 'giorno' },
  ]),
  noun('it-noun-casa', 'la', 'casa', 'case', 'house / home', [
    { de: 'Sono a casa.', en: 'I am at home.', focus: 'casa' },
    { de: 'La casa è grande.', en: 'The house is big.', focus: 'casa' },
    { de: 'Torno a casa presto.', en: 'I return home early.', focus: 'casa' },
  ]),
  noun('it-noun-mela', 'la', 'mela', 'mele', 'apple', [
    { de: 'Mangio una mela.', en: 'I eat an apple.', focus: 'mela' },
    { de: 'Le mele sono rosse.', en: 'The apples are red.', focus: 'mele' },
    { de: 'Compro delle mele.', en: 'I buy some apples.', focus: 'mele' },
  ]),
  noun('it-noun-pane', 'il', 'pane', 'pani', 'bread', [
    { de: 'Compro il pane.', en: 'I buy bread.', focus: 'pane' },
    { de: 'Il pane è fresco.', en: 'The bread is fresh.', focus: 'pane' },
    { de: 'Mangiamo pane e formaggio.', en: 'We eat bread and cheese.', focus: 'pane' },
  ]),
  noun('it-noun-caffe', 'il', 'caffè', 'caffè', 'coffee', [
    { de: 'Bevo un caffè.', en: 'I drink a coffee.', focus: 'caffè' },
    { de: 'Il caffè è caldo.', en: 'The coffee is hot.', focus: 'caffè' },
    { de: 'Prendo un caffè, per favore.', en: 'A coffee, please.', focus: 'caffè' },
  ]),
  noun('it-noun-acqua', "l'", 'acqua', 'acque', 'water', [
    { de: 'Bevo l\'acqua.', en: 'I drink water.', focus: 'acqua' },
    { de: 'L\'acqua è fredda.', en: 'The water is cold.', focus: 'acqua' },
    { de: 'Vorrei dell\'acqua.', en: 'I would like some water.', focus: 'acqua' },
  ]),
  noun('it-noun-treno', 'il', 'treno', 'treni', 'train', [
    { de: 'Prendo il treno.', en: 'I take the train.', focus: 'treno' },
    { de: 'Il treno è in ritardo.', en: 'The train is late.', focus: 'treno' },
    { de: 'Il treno parte alle otto.', en: 'The train leaves at eight.', focus: 'treno' },
  ]),
  noun('it-noun-lavoro', 'il', 'lavoro', 'lavori', 'work / job', [
    { de: 'Vado al lavoro.', en: 'I go to work.', focus: 'lavoro' },
    { de: 'Il lavoro è difficile.', en: 'The work is difficult.', focus: 'lavoro' },
    { de: 'Cerco un lavoro.', en: 'I am looking for a job.', focus: 'lavoro' },
  ]),
];

const PREPS: CardDef[] = [
  gram('it-prep-di', 'prep', 'A1', '<b>di</b> — of, from (possession, origin)', [
    { de: 'Sono di Roma.', en: 'I am from Rome.', focus: 'di' },
    { de: 'Il libro di Marco.', en: 'Marco\'s book.', focus: 'di' },
    { de: 'Un bicchiere di vino.', en: 'A glass of wine.', focus: 'di' },
  ], 'di'),
  gram('it-prep-a', 'prep', 'A1', '<b>a</b> — to, at (direction, location)', [
    { de: 'Vado a scuola.', en: 'I go to school.', focus: 'a' },
    { de: 'Siamo a casa.', en: 'We are at home.', focus: 'a' },
    { de: 'Parlo a mia madre.', en: 'I speak to my mother.', focus: 'a' },
  ], 'a'),
  gram('it-prep-da', 'prep', 'A1', '<b>da</b> — from, by, at (someone\'s place)', [
    { de: 'Vengo da Milano.', en: 'I come from Milan.', focus: 'da' },
    { de: 'Il regalo è da Maria.', en: 'The gift is from Maria.', focus: 'da' },
    { de: 'Vado dal medico.', en: 'I go to the doctor.', focus: 'dal' },
  ], 'da'),
  gram('it-prep-in', 'prep', 'A1', '<b>in</b> — in, to (places, countries)', [
    { de: 'Vivo in Italia.', en: 'I live in Italy.', focus: 'in' },
    { de: 'Il libro è in tavola.', en: 'The book is on the table.', focus: 'in' },
    { de: 'Andiamo in vacanza.', en: 'We go on holiday.', focus: 'in' },
  ], 'in'),
  gram('it-prep-su', 'prep', 'A1', '<b>su</b> — on, about', [
    { de: 'Il libro è sul tavolo.', en: 'The book is on the table.', focus: 'sul' },
    { de: 'Parliamo del film.', en: 'We talk about the film.', focus: 'del' },
    { de: 'Siediti sulla sedia.', en: 'Sit on the chair.', focus: 'sulla' },
  ], 'su'),
  gram('it-prep-per', 'prep', 'A1', '<b>per</b> — for, through, in order to', [
    { de: 'Grazie per l\'aiuto.', en: 'Thanks for the help.', focus: 'per' },
    { de: 'Questo è per te.', en: 'This is for you.', focus: 'per' },
    { de: 'Studio per l\'esame.', en: 'I study for the exam.', focus: 'per' },
  ], 'per'),
  gram('it-prep-con', 'prep', 'A1', '<b>con</b> — with', [
    { de: 'Esco con gli amici.', en: 'I go out with friends.', focus: 'con' },
    { de: 'Caffè con latte.', en: 'Coffee with milk.', focus: 'con' },
    { de: 'Vado con te.', en: 'I go with you.', focus: 'con' },
  ], 'con'),
];

const WH: CardDef[] = [
  gram('it-wh-cosa', 'wh', 'A1', '<b>Cosa / Che cosa</b> — what', [
    { de: 'Cosa fai?', en: 'What are you doing?', focus: 'Cosa' },
    { de: 'Che cos\'è?', en: 'What is it?', focus: 'cos' },
    { de: 'Non so cosa dire.', en: 'I don\'t know what to say.', focus: 'cosa' },
  ], 'cosa'),
  gram('it-wh-chi', 'wh', 'A1', '<b>Chi</b> — who', [
    { de: 'Chi è?', en: 'Who is it?', focus: 'Chi' },
    { de: 'Chi parla?', en: 'Who is speaking?', focus: 'Chi' },
    { de: 'Chi ha chiamato?', en: 'Who called?', focus: 'Chi' },
  ], 'chi'),
  gram('it-wh-dove', 'wh', 'A1', '<b>Dove</b> — where', [
    { de: 'Dove abiti?', en: 'Where do you live?', focus: 'Dove' },
    { de: 'Dove è il bagno?', en: 'Where is the bathroom?', focus: 'Dove' },
    { de: 'Non so dove sia.', en: 'I don\'t know where it is.', focus: 'dove' },
  ], 'dove'),
  gram('it-wh-quando', 'wh', 'A1', '<b>Quando</b> — when', [
    { de: 'Quando arrivi?', en: 'When are you arriving?', focus: 'Quando' },
    { de: 'Quando inizia il film?', en: 'When does the film start?', focus: 'Quando' },
    { de: 'Dimmi quando puoi.', en: 'Tell me when you can.', focus: 'quando' },
  ], 'quando'),
  gram('it-wh-perche', 'wh', 'A1', '<b>Perché</b> — why', [
    { de: 'Perché studi italiano?', en: 'Why do you study Italian?', focus: 'Perché' },
    { de: 'Perché ridi?', en: 'Why are you laughing?', focus: 'Perché' },
    { de: 'Non capisco perché.', en: 'I don\'t understand why.', focus: 'perché' },
  ], 'perché'),
  gram('it-wh-come', 'wh', 'A1', '<b>Come</b> — how', [
    { de: 'Come ti chiami?', en: 'What is your name?', focus: 'Come' },
    { de: 'Come stai?', en: 'How are you?', focus: 'Come' },
    { de: 'Come si dice?', en: 'How do you say it?', focus: 'Come' },
  ], 'come'),
  gram('it-wh-quanto', 'wh', 'A2', '<b>Quanto</b> — how much / many', [
    { de: 'Quanto costa?', en: 'How much does it cost?', focus: 'Quanto' },
    { de: 'Quanti anni hai?', en: 'How old are you?', focus: 'Quanti' },
    { de: 'Quanta pasta vuoi?', en: 'How much pasta do you want?', focus: 'Quanta' },
  ], 'quanto'),
];

const PRONOUNS: CardDef[] = [
  gram('it-obj-lo', 'pronoun', 'A1', '<b>lo / la / li / le</b> — direct object pronouns', [
    { de: 'Lo vedo.', en: 'I see him / it.', focus: 'Lo' },
    { de: 'La conosco.', en: 'I know her.', focus: 'La' },
    { de: 'Li compro.', en: 'I buy them.', focus: 'Li' },
  ], 'lo'),
  gram('it-obj-mi-ti', 'pronoun', 'A1', '<b>mi / ti</b> — me / you (direct or indirect)', [
    { de: 'Mi chiami?', en: 'Are you calling me?', focus: 'Mi' },
    { de: 'Ti amo.', en: 'I love you.', focus: 'Ti' },
    { de: 'Mi aiuti?', en: 'Can you help me?', focus: 'Mi' },
  ], 'mi'),
  gram('it-ind-gli-le', 'pronoun', 'A1', '<b>gli / le</b> — to him / her (indirect)', [
    { de: 'Gli do il libro.', en: 'I give him the book.', focus: 'Gli' },
    { de: 'Le scrivo una lettera.', en: 'I write her a letter.', focus: 'Le' },
    { de: 'Gli telefono stasera.', en: 'I call him tonight.', focus: 'Gli' },
  ], 'gli'),
  gram('it-ind-ci-vi', 'pronoun', 'A2', '<b>ci / vi</b> — to us / you (pl.)', [
    { de: 'Ci piace la pizza.', en: 'We like pizza.', focus: 'Ci' },
    { de: 'Vi aspetto qui.', en: 'I wait for you here.', focus: 'Vi' },
    { de: 'Ci vediamo domani.', en: 'See you tomorrow.', focus: 'Ci' },
  ], 'ci'),
];

const POSSESSIVES: CardDef[] = [
  gram('it-poss-mio', 'possessive', 'A1', '<b>mio / mia / miei / mie</b> — my (agrees with noun)', [
    { de: 'Il mio libro.', en: 'My book.', focus: 'mio' },
    { de: 'La mia casa.', en: 'My house.', focus: 'mia' },
    { de: 'I miei genitori.', en: 'My parents.', focus: 'miei' },
  ], 'mio'),
  gram('it-poss-tuo', 'possessive', 'A1', '<b>tuo / tua</b> — your (informal)', [
    { de: 'Il tuo amico.', en: 'Your friend.', focus: 'tuo' },
    { de: 'La tua idea.', en: 'Your idea.', focus: 'tua' },
    { de: 'È tua?', en: 'Is it yours?', focus: 'tua' },
  ], 'tuo'),
  gram('it-poss-suo', 'possessive', 'A1', '<b>suo / sua</b> — his / her / its', [
    { de: 'Il suo lavoro.', en: 'His/her job.', focus: 'suo' },
    { de: 'La sua macchina.', en: 'His/her car.', focus: 'sua' },
    { de: 'È suo.', en: 'It is his.', focus: 'suo' },
  ], 'suo'),
];

const MODALS: CardDef[] = [
  verb('it-modal-dovere', 'A1', 'dovere',
    { ich: 'devo', du: 'devi', er: 'deve', wir: 'dobbiamo', ihr: 'dovete', sie: 'devono' },
    'doveva', 'ha dovuto', [
      { de: 'Devo studiare.', en: 'I must study.', focus: 'Devo', subject: 'ich' },
      { de: 'Devi partire presto.', en: 'You must leave early.', focus: 'Devi', subject: 'du' },
      { de: 'Dobbiamo andare.', en: 'We must go.', focus: 'Dobbiamo', subject: 'wir' },
    ]),
  verb('it-modal-potere', 'A1', 'potere',
    { ich: 'posso', du: 'puoi', er: 'può', wir: 'possiamo', ihr: 'potete', sie: 'possono' },
    'poteva', 'ha potuto', [
      { de: 'Posso aiutarti?', en: 'Can I help you?', focus: 'Posso', subject: 'ich' },
      { de: 'Non può venire.', en: 'He cannot come.', focus: 'può', subject: 'er' },
      { de: 'Possiamo mangiare fuori.', en: 'We can eat out.', focus: 'Possiamo', subject: 'wir' },
    ]),
  verb('it-modal-volere', 'A1', 'volere',
    { ich: 'voglio', du: 'vuoi', er: 'vuole', wir: 'vogliamo', ihr: 'volete', sie: 'vogliono' },
    'voleva', 'ha voluto', [
      { de: 'Voglio un caffè.', en: 'I want a coffee.', focus: 'Voglio', subject: 'ich' },
      { de: 'Vuoi venire?', en: 'Do you want to come?', focus: 'Vuoi', subject: 'du' },
      { de: 'Vogliono partire.', en: 'They want to leave.', focus: 'Vogliono', subject: 'sie' },
    ]),
];

const PASSATO: CardDef[] = [
  gram('it-pass-avere', 'perfekt', 'A2', 'Passato prossimo with <b>avere</b> (most transitive verbs).', [
    { de: 'Ho letto il libro.', en: 'I read the book.', focus: 'Ho' },
    { de: 'Ha mangiato la pizza.', en: 'He ate the pizza.', focus: 'Ha' },
    { de: 'Abbiamo finito il lavoro.', en: 'We finished the work.', focus: 'Abbiamo' },
  ]),
  gram('it-pass-essere', 'perfekt', 'A2', 'Passato prossimo with <b>essere</b> (movement, change of state).', [
    { de: 'Sono andato a Roma.', en: 'I went to Rome.', focus: 'Sono' },
    { de: 'È arrivata tardi.', en: 'She arrived late.', focus: 'È' },
    { de: 'Siamo stati a casa.', en: 'We stayed home.', focus: 'Siamo' },
  ]),
  gram('it-pass-agreement', 'perfekt', 'A2', 'Past participle agrees with subject when auxiliary is <b>essere</b>.', [
    { de: 'Maria è andata al mercato.', en: 'Maria went to the market.', focus: 'andata' },
    { de: 'Siamo arrivati presto.', en: 'We arrived early.', focus: 'arrivati' },
    { de: 'Lei è partita ieri.', en: 'She left yesterday.', focus: 'partita' },
  ]),
  gram('it-pass-word-order', 'perfekt', 'A2', 'Word order: auxiliary + object + past participle.', [
    { de: 'Ho già visto questo film.', en: 'I have already seen this film.', focus: 'Ho' },
    { de: 'Non ho capito.', en: 'I did not understand.', focus: 'capito' },
    { de: 'Hai fatto i compiti?', en: 'Did you do the homework?', focus: 'fatto' },
  ]),
];

const IMPERFETTO: CardDef[] = [
  gram('it-impf-description', 'verb', 'A2', '<b>Imperfetto</b> — habitual actions, descriptions in the past.', [
    { de: 'Da bambino giocavo fuori.', en: 'As a child I played outside.', focus: 'giocavo' },
    { de: 'Faceva caldo.', en: 'It was hot.', focus: 'Faceva' },
    { de: 'Andavamo al mare ogni estate.', en: 'We went to the sea every summer.', focus: 'Andavamo' },
  ]),
  gram('it-impf-era', 'verb', 'A2', '<b>era / aveva</b> — was / had (very common).', [
    { de: 'Ero stanco ieri.', en: 'I was tired yesterday.', focus: 'Ero' },
    { de: 'Aveva fretta.', en: 'He was in a hurry.', focus: 'Aveva' },
    { de: 'Eravamo a casa.', en: 'We were at home.', focus: 'Eravamo' },
  ]),
  gram('it-impf-vs-passato', 'verb', 'A2', 'Imperfetto (background) vs passato prossimo (completed event).', [
    { de: 'Mentre leggevo, ha telefonato.', en: 'While I was reading, he called.', focus: 'leggevo' },
    { de: 'Pioveva quando sono uscito.', en: 'It was raining when I went out.', focus: 'Pioveva' },
    { de: 'Cosa facevi ieri?', en: 'What were you doing yesterday?', focus: 'facevi' },
  ]),
];

const NEGATION: CardDef[] = [
  gram('it-neg-non', 'negation', 'A1', '<b>non</b> before the verb — general negation.', [
    { de: 'Non capisco.', en: 'I do not understand.', focus: 'Non' },
    { de: 'Non è vero.', en: 'It is not true.', focus: 'Non' },
    { de: 'Non voglio uscire.', en: 'I do not want to go out.', focus: 'Non' },
  ], 'non'),
  gram('it-neg-mai', 'negation', 'A2', '<b>non … mai</b> — never', [
    { de: 'Non ho mai visto Roma.', en: 'I have never seen Rome.', focus: 'mai' },
    { de: 'Non mangia mai carne.', en: 'He never eats meat.', focus: 'mai' },
    { de: 'Non l\'ho mai fatto.', en: 'I have never done it.', focus: 'mai' },
  ], 'mai'),
  gram('it-neg-niente', 'negation', 'A1', '<b>niente / nulla</b> — nothing', [
    { de: 'Non ho niente.', en: 'I have nothing.', focus: 'niente' },
    { de: 'Non dico niente.', en: 'I say nothing.', focus: 'niente' },
    { de: 'Non c\'è niente.', en: 'There is nothing.', focus: 'niente' },
  ], 'niente'),
];

const COMPARATIVE: CardDef[] = [
  gram('it-comp-buono', 'comparative', 'A2', '<b>buono → migliore</b> (irregular)', [
    { de: 'Questo caffè è migliore.', en: 'This coffee is better.', focus: 'migliore' },
    { de: 'Parla meglio di me.', en: 'She speaks better than me.', focus: 'meglio' },
    { de: 'È il migliore della classe.', en: 'He is the best in the class.', focus: 'migliore' },
  ], 'migliore'),
  gram('it-comp-grande', 'comparative', 'A2', '<b>grande → più grande</b> (regular: più + adj)', [
    { de: 'Roma è più grande.', en: 'Rome is bigger.', focus: 'grande' },
    { de: 'È più alto di me.', en: 'He is taller than me.', focus: 'alto' },
    { de: 'La più bella città.', en: 'The most beautiful city.', focus: 'bella' },
  ], 'grande'),
];

const REFLEXIVE: CardDef[] = [
  gram('it-refl-mi', 'reflexive', 'A2', '<b>mi</b> — reflexive pronoun (io)', [
    { de: 'Mi alzo alle sette.', en: 'I get up at seven.', focus: 'Mi' },
    { de: 'Mi lavo le mani.', en: 'I wash my hands.', focus: 'Mi' },
    { de: 'Mi chiamo Marco.', en: 'My name is Marco.', focus: 'Mi' },
  ], 'mi'),
  gram('it-refl-si', 'reflexive', 'A2', '<b>si</b> — reflexive (lui/lei)', [
    { de: 'Si veste velocemente.', en: 'He gets dressed quickly.', focus: 'Si' },
    { de: 'Si chiama Anna.', en: 'Her name is Anna.', focus: 'Si' },
    { de: 'Si sente meglio.', en: 'He feels better.', focus: 'Si' },
  ], 'si'),
  gram('it-refl-alzarsi', 'reflexive', 'A2', '<b>alzarsi</b> — get up', [
    { de: 'Mi alzo presto.', en: 'I get up early.', focus: 'Mi' },
    { de: 'Ti alzi tardi?', en: 'Do you get up late?', focus: 'Ti' },
    { de: 'Si alza alle sei.', en: 'He gets up at six.', focus: 'Si' },
  ], 'alzarsi'),
  gram('it-refl-lavarsi', 'reflexive', 'A2', '<b>lavarsi</b> — wash oneself', [
    { de: 'Mi lavo ogni mattina.', en: 'I wash myself every morning.', focus: 'Mi' },
    { de: 'Si lava i capelli.', en: 'She washes her hair.', focus: 'Si' },
    { de: 'Lavati le mani!', en: 'Wash your hands!', focus: 'Lavati' },
  ], 'lavarsi'),
  gram('it-refl-divertirsi', 'reflexive', 'A2', '<b>divertirsi</b> — have fun', [
    { de: 'Mi diverto molto.', en: 'I have a lot of fun.', focus: 'Mi' },
    { de: 'Vi siete divertiti?', en: 'Did you have fun?', focus: 'divertiti' },
    { de: 'Ci siamo divertiti.', en: 'We had fun.', focus: 'Ci' },
  ], 'divertirsi'),
];

const ARTICULATED: CardDef[] = [
  gram('it-art-del', 'prep', 'A2', '<b>del / dello / della / dei / degli / delle</b> — of the / some', [
    { de: 'Il libro del professore.', en: 'The teacher\'s book.', focus: 'del' },
    { de: 'Un pezzo della torta.', en: 'A piece of the cake.', focus: 'della' },
    { de: 'I libri degli studenti.', en: 'The students\' books.', focus: 'degli' },
  ], 'del'),
  gram('it-art-al', 'prep', 'A2', '<b>al / allo / alla / ai / agli / alle</b> — to the', [
    { de: 'Vado al mercato.', en: 'I go to the market.', focus: 'al' },
    { de: 'Pensiamo alla vacanza.', en: 'We think about the holiday.', focus: 'alla' },
    { de: 'Arrivo alle otto.', en: 'I arrive at eight.', focus: 'alle' },
  ], 'al'),
  gram('it-art-nel', 'prep', 'A2', '<b>nel / nello / nella / nei / negli / nelle</b> — in the', [
    { de: 'Sono in ufficio.', en: 'I am in the office.', focus: 'in' },
    { de: 'Vivo nella città.', en: 'I live in the city.', focus: 'nella' },
    { de: 'Siamo in classe.', en: 'We are in class.', focus: 'in' },
  ], 'nel'),
];

const CONJUNCTIONS: CardDef[] = [
  gram('it-conj-perche', 'conjunction', 'A2', '<b>perché</b> — because (no word-order change in Italian)', [
    { de: 'Resto a casa perché sono malato.', en: 'I stay home because I am ill.', focus: 'perché' },
    { de: 'Studio perché voglio imparare.', en: 'I study because I want to learn.', focus: 'perché' },
    { de: 'Non mangia perché non ha fame.', en: 'She does not eat because she is not hungry.', focus: 'perché' },
  ], 'perché'),
  gram('it-conj-che', 'conjunction', 'A2', '<b>che</b> — that (complementizer)', [
    { de: 'Penso che sia vero.', en: 'I think that it is true.', focus: 'che' },
    { de: 'Dice che viene.', en: 'He says that he is coming.', focus: 'che' },
    { de: 'Spero che tu stia bene.', en: 'I hope that you are well.', focus: 'che' },
  ], 'che'),
  gram('it-conj-quando', 'conjunction', 'A2', '<b>quando</b> — when', [
    { de: 'Quando arrivi, chiamami.', en: 'When you arrive, call me.', focus: 'Quando' },
    { de: 'Quando piove, resto dentro.', en: 'When it rains, I stay inside.', focus: 'Quando' },
    { de: 'Dimmi quando sei pronto.', en: 'Tell me when you are ready.', focus: 'quando' },
  ], 'quando'),
  gram('it-conj-se', 'conjunction', 'A2', '<b>se</b> — if', [
    { de: 'Se hai tempo, vieni.', en: 'If you have time, come.', focus: 'Se' },
    { de: 'Non so se viene.', en: 'I don\'t know if he is coming.', focus: 'se' },
    { de: 'Se piove, restiamo a casa.', en: 'If it rains, we stay home.', focus: 'Se' },
  ], 'se'),
  gram('it-conj-anche-se', 'conjunction', 'A2', '<b>anche se</b> — even though', [
    { de: 'Esco anche se piove.', en: 'I go out even though it is raining.', focus: 'anche se' },
    { de: 'Lavora anche se è stanco.', en: 'He works even though he is tired.', focus: 'anche se' },
    { de: 'Rido anche se sono triste.', en: 'I laugh even though I am sad.', focus: 'anche se' },
  ], 'anche se'),
];

const AGREEMENT: CardDef[] = [
  gram('it-adj-o-a', 'adjective', 'A2', 'Adjectives agree: <b>-o</b> (masc.) / <b>-a</b> (fem.)', [
    { de: 'Un ragazzo alto.', en: 'A tall boy.', focus: 'alto' },
    { de: 'Una ragazza alta.', en: 'A tall girl.', focus: 'alta' },
    { de: 'Libri interessanti.', en: 'Interesting books.', focus: 'interessanti' },
  ]),
  gram('it-adj-bello', 'adjective', 'A2', '<b>bello / bella / bei / belle</b> — beautiful', [
    { de: 'Un bel giorno.', en: 'A beautiful day.', focus: 'bel' },
    { de: 'Una bella idea.', en: 'A beautiful idea.', focus: 'bella' },
    { de: 'Che bellezza!', en: 'How beautiful!', focus: 'bellezza' },
  ]),
  gram('it-adj-article', 'adjective', 'A2', 'Adjective <em>before</em> or <em>after</em> noun can change meaning.', [
    { de: 'Un grande uomo.', en: 'A great man.', focus: 'grande' },
    { de: 'Un uomo grande.', en: 'A big man.', focus: 'grande' },
    { de: 'Una vecchia amica.', en: 'An old friend (longtime).', focus: 'vecchia' },
  ]),
];

const FUTURE: CardDef[] = [
  gram('it-fut-ir', 'verb', 'A2', '<b>Future</b> (or present + time word): <b>andrò, farò, sarò</b>.', [
    { de: 'Domani lavorerò.', en: 'Tomorrow I will work.', focus: 'lavorerò' },
    { de: 'Verrai alla festa?', en: 'Will you come to the party?', focus: 'Verrai' },
    { de: 'Sarà difficile.', en: 'It will be difficult.', focus: 'Sarà' },
  ]),
  gram('it-fut-present-time', 'verb', 'A2', 'Present + time word often replaces future in speech.', [
    { de: 'Domani vado a Milano.', en: 'Tomorrow I am going to Milan.', focus: 'vado' },
    { de: 'La settimana prossima parto.', en: 'Next week I am leaving.', focus: 'parto' },
    { de: 'Stasera cucino.', en: 'This evening I am going to cook.', focus: 'cucino' },
  ]),
];

const IMPERATIVE: CardDef[] = [
  gram('it-imp-tu', 'verb', 'A2', 'Imperative <b>tu</b> — often 3rd person present: <em>Vieni!</em>', [
    { de: 'Vieni qui!', en: 'Come here!', focus: 'Vieni' },
    { de: 'Ascolta!', en: 'Listen!', focus: 'Ascolta' },
    { de: 'Mangia!', en: 'Eat!', focus: 'Mangia' },
  ]),
  gram('it-imp-noi', 'verb', 'A2', 'Imperative <b>noi</b> — same as present noi: <em>Andiamo!</em>', [
    { de: 'Andiamo!', en: 'Let\'s go!', focus: 'Andiamo' },
    { de: 'Mangiamo!', en: 'Let\'s eat!', focus: 'Mangiamo' },
    { de: 'Partiamo!', en: 'Let\'s leave!', focus: 'Partiamo' },
  ]),
  gram('it-imp-lei', 'verb', 'A2', 'Imperative <b>Lei</b> (formal) — subjunctive: <em>Venga!</em>', [
    { de: 'Venga, per favore!', en: 'Come, please!', focus: 'Venga' },
    { de: 'Si sieda.', en: 'Take a seat.', focus: 'sieda' },
    { de: 'Mi scusi.', en: 'Excuse me.', focus: 'scusi' },
  ]),
];

const PACKS: CardDef[] = [
  gram('it-pack-travel-ticket', 'verb', 'A2', 'At the station: buying a ticket.', [
    { de: 'Vorrei un biglietto per Roma.', en: 'I would like a ticket to Rome.', focus: 'biglietto' },
    { de: 'Quanto costa?', en: 'How much does it cost?', focus: 'costa' },
    { de: 'Quando parte il prossimo treno?', en: 'When does the next train leave?', focus: 'parte' },
  ]),
  gram('it-pack-travel-hotel', 'verb', 'A2', 'At the hotel: check-in.', [
    { de: 'Ho una prenotazione.', en: 'I have a reservation.', focus: 'prenotazione' },
    { de: 'Avete una camera libera?', en: 'Do you have a free room?', focus: 'camera' },
    { de: 'La colazione è inclusa?', en: 'Is breakfast included?', focus: 'colazione' },
  ]),
  gram('it-pack-doctor-visit', 'verb', 'A2', 'At the doctor.', [
    { de: 'Ho mal di testa.', en: 'I have a headache.', focus: 'testa' },
    { de: 'Mi fa male la gola.', en: 'My throat hurts.', focus: 'gola' },
    { de: 'Ho bisogno di un appuntamento.', en: 'I need an appointment.', focus: 'appuntamento' },
  ]),
  gram('it-pack-work-office', 'verb', 'A2', 'In the office.', [
    { de: 'Ho una riunione oggi.', en: 'I have a meeting today.', focus: 'riunione' },
    { de: 'Ti mando l\'email.', en: 'I send you the email.', focus: 'email' },
    { de: 'Possiamo parlarne domani?', en: 'Can we talk about it tomorrow?', focus: 'parlarne' },
  ]),
];

export const CARDS_IT: CardDef[] = (() => {
  const HAND_CURATED: CardDef[] = [
    ...VERBS,
    ...NOUNS,
    ...PREPS,
    ...WH,
    ...PRONOUNS,
    ...POSSESSIVES,
    ...MODALS,
    ...PASSATO,
    ...IMPERFETTO,
    ...NEGATION,
    ...COMPARATIVE,
    ...REFLEXIVE,
    ...ARTICULATED,
    ...CONJUNCTIONS,
    ...AGREEMENT,
    ...FUTURE,
    ...IMPERATIVE,
    ...PACKS,
    ...DEPTH_CARDS_IT,
  ];

  const handIds = new Set(HAND_CURATED.map((c) => c.id));
  const handKeys = new Set(
    HAND_CURATED.map((c) => `${c.type}::${(c.verb || c.noun || c.word || '').toLowerCase()}`).filter(
      (k) => !k.endsWith('::'),
    ),
  );
  const generatedDeduped = CARDS_GENERATED_IT.filter((c) => {
    if (handIds.has(c.id)) return false;
    const key = `${c.type}::${(c.verb || c.noun || c.word || '').toLowerCase()}`;
    if (handKeys.has(key)) return false;
    return true;
  });

  return [...HAND_CURATED, ...generatedDeduped];
})();
