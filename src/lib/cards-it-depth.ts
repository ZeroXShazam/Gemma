import type { CardDef, Example, Level } from './types';

const L = 'it' as const;

function gram(id: string, type: CardDef['type'], lv: Level, rule: string, ex: Example[], word?: string): CardDef {
  return { id, language: L, type, level: lv, rule, examples: ex, word, source: 'hand' };
}

/** Phase 4 hand-curated depth cards for thin A2 grammar sections (Italian). */
export const DEPTH_CARDS_IT: CardDef[] = [
  gram('it-depth-passato-avere-essere', 'perfekt', 'A2', '<b>avere</b> vs <b>essere</b> — motion/state change → essere; most others → avere.', [
    { de: 'Sono corso velocemente a casa.', en: 'I ran home quickly.', focus: 'Sono' },
    { de: 'Ha lavorato tutto il giorno.', en: 'He worked all day.', focus: 'Ha' },
    { de: 'Ci siamo svegliati tardi.', en: 'We woke up late.', focus: 'siamo' },
  ]),
  gram('it-depth-passato-irregular', 'perfekt', 'A2', 'Common irregular participles: <b>letto, scritto, detto, fatto</b>.', [
    { de: 'Ho già letto il libro.', en: 'I have already read the book.', focus: 'letto' },
    { de: 'Ha scritto una lettera.', en: 'He wrote a letter.', focus: 'scritto' },
    { de: 'Ha detto la verità.', en: 'She told the truth.', focus: 'detto' },
  ]),
  gram('it-depth-passato-pronomi', 'perfekt', 'A2', 'Pronouns before the auxiliary: <b>l\'ho visto, mi sono alzato</b>.', [
    { de: 'L\'ho visto ieri.', en: 'I saw him yesterday.', focus: "l'ho" },
    { de: 'Mi sono alzato presto.', en: 'I got up early.', focus: 'alzato' },
    { de: 'Non l\'abbiamo trovato.', en: 'We did not find it.', focus: "l'abbiamo" },
  ]),
  gram('it-depth-passato-mai', 'perfekt', 'A2', '<b>non … mai</b> + passato prossimo — "have never …"', [
    { de: 'Non ho mai mangiato sushi.', en: 'I have never eaten sushi.', focus: 'mai' },
    { de: 'Non è mai stato in Italia.', en: 'He has never been to Italy.', focus: 'mai' },
    { de: 'Non ci siamo mai incontrati.', en: 'We have never met.', focus: 'mai' },
  ]),
  gram('it-depth-passato-da', 'perfekt', 'A2', '<b>da</b> + present for ongoing actions/states.', [
    { de: 'Studio italiano da due anni.', en: 'I have been studying Italian for two years.', focus: 'Studio' },
    { de: 'Vive a Roma dal 2020.', en: 'He has lived in Rome since 2020.', focus: 'Vive' },
    { de: 'Lavora in questa azienda da gennaio.', en: 'She has worked at this company since January.', focus: 'Lavora' },
  ]),
  gram('it-depth-passato-questions', 'perfekt', 'A2', 'Yes/no questions: auxiliary first.', [
    { de: 'Hai già mangiato?', en: 'Have you eaten yet?', focus: 'Hai' },
    { de: 'È già partito?', en: 'Has he already left?', focus: 'È' },
    { de: 'Avete fatto i compiti?', en: 'Have you done the homework?', focus: 'Avete' },
  ]),
  gram('it-depth-passato-everyday', 'perfekt', 'A2', 'Everyday passato: <b>capito, dimenticato, perso, rotto</b>.', [
    { de: 'Scusa, ti ho capito male.', en: 'Sorry, I misunderstood you.', focus: 'capito' },
    { de: 'Ha dimenticato il passaporto.', en: 'He forgot his passport.', focus: 'dimenticato' },
    { de: 'Ha perso il telefono.', en: 'She lost her phone.', focus: 'perso' },
  ]),
  gram('it-depth-passato-recent', 'perfekt', 'A2', 'Recent past with <b>appena, già, appena</b>.', [
    { de: 'Ho appena mangiato.', en: 'I have just eaten.', focus: 'appena' },
    { de: 'È appena arrivato.', en: 'He has just arrived.', focus: 'appena' },
    { de: 'Abbiamo già pagato.', en: 'We have already paid.', focus: 'già' },
  ]),

  gram('it-depth-imperf-narrative', 'verb', 'A2', 'Imperfetto in short narratives — background actions.', [
    { de: 'Ieri pioveva tutto il giorno.', en: 'Yesterday it rained all day.', focus: 'pioveva' },
    { de: 'Si alzava presto e andava al lavoro.', en: 'He got up early and went to work.', focus: 'andava' },
    { de: 'La sera cucinavamo insieme.', en: 'In the evening we cooked together.', focus: 'cucinavamo' },
  ]),
  gram('it-depth-imperf-dormiva-beva', 'verb', 'A2', 'High-frequency imperfetto: <b>dormiva, beveva, mangiava, leggeva</b>.', [
    { de: 'Dormiva male.', en: 'He slept badly.', focus: 'Dormiva' },
    { de: 'Beveva solo acqua.', en: 'He drank only water.', focus: 'Beveva' },
    { de: 'Leggeva fino a mezzanotte.', en: 'She read until midnight.', focus: 'Leggeva' },
  ]),
  gram('it-depth-imperf-portava-prendeva', 'verb', 'A2', 'More imperfetto: <b>portava, prendeva, dava, aiutava</b>.', [
    { de: 'Mi portava il caffè.', en: 'He brought me coffee.', focus: 'portava' },
    { de: 'Prendeva l\'autobus.', en: 'She took the bus.', focus: 'Prendeva' },
    { de: 'Mi aiutava con i compiti.', en: 'He helped me with the homework.', focus: 'aiutava' },
  ]),
  gram('it-depth-imperf-modals', 'modal', 'A2', 'Modals in imperfetto: <b>poteva, doveva, voleva</b>.', [
    { de: 'Ieri non potevo venire.', en: 'I could not come yesterday.', focus: 'potevo' },
    { de: 'Da bambino non potevo guardare la TV a lungo.', en: 'As a child I could not watch TV for long.', focus: 'potevo' },
    { de: 'Voleva diventare medico.', en: 'He wanted to become a doctor.', focus: 'Voleva' },
  ]),
  gram('it-depth-imperf-era', 'verb', 'A2', '<b>Era …</b> — describing past situations.', [
    { de: 'Era freddo e ventoso.', en: 'It was cold and windy.', focus: 'Era' },
    { de: 'Era una bella giornata.', en: 'It was a beautiful day.', focus: 'Era' },
    { de: 'Era già tardi.', en: 'It was already late.', focus: 'Era' },
  ]),
  gram('it-depth-imperf-aveva-bisogno', 'verb', 'A2', '<b>aveva / aveva bisogno / doveva</b> — past needs.', [
    { de: 'Aveva molto da fare.', en: 'He had a lot to do.', focus: 'Aveva' },
    { de: 'Aveva bisogno di più tempo.', en: 'He needed more time.', focus: 'bisogno' },
    { de: 'Doveva alzarsi presto.', en: 'She had to get up early.', focus: 'Doveva' },
  ]),

  gram('it-depth-refl-ricordarsi', 'reflexive', 'A2', '<b>ricordarsi di</b> — remember (something)', [
    { de: 'Mi ricordo quel giorno.', en: 'I remember that day.', focus: 'ricordo' },
    { de: 'Si ricorda la sua infanzia.', en: 'He remembers his childhood.', focus: 'ricorda' },
    { de: 'Ti ricordi di lei?', en: 'Do you remember her?', focus: 'ricordi' },
  ], 'ricordarsi'),
  gram('it-depth-refl-prepararsi', 'reflexive', 'A2', '<b>prepararsi a</b> — prepare for', [
    { de: 'Mi preparo all\'esame.', en: 'I am preparing for the exam.', focus: 'preparo' },
    { de: 'Si prepara alla riunione.', en: 'He is preparing for the meeting.', focus: 'prepara' },
    { de: 'Ci prepariamo alle vacanze.', en: 'We are preparing for the holiday.', focus: 'prepariamo' },
  ], 'prepararsi'),
  gram('it-depth-refl-concentrarsi', 'reflexive', 'A2', '<b>concentrarsi su</b> — concentrate on', [
    { de: 'Mi concentro sul lavoro.', en: 'I am concentrating on the work.', focus: 'concentro' },
    { de: 'Puoi concentrarti, per favore?', en: 'Can you please concentrate?', focus: 'concentrarti' },
    { de: 'Si concentra sul problema.', en: 'He is concentrating on the problem.', focus: 'concentra' },
  ], 'concentrarsi'),
  gram('it-depth-refl-decidersi', 'reflexive', 'A2', '<b>decidersi per</b> — decide on', [
    { de: 'Mi decido per il vestito rosso.', en: 'I decide on the red dress.', focus: 'decido' },
    { de: 'Si è deciso per il lavoro.', en: 'He decided on the job.', focus: 'deciso' },
    { de: 'Per cosa ti decidi?', en: 'What are you deciding on?', focus: 'decidi' },
  ], 'decidersi'),
  gram('it-depth-refl-sentirsi', 'reflexive', 'A2', '<b>sentirsi</b> + adj — feel (health/mood)', [
    { de: 'Oggi mi sento meglio.', en: 'I feel better today.', focus: 'sento' },
    { de: 'Si sente stanco.', en: 'He feels tired.', focus: 'sente' },
    { de: 'Ti senti male?', en: 'Do you feel ill?', focus: 'senti' },
  ], 'sentirsi'),
  gram('it-depth-refl-sbrigarsi', 'reflexive', 'A2', '<b>sbrigarsi / affrettarsi</b> — hurry up', [
    { de: 'Mi sbrigo.', en: 'I am hurrying.', focus: 'sbrigo' },
    { de: 'Sbrigati, il treno parte!', en: 'Hurry up, the train is leaving!', focus: 'Sbrigati' },
    { de: 'Ci affrettiamo.', en: 'We are hurrying.', focus: 'affrettiamo' },
  ], 'sbrigarsi'),
  gram('it-depth-refl-presentarsi', 'reflexive', 'A2', '<b>presentarsi</b> — introduce oneself OR show up', [
    { de: 'Immaginatelo!', en: 'Imagine that!', focus: 'Immaginatelo' },
    { de: 'Posso presentarmi?', en: 'May I introduce myself?', focus: 'presentarmi' },
    { de: 'Si presenta al capo.', en: 'He introduces himself to the boss.', focus: 'presenta' },
  ], 'presentarsi'),
  gram('it-depth-refl-cambiarsi', 'reflexive', 'A2', '<b>cambiarsi</b> — change clothes', [
    { de: 'Mi cambio.', en: 'I am changing clothes.', focus: 'cambio' },
    { de: 'Si cambia velocemente.', en: 'He changes quickly.', focus: 'cambia' },
    { de: 'Vestiti caldo!', en: 'Dress warmly!', focus: 'Vestiti' },
  ], 'cambiarsi'),

  gram('it-depth-prep-su-loc', 'prep', 'A2', '<b>su</b> (location) — on, above', [
    { de: 'Il quadro è appeso sopra il divano.', en: 'The picture hangs above the sofa.', focus: 'sopra' },
    { de: 'Parliamo durante il pranzo.', en: 'We talk during lunch.', focus: 'durante' },
    { de: 'Il ponte passa sopra il fiume.', en: 'The bridge goes over the river.', focus: 'sopra' },
  ], 'su'),
  gram('it-depth-prep-su-mov', 'prep', 'A2', '<b>su / attraverso</b> (movement) — across, over', [
    { de: 'Salta oltre la recinzione.', en: 'He jumps over the fence.', focus: 'oltre' },
    { de: 'Attraversa il ponte.', en: 'She crosses the bridge.', focus: 'Attraversa' },
    { de: 'Leggo durante il fine settimana.', en: 'I read over the weekend.', focus: 'durante' },
  ], 'su'),
  gram('it-depth-prep-sotto-loc', 'prep', 'A2', '<b>sotto</b> (location) — under, below', [
    { de: 'Il gatto è sotto il tavolo.', en: 'The cat is under the table.', focus: 'sotto' },
    { de: 'Sta sotto il ponte.', en: 'He stands under the bridge.', focus: 'sotto' },
    { de: 'Il libro è sotto le mie cose.', en: 'The book is under my things.', focus: 'sotto' },
  ], 'sotto'),
  gram('it-depth-prep-sotto-mov', 'prep', 'A2', '<b>sotto</b> (movement) — under', [
    { de: 'Mette il libro sotto il tavolo.', en: 'He puts the book under the table.', focus: 'sotto' },
    { de: 'Mette la borsa sotto il sedile.', en: 'She puts the bag under the seat.', focus: 'sotto' },
    { de: 'Andiamo sotto il ponte.', en: 'We go under the bridge.', focus: 'sotto' },
  ], 'sotto'),
  gram('it-depth-prep-davanti-loc', 'prep', 'A2', '<b>davanti a</b> (location) — in front of', [
    { de: 'La macchina è davanti alla casa.', en: 'The car is in front of the house.', focus: 'davanti' },
    { de: 'Aspetta davanti alla porta.', en: 'He waits in front of the door.', focus: 'davanti' },
    { de: 'Sediamo davanti alla TV.', en: 'We sit in front of the TV.', focus: 'davanti' },
  ], 'davanti'),
  gram('it-depth-prep-davanti-mov', 'prep', 'A2', '<b>davanti a</b> (movement) — in front of', [
    { de: 'Mette la bici davanti alla casa.', en: 'He puts the bike in front of the house.', focus: 'davanti' },
    { de: 'Arriva davanti alla scuola.', en: 'She arrives in front of the school.', focus: 'davanti' },
    { de: 'Mettiti davanti a me!', en: 'Stand in front of me!', focus: 'davanti' },
  ], 'davanti'),

  gram('it-depth-conj-perche', 'conjunction', 'A2', '<b>perché</b> — because (reason clause).', [
    { de: 'Resto a casa perché sono malato.', en: 'I stay home because I am ill.', focus: 'perché' },
    { de: 'Studia italiano perché lavora a Roma.', en: 'He studies Italian because he works in Rome.', focus: 'perché' },
    { de: 'Non mangia perché non ha fame.', en: 'She does not eat because she is not hungry.', focus: 'perché' },
  ], 'perché'),
  gram('it-depth-conj-che-indirect', 'conjunction', 'A2', '<b>che</b> after verbs of thinking/saying.', [
    { de: 'Penso che abbia ragione.', en: 'I think that he is right.', focus: 'che' },
    { de: 'Crede che domani pioverà.', en: 'She believes that it will rain tomorrow.', focus: 'che' },
    { de: 'Pensa che costi troppo.', en: 'He thinks that is too expensive.', focus: 'che' },
  ], 'che'),
  gram('it-depth-conj-quando-cond', 'conjunction', 'A2', '<b>quando</b> — when / whenever.', [
    { de: 'Quando hai tempo, chiamami.', en: 'When you have time, call me.', focus: 'Quando' },
    { de: 'Quando fa caldo, andiamo a nuotare.', en: 'When it is warm, we go swimming.', focus: 'Quando' },
    { de: 'Ti aiuto quando posso.', en: 'I help you when I can.', focus: 'quando' },
  ], 'quando'),
  gram('it-depth-conj-anche-se', 'conjunction', 'A2', '<b>anche se</b> — although (contrast).', [
    { de: 'Anche se piove, esco a camminare.', en: 'Although it is raining, I go for a walk.', focus: 'Anche se' },
    { de: 'Lavora anche se è stanco.', en: 'He works although he is tired.', focus: 'anche se' },
    { de: 'Ride anche se è triste.', en: 'She laughs although she is sad.', focus: 'anche se' },
  ], 'anche se'),
  gram('it-depth-conj-che-vs-se', 'conjunction', 'A2', '<b>che</b> = that (statement) · <b>se</b> = if/whether.', [
    { de: 'Spero che tu venga.', en: 'I hope that you are coming.', focus: 'che' },
    { de: 'Non so se viene.', en: 'I do not know whether he is coming.', focus: 'se' },
    { de: 'Chiede se ho tempo.', en: 'She asks whether I have time.', focus: 'se' },
  ]),

  gram('it-depth-adj-niente', 'adjective', 'A2', '<b>nessun / nessuna</b> + noun — no, not any.', [
    { de: 'Non è un buon caffè.', en: 'That is not good coffee.', focus: 'Non' },
    { de: 'Non è una persona cattiva.', en: 'He is not a bad person.', focus: 'Non' },
    { de: 'Non è un grosso errore.', en: 'That is not a big mistake.', focus: 'Non' },
  ]),
  gram('it-depth-adj-plural', 'adjective', 'A2', 'Plural agreement: <b>case vecchie, mele verdi</b>.', [
    { de: 'Le case vecchie sono belle.', en: 'The old houses are beautiful.', focus: 'vecchie' },
    { de: 'Mi piacciono le mele verdi.', en: 'I like green apples.', focus: 'verdi' },
    { de: 'I giovani ballano.', en: 'The young people are dancing.', focus: 'giovani' },
  ]),
  gram('it-depth-adj-position', 'adjective', 'A2', 'Adjective <em>before</em> or <em>after</em> the noun can change meaning.', [
    { de: 'Un grande uomo.', en: 'A great man.', focus: 'grande' },
    { de: 'Un uomo grande.', en: 'A big man.', focus: 'grande' },
    { de: 'Una vecchia amica.', en: 'An old friend (longtime).', focus: 'vecchia' },
  ]),
  gram('it-depth-adj-comparative', 'adjective', 'A2', 'Comparative: <b>più … di / meno … di</b>.', [
    { de: 'Un piano migliore sarebbe utile.', en: 'A better plan would be useful.', focus: 'migliore' },
    { de: 'Ha un appartamento più grande.', en: 'She has a bigger apartment.', focus: 'grande' },
    { de: 'Compra una macchina più economica.', en: 'He buys a cheaper car.', focus: 'economica' },
  ]),
  gram('it-depth-adj-quanto', 'adjective', 'A2', '<b>quanto / quanta / quanti / quante</b> — how much/many.', [
    { de: 'Quanto costa?', en: 'How much does it cost?', focus: 'Quanto' },
    { de: 'Quanti anni hai?', en: 'How old are you?', focus: 'Quanti' },
    { de: 'Quanta pasta vuoi?', en: 'How much pasta do you want?', focus: 'Quanta' },
  ]),

  gram('it-depth-dat-aiutare', 'pronoun', 'A1', '<b>aiutare</b> — help someone (indirect object).', [
    { de: 'Puoi aiutarmi?', en: 'Can you help me?', focus: 'aiutarmi' },
    { de: 'Aiuta sua madre.', en: 'He helps his mother.', focus: 'Aiuta' },
    { de: 'Aiutiamo i bambini.', en: 'We help the children.', focus: 'Aiutiamo' },
  ], 'aiutare'),
  gram('it-depth-dat-dare', 'pronoun', 'A1', '<b>dare</b> — give someone something.', [
    { de: 'Ti do il libro.', en: 'I give you the book.', focus: 'Ti' },
    { de: 'Mi dà un caffè.', en: 'He gives me a coffee.', focus: 'Mi' },
    { de: 'Gli dà i soldi.', en: 'She gives him the money.', focus: 'Gli' },
  ], 'dare'),
  gram('it-depth-dat-con', 'prep', 'A1', '<b>con</b> — with', [
    { de: 'Vado con l\'autobus.', en: 'I travel by bus.', focus: 'con' },
    { de: 'Parla con me.', en: 'He speaks with me.', focus: 'con' },
    { de: 'Andiamo con gli amici.', en: 'We go with the friends.', focus: 'con' },
  ], 'con'),
  gram('it-depth-dat-rispondere', 'verb', 'A2', '<b>rispondere a</b> — answer someone.', [
    { de: 'Non mi risponde.', en: 'He does not answer me.', focus: 'mi' },
    { de: 'Ti rispondo più tardi.', en: 'I answer you later.', focus: 'Ti' },
    { de: 'Risponde al capo.', en: 'She answers the boss.', focus: 'Risponde' },
  ], 'rispondere'),
  gram('it-depth-dat-ringraziare', 'verb', 'A2', '<b>ringraziare</b> — thank someone.', [
    { de: 'Ti ringrazio per l\'aiuto.', en: 'I thank you for the help.', focus: 'ringrazio' },
    { de: 'Ringrazia i suoi genitori.', en: 'He thanks his parents.', focus: 'Ringrazia' },
    { de: 'La ringraziamo di cuore.', en: 'We thank you warmly.', focus: 'ringraziamo' },
  ], 'ringraziare'),
  gram('it-depth-dat-piacere', 'verb', 'A2', '<b>piacere a</b> — please / appeal to someone.', [
    { de: 'Il vestito mi piace.', en: 'I like the dress.', focus: 'piace' },
    { de: 'Il film non gli piace.', en: 'He does not like the film.', focus: 'piace' },
    { de: 'L\'idea ci piace.', en: 'We like the idea.', focus: 'piace' },
  ], 'piacere'),
  gram('it-depth-dat-congratularsi', 'verb', 'A2', '<b>congratularsi con</b> — congratulate someone.', [
    { de: 'Ti congratulo per il compleanno!', en: 'Congratulations on your birthday!', focus: 'congratulo' },
    { de: 'Ci congratuliamo con Lei per la promozione.', en: 'We congratulate you on the promotion.', focus: 'congratuliamo' },
    { de: 'Si congratula con sua sorella.', en: 'He congratulates his sister.', focus: 'congratula' },
  ], 'congratularsi'),
  gram('it-depth-dat-successo', 'verb', 'A2', '<b>capitare / succedere a</b> — happen to someone.', [
    { de: 'Cos\'è successo?', en: 'What happened?', focus: 'successo' },
    { de: 'Non gli era mai successo.', en: 'That never happened to him.', focus: 'successo' },
    { de: 'Ti è successo qualcosa?', en: 'Did something happen to you?', focus: 'successo' },
  ], 'succedere'),

  gram('it-depth-pack-travel-ticket', 'verb', 'A2', 'At the station: buying a ticket.', [
    { de: 'Vorrei un biglietto per Milano.', en: 'I would like a ticket to Milan.', focus: 'biglietto' },
    { de: 'Per Roma, per favore.', en: 'To Rome, please.', focus: 'Roma' },
    { de: 'Quando parte il prossimo treno?', en: 'When does the next train leave?', focus: 'prossimo' },
  ]),
  gram('it-depth-pack-travel-platform', 'verb', 'A2', 'At the station: finding your train.', [
    { de: 'Da quale binario parte il treno?', en: 'From which platform does the train leave?', focus: 'binario' },
    { de: 'Il treno è in ritardo.', en: 'The train is delayed.', focus: 'ritardo' },
    { de: 'Scusi, dov\'è l\'uscita?', en: 'Excuse me, where is the exit?', focus: 'uscita' },
  ]),
  gram('it-depth-pack-travel-hotel', 'verb', 'A2', 'At the hotel: check-in.', [
    { de: 'Ho una prenotazione a nome Rossi.', en: 'I have a reservation under the name Rossi.', focus: 'prenotazione' },
    { de: 'Avete ancora una camera libera?', en: 'Do you still have a free room?', focus: 'camera' },
    { de: 'La colazione è inclusa nel prezzo.', en: 'Breakfast is included in the price.', focus: 'colazione' },
  ]),
  gram('it-depth-pack-travel-directions', 'verb', 'A2', 'Asking for directions in a city.', [
    { de: 'Scusi, come arrivo alla stazione?', en: 'Excuse me, how do I get to the station?', focus: 'stazione' },
    { de: 'Vada dritto e poi a sinistra.', en: 'Go straight ahead and then left.', focus: 'dritto' },
    { de: 'È lontano da qui?', en: 'Is it far from here?', focus: 'lontano' },
  ]),

  gram('it-depth-pack-doctor-termin', 'verb', 'A2', 'At the doctor: making an appointment.', [
    { de: 'Ho bisogno di un appuntamento dal medico.', en: 'I need an appointment with the doctor.', focus: 'appuntamento' },
    { de: 'Va bene lunedì?', en: 'Does Monday work?', focus: 'lunedì' },
    { de: 'Ho un forte mal di testa.', en: 'I have a bad headache.', focus: 'testa' },
  ]),
  gram('it-depth-pack-doctor-symptoms', 'verb', 'A2', 'Describing symptoms.', [
    { de: 'Mi fa male la schiena.', en: 'My back hurts.', focus: 'schiena' },
    { de: 'Ho febbre e tosse.', en: 'I have a fever and a cough.', focus: 'febbre' },
    { de: 'Da ieri mi sento male.', en: 'Since yesterday I have felt unwell.', focus: 'male' },
  ]),
  gram('it-depth-pack-doctor-pharmacy', 'verb', 'A2', 'At the pharmacy.', [
    { de: 'Ho bisogno di questo medicinale.', en: 'I need this medicine.', focus: 'medicinale' },
    { de: 'Avete qualcosa per il raffreddore?', en: 'Do you have something for a cold?', focus: 'raffreddore' },
    { de: 'Prenda le compresse tre volte al giorno.', en: 'Take the tablets three times a day.', focus: 'compresse' },
  ]),
  gram('it-depth-pack-doctor-advice', 'verb', 'A2', 'Doctor\'s advice.', [
    { de: 'Deve riposarsi.', en: 'You should rest.', focus: 'riposarsi' },
    { de: 'Beva molta acqua.', en: 'Drink a lot of water.', focus: 'acqua' },
    { de: 'Torni tra una settimana.', en: 'Come back in a week.', focus: 'settimana' },
  ]),

  gram('it-depth-pack-work-interview', 'verb', 'A2', 'Job interview basics.', [
    { de: 'Cerco un lavoro come programmatore.', en: 'I am looking for a job as a programmer.', focus: 'lavoro' },
    { de: 'Ho cinque anni di esperienza.', en: 'I have five years of experience.', focus: 'esperienza' },
    { de: 'Quando posso iniziare?', en: 'When can I start?', focus: 'iniziare' },
  ]),
  gram('it-depth-pack-work-office', 'verb', 'A2', 'In the office.', [
    { de: 'Oggi ho molte riunioni.', en: 'I have many meetings today.', focus: 'riunioni' },
    { de: 'Possiamo parlarne domani?', en: 'Can we discuss that tomorrow?', focus: 'parlarne' },
    { de: 'Le mando il file via email.', en: 'I will send you the file by email.', focus: 'file' },
  ]),
  gram('it-depth-pack-work-colleague', 'verb', 'A2', 'Talking with colleagues.', [
    { de: 'Puoi aiutarmi un momento?', en: 'Can you help me briefly?', focus: 'aiutarmi' },
    { de: 'Ho quasi finito il progetto.', en: 'I am almost finished with the project.', focus: 'progetto' },
    { de: 'Pranziamo insieme alla mensa.', en: 'We eat together in the canteen.', focus: 'mensa' },
  ]),
  gram('it-depth-pack-work-schedule', 'verb', 'A2', 'Work schedule and hours.', [
    { de: 'Lavoro dalle nove alle cinque.', en: 'I work from nine to five.', focus: 'nove' },
    { de: 'Venerdì lavoro da casa.', en: 'On Friday I work from home.', focus: 'casa' },
    { de: 'La prossima settimana sono in ferie.', en: 'Next week I am on holiday.', focus: 'ferie' },
  ]),
];
