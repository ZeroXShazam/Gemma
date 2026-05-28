import type { CardDef, Example, Level } from './types';

function gram(id: string, type: CardDef['type'], lv: Level, rule: string, ex: Example[], word?: string): CardDef {
  return { id, type, level: lv, rule, examples: ex, word, source: 'hand' };
}

/** Phase 4 hand-curated depth cards for thin A2 grammar sections. */
export const DEPTH_CARDS: CardDef[] = [
  // ─── Perfekt (+8) ───────────────────────────────────────────────────────────
  gram('perf-choice-haben-sein', 'perfekt', 'A2', '<b>haben</b> vs <b>sein</b> — motion/change of state → sein; most others → haben.', [
    { de: 'Ich bin schnell nach Hause gelaufen.', en: 'I ran home quickly.', focus: 'bin' },
    { de: 'Er hat den ganzen Tag gearbeitet.', en: 'He worked all day.', focus: 'hat' },
    { de: 'Wir sind spät aufgewacht.', en: 'We woke up late.', focus: 'sind' },
  ]),
  gram('perf-partizip-irregular', 'perfekt', 'A2', 'Common irregular Partizip II: <b>gelesen, geschrieben, gefunden, genommen</b>.', [
    { de: 'Ich habe das Buch schon gelesen.', en: 'I have already read the book.', focus: 'gelesen' },
    { de: 'Er hat einen Brief geschrieben.', en: 'He wrote a letter.', focus: 'geschrieben' },
    { de: 'Sie hat ihre Schlüssel nicht gefunden.', en: 'She did not find her keys.', focus: 'gefunden' },
  ]),
  gram('perf-separable', 'perfekt', 'A2', 'Separable verbs: prefix goes <em>before</em> ge- → <b>aufgestanden, angekommen</b>.', [
    { de: 'Ich bin früh aufgestanden.', en: 'I got up early.', focus: ['bin', 'aufgestanden'] },
    { de: 'Der Zug ist pünktlich angekommen.', en: 'The train arrived on time.', focus: ['ist', 'angekommen'] },
    { de: 'Er hat das Fenster aufgemacht.', en: 'He opened the window.', focus: ['hat', 'aufgemacht'] },
  ]),
  gram('perf-never', 'perfekt', 'A2', '<b>noch nie</b> + Perfekt — "have never …"', [
    { de: 'Ich habe noch nie Sushi gegessen.', en: 'I have never eaten sushi.', focus: 'noch nie' },
    { de: 'Er ist noch nie in Italien gewesen.', en: 'He has never been to Italy.', focus: 'noch nie' },
    { de: 'Wir haben uns noch nie getroffen.', en: 'We have never met.', focus: 'noch nie' },
  ]),
  gram('perf-since', 'perfekt', 'A2', '<b>seit</b> + Präsens OR <b>seit</b> + Zeit + Perfekt for ongoing states.', [
    { de: 'Ich lerne seit zwei Jahren Deutsch.', en: 'I have been learning German for two years.', focus: 'lerne' },
    { de: 'Er wohnt seit 2020 in Berlin.', en: 'He has lived in Berlin since 2020.', focus: 'wohnt' },
    { de: 'Sie arbeitet seit Januar in dieser Firma.', en: 'She has worked at this company since January.', focus: 'arbeitet' },
  ]),
  gram('perf-questions', 'perfekt', 'A2', 'Yes/no questions with Perfekt: auxiliary first.', [
    { de: 'Hast du schon gegessen?', en: 'Have you eaten yet?', focus: 'Hast' },
    { de: 'Ist er schon gegangen?', en: 'Has he already left?', focus: 'Ist' },
    { de: 'Habt ihr die Hausaufgaben gemacht?', en: 'Have you done the homework?', focus: 'Habt' },
  ]),
  gram('perf-missverstanden', 'perfekt', 'A2', 'Everyday Perfekt: <b>missverstanden, vergessen, verloren, kaputt gemacht</b>.', [
    { de: 'Entschuldigung, ich habe dich missverstanden.', en: 'Sorry, I misunderstood you.', focus: 'missverstanden' },
    { de: 'Er hat seinen Pass vergessen.', en: 'He forgot his passport.', focus: 'vergessen' },
    { de: 'Sie hat ihr Handy verloren.', en: 'She lost her phone.', focus: 'verloren' },
  ]),
  gram('perf-recent-past', 'perfekt', 'A2', 'Recent past with <b>gerade, eben, schon</b>.', [
    { de: 'Ich habe gerade gegessen.', en: 'I have just eaten.', focus: 'gerade' },
    { de: 'Er ist eben angekommen.', en: 'He has just arrived.', focus: 'eben' },
    { de: 'Wir haben schon bezahlt.', en: 'We have already paid.', focus: 'schon' },
  ]),

  // ─── Präteritum (+6) ────────────────────────────────────────────────────────
  gram('prat-narrative', 'verb', 'A2', 'Präteritum in short narratives — common in written German.', [
    { de: 'Gestern regnete es den ganzen Tag.', en: 'Yesterday it rained all day.', focus: 'regnete' },
    { de: 'Er stand früh auf und ging zur Arbeit.', en: 'He got up early and went to work.', focus: 'ging' },
    { de: 'Am Abend kochten wir zusammen.', en: 'In the evening we cooked together.', focus: 'kochten' },
  ]),
  gram('prat-schlief-trank', 'verb', 'A2', 'High-frequency Präteritum: <b>schlief, trank, aß, las</b>.', [
    { de: 'Ich schlief schlecht.', en: 'I slept badly.', focus: 'schlief' },
    { de: 'Er trank nur Wasser.', en: 'He drank only water.', focus: 'trank' },
    { de: 'Sie las bis Mitternacht.', en: 'She read until midnight.', focus: 'las' },
  ]),
  gram('prat-brachte-nahm', 'verb', 'A2', 'More Präteritum: <b>brachte, nahm, gab, half</b>.', [
    { de: 'Er brachte mir Kaffee.', en: 'He brought me coffee.', focus: 'brachte' },
    { de: 'Sie nahm den Bus.', en: 'She took the bus.', focus: 'nahm' },
    { de: 'Er half mir bei den Hausaufgaben.', en: 'He helped me with the homework.', focus: 'half' },
  ]),
  gram('prat-modals-past', 'modal', 'A2', 'Modals in Präteritum in context: <b>konnte, durfte, sollte, wollte</b>.', [
    { de: 'Ich konnte gestern nicht kommen.', en: 'I could not come yesterday.', focus: 'konnte' },
    { de: 'Als Kind durfte ich nicht lange fernsehen.', en: 'As a child I was not allowed to watch TV for long.', focus: 'durfte' },
    { de: 'Er wollte Arzt werden.', en: 'He wanted to become a doctor.', focus: 'wollte' },
  ]),
  gram('prat-war-es', 'verb', 'A2', '<b>Es war …</b> — describing past situations.', [
    { de: 'Es war kalt und windig.', en: 'It was cold and windy.', focus: 'war' },
    { de: 'Es war ein schöner Tag.', en: 'It was a beautiful day.', focus: 'war' },
    { de: 'Es war schon spät.', en: 'It was already late.', focus: 'war' },
  ]),
  gram('prat-hatte-brauchte', 'verb', 'A2', '<b>hatte / brauchte / musste</b> — past needs and obligations.', [
    { de: 'Ich hatte viel zu tun.', en: 'I had a lot to do.', focus: 'hatte' },
    { de: 'Er brauchte mehr Zeit.', en: 'He needed more time.', focus: 'brauchte' },
    { de: 'Sie musste früh aufstehen.', en: 'She had to get up early.', focus: 'musste' },
  ]),

  // ─── Reflexive (+8) ─────────────────────────────────────────────────────────
  gram('refl-erinnern-an', 'reflexive', 'A2', '<b>sich erinnern an</b> + Akk — remember (something)', [
    { de: 'Ich erinnere mich an den Tag.', en: 'I remember the day.', focus: 'mich' },
    { de: 'Er erinnert sich an seine Kindheit.', en: 'He remembers his childhood.', focus: 'sich' },
    { de: 'Erinnerst du dich an sie?', en: 'Do you remember her?', focus: 'dich' },
  ], 'erinnern'),
  gram('refl-vorbereiten', 'reflexive', 'A2', '<b>sich vorbereiten auf</b> + Akk — prepare for', [
    { de: 'Ich bereite mich auf die Prüfung vor.', en: 'I am preparing for the exam.', focus: ['bereite', 'vor'] },
    { de: 'Er bereitet sich auf das Meeting vor.', en: 'He is preparing for the meeting.', focus: ['bereitet', 'vor'] },
    { de: 'Wir bereiten uns auf den Urlaub vor.', en: 'We are preparing for the holiday.', focus: ['bereiten', 'vor'] },
  ], 'vorbereiten'),
  gram('refl-konzentrieren', 'reflexive', 'A2', '<b>sich konzentrieren auf</b> + Akk — concentrate on', [
    { de: 'Ich konzentriere mich auf die Arbeit.', en: 'I am concentrating on the work.', focus: 'mich' },
    { de: 'Kannst du dich bitte konzentrieren?', en: 'Can you please concentrate?', focus: 'dich' },
    { de: 'Er konzentriert sich auf das Problem.', en: 'He is concentrating on the problem.', focus: 'sich' },
  ], 'konzentrieren'),
  gram('refl-entscheiden', 'reflexive', 'A2', '<b>sich entscheiden für</b> + Akk — decide on', [
    { de: 'Ich entscheide mich für das rote Kleid.', en: 'I decide on the red dress.', focus: 'mich' },
    { de: 'Er hat sich für den Job entschieden.', en: 'He decided on the job.', focus: 'sich' },
    { de: 'Wofür entscheidest du dich?', en: 'What are you deciding on?', focus: 'dich' },
  ], 'entscheiden'),
  gram('refl-fuehlen', 'reflexive', 'A2', '<b>sich fühlen</b> + Adj — feel (health/mood)', [
    { de: 'Ich fühle mich heute besser.', en: 'I feel better today.', focus: 'mich' },
    { de: 'Er fühlt sich müde.', en: 'He feels tired.', focus: 'sich' },
    { de: 'Fühlst du dich krank?', en: 'Do you feel ill?', focus: 'dich' },
  ], 'fühlen'),
  gram('refl-beeilen', 'reflexive', 'A2', '<b>sich beeilen</b> — hurry up', [
    { de: 'Ich beeile mich.', en: 'I am hurrying.', focus: 'mich' },
    { de: 'Beeil dich, der Zug fährt gleich!', en: 'Hurry up, the train is leaving soon!', focus: 'dich' },
    { de: 'Wir beeilen uns.', en: 'We are hurrying.', focus: 'uns' },
  ], 'beeilen'),
  gram('refl-vorstellen', 'reflexive', 'A2', '<b>sich vorstellen</b> — imagine OR introduce oneself', [
    { de: 'Stell dir das vor!', en: 'Imagine that!', focus: 'dir' },
    { de: 'Darf ich mich vorstellen?', en: 'May I introduce myself?', focus: 'mich' },
    { de: 'Er stellt sich dem Chef vor.', en: 'He introduces himself to the boss.', focus: 'sich' },
  ], 'vorstellen'),
  gram('refl-umziehen', 'reflexive', 'A2', '<b>sich umziehen</b> — change clothes', [
    { de: 'Ich ziehe mich um.', en: 'I am changing clothes.', focus: 'mich' },
    { de: 'Er zieht sich schnell um.', en: 'He changes quickly.', focus: 'sich' },
    { de: 'Zieh dich warm an!', en: 'Dress warmly!', focus: 'dich' },
  ], 'umziehen'),

  // ─── Wechselpräpositionen (+6) ───────────────────────────────────────────────
  gram('prep-ueber-dat', 'prep', 'A2', '<b>über</b> + Dativ (Wo? / location) — "above, over"', [
    { de: 'Das Bild hängt über dem Sofa.', en: 'The picture hangs above the sofa.', focus: 'über', caseLabel: 'Dat (location)' },
    { de: 'Wir sprechen über dem Essen.', en: 'We talk over the meal.', focus: 'über', caseLabel: 'Dat (location)' },
    { de: 'Die Brücke führt über dem Fluss.', en: 'The bridge goes over the river.', focus: 'über', caseLabel: 'Dat (location)' },
  ], 'über'),
  gram('prep-ueber-akk', 'prep', 'A2', '<b>über</b> + Akkusativ (Wohin? / movement) — "across, over"', [
    { de: 'Er springt über den Zaun.', en: 'He jumps over the fence.', focus: 'über', caseLabel: 'Akk (movement)' },
    { de: 'Sie fährt über die Brücke.', en: 'She drives over the bridge.', focus: 'über', caseLabel: 'Akk (movement)' },
    { de: 'Ich lese über das Wochenende.', en: 'I read over the weekend.', focus: 'über', caseLabel: 'Akk (also: about)' },
  ], 'über'),
  gram('prep-unter-dat', 'prep', 'A2', '<b>unter</b> + Dativ (Wo?) — "under, below"', [
    { de: 'Die Katze liegt unter dem Tisch.', en: 'The cat lies under the table.', focus: 'unter', caseLabel: 'Dat (location)' },
    { de: 'Er steht unter der Brücke.', en: 'He stands under the bridge.', focus: 'unter', caseLabel: 'Dat (location)' },
    { de: 'Das Buch ist unter meinen Sachen.', en: 'The book is under my things.', focus: 'unter', caseLabel: 'Dat (location)' },
  ], 'unter'),
  gram('prep-unter-akk', 'prep', 'A2', '<b>unter</b> + Akkusativ (Wohin?) — "under"', [
    { de: 'Er legt das Buch unter den Tisch.', en: 'He puts the book under the table.', focus: 'unter', caseLabel: 'Akk (movement)' },
    { de: 'Sie stellt die Tasche unter den Sitz.', en: 'She puts the bag under the seat.', focus: 'unter', caseLabel: 'Akk (movement)' },
    { de: 'Wir gehen unter die Brücke.', en: 'We go under the bridge.', focus: 'unter', caseLabel: 'Akk (movement)' },
  ], 'unter'),
  gram('prep-vor-dat', 'prep', 'A2', '<b>vor</b> + Dativ (Wo?) — "in front of"', [
    { de: 'Das Auto steht vor dem Haus.', en: 'The car is in front of the house.', focus: 'vor', caseLabel: 'Dat (location)' },
    { de: 'Er wartet vor der Tür.', en: 'He waits in front of the door.', focus: 'vor', caseLabel: 'Dat (location)' },
    { de: 'Wir sitzen vor dem Fernseher.', en: 'We sit in front of the TV.', focus: 'vor', caseLabel: 'Dat (location)' },
  ], 'vor'),
  gram('prep-vor-akk', 'prep', 'A2', '<b>vor</b> + Akkusativ (Wohin?) — "in front of"', [
    { de: 'Er stellt das Fahrrad vor das Haus.', en: 'He puts the bike in front of the house.', focus: 'vor', caseLabel: 'Akk (movement)' },
    { de: 'Sie fährt vor die Schule.', en: 'She drives up to the school.', focus: 'vor', caseLabel: 'Akk (movement)' },
    { de: 'Stell dich vor mich!', en: 'Stand in front of me!', focus: 'vor', caseLabel: 'Akk (movement)' },
  ], 'vor'),

  // ─── Clauses (+5) ───────────────────────────────────────────────────────────
  gram('conj-weil-word-order', 'conjunction', 'A2', '<b>weil</b> — verb must go to the <em>end</em> of the clause.', [
    { de: 'Ich bleibe zu Hause, weil ich krank bin.', en: 'I stay home because I am ill.', focus: 'weil' },
    { de: 'Er lernt Deutsch, weil er in Berlin arbeitet.', en: 'He learns German because he works in Berlin.', focus: 'weil' },
    { de: 'Sie isst nicht, weil sie keinen Hunger hat.', en: 'She does not eat because she is not hungry.', focus: 'weil' },
  ], 'weil'),
  gram('conj-dass-indirect', 'conjunction', 'A2', '<b>dass</b> after verbs of thinking/saying — verb to end.', [
    { de: 'Ich denke, dass er Recht hat.', en: 'I think that he is right.', focus: 'dass' },
    { de: 'Sie glaubt, dass es morgen regnet.', en: 'She believes that it will rain tomorrow.', focus: 'dass' },
    { de: 'Er meint, dass das zu teuer ist.', en: 'He thinks that is too expensive.', focus: 'dass' },
  ], 'dass'),
  gram('conj-wenn-conditional', 'conjunction', 'A2', '<b>wenn</b> — "if/whenever" (condition or repeated event).', [
    { de: 'Wenn du Zeit hast, ruf mich an.', en: 'If you have time, call me.', focus: 'wenn' },
    { de: 'Wenn es warm ist, gehen wir schwimmen.', en: 'When it is warm, we go swimming.', focus: 'wenn' },
    { de: 'Ich helfe dir, wenn ich kann.', en: 'I help you when I can.', focus: 'wenn' },
  ], 'wenn'),
  gram('conj-obwohl', 'conjunction', 'A2', '<b>obwohl</b> — "although" → verb to end (contrast).', [
    { de: 'Obwohl es regnet, gehe ich spazieren.', en: 'Although it is raining, I go for a walk.', focus: 'Obwohl' },
    { de: 'Er arbeitet, obwohl er müde ist.', en: 'He works although he is tired.', focus: 'obwohl' },
    { de: 'Sie lacht, obwohl sie traurig ist.', en: 'She laughs although she is sad.', focus: 'obwohl' },
  ], 'obwohl'),
  gram('conj-dass-vs-ob', 'conjunction', 'A2', '<b>dass</b> = that (statement) · <b>ob</b> = whether (yes/no).', [
    { de: 'Ich hoffe, dass du kommst.', en: 'I hope that you are coming.', focus: 'dass' },
    { de: 'Ich weiß nicht, ob er kommt.', en: 'I do not know whether he is coming.', focus: 'ob' },
    { de: 'Sie fragt, ob ich Zeit habe.', en: 'She asks whether I have time.', focus: 'ob' },
  ]),

  // ─── Adjective endings (+7) ───────────────────────────────────────────────────
  gram('adj-kein-m-nom', 'adjective', 'A2', '<b>kein</b> + adj ending · masc. Nom.: <b>-er</b> (kein gut<b>er</b> Mann)', [
    { de: 'Das ist kein guter Kaffee.', en: 'That is not good coffee.', focus: 'kein' },
    { de: 'Er ist kein schlechter Mensch.', en: 'He is not a bad person.', focus: 'kein' },
    { de: 'Das ist kein großer Fehler.', en: 'That is not a big mistake.', focus: 'kein' },
  ]),
  gram('adj-kein-f-akk', 'adjective', 'A2', '<b>keine</b> + adj · fem. Akk.: <b>-e</b> (keine gut<b>e</b> Idee)', [
    { de: 'Ich habe keine gute Idee.', en: 'I have no good idea.', focus: 'keine' },
    { de: 'Er hat keine neue Adresse.', en: 'He has no new address.', focus: 'keine' },
    { de: 'Sie trinkt keine kalte Milch.', en: 'She drinks no cold milk.', focus: 'keine' },
  ]),
  gram('adj-def-plural', 'adjective', 'A2', 'Definite plural: <b>die</b> + adj <b>-en</b> (die alt<b>en</b> Häuser)', [
    { de: 'Die alten Häuser sind schön.', en: 'The old houses are beautiful.', focus: 'alten' },
    { de: 'Ich mag die grünen Äpfel.', en: 'I like the green apples.', focus: 'grünen' },
    { de: 'Die jungen Leute tanzen.', en: 'The young people are dancing.', focus: 'jungen' },
  ]),
  gram('adj-nach-dem', 'adjective', 'A2', 'After <b>dem/der/den</b> (Dat/weak): ending always <b>-en</b>.', [
    { de: 'Mit dem alten Mann spreche ich gern.', en: 'I like talking with the old man.', focus: 'alten' },
    { de: 'In der großen Stadt wohne ich.', en: 'I live in the big city.', focus: 'großen' },
    { de: 'Bei den netten Nachbarn fühle ich mich wohl.', en: 'I feel comfortable with the nice neighbours.', focus: 'netten' },
  ]),
  gram('adj-without-article', 'adjective', 'A2', 'No article (strong endings): <b>Frischer</b> Kaffee schmeckt gut.', [
    { de: 'Frischer Kaffee schmeckt am besten.', en: 'Fresh coffee tastes best.', focus: 'Frischer' },
    { de: 'Kaltes Wasser ist gesund.', en: 'Cold water is healthy.', focus: 'Kaltes' },
    { de: 'Deutsche Sprache ist nicht leicht.', en: 'German is not easy.', focus: 'Deutsche' },
  ]),
  gram('adj-comparative-ending', 'adjective', 'A2', 'Comparative + noun: <b>-er</b> + weak ending <b>-en/-e</b>.', [
    { de: 'Ein besserer Plan wäre gut.', en: 'A better plan would be good.', focus: 'besserer' },
    { de: 'Sie hat eine größere Wohnung.', en: 'She has a bigger apartment.', focus: 'größere' },
    { de: 'Er kauft ein billigeres Auto.', en: 'He buys a cheaper car.', focus: 'billigeres' },
  ]),
  gram('adj-ein-neuter-akk', 'adjective', 'A2', '<b>ein</b> + neuter Akk.: adj <b>-es</b> (ein klein<b>es</b> Kind)', [
    { de: 'Ich kaufe ein kleines Geschenk.', en: 'I buy a small gift.', focus: 'ein' },
    { de: 'Er liest ein interessantes Buch.', en: 'He reads an interesting book.', focus: 'ein' },
    { de: 'Sie sucht ein neues Handy.', en: 'She is looking for a new phone.', focus: 'ein' },
  ]),

  // ─── Dative (+8) ────────────────────────────────────────────────────────────
  gram('dat-helfen', 'pronoun', 'A1', '<b>helfen</b> + Dativ — help someone', [
    { de: 'Kannst du mir helfen?', en: 'Can you help me?', focus: 'mir' },
    { de: 'Er hilft seiner Mutter.', en: 'He helps his mother.', focus: 'seiner' },
    { de: 'Wir helfen den Kindern.', en: 'We help the children.', focus: 'den' },
  ], 'helfen'),
  gram('dat-geben', 'pronoun', 'A1', '<b>geben</b> + Dativ + Akk — give someone something', [
    { de: 'Ich gebe dir das Buch.', en: 'I give you the book.', focus: 'dir' },
    { de: 'Er gibt mir einen Kaffee.', en: 'He gives me a coffee.', focus: 'mir' },
    { de: 'Sie gibt ihm das Geld.', en: 'She gives him the money.', focus: 'ihm' },
  ], 'geben'),
  gram('dat-mit', 'prep', 'A1', '<b>mit</b> + Dativ — with (always dative)', [
    { de: 'Ich fahre mit dem Bus.', en: 'I travel by bus.', focus: 'mit' },
    { de: 'Er spricht mit mir.', en: 'He speaks with me.', focus: 'mit' },
    { de: 'Wir gehen mit den Freunden.', en: 'We go with the friends.', focus: 'mit' },
  ], 'mit'),
  gram('dat-antworten', 'verb', 'A2', '<b>antworten</b> + Dativ — answer someone', [
    { de: 'Er antwortet mir nicht.', en: 'He does not answer me.', focus: 'mir' },
    { de: 'Ich antworte dir später.', en: 'I answer you later.', focus: 'dir' },
    { de: 'Sie antwortet dem Chef.', en: 'She answers the boss.', focus: 'dem' },
  ], 'antworten'),
  gram('dat-danken', 'verb', 'A2', '<b>danken</b> + Dativ — thank someone', [
    { de: 'Ich danke dir für die Hilfe.', en: 'I thank you for the help.', focus: 'dir' },
    { de: 'Er dankt seinen Eltern.', en: 'He thanks his parents.', focus: 'seinen' },
    { de: 'Wir danken Ihnen herzlich.', en: 'We thank you warmly.', focus: 'Ihnen' },
  ], 'danken'),
  gram('dat-gefallen', 'verb', 'A2', '<b>gefallen</b> + Dativ — please / appeal to someone', [
    { de: 'Das Kleid gefällt mir.', en: 'I like the dress.', focus: 'mir' },
    { de: 'Der Film gefällt ihm nicht.', en: 'He does not like the film.', focus: 'ihm' },
    { de: 'Die Idee gefällt uns.', en: 'We like the idea.', focus: 'uns' },
  ], 'gefallen'),
  gram('dat-gratulieren', 'verb', 'A2', '<b>gratulieren</b> + Dativ — congratulate someone', [
    { de: 'Ich gratuliere dir zum Geburtstag!', en: 'Congratulations on your birthday!', focus: 'dir' },
    { de: 'Wir gratulieren Ihnen zur Beförderung.', en: 'We congratulate you on the promotion.', focus: 'Ihnen' },
    { de: 'Er gratuliert seiner Schwester.', en: 'He congratulates his sister.', focus: 'seiner' },
  ], 'gratulieren'),
  gram('dat-passieren', 'verb', 'A2', '<b>passieren</b> + Dativ — happen to someone', [
    { de: 'Was ist dir passiert?', en: 'What happened to you?', focus: 'dir' },
    { de: 'Das ist ihm nie passiert.', en: 'That never happened to him.', focus: 'ihm' },
    { de: 'Ist dir etwas passiert?', en: 'Did something happen to you?', focus: 'dir' },
  ], 'passieren'),

  // ─── Sentence packs: travel (+4) ────────────────────────────────────────────
  gram('pack-travel-ticket', 'verb', 'A2', 'At the station: buying a ticket.', [
    { de: 'Ich möchte eine Fahrkarte nach München.', en: 'I would like a ticket to Munich.', focus: 'Fahrkarte' },
    { de: 'Einmal nach Berlin, bitte.', en: 'One to Berlin, please.', focus: 'Berlin' },
    { de: 'Wann fährt der nächste Zug?', en: 'When does the next train leave?', focus: 'nächste' },
  ]),
  gram('pack-travel-platform', 'verb', 'A2', 'At the station: finding your train.', [
    { de: 'Von welchem Gleis fährt der Zug?', en: 'From which platform does the train leave?', focus: 'Gleis' },
    { de: 'Der Zug hat Verspätung.', en: 'The train is delayed.', focus: 'Verspätung' },
    { de: 'Entschuldigung, wo ist der Ausgang?', en: 'Excuse me, where is the exit?', focus: 'Ausgang' },
  ]),
  gram('pack-travel-hotel', 'verb', 'A2', 'At the hotel: check-in.', [
    { de: 'Ich habe eine Reservierung auf den Namen Schmidt.', en: 'I have a reservation under the name Schmidt.', focus: 'Reservierung' },
    { de: 'Haben Sie noch ein freies Zimmer?', en: 'Do you still have a free room?', focus: 'Zimmer' },
    { de: 'Frühstück ist im Preis enthalten.', en: 'Breakfast is included in the price.', focus: 'Frühstück' },
  ]),
  gram('pack-travel-directions', 'verb', 'A2', 'Asking for directions in a city.', [
    { de: 'Entschuldigung, wie komme ich zum Bahnhof?', en: 'Excuse me, how do I get to the station?', focus: 'Bahnhof' },
    { de: 'Gehen Sie geradeaus und dann links.', en: 'Go straight ahead and then left.', focus: 'geradeaus' },
    { de: 'Ist es weit von hier?', en: 'Is it far from here?', focus: 'weit' },
  ]),

  // ─── Sentence packs: doctor (+4) ────────────────────────────────────────────
  gram('pack-doctor-termin', 'verb', 'A2', 'At the doctor: making an appointment.', [
    { de: 'Ich brauche einen Termin beim Arzt.', en: 'I need an appointment with the doctor.', focus: 'Termin' },
    { de: 'Geht es am Montag?', en: 'Does Monday work?', focus: 'Montag' },
    { de: 'Ich habe starke Kopfschmerzen.', en: 'I have a bad headache.', focus: 'Kopfschmerzen' },
  ]),
  gram('pack-doctor-symptoms', 'verb', 'A2', 'Describing symptoms.', [
    { de: 'Mir tut der Rücken weh.', en: 'My back hurts.', focus: 'Rücken' },
    { de: 'Ich habe Fieber und Husten.', en: 'I have a fever and a cough.', focus: 'Fieber' },
    { de: 'Seit gestern fühle ich mich schlecht.', en: 'Since yesterday I have felt unwell.', focus: 'schlecht' },
  ]),
  gram('pack-doctor-prescription', 'verb', 'A2', 'At the pharmacy.', [
    { de: 'Ich brauche dieses Medikament.', en: 'I need this medicine.', focus: 'Medikament' },
    { de: 'Haben Sie etwas gegen Erkältung?', en: 'Do you have something for a cold?', focus: 'Erkältung' },
    { de: 'Nehmen Sie die Tabletten dreimal täglich.', en: 'Take the tablets three times a day.', focus: 'Tabletten' },
  ]),
  gram('pack-doctor-advice', 'verb', 'A2', 'Doctor\'s advice.', [
    { de: 'Sie sollten sich ausruhen.', en: 'You should rest.', focus: 'ausruhen' },
    { de: 'Trinken Sie viel Wasser.', en: 'Drink a lot of water.', focus: 'Wasser' },
    { de: 'Kommen Sie in einer Woche wieder.', en: 'Come back in a week.', focus: 'Woche' },
  ]),

  // ─── Sentence packs: work (+4) ──────────────────────────────────────────────
  gram('pack-work-interview', 'verb', 'A2', 'Job interview basics.', [
    { de: 'Ich suche eine Stelle als Programmierer.', en: 'I am looking for a job as a programmer.', focus: 'Stelle' },
    { de: 'Ich habe fünf Jahre Erfahrung.', en: 'I have five years of experience.', focus: 'Erfahrung' },
    { de: 'Wann kann ich anfangen?', en: 'When can I start?', focus: 'anfangen' },
  ]),
  gram('pack-work-office', 'verb', 'A2', 'In the office.', [
    { de: 'Ich habe heute viele Meetings.', en: 'I have many meetings today.', focus: 'Meetings' },
    { de: 'Können wir das morgen besprechen?', en: 'Can we discuss that tomorrow?', focus: 'besprechen' },
    { de: 'Ich schicke Ihnen die Datei per E-Mail.', en: 'I will send you the file by email.', focus: 'Datei' },
  ]),
  gram('pack-work-colleague', 'verb', 'A2', 'Talking with colleagues.', [
    { de: 'Kannst du mir kurz helfen?', en: 'Can you help me briefly?', focus: 'helfen' },
    { de: 'Ich bin mit dem Projekt fast fertig.', en: 'I am almost finished with the project.', focus: 'fertig' },
    { de: 'Wir essen zusammen in der Kantine.', en: 'We eat together in the canteen.', focus: 'Kantine' },
  ]),
  gram('pack-work-schedule', 'verb', 'A2', 'Work schedule and hours.', [
    { de: 'Ich arbeite von neun bis fünf.', en: 'I work from nine to five.', focus: 'neun' },
    { de: 'Am Freitag arbeite ich von zu Hause.', en: 'On Friday I work from home.', focus: 'Hause' },
    { de: 'Nächste Woche habe ich Urlaub.', en: 'Next week I am on holiday.', focus: 'Urlaub' },
  ]),
];
