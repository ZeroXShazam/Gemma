import type { CardDef, Conjugations, Example, Level } from './types';
import { CARDS_GENERATED } from './cards-generated';
import { DEPTH_CARDS } from './cards-depth';
export { ALL_TYPES } from './types';

function verb(id: string, lv: Level, v: string, c: Conjugations, prat: string, perf: string, ex: Example[]): CardDef {
  return { id, language: 'de', type: 'verb', level: lv, verb: v, conjugations: c, praeteritum: prat, perfekt: perf, examples: ex, source: 'hand' };
}
type Art = 'der'|'die'|'das';
type Cas = 'nom'|'akk'|'dat';
const POSS_FORMS: Record<string, Record<Art, Record<Cas, string>>> = {
  mein:  { der:{nom:'mein', akk:'meinen', dat:'meinem'}, die:{nom:'meine', akk:'meine', dat:'meiner'}, das:{nom:'mein', akk:'mein', dat:'meinem'} },
  dein:  { der:{nom:'dein', akk:'deinen', dat:'deinem'}, die:{nom:'deine', akk:'deine', dat:'deiner'}, das:{nom:'dein', akk:'dein', dat:'deinem'} },
  sein:  { der:{nom:'sein', akk:'seinen', dat:'seinem'}, die:{nom:'seine', akk:'seine', dat:'seiner'}, das:{nom:'sein', akk:'sein', dat:'seinem'} },
  ihr:   { der:{nom:'ihr',  akk:'ihren',  dat:'ihrem'},  die:{nom:'ihre',  akk:'ihre',  dat:'ihrer'},  das:{nom:'ihr',  akk:'ihr',  dat:'ihrem'}  },
  unser: { der:{nom:'unser',akk:'unseren',dat:'unserem'},die:{nom:'unsere',akk:'unsere',dat:'unserer'},das:{nom:'unser',akk:'unser',dat:'unserem'} },
  euer:  { der:{nom:'euer', akk:'euren',  dat:'eurem'},  die:{nom:'eure',  akk:'eure',  dat:'eurer'},  das:{nom:'euer', akk:'euer', dat:'eurem'}  },
  Ihr:   { der:{nom:'Ihr',  akk:'Ihren',  dat:'Ihrem'},  die:{nom:'Ihre',  akk:'Ihre',  dat:'Ihrer'},  das:{nom:'Ihr',  akk:'Ihr',  dat:'Ihrem'}  },
}
const POSS_EN: Record<string, string> = {
  mein:'my', dein:'your', sein:'his', ihr:'her', unser:'our', euer:'your (pl.)', Ihr:'your (formal)',
}

function genPossEx(art: Art, n: string, enN: string): Example[] {
  const exs: Example[] = []
  for (const [poss, byArt] of Object.entries(POSS_FORMS)) {
    const f = byArt[art], en = POSS_EN[poss]
    exs.push(
      { de:`Das ist ${f.nom} ${n}.`,       en:`That is ${en} ${enN}.`,       focus:f.nom, caseLabel:'Nom' },
      { de:`Ich habe ${f.akk} ${n}.`,      en:`I have ${en} ${enN}.`,        focus:f.akk, caseLabel:'Akk' },
      { de:`Ich spreche von ${f.dat} ${n}.`,en:`I speak about ${en} ${enN}.`,focus:f.dat, caseLabel:'Dat' },
    )
  }
  return exs
}

function noun(id: string, art: Art, n: string, forms: {nom:string;akk:string;dat:string}, pl: string, enN: string, ex: Example[]): CardDef {
  return { id, language: 'de', type: 'noun', level: 'A1', article: art, noun: n, nounForms: forms, plural: pl, examples: [...ex, ...genPossEx(art, n, enN)], source: 'hand' };
}
function gram(id: string, type: CardDef['type'], lv: Level, rule: string, ex: Example[], word?: string): CardDef {
  return { id, language: 'de', type, level: lv, rule, examples: ex, word, source: 'hand' };
}

// ─── VERBS ────────────────────────────────────────────────────────────────────

const VERBS: CardDef[] = [
  verb('verb-sein','A1','sein',{ich:'bin',du:'bist',er:'ist',wir:'sind',ihr:'seid',sie:'sind'},'war','ist gewesen',[
    {de:'Ich bin müde.',en:'I am tired.',focus:'bin',subject:'ich'},
    {de:'Er ist Arzt.',en:'He is a doctor.',focus:'ist',subject:'er'},
    {de:'Wir sind zu Hause.',en:'We are at home.',focus:'sind',subject:'wir'},
  ]),
  verb('verb-haben','A1','haben',{ich:'habe',du:'hast',er:'hat',wir:'haben',ihr:'habt',sie:'haben'},'hatte','hat gehabt',[
    {de:'Ich habe einen Hund.',en:'I have a dog.',focus:'habe',subject:'ich'},
    {de:'Sie hat keine Zeit.',en:'She has no time.',focus:'hat',subject:'er'},
    {de:'Habt ihr Hunger?',en:'Are you (pl.) hungry?',focus:'habt',subject:'ihr'},
  ]),
  verb('verb-gehen','A1','gehen',{ich:'gehe',du:'gehst',er:'geht',wir:'gehen',ihr:'geht',sie:'gehen'},'ging','ist gegangen',[
    {de:'Ich gehe nach Hause.',en:'I am going home.',focus:'gehe',subject:'ich'},
    {de:'Er geht in die Schule.',en:'He goes to school.',focus:'geht',subject:'er'},
    {de:'Wir gehen spazieren.',en:'We are going for a walk.',focus:'gehen',subject:'wir'},
  ]),
  verb('verb-kommen','A1','kommen',{ich:'komme',du:'kommst',er:'kommt',wir:'kommen',ihr:'kommt',sie:'kommen'},'kam','ist gekommen',[
    {de:'Ich komme aus Deutschland.',en:'I come from Germany.',focus:'komme',subject:'ich'},
    {de:'Du kommst zu spät.',en:'You are coming too late.',focus:'kommst',subject:'du'},
    {de:'Sie kommen morgen.',en:'They are coming tomorrow.',focus:'kommen',subject:'sie'},
  ]),
  verb('verb-lesen','A1','lesen',{ich:'lese',du:'liest',er:'liest',wir:'lesen',ihr:'lest',sie:'lesen'},'las','hat gelesen',[
    {de:'Ich lese ein Buch.',en:'I am reading a book.',focus:'lese',subject:'ich'},
    {de:'Sie liest die Zeitung.',en:'She reads the newspaper.',focus:'liest',subject:'er'},
    {de:'Wir lesen gern Romane.',en:'We like to read novels.',focus:'lesen',subject:'wir'},
  ]),
  verb('verb-essen','A1','essen',{ich:'esse',du:'isst',er:'isst',wir:'essen',ihr:'esst',sie:'essen'},'aß','hat gegessen',[
    {de:'Ich esse einen Apfel.',en:'I am eating an apple.',focus:'esse',subject:'ich'},
    {de:'Er isst Pizza.',en:'He eats pizza.',focus:'isst',subject:'er'},
    {de:'Wir essen zu Abend.',en:'We are having dinner.',focus:'essen',subject:'wir'},
  ]),
  verb('verb-trinken','A1','trinken',{ich:'trinke',du:'trinkst',er:'trinkt',wir:'trinken',ihr:'trinkt',sie:'trinken'},'trank','hat getrunken',[
    {de:'Ich trinke Kaffee.',en:'I drink coffee.',focus:'trinke',subject:'ich'},
    {de:'Du trinkst zu viel.',en:'You drink too much.',focus:'trinkst',subject:'du'},
    {de:'Er trinkt ein Glas Wasser.',en:'He drinks a glass of water.',focus:'trinkt',subject:'er'},
  ]),
  verb('verb-fahren','A1','fahren',{ich:'fahre',du:'fährst',er:'fährt',wir:'fahren',ihr:'fahrt',sie:'fahren'},'fuhr','ist gefahren',[
    {de:'Ich fahre mit dem Bus.',en:'I travel by bus.',focus:'fahre',subject:'ich'},
    {de:'Er fährt nach Berlin.',en:'He is driving to Berlin.',focus:'fährt',subject:'er'},
    {de:'Wir fahren in den Urlaub.',en:'We are going on holiday.',focus:'fahren',subject:'wir'},
  ]),
  verb('verb-sprechen','A1','sprechen',{ich:'spreche',du:'sprichst',er:'spricht',wir:'sprechen',ihr:'sprecht',sie:'sprechen'},'sprach','hat gesprochen',[
    {de:'Ich spreche Deutsch.',en:'I speak German.',focus:'spreche',subject:'ich'},
    {de:'Er spricht sehr leise.',en:'He speaks very quietly.',focus:'spricht',subject:'er'},
    {de:'Wir sprechen über das Problem.',en:'We are talking about the problem.',focus:'sprechen',subject:'wir'},
  ]),
  verb('verb-sehen','A1','sehen',{ich:'sehe',du:'siehst',er:'sieht',wir:'sehen',ihr:'seht',sie:'sehen'},'sah','hat gesehen',[
    {de:'Ich sehe einen Film.',en:'I am watching a film.',focus:'sehe',subject:'ich'},
    {de:'Du siehst müde aus.',en:'You look tired.',focus:'siehst',subject:'du'},
    {de:'Er sieht das Problem.',en:'He sees the problem.',focus:'sieht',subject:'er'},
  ]),
  verb('verb-nehmen','A1','nehmen',{ich:'nehme',du:'nimmst',er:'nimmt',wir:'nehmen',ihr:'nehmt',sie:'nehmen'},'nahm','hat genommen',[
    {de:'Ich nehme den Zug.',en:'I am taking the train.',focus:'nehme',subject:'ich'},
    {de:'Er nimmt das Buch.',en:'He takes the book.',focus:'nimmt',subject:'er'},
    {de:'Wir nehmen ein Taxi.',en:'We are taking a taxi.',focus:'nehmen',subject:'wir'},
  ]),
  verb('verb-geben','A1','geben',{ich:'gebe',du:'gibst',er:'gibt',wir:'geben',ihr:'gebt',sie:'geben'},'gab','hat gegeben',[
    {de:'Ich gebe dir das Geld.',en:'I give you the money.',focus:'gebe',subject:'ich'},
    {de:'Er gibt mir einen Rat.',en:'He gives me advice.',focus:'gibt',subject:'er'},
    {de:'Sie geben uns Zeit.',en:'They give us time.',focus:'geben',subject:'sie'},
  ]),
  verb('verb-finden','A1','finden',{ich:'finde',du:'findest',er:'findet',wir:'finden',ihr:'findet',sie:'finden'},'fand','hat gefunden',[
    {de:'Ich finde das toll.',en:'I find that great.',focus:'finde',subject:'ich'},
    {de:'Er findet seinen Schlüssel nicht.',en:'He cannot find his key.',focus:'findet',subject:'er'},
    {de:'Wir finden die Lösung.',en:'We find the solution.',focus:'finden',subject:'wir'},
  ]),
  verb('verb-wissen','A1','wissen',{ich:'weiß',du:'weißt',er:'weiß',wir:'wissen',ihr:'wisst',sie:'wissen'},'wusste','hat gewusst',[
    {de:'Ich weiß es nicht.',en:'I do not know.',focus:'weiß',subject:'ich'},
    {de:'Weißt du die Antwort?',en:'Do you know the answer?',focus:'weißt',subject:'du'},
    {de:'Wir wissen, wo er ist.',en:'We know where he is.',focus:'wissen',subject:'wir'},
  ]),
  verb('verb-machen','A1','machen',{ich:'mache',du:'machst',er:'macht',wir:'machen',ihr:'macht',sie:'machen'},'machte','hat gemacht',[
    {de:'Ich mache meine Hausaufgaben.',en:'I am doing my homework.',focus:'mache',subject:'ich'},
    {de:'Er macht einen Fehler.',en:'He makes a mistake.',focus:'macht',subject:'er'},
    {de:'Was machen Sie beruflich?',en:'What do you do for a living?',focus:'machen',subject:'sie'},
  ]),
  verb('verb-arbeiten','A1','arbeiten',{ich:'arbeite',du:'arbeitest',er:'arbeitet',wir:'arbeiten',ihr:'arbeitet',sie:'arbeiten'},'arbeitete','hat gearbeitet',[
    {de:'Ich arbeite bei einer Bank.',en:'I work at a bank.',focus:'arbeite',subject:'ich'},
    {de:'Er arbeitet viel.',en:'He works a lot.',focus:'arbeitet',subject:'er'},
    {de:'Wir arbeiten zusammen.',en:'We work together.',focus:'arbeiten',subject:'wir'},
  ]),
  verb('verb-wohnen','A1','wohnen',{ich:'wohne',du:'wohnst',er:'wohnt',wir:'wohnen',ihr:'wohnt',sie:'wohnen'},'wohnte','hat gewohnt',[
    {de:'Ich wohne in Berlin.',en:'I live in Berlin.',focus:'wohne',subject:'ich'},
    {de:'Sie wohnt in einer kleinen Wohnung.',en:'She lives in a small apartment.',focus:'wohnt',subject:'er'},
    {de:'Wo wohnen Sie?',en:'Where do you live?',focus:'wohnen',subject:'sie'},
  ]),
  verb('verb-lernen','A1','lernen',{ich:'lerne',du:'lernst',er:'lernt',wir:'lernen',ihr:'lernt',sie:'lernen'},'lernte','hat gelernt',[
    {de:'Ich lerne Deutsch.',en:'I am learning German.',focus:'lerne',subject:'ich'},
    {de:'Du lernst sehr fleißig.',en:'You study very diligently.',focus:'lernst',subject:'du'},
    {de:'Wir lernen jeden Tag.',en:'We learn every day.',focus:'lernen',subject:'wir'},
  ]),
  verb('verb-heißen','A1','heißen',{ich:'heiße',du:'heißt',er:'heißt',wir:'heißen',ihr:'heißt',sie:'heißen'},'hieß','hat geheißen',[
    {de:'Ich heiße Maria.',en:'My name is Maria.',focus:'heiße',subject:'ich'},
    {de:'Wie heißt du?',en:'What is your name?',focus:'heißt',subject:'du'},
    {de:'Wie heißt die Stadt?',en:'What is the city called?',focus:'heißt',subject:'er'},
  ]),
  verb('verb-helfen','A1','helfen',{ich:'helfe',du:'hilfst',er:'hilft',wir:'helfen',ihr:'helft',sie:'helfen'},'half','hat geholfen',[
    {de:'Ich helfe dir gern.',en:'I am happy to help you.',focus:'helfe',subject:'ich'},
    {de:'Er hilft seiner Mutter.',en:'He helps his mother.',focus:'hilft',subject:'er'},
    {de:'Könnt ihr mir helfen?',en:'Can you (pl.) help me?',focus:'helfen',subject:'ihr'},
  ]),
  verb('verb-schlafen','A1','schlafen',{ich:'schlafe',du:'schläfst',er:'schläft',wir:'schlafen',ihr:'schlaft',sie:'schlafen'},'schlief','hat geschlafen',[
    {de:'Ich schlafe acht Stunden.',en:'I sleep eight hours.',focus:'schlafe',subject:'ich'},
    {de:'Das Baby schläft.',en:'The baby is sleeping.',focus:'schläft',subject:'er'},
    {de:'Wir schlafen gut hier.',en:'We sleep well here.',focus:'schlafen',subject:'wir'},
  ]),
  verb('verb-verstehen','A2','verstehen',{ich:'verstehe',du:'verstehst',er:'versteht',wir:'verstehen',ihr:'versteht',sie:'verstehen'},'verstand','hat verstanden',[
    {de:'Ich verstehe das nicht.',en:'I do not understand that.',focus:'verstehe',subject:'ich'},
    {de:'Verstehst du die Frage?',en:'Do you understand the question?',focus:'verstehst',subject:'du'},
    {de:'Er versteht kein Englisch.',en:'He does not understand English.',focus:'versteht',subject:'er'},
  ]),
  verb('verb-bleiben','A2','bleiben',{ich:'bleibe',du:'bleibst',er:'bleibt',wir:'bleiben',ihr:'bleibt',sie:'bleiben'},'blieb','ist geblieben',[
    {de:'Ich bleibe zu Hause.',en:'I am staying at home.',focus:'bleibe',subject:'ich'},
    {de:'Er bleibt drei Tage.',en:'He is staying for three days.',focus:'bleibt',subject:'er'},
    {de:'Wir bleiben in Kontakt.',en:'We stay in contact.',focus:'bleiben',subject:'wir'},
  ]),
  verb('verb-treffen','A2','treffen',{ich:'treffe',du:'triffst',er:'trifft',wir:'treffen',ihr:'trefft',sie:'treffen'},'traf','hat getroffen',[
    {de:'Ich treffe meine Freunde.',en:'I am meeting my friends.',focus:'treffe',subject:'ich'},
    {de:'Er trifft sie um drei Uhr.',en:'He meets her at three o\'clock.',focus:'trifft',subject:'er'},
    {de:'Wir treffen uns im Café.',en:'We are meeting at the café.',focus:'treffen',subject:'wir'},
  ]),
  verb('verb-denken','A2','denken',{ich:'denke',du:'denkst',er:'denkt',wir:'denken',ihr:'denkt',sie:'denken'},'dachte','hat gedacht',[
    {de:'Ich denke oft an dich.',en:'I think of you often.',focus:'denke',subject:'ich'},
    {de:'Er denkt nach.',en:'He is thinking it over.',focus:'denkt',subject:'er'},
    {de:'Wir denken, dass es gut ist.',en:'We think it is good.',focus:'denken',subject:'wir'},
  ]),
  verb('verb-schreiben','A2','schreiben',{ich:'schreibe',du:'schreibst',er:'schreibt',wir:'schreiben',ihr:'schreibt',sie:'schreiben'},'schrieb','hat geschrieben',[
    {de:'Ich schreibe einen Brief.',en:'I am writing a letter.',focus:'schreibe',subject:'ich'},
    {de:'Du schreibst sehr schön.',en:'You write very beautifully.',focus:'schreibst',subject:'du'},
    {de:'Er schreibt eine E-Mail.',en:'He is writing an email.',focus:'schreibt',subject:'er'},
  ]),
  verb('verb-bringen','A2','bringen',{ich:'bringe',du:'bringst',er:'bringt',wir:'bringen',ihr:'bringt',sie:'bringen'},'brachte','hat gebracht',[
    {de:'Ich bringe dir etwas mit.',en:'I am bringing you something.',focus:'bringe',subject:'ich'},
    {de:'Er bringt das Essen.',en:'He brings the food.',focus:'bringt',subject:'er'},
    {de:'Sie bringen uns Kaffee.',en:'They bring us coffee.',focus:'bringen',subject:'sie'},
  ]),
  verb('verb-laufen','A2','laufen',{ich:'laufe',du:'läufst',er:'läuft',wir:'laufen',ihr:'lauft',sie:'laufen'},'lief','ist gelaufen',[
    {de:'Ich laufe jeden Morgen.',en:'I run every morning.',focus:'laufe',subject:'ich'},
    {de:'Das Kind läuft schnell.',en:'The child runs fast.',focus:'läuft',subject:'er'},
    {de:'Wir laufen durch den Park.',en:'We run through the park.',focus:'laufen',subject:'wir'},
  ]),
];

// ─── NOUNS ────────────────────────────────────────────────────────────────────

const NOUNS: CardDef[] = [
  noun('noun-mann','der','Mann',{nom:'der',akk:'den',dat:'dem'},'Männer','man',[
    {de:'Der Mann ist groß.',en:'The man is tall.',focus:'Der',caseLabel:'Nom'},
    {de:'Ich sehe den Mann.',en:'I see the man.',focus:'den',caseLabel:'Akk'},
    {de:'Ich spreche mit dem Mann.',en:'I speak with the man.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-frau','die','Frau',{nom:'die',akk:'die',dat:'der'},'Frauen','woman',[
    {de:'Die Frau lächelt.',en:'The woman smiles.',focus:'Die',caseLabel:'Nom'},
    {de:'Er liebt die Frau.',en:'He loves the woman.',focus:'die',caseLabel:'Akk'},
    {de:'Er hilft der Frau.',en:'He helps the woman.',focus:'der',caseLabel:'Dat'},
  ]),
  noun('noun-kind','das','Kind',{nom:'das',akk:'das',dat:'dem'},'Kinder','child',[
    {de:'Das Kind spielt draußen.',en:'The child plays outside.',focus:'Das',caseLabel:'Nom'},
    {de:'Ich sehe das Kind.',en:'I see the child.',focus:'das',caseLabel:'Akk'},
    {de:'Sie liest dem Kind vor.',en:'She reads to the child.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-buch','das','Buch',{nom:'das',akk:'das',dat:'dem'},'Bücher','book',[
    {de:'Das Buch ist interessant.',en:'The book is interesting.',focus:'Das',caseLabel:'Nom'},
    {de:'Sie liest das Buch.',en:'She is reading the book.',focus:'das',caseLabel:'Akk'},
    {de:'Er spricht von dem Buch.',en:'He speaks about the book.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-wein','der','Wein',{nom:'der',akk:'den',dat:'dem'},'Weine','wine',[
    {de:'Der Wein schmeckt gut.',en:'The wine tastes good.',focus:'Der',caseLabel:'Nom'},
    {de:'Ich trinke den Wein.',en:'I drink the wine.',focus:'den',caseLabel:'Akk'},
    {de:'Sie spricht von dem Wein.',en:'She speaks about the wine.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-wasser','das','Wasser',{nom:'das',akk:'das',dat:'dem'},'Wässer','water',[
    {de:'Das Wasser ist kalt.',en:'The water is cold.',focus:'Das',caseLabel:'Nom'},
    {de:'Ich trinke das Wasser.',en:'I drink the water.',focus:'das',caseLabel:'Akk'},
    {de:'Er kocht mit dem Wasser.',en:'He cooks with the water.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-haus','das','Haus',{nom:'das',akk:'das',dat:'dem'},'Häuser','house',[
    {de:'Das Haus ist groß.',en:'The house is big.',focus:'Das',caseLabel:'Nom'},
    {de:'Wir kaufen das Haus.',en:'We are buying the house.',focus:'das',caseLabel:'Akk'},
    {de:'Er wartet vor dem Haus.',en:'He waits in front of the house.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-auto','das','Auto',{nom:'das',akk:'das',dat:'dem'},'Autos','car',[
    {de:'Das Auto fährt schnell.',en:'The car drives fast.',focus:'Das',caseLabel:'Nom'},
    {de:'Er kauft das Auto.',en:'He buys the car.',focus:'das',caseLabel:'Akk'},
    {de:'Sie fährt mit dem Auto.',en:'She travels by car.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-tisch','der','Tisch',{nom:'der',akk:'den',dat:'dem'},'Tische','table',[
    {de:'Der Tisch ist neu.',en:'The table is new.',focus:'Der',caseLabel:'Nom'},
    {de:'Wir brauchen den Tisch.',en:'We need the table.',focus:'den',caseLabel:'Akk'},
    {de:'Das Buch liegt auf dem Tisch.',en:'The book lies on the table.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-hund','der','Hund',{nom:'der',akk:'den',dat:'dem'},'Hunde','dog',[
    {de:'Der Hund bellt laut.',en:'The dog barks loudly.',focus:'Der',caseLabel:'Nom'},
    {de:'Sie hat den Hund gefunden.',en:'She found the dog.',focus:'den',caseLabel:'Akk'},
    {de:'Er gibt dem Hund Wasser.',en:'He gives the dog water.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-katze','die','Katze',{nom:'die',akk:'die',dat:'der'},'Katzen','cat',[
    {de:'Die Katze schläft.',en:'The cat is sleeping.',focus:'Die',caseLabel:'Nom'},
    {de:'Ich mag die Katze.',en:'I like the cat.',focus:'die',caseLabel:'Akk'},
    {de:'Sie spielt mit der Katze.',en:'She plays with the cat.',focus:'der',caseLabel:'Dat'},
  ]),
  noun('noun-apfel','der','Apfel',{nom:'der',akk:'den',dat:'dem'},'Äpfel','apple',[
    {de:'Der Apfel ist rot.',en:'The apple is red.',focus:'Der',caseLabel:'Nom'},
    {de:'Er isst den Apfel.',en:'He eats the apple.',focus:'den',caseLabel:'Akk'},
    {de:'Sie macht Saft mit dem Apfel.',en:'She makes juice with the apple.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-brot','das','Brot',{nom:'das',akk:'das',dat:'dem'},'Brote','bread',[
    {de:'Das Brot ist frisch.',en:'The bread is fresh.',focus:'Das',caseLabel:'Nom'},
    {de:'Ich kaufe das Brot.',en:'I buy the bread.',focus:'das',caseLabel:'Akk'},
    {de:'Er macht ein Sandwich mit dem Brot.',en:'He makes a sandwich with the bread.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-zeit','die','Zeit',{nom:'die',akk:'die',dat:'der'},'Zeiten','time',[
    {de:'Die Zeit vergeht schnell.',en:'Time passes quickly.',focus:'Die',caseLabel:'Nom'},
    {de:'Ich habe keine die Zeit.',en:'I have no time.',focus:'die',caseLabel:'Akk'},
    {de:'Sie spricht von der Zeit.',en:'She speaks about time.',focus:'der',caseLabel:'Dat'},
  ]),
  noun('noun-tag','der','Tag',{nom:'der',akk:'den',dat:'dem'},'Tage','day',[
    {de:'Der Tag war schön.',en:'The day was beautiful.',focus:'Der',caseLabel:'Nom'},
    {de:'Ich genieße den Tag.',en:'I enjoy the day.',focus:'den',caseLabel:'Akk'},
    {de:'Er denkt an dem Tag.',en:'He thinks about that day.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-geld','das','Geld',{nom:'das',akk:'das',dat:'dem'},'Gelder','money',[
    {de:'Das Geld liegt auf dem Tisch.',en:'The money is on the table.',focus:'Das',caseLabel:'Nom'},
    {de:'Er braucht das Geld.',en:'He needs the money.',focus:'das',caseLabel:'Akk'},
    {de:'Mit dem Geld kaufe ich ein Buch.',en:'With the money I buy a book.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-tür','die','Tür',{nom:'die',akk:'die',dat:'der'},'Türen','door',[
    {de:'Die Tür ist geschlossen.',en:'The door is closed.',focus:'Die',caseLabel:'Nom'},
    {de:'Er öffnet die Tür.',en:'He opens the door.',focus:'die',caseLabel:'Akk'},
    {de:'Sie steht vor der Tür.',en:'She stands in front of the door.',focus:'der',caseLabel:'Dat'},
  ]),
  noun('noun-schule','die','Schule',{nom:'die',akk:'die',dat:'der'},'Schulen','school',[
    {de:'Die Schule beginnt um acht Uhr.',en:'School starts at eight o\'clock.',focus:'Die',caseLabel:'Nom'},
    {de:'Er mag die Schule nicht.',en:'He does not like school.',focus:'die',caseLabel:'Akk'},
    {de:'Sie wartet vor der Schule.',en:'She waits in front of the school.',focus:'der',caseLabel:'Dat'},
  ]),
  noun('noun-stadt','die','Stadt',{nom:'die',akk:'die',dat:'der'},'Städte','city',[
    {de:'Die Stadt ist groß.',en:'The city is big.',focus:'Die',caseLabel:'Nom'},
    {de:'Ich besuche die Stadt.',en:'I visit the city.',focus:'die',caseLabel:'Akk'},
    {de:'Er wohnt in der Stadt.',en:'He lives in the city.',focus:'der',caseLabel:'Dat'},
  ]),
  noun('noun-kaffee','der','Kaffee',{nom:'der',akk:'den',dat:'dem'},'Kaffees','coffee',[
    {de:'Der Kaffee ist heiß.',en:'The coffee is hot.',focus:'Der',caseLabel:'Nom'},
    {de:'Ich trinke den Kaffee.',en:'I drink the coffee.',focus:'den',caseLabel:'Akk'},
    {de:'Er macht eine Pause mit dem Kaffee.',en:'He takes a break with the coffee.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-zug','der','Zug',{nom:'der',akk:'den',dat:'dem'},'Züge','train',[
    {de:'Der Zug kommt pünktlich.',en:'The train arrives on time.',focus:'Der',caseLabel:'Nom'},
    {de:'Sie nimmt den Zug.',en:'She takes the train.',focus:'den',caseLabel:'Akk'},
    {de:'Ich fahre mit dem Zug.',en:'I travel by train.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-bus','der','Bus',{nom:'der',akk:'den',dat:'dem'},'Busse','bus',[
    {de:'Der Bus fährt ab.',en:'The bus departs.',focus:'Der',caseLabel:'Nom'},
    {de:'Ich nehme den Bus.',en:'I take the bus.',focus:'den',caseLabel:'Akk'},
    {de:'Sie fährt mit dem Bus.',en:'She travels by bus.',focus:'dem',caseLabel:'Dat'},
  ]),
  noun('noun-arbeit','die','Arbeit',{nom:'die',akk:'die',dat:'der'},'Arbeiten','work',[
    {de:'Die Arbeit macht Spaß.',en:'The work is fun.',focus:'Die',caseLabel:'Nom'},
    {de:'Er sucht die Arbeit.',en:'He is looking for work.',focus:'die',caseLabel:'Akk'},
    {de:'Sie kommt von der Arbeit.',en:'She comes from work.',focus:'der',caseLabel:'Dat'},
  ]),
  noun('noun-familie','die','Familie',{nom:'die',akk:'die',dat:'der'},'Familien','family',[
    {de:'Die Familie ist wichtig.',en:'The family is important.',focus:'Die',caseLabel:'Nom'},
    {de:'Er besucht die Familie.',en:'He visits the family.',focus:'die',caseLabel:'Akk'},
    {de:'Sie spricht von der Familie.',en:'She speaks about the family.',focus:'der',caseLabel:'Dat'},
  ]),
  noun('noun-straße','die','Straße',{nom:'die',akk:'die',dat:'der'},'Straßen','street',[
    {de:'Die Straße ist lang.',en:'The street is long.',focus:'Die',caseLabel:'Nom'},
    {de:'Er überquert die Straße.',en:'He crosses the street.',focus:'die',caseLabel:'Akk'},
    {de:'Sie wohnt in der Straße.',en:'She lives in the street.',focus:'der',caseLabel:'Dat'},
  ]),
];

// ─── PREPOSITIONS ──────────────────────────────────────────────────────────────

const PREPS: CardDef[] = [
  gram('prep-mit','prep','A1','<b>mit</b> + Dativ — "with, by means of"',[
    {de:'Ich fahre mit dem Bus.',en:'I travel by bus.',focus:'mit'},
    {de:'Er trinkt Kaffee mit Milch.',en:'He drinks coffee with milk.',focus:'mit'},
    {de:'Sie geht mit ihrer Freundin.',en:'She goes with her friend.',focus:'mit'},
  ],'mit'),
  gram('prep-aus','prep','A1','<b>aus</b> + Dativ — "out of, from (origin)"',[
    {de:'Er kommt aus Deutschland.',en:'He comes from Germany.',focus:'aus'},
    {de:'Sie trinkt Wasser aus einer Flasche.',en:'She drinks water from a bottle.',focus:'aus'},
    {de:'Das Tisch ist aus Holz.',en:'The table is made of wood.',focus:'aus'},
  ],'aus'),
  gram('prep-zu','prep','A1','<b>zu</b> + Dativ — "to (a person/place), for"',[
    {de:'Ich gehe zu meiner Mutter.',en:'I am going to my mother\'s.',focus:'zu'},
    {de:'Er geht zu Fuß.',en:'He goes on foot.',focus:'zu'},
    {de:'Sie kommt zu mir.',en:'She is coming to my place.',focus:'zu'},
  ],'zu'),
  gram('prep-nach','prep','A1','<b>nach</b> + Dativ — "to (cities/countries), after"',[
    {de:'Wir fahren nach Berlin.',en:'We are travelling to Berlin.',focus:'nach'},
    {de:'Er kommt nach Hause.',en:'He is coming home.',focus:'nach'},
    {de:'Nach dem Essen schläft sie.',en:'She sleeps after the meal.',focus:'nach'},
  ],'nach'),
  gram('prep-bei','prep','A1','<b>bei</b> + Dativ — "at, near, at the place of"',[
    {de:'Ich wohne bei meinen Eltern.',en:'I live with my parents.',focus:'bei'},
    {de:'Er arbeitet bei einer Firma.',en:'He works at a company.',focus:'bei'},
    {de:'Sie wartet bei dem Eingang.',en:'She waits by the entrance.',focus:'bei'},
  ],'bei'),
  gram('prep-von','prep','A1','<b>von</b> + Dativ — "from, of, by"',[
    {de:'Er kommt von der Arbeit.',en:'He comes from work.',focus:'von'},
    {de:'Das ist ein Geschenk von mir.',en:'That is a gift from me.',focus:'von'},
    {de:'Sie spricht von dem Film.',en:'She speaks about the film.',focus:'von'},
  ],'von'),
  gram('prep-seit','prep','A2','<b>seit</b> + Dativ — "since, for (ongoing duration)"',[
    {de:'Ich lerne seit zwei Jahren Deutsch.',en:'I have been learning German for two years.',focus:'seit'},
    {de:'Er wohnt seit 2020 hier.',en:'He has lived here since 2020.',focus:'seit'},
    {de:'Sie kennt ihn seit einem Jahr.',en:'She has known him for a year.',focus:'seit'},
  ],'seit'),
  gram('prep-für','prep','A1','<b>für</b> + Akkusativ — "for"',[
    {de:'Das ist für dich.',en:'That is for you.',focus:'für'},
    {de:'Er kauft ein Geschenk für seine Mutter.',en:'He buys a gift for his mother.',focus:'für'},
    {de:'Ich lerne für die Prüfung.',en:'I study for the exam.',focus:'für'},
  ],'für'),
  gram('prep-ohne','prep','A1','<b>ohne</b> + Akkusativ — "without"',[
    {de:'Er trinkt Kaffee ohne Zucker.',en:'He drinks coffee without sugar.',focus:'ohne'},
    {de:'Sie geht ohne Mantel raus.',en:'She goes out without a coat.',focus:'ohne'},
    {de:'Ich kann nicht ohne dich leben.',en:'I cannot live without you.',focus:'ohne'},
  ],'ohne'),
  gram('prep-durch','prep','A2','<b>durch</b> + Akkusativ — "through, by means of"',[
    {de:'Er geht durch den Park.',en:'He walks through the park.',focus:'durch'},
    {de:'Wir fahren durch die Stadt.',en:'We drive through the city.',focus:'durch'},
    {de:'Sie lernt Deutsch durch Filme.',en:'She learns German through films.',focus:'durch'},
  ],'durch'),
  gram('prep-gegen','prep','A2','<b>gegen</b> + Akkusativ — "against, around (time)"',[
    {de:'Er ist gegen den Plan.',en:'He is against the plan.',focus:'gegen'},
    {de:'Wir spielen gegen das andere Team.',en:'We play against the other team.',focus:'gegen'},
    {de:'Sie kommt gegen Abend.',en:'She comes around evening.',focus:'gegen'},
  ],'gegen'),
  gram('prep-um','prep','A1','<b>um</b> + Akkusativ — "around, at (time)"',[
    {de:'Der Bus fährt um acht Uhr.',en:'The bus leaves at eight o\'clock.',focus:'um'},
    {de:'Wir gehen um den See.',en:'We walk around the lake.',focus:'um'},
    {de:'Sie bittet ihn um Hilfe.',en:'She asks him for help.',focus:'um'},
  ],'um'),
  gram('prep-in-dat','prep','A1','<b>in</b> + Dativ (Wo? / location) — "in, inside"',[
    {de:'Er arbeitet in der Schule.',en:'He works in the school.',focus:'in'},
    {de:'Das Buch liegt in dem Regal.',en:'The book is in the shelf.',focus:'in'},
    {de:'Sie wohnt in der Stadt.',en:'She lives in the city.',focus:'in'},
  ],'in'),
  gram('prep-auf-dat','prep','A1','<b>auf</b> + Dativ (Wo? / location) — "on top of"',[
    {de:'Das Buch liegt auf dem Tisch.',en:'The book lies on the table.',focus:'auf'},
    {de:'Er sitzt auf dem Stuhl.',en:'He sits on the chair.',focus:'auf'},
    {de:'Die Katze schläft auf dem Sofa.',en:'The cat sleeps on the sofa.',focus:'auf'},
  ],'auf'),
  gram('prep-an-dat','prep','A1','<b>an</b> + Dativ (Wo? / location) — "at, on (vertical surface)"',[
    {de:'Das Bild hängt an der Wand.',en:'The picture hangs on the wall.',focus:'an'},
    {de:'Er sitzt an dem Fenster.',en:'He sits at the window.',focus:'an'},
    {de:'Sie wartet an der Haltestelle.',en:'She waits at the bus stop.',focus:'an'},
  ],'an'),
  gram('prep-in-akk','prep','A2','<b>in</b> + Akkusativ (Wohin? / movement) — "into, to"',[
    {de:'Ich gehe in die Schule.',en:'I am going to school.',focus:'in',caseLabel:'Akk (movement)'},
    {de:'Er fährt in die Stadt.',en:'He is driving into the city.',focus:'in',caseLabel:'Akk (movement)'},
    {de:'Sie legt das Buch in den Rucksack.',en:'She puts the book in the backpack.',focus:'in',caseLabel:'Akk (movement)'},
  ],'in'),
  gram('prep-an-akk','prep','A2','<b>an</b> + Akkusativ (Wohin? / movement) — "to, onto"',[
    {de:'Ich hänge das Bild an die Wand.',en:'I hang the picture on the wall.',focus:'an',caseLabel:'Akk (movement)'},
    {de:'Er stellt die Flasche an den Tisch.',en:'He puts the bottle on the table.',focus:'an',caseLabel:'Akk (movement)'},
    {de:'Sie fährt an den See.',en:'She drives to the lake.',focus:'an',caseLabel:'Akk (movement)'},
  ],'an'),
  gram('prep-auf-akk','prep','A2','<b>auf</b> + Akkusativ (Wohin? / movement) — "onto, onto"',[
    {de:'Ich lege das Buch auf den Tisch.',en:'I put the book on the table.',focus:'auf',caseLabel:'Akk (movement)'},
    {de:'Er setzt sich auf den Stuhl.',en:'He sits down on the chair.',focus:'auf',caseLabel:'Akk (movement)'},
    {de:'Sie stellt die Tasse auf das Regal.',en:'She puts the cup on the shelf.',focus:'auf',caseLabel:'Akk (movement)'},
  ],'auf'),
];

// ─── WH-WORDS ─────────────────────────────────────────────────────────────────

const WH: CardDef[] = [
  gram('wh-was','wh','A1','<b>Was</b> — "what" (Akkusativ object or predicate)',[
    {de:'Was machst du?',en:'What are you doing?',focus:'Was'},
    {de:'Was ist das?',en:'What is that?',focus:'Was'},
    {de:'Ich weiß nicht, was das bedeutet.',en:'I don\'t know what that means.',focus:'was'},
  ],'was'),
  gram('wh-wer','wh','A1','<b>Wer</b> — "who" (Nominativ subject)',[
    {de:'Wer ist das?',en:'Who is that?',focus:'Wer'},
    {de:'Wer spricht?',en:'Who is speaking?',focus:'Wer'},
    {de:'Ich frage, wer das gemacht hat.',en:'I ask who did that.',focus:'wer'},
  ],'wer'),
  gram('wh-wen','wh','A1','<b>Wen</b> — "whom" (Akkusativ object)',[
    {de:'Wen liebst du?',en:'Whom do you love?',focus:'Wen'},
    {de:'Wen siehst du?',en:'Whom do you see?',focus:'Wen'},
    {de:'Wen hat er angerufen?',en:'Whom did he call?',focus:'Wen'},
  ],'wen'),
  gram('wh-wem','wh','A2','<b>Wem</b> — "to whom" (Dativ object)',[
    {de:'Wem gibst du das?',en:'To whom are you giving that?',focus:'Wem'},
    {de:'Mit wem sprichst du?',en:'With whom are you speaking?',focus:'wem'},
    {de:'Wem hilfst du?',en:'Whom are you helping?',focus:'Wem'},
  ],'wem'),
  gram('wh-wo','wh','A1','<b>Wo</b> — "where" (location, static)',[
    {de:'Wo wohnst du?',en:'Where do you live?',focus:'Wo'},
    {de:'Wo ist das Buch?',en:'Where is the book?',focus:'Wo'},
    {de:'Ich weiß nicht, wo er ist.',en:'I don\'t know where he is.',focus:'wo'},
  ],'wo'),
  gram('wh-wohin','wh','A1','<b>Wohin</b> — "where to" (direction, motion)',[
    {de:'Wohin gehst du?',en:'Where are you going?',focus:'Wohin'},
    {de:'Wohin fährt der Zug?',en:'Where does the train go?',focus:'Wohin'},
    {de:'Ich weiß nicht, wohin wir fahren.',en:'I don\'t know where we are going.',focus:'wohin'},
  ],'wohin'),
  gram('wh-woher','wh','A1','<b>Woher</b> — "where from" (origin)',[
    {de:'Woher kommst du?',en:'Where are you from?',focus:'Woher'},
    {de:'Woher weißt du das?',en:'How do you know that?',focus:'Woher'},
    {de:'Woher ist er?',en:'Where is he from?',focus:'Woher'},
  ],'woher'),
  gram('wh-wann','wh','A1','<b>Wann</b> — "when" (point in time)',[
    {de:'Wann kommst du?',en:'When are you coming?',focus:'Wann'},
    {de:'Wann beginnt der Film?',en:'When does the film start?',focus:'Wann'},
    {de:'Ich weiß nicht, wann er kommt.',en:'I don\'t know when he is coming.',focus:'wann'},
  ],'wann'),
  gram('wh-warum','wh','A1','<b>Warum</b> — "why" (reason)',[
    {de:'Warum lernst du Deutsch?',en:'Why are you learning German?',focus:'Warum'},
    {de:'Warum lachst du?',en:'Why are you laughing?',focus:'Warum'},
    {de:'Ich verstehe nicht, warum er geht.',en:'I don\'t understand why he is leaving.',focus:'warum'},
  ],'warum'),
  gram('wh-wie','wh','A1','<b>Wie</b> — "how, what ... like"',[
    {de:'Wie heißt du?',en:'What is your name?',focus:'Wie'},
    {de:'Wie geht es dir?',en:'How are you?',focus:'Wie'},
    {de:'Wie alt bist du?',en:'How old are you?',focus:'Wie'},
  ],'wie'),
  gram('wh-welcher','wh','A2','<b>Welch-</b> — "which, what kind of" (declines like definite article)',[
    {de:'Welcher Bus fährt nach Berlin?',en:'Which bus goes to Berlin?',focus:'Welcher'},
    {de:'Welches Buch liest du?',en:'Which book are you reading?',focus:'Welches'},
    {de:'Welche Farbe magst du?',en:'Which colour do you like?',focus:'Welche'},
  ],'welcher'),
];

// ─── PRONOUNS ────────────────────────────────────────────────────────────────

const PRONOUNS: CardDef[] = [
  gram('pron-mich','pronoun','A1','<b>mich</b> — 1st person singular Akkusativ',[
    {de:'Er liebt mich.',en:'He loves me.',focus:'mich'},
    {de:'Siehst du mich?',en:'Do you see me?',focus:'mich'},
    {de:'Sie ruft mich an.',en:'She calls me.',focus:'mich'},
  ],'mich'),
  gram('pron-mir','pronoun','A1','<b>mir</b> — 1st person singular Dativ',[
    {de:'Er hilft mir.',en:'He helps me.',focus:'mir'},
    {de:'Das gefällt mir.',en:'I like that.',focus:'mir'},
    {de:'Gibst du mir das Buch?',en:'Are you giving me the book?',focus:'mir'},
  ],'mir'),
  gram('pron-dich','pronoun','A1','<b>dich</b> — 2nd person singular Akkusativ',[
    {de:'Ich liebe dich.',en:'I love you.',focus:'dich'},
    {de:'Sie sieht dich.',en:'She sees you.',focus:'dich'},
    {de:'Er vermisst dich.',en:'He misses you.',focus:'dich'},
  ],'dich'),
  gram('pron-dir','pronoun','A1','<b>dir</b> — 2nd person singular Dativ',[
    {de:'Ich helfe dir.',en:'I help you.',focus:'dir'},
    {de:'Das gehört dir.',en:'That belongs to you.',focus:'dir'},
    {de:'Er schreibt dir einen Brief.',en:'He writes you a letter.',focus:'dir'},
  ],'dir'),
  gram('pron-ihn','pronoun','A1','<b>ihn</b> — 3rd person singular masculine Akkusativ',[
    {de:'Ich sehe ihn.',en:'I see him.',focus:'ihn'},
    {de:'Sie liebt ihn.',en:'She loves him.',focus:'ihn'},
    {de:'Er kennt ihn gut.',en:'He knows him well.',focus:'ihn'},
  ],'ihn'),
  gram('pron-ihm','pronoun','A1','<b>ihm</b> — 3rd person singular masculine/neuter Dativ',[
    {de:'Ich gebe ihm das Buch.',en:'I give him the book.',focus:'ihm'},
    {de:'Sie hilft ihm.',en:'She helps him.',focus:'ihm'},
    {de:'Das gefällt ihm.',en:'He likes that.',focus:'ihm'},
  ],'ihm'),
  gram('pron-sie-akk','pronoun','A1','<b>sie</b> — 3rd person singular feminine Akkusativ',[
    {de:'Ich mag sie.',en:'I like her.',focus:'sie'},
    {de:'Er trifft sie.',en:'He meets her.',focus:'sie'},
    {de:'Wir sehen sie jeden Tag.',en:'We see her every day.',focus:'sie'},
  ],'sie'),
  gram('pron-ihr-dat','pronoun','A1','<b>ihr</b> — 3rd person singular feminine Dativ',[
    {de:'Ich helfe ihr.',en:'I help her.',focus:'ihr'},
    {de:'Das gehört ihr.',en:'That belongs to her.',focus:'ihr'},
    {de:'Er gibt ihr ein Geschenk.',en:'He gives her a gift.',focus:'ihr'},
  ],'ihr'),
  gram('pron-uns','pronoun','A1','<b>uns</b> — 1st person plural Akkusativ/Dativ',[
    {de:'Er besucht uns.',en:'He visits us.',focus:'uns'},
    {de:'Kannst du uns helfen?',en:'Can you help us?',focus:'uns'},
    {de:'Das macht uns glücklich.',en:'That makes us happy.',focus:'uns'},
  ],'uns'),
  gram('pron-euch','pronoun','A1','<b>euch</b> — 2nd person plural Akkusativ/Dativ',[
    {de:'Ich vermisse euch.',en:'I miss you (all).',focus:'euch'},
    {de:'Er sieht euch morgen.',en:'He sees you (all) tomorrow.',focus:'euch'},
    {de:'Sie hilft euch.',en:'She helps you (all).',focus:'euch'},
  ],'euch'),
  gram('pron-ihnen','pronoun','A2','<b>ihnen</b> — 3rd person plural Dativ',[
    {de:'Ich gebe ihnen das Geld.',en:'I give them the money.',focus:'ihnen'},
    {de:'Kannst du ihnen helfen?',en:'Can you help them?',focus:'ihnen'},
    {de:'Das gehört ihnen.',en:'That belongs to them.',focus:'ihnen'},
  ],'ihnen'),
];

// ─── POSSESSIVES ──────────────────────────────────────────────────────────────

const POSSESSIVES: CardDef[] = [
  gram('poss-mein-m','possessive','A1','<b>mein</b> — my (masc. Nom. / neut. Nom./Akk.)',[
    {de:'Mein Vater ist Arzt.',en:'My father is a doctor.',focus:'Mein'},
    {de:'Mein Bruder wohnt in Berlin.',en:'My brother lives in Berlin.',focus:'Mein'},
    {de:'Ich esse mein Brot.',en:'I eat my bread.',focus:'mein'},
  ],'mein'),
  gram('poss-meine','possessive','A1','<b>meine</b> — my (fem. Nom./Akk. · pl. Nom./Akk.)',[
    {de:'Meine Mutter kocht gut.',en:'My mother cooks well.',focus:'Meine'},
    {de:'Ich liebe meine Katze.',en:'I love my cat.',focus:'meine'},
    {de:'Meine Freunde sind nett.',en:'My friends are nice.',focus:'Meine'},
  ],'meine'),
  gram('poss-meinen','possessive','A2','<b>meinen</b> — my (masc. Akk.)',[
    {de:'Ich liebe meinen Bruder.',en:'I love my brother.',focus:'meinen'},
    {de:'Hast du meinen Schlüssel gesehen?',en:'Have you seen my key?',focus:'meinen'},
    {de:'Sie kennt meinen Vater.',en:'She knows my father.',focus:'meinen'},
  ],'meinen'),
  gram('poss-meinem','possessive','A2','<b>meinem</b> — my (masc./neut. Dat.)',[
    {de:'Er hilft meinem Vater.',en:'He helps my father.',focus:'meinem'},
    {de:'Sie spricht mit meinem Bruder.',en:'She speaks with my brother.',focus:'meinem'},
    {de:'Ich fahre mit meinem Auto.',en:'I drive my car.',focus:'meinem'},
  ],'meinem'),
  gram('poss-dein','possessive','A1','<b>dein</b> — your (masc. Nom. / neut. Nom./Akk.), informal sg.',[
    {de:'Dein Buch liegt hier.',en:'Your book is here.',focus:'Dein'},
    {de:'Wo ist dein Hund?',en:'Where is your dog?',focus:'dein'},
    {de:'Dein Kind ist süß.',en:'Your child is cute.',focus:'Dein'},
  ],'dein'),
  gram('poss-sein','possessive','A1','<b>sein</b> — his (masc. Nom. / neut. Nom./Akk.)',[
    {de:'Sein Hund ist groß.',en:'His dog is big.',focus:'Sein'},
    {de:'Sein Auto ist neu.',en:'His car is new.',focus:'Sein'},
    {de:'Er liest sein Buch.',en:'He reads his book.',focus:'sein'},
  ],'sein'),
  gram('poss-ihre','possessive','A1','<b>ihre</b> — her (fem. Nom./Akk. · pl. Nom./Akk.)',[
    {de:'Ihre Katze ist süß.',en:'Her cat is cute.',focus:'Ihre'},
    {de:'Er liebt ihre Stimme.',en:'He loves her voice.',focus:'ihre'},
    {de:'Ihre Freunde kommen.',en:'Her friends are coming.',focus:'Ihre'},
  ],'ihre'),
  gram('poss-unser','possessive','A2','<b>unser</b> — our (masc. Nom. / neut. Nom./Akk.)',[
    {de:'Unser Lehrer ist nett.',en:'Our teacher is nice.',focus:'Unser'},
    {de:'Unser Haus ist groß.',en:'Our house is big.',focus:'Unser'},
    {de:'Wir essen unser Brot.',en:'We eat our bread.',focus:'unser'},
  ],'unser'),
];

// ─── ADJECTIVE ENDINGS ────────────────────────────────────────────────────────

const ADJECTIVES: CardDef[] = [
  gram('adj-def-m-nom','adjective','A2','Definite article · masculine Nom.: <b>-e</b> (der alt<b>e</b> Mann)',[
    {de:'Der alte Mann sitzt dort.',en:'The old man sits there.',focus:'alte'},
    {de:'Der große Hund bellt.',en:'The big dog barks.',focus:'große'},
    {de:'Der neue Zug ist schnell.',en:'The new train is fast.',focus:'neue'},
  ]),
  gram('adj-def-m-akk','adjective','A2','Definite article · masculine Akk.: <b>-en</b> (den alt<b>en</b> Mann)',[
    {de:'Ich sehe den alten Mann.',en:'I see the old man.',focus:'alten'},
    {de:'Sie liebt den großen Hund.',en:'She loves the big dog.',focus:'großen'},
    {de:'Er nimmt den roten Apfel.',en:'He takes the red apple.',focus:'roten'},
  ]),
  gram('adj-def-f-nom','adjective','A2','Definite article · feminine Nom.: <b>-e</b> (die alt<b>e</b> Frau)',[
    {de:'Die alte Frau lächelt.',en:'The old woman smiles.',focus:'alte'},
    {de:'Die neue Schule ist modern.',en:'The new school is modern.',focus:'neue'},
    {de:'Die kleine Katze schläft.',en:'The small cat is sleeping.',focus:'kleine'},
  ]),
  gram('adj-def-dat','adjective','A2','Definite article · Dativ (all genders): <b>-en</b>',[
    {de:'Er hilft dem alten Mann.',en:'He helps the old man.',focus:'alten'},
    {de:'Sie spricht mit der netten Frau.',en:'She speaks with the nice woman.',focus:'netten'},
    {de:'Das Buch liegt in dem roten Regal.',en:'The book is in the red shelf.',focus:'roten'},
  ]),
  gram('adj-indef-m-nom','adjective','A2','Indefinite article · masculine Nom.: <b>-er</b> (ein alt<b>er</b> Mann)',[
    {de:'Ein alter Mann sitzt dort.',en:'An old man sits there.',focus:'alter'},
    {de:'Ein großer Hund bellt.',en:'A big dog barks.',focus:'großer'},
    {de:'Ein neuer Zug kommt.',en:'A new train comes.',focus:'neuer'},
  ]),
  gram('adj-indef-n-nom','adjective','A2','Indefinite article · neuter Nom./Akk.: <b>-es</b> (ein klein<b>es</b> Kind)',[
    {de:'Ein kleines Kind lacht.',en:'A small child laughs.',focus:'kleines'},
    {de:'Ich habe ein neues Auto.',en:'I have a new car.',focus:'neues'},
    {de:'Das ist ein gutes Buch.',en:'That is a good book.',focus:'gutes'},
  ]),
  gram('adj-indef-m-akk','adjective','A2','Indefinite article · masculine Akk.: <b>-en</b> (einen alt<b>en</b> Mann)',[
    {de:'Ich kaufe einen roten Apfel.',en:'I buy a red apple.',focus:'roten'},
    {de:'Sie sieht einen großen Hund.',en:'She sees a big dog.',focus:'großen'},
    {de:'Er hat einen neuen Job.',en:'He has a new job.',focus:'neuen'},
  ]),
  gram('adj-indef-f-nom','adjective','A2','Indefinite article · feminine Nom.: <b>-e</b> (eine alt<b>e</b> Frau)',[
    {de:'Eine alte Frau wartet dort.',en:'An old woman waits there.',focus:'alte'},
    {de:'Eine nette Lehrerin erklärt es.',en:'A nice teacher explains it.',focus:'nette'},
    {de:'Eine kleine Katze schläft.',en:'A small cat is sleeping.',focus:'kleine'},
  ]),
];

// ─── MODALS ───────────────────────────────────────────────────────────────────

const MODALS: CardDef[] = [
  { id:'modal-können', type:'modal', level:'A1', verb:'können',
    conjugations:{ich:'kann',du:'kannst',er:'kann',wir:'können',ihr:'könnt',sie:'können'},
    praeteritum:'konnte', perfekt:'hat gekonnt',
    examples:[
      {de:'Ich kann gut schwimmen.',en:'I can swim well.',focus:'kann',subject:'ich'},
      {de:'Kannst du mir helfen?',en:'Can you help me?',focus:'Kannst',subject:'du'},
      {de:'Er kann kein Deutsch.',en:'He cannot speak German.',focus:'kann',subject:'er'},
    ]},
  { id:'modal-müssen', type:'modal', level:'A1', verb:'müssen',
    conjugations:{ich:'muss',du:'musst',er:'muss',wir:'müssen',ihr:'müsst',sie:'müssen'},
    praeteritum:'musste', perfekt:'hat gemusst',
    examples:[
      {de:'Ich muss jetzt gehen.',en:'I must go now.',focus:'muss',subject:'ich'},
      {de:'Du musst mehr lernen.',en:'You must study more.',focus:'musst',subject:'du'},
      {de:'Er muss früh aufstehen.',en:'He must get up early.',focus:'muss',subject:'er'},
    ]},
  { id:'modal-wollen', type:'modal', level:'A1', verb:'wollen',
    conjugations:{ich:'will',du:'willst',er:'will',wir:'wollen',ihr:'wollt',sie:'wollen'},
    praeteritum:'wollte', perfekt:'hat gewollt',
    examples:[
      {de:'Ich will nach Hause gehen.',en:'I want to go home.',focus:'will',subject:'ich'},
      {de:'Willst du Kaffee trinken?',en:'Do you want to drink coffee?',focus:'Willst',subject:'du'},
      {de:'Sie will Ärztin werden.',en:'She wants to become a doctor.',focus:'will',subject:'er'},
    ]},
  { id:'modal-sollen', type:'modal', level:'A2', verb:'sollen',
    conjugations:{ich:'soll',du:'sollst',er:'soll',wir:'sollen',ihr:'sollt',sie:'sollen'},
    praeteritum:'sollte', perfekt:'hat gesollt',
    examples:[
      {de:'Ich soll das Fenster schließen.',en:'I am supposed to close the window.',focus:'soll',subject:'ich'},
      {de:'Du sollst nicht lügen.',en:'You shall not lie.',focus:'sollst',subject:'du'},
      {de:'Er soll um 8 Uhr kommen.',en:'He is supposed to come at 8 o\'clock.',focus:'soll',subject:'er'},
    ]},
  { id:'modal-dürfen', type:'modal', level:'A2', verb:'dürfen',
    conjugations:{ich:'darf',du:'darfst',er:'darf',wir:'dürfen',ihr:'dürft',sie:'dürfen'},
    praeteritum:'durfte', perfekt:'hat gedurft',
    examples:[
      {de:'Ich darf hier nicht parken.',en:'I am not allowed to park here.',focus:'darf',subject:'ich'},
      {de:'Darfst du das essen?',en:'Are you allowed to eat that?',focus:'Darfst',subject:'du'},
      {de:'Er darf das Zimmer verlassen.',en:'He is allowed to leave the room.',focus:'darf',subject:'er'},
    ]},
  { id:'modal-mögen', type:'modal', level:'A1', verb:'mögen',
    conjugations:{ich:'mag',du:'magst',er:'mag',wir:'mögen',ihr:'mögt',sie:'mögen'},
    praeteritum:'mochte', perfekt:'hat gemocht',
    examples:[
      {de:'Ich mag Schokolade.',en:'I like chocolate.',focus:'mag',subject:'ich'},
      {de:'Magst du Musik?',en:'Do you like music?',focus:'Magst',subject:'du'},
      {de:'Er mag keine Spinne.',en:'He does not like spiders.',focus:'mag',subject:'er'},
    ]},
  { id:'modal-möchten', type:'modal', level:'A1', verb:'möchten',
    conjugations:{ich:'möchte',du:'möchtest',er:'möchte',wir:'möchten',ihr:'möchtet',sie:'möchten'},
    praeteritum:'wollte', perfekt:'hat gewollt',
    examples:[
      {de:'Ich möchte einen Kaffee bitte.',en:'I would like a coffee please.',focus:'möchte',subject:'ich'},
      {de:'Möchtest du mitkommen?',en:'Would you like to come along?',focus:'Möchtest',subject:'du'},
      {de:'Er möchte Arzt werden.',en:'He would like to become a doctor.',focus:'möchte',subject:'er'},
    ]},
];

// ─── PERFEKT ──────────────────────────────────────────────────────────────────

const PERFEKT: CardDef[] = [
  gram('perf-haben','perfekt','A2','Use <b>haben</b> as auxiliary for most verbs (transitive, many intransitive).',[
    {de:'Ich habe das Buch gelesen.',en:'I have read the book.',focus:'habe'},
    {de:'Er hat Kaffee getrunken.',en:'He has drunk coffee.',focus:'hat'},
    {de:'Wir haben gut gegessen.',en:'We have eaten well.',focus:'haben'},
  ],'haben'),
  gram('perf-sein','perfekt','A2','Use <b>sein</b> as auxiliary for motion/change-of-state verbs (gehen, kommen, fahren, werden, etc.).',[
    {de:'Ich bin nach Berlin gefahren.',en:'I have travelled to Berlin.',focus:'bin'},
    {de:'Er ist nach Hause gegangen.',en:'He has gone home.',focus:'ist'},
    {de:'Sie sind spät gekommen.',en:'They came late.',focus:'sind'},
  ],'sein'),
  gram('perf-word-order','perfekt','A2','Perfekt word order: auxiliary (<b>haben/sein</b>) + Partizip II at the <em>end</em>.',[
    {de:'Ich habe gestern Fußball gespielt.',en:'I played football yesterday.',focus:'habe'},
    {de:'Sie ist früh aufgestanden.',en:'She got up early.',focus:'ist'},
    {de:'Wir haben lange gewartet.',en:'We waited a long time.',focus:'haben'},
  ]),
  gram('perf-partizip-sein','perfekt','A2','Common Partizip II with <b>sein</b>: gegangen, gekommen, gefahren, gewesen.',[
    {de:'Er ist schon gegangen.',en:'He has already left.',focus:'gegangen'},
    {de:'Sie ist pünktlich gekommen.',en:'She arrived on time.',focus:'gekommen'},
    {de:'Wir sind mit dem Zug gefahren.',en:'We travelled by train.',focus:'gefahren'},
  ]),
];

// ─── NEGATION ────────────────────────────────────────────────────────────────

const NEGATION: CardDef[] = [
  gram('neg-kein','negation','A1','<b>kein</b> negates nouns (replaces indefinite article / no article). Declines like <em>ein</em>.',[
    {de:'Ich habe kein Geld.',en:'I have no money.',focus:'kein'},
    {de:'Er hat keine Zeit.',en:'He has no time.',focus:'keine'},
    {de:'Sie trinkt keinen Kaffee.',en:'She drinks no coffee.',focus:'keinen'},
  ],'kein'),
  gram('neg-nicht','negation','A1','<b>nicht</b> negates verbs, adjectives, adverbs, and specific nouns with definite article.',[
    {de:'Ich verstehe das nicht.',en:'I do not understand that.',focus:'nicht'},
    {de:'Das ist nicht schwer.',en:'That is not difficult.',focus:'nicht'},
    {de:'Er kommt heute nicht.',en:'He is not coming today.',focus:'nicht'},
  ],'nicht'),
  gram('neg-noch-nicht','negation','A1','<b>noch nicht</b> — "not yet"',[
    {de:'Ich habe noch nicht gegessen.',en:'I have not eaten yet.',focus:'noch nicht'},
    {de:'Er ist noch nicht da.',en:'He is not here yet.',focus:'noch nicht'},
    {de:'Wir sind noch nicht fertig.',en:'We are not finished yet.',focus:'noch nicht'},
  ],'noch nicht'),
  gram('neg-noch-nie','negation','A2','<b>noch nie</b> — "never yet"',[
    {de:'Ich war noch nie in Berlin.',en:'I have never been to Berlin yet.',focus:'noch nie'},
    {de:'Er hat noch nie Ski gefahren.',en:'He has never skied before.',focus:'noch nie'},
    {de:'Sie hat noch nie Sushi gegessen.',en:'She has never eaten sushi.',focus:'noch nie'},
  ],'noch nie'),
];

// ─── COMPARATIVE ──────────────────────────────────────────────────────────────

const COMPARATIVE: CardDef[] = [
  gram('comp-gut','comparative','A2','<b>gut → besser → am besten</b> (irregular)',[
    {de:'Sie spricht besser als ich.',en:'She speaks better than I do.',focus:'besser'},
    {de:'Dieser Kaffee schmeckt besser.',en:'This coffee tastes better.',focus:'besser'},
    {de:'Er ist am besten.',en:'He is the best.',focus:'besten'},
  ],'besser'),
  gram('comp-viel','comparative','A2','<b>viel → mehr → am meisten</b> (irregular)',[
    {de:'Er trinkt mehr als ich.',en:'He drinks more than I do.',focus:'mehr'},
    {de:'Ich brauche mehr Zeit.',en:'I need more time.',focus:'mehr'},
    {de:'Sie hat am meisten Geld.',en:'She has the most money.',focus:'meisten'},
  ],'mehr'),
  gram('comp-groß','comparative','A2','<b>groß → größer → am größten</b> (umlaut)',[
    {de:'Berlin ist größer als Hamburg.',en:'Berlin is bigger than Hamburg.',focus:'größer'},
    {de:'Er ist größer als sein Bruder.',en:'He is taller than his brother.',focus:'größer'},
    {de:'Das ist die größte Stadt.',en:'That is the biggest city.',focus:'größte'},
  ],'größer'),
  gram('comp-alt','comparative','A2','<b>alt → älter → am ältesten</b> (umlaut)',[
    {de:'Sie ist älter als er.',en:'She is older than he is.',focus:'älter'},
    {de:'Mein Auto ist älter als deins.',en:'My car is older than yours.',focus:'älter'},
    {de:'Er ist der älteste in der Gruppe.',en:'He is the oldest in the group.',focus:'älteste'},
  ],'älter'),
];

// ─── REFLEXIVE ────────────────────────────────────────────────────────────────

const REFLEXIVE: CardDef[] = [
  gram('refl-mich','reflexive','A2','<b>mich</b> — reflexive pronoun for <em>ich</em>',[
    {de:'Ich freue mich.',en:'I am happy.',focus:'mich'},
    {de:'Ich wasche mich.',en:'I wash myself.',focus:'mich'},
    {de:'Ich erinnere mich nicht.',en:'I don\'t remember.',focus:'mich'},
  ],'mich'),
  gram('refl-dich','reflexive','A2','<b>dich</b> — reflexive pronoun for <em>du</em>',[
    {de:'Du freust dich.',en:'You are happy.',focus:'dich'},
    {de:'Hast du dich gewaschen?',en:'Have you washed yourself?',focus:'dich'},
    {de:'Erinnerst du dich?',en:'Do you remember?',focus:'dich'},
  ],'dich'),
  gram('refl-sich','reflexive','A2','<b>sich</b> — reflexive pronoun for er/sie/es, sie (pl.), Sie',[
    {de:'Er freut sich.',en:'He is happy.',focus:'sich'},
    {de:'Sie erinnert sich an den Tag.',en:'She remembers the day.',focus:'sich'},
    {de:'Sie freuen sich auf den Urlaub.',en:'They look forward to the holiday.',focus:'sich'},
  ],'sich'),
  gram('refl-freuen-auf','reflexive','A2','<b>sich freuen auf</b> + Akk — look forward to (future event)',[
    {de:'Ich freue mich auf das Wochenende.',en:'I look forward to the weekend.',focus:'mich'},
    {de:'Er freut sich auf den Urlaub.',en:'He looks forward to the holiday.',focus:'sich'},
    {de:'Wir freuen uns auf dich.',en:'We look forward to seeing you.',focus:'uns'},
  ],'freuen'),
  gram('refl-interessieren','reflexive','A2','<b>sich interessieren für</b> + Akk — be interested in',[
    {de:'Ich interessiere mich für Musik.',en:'I am interested in music.',focus:'mich'},
    {de:'Er interessiert sich für Fußball.',en:'He is interested in football.',focus:'sich'},
    {de:'Interessierst du dich für Kunst?',en:'Are you interested in art?',focus:'dich'},
  ],'interessieren'),
  gram('refl-waschen','reflexive','A2','<b>sich waschen</b> — wash oneself (daily routine)',[
    {de:'Ich wasche mich jeden Morgen.',en:'I wash myself every morning.',focus:'mich'},
    {de:'Er wäscht sich die Hände.',en:'He washes his hands.',focus:'sich'},
    {de:'Wäscht du dich?',en:'Are you washing yourself?',focus:'dich'},
  ],'waschen'),
  gram('refl-anziehen','reflexive','A2','<b>sich anziehen</b> — get dressed',[
    {de:'Ich ziehe mich an.',en:'I get dressed.',focus:'mich'},
    {de:'Er zieht sich schnell an.',en:'He gets dressed quickly.',focus:'sich'},
    {de:'Zieh dich warm an!',en:'Dress warmly!',focus:'dich'},
  ],'anziehen'),
];

// ─── PRÄTERITUM ───────────────────────────────────────────────────────────────

const PRAETERITUM: CardDef[] = [
  gram('prat-war-hatte','verb','A2','<b>war / hatte</b> — Präteritum of <em>sein</em> and <em>haben</em> (very common in speech and writing).',[
    {de:'Ich war gestern müde.',en:'I was tired yesterday.',focus:'war'},
    {de:'Er hatte keine Zeit.',en:'He had no time.',focus:'hatte'},
    {de:'Wir waren zu Hause.',en:'We were at home.',focus:'waren'},
  ]),
  gram('prat-modals','modal','A2','Modal verbs in Präteritum: <b>konnte, musste, wollte, durfte</b>.',[
    {de:'Ich konnte nicht kommen.',en:'I could not come.',focus:'konnte'},
    {de:'Er musste arbeiten.',en:'He had to work.',focus:'musste'},
    {de:'Sie wollte schlafen.',en:'She wanted to sleep.',focus:'wollte'},
  ]),
  gram('prat-ging-kam','verb','A2','Common Präteritum forms: <b>ging, kam, machte, sah</b>.',[
    {de:'Ich ging nach Hause.',en:'I went home.',focus:'ging'},
    {de:'Er kam zu spät.',en:'He came too late.',focus:'kam'},
    {de:'Sie machte Hausaufgaben.',en:'She did homework.',focus:'machte'},
  ]),
  gram('prat-wusste-sagte','verb','A2','More high-frequency Präteritum: <b>wusste, sagte, fand, dachte</b>.',[
    {de:'Ich wusste die Antwort.',en:'I knew the answer.',focus:'wusste'},
    {de:'Er sagte nichts.',en:'He said nothing.',focus:'sagte'},
    {de:'Sie fand den Weg.',en:'She found the way.',focus:'fand'},
  ]),
];

// ─── FUTURE ───────────────────────────────────────────────────────────────────

const FUTURE: CardDef[] = [
  gram('fut-werden','verb','A2','<b>werden</b> + Infinitiv — future tense. Conjugation: werde, wirst, wird, werden, werdet, werden.',[
    {de:'Ich werde morgen arbeiten.',en:'I will work tomorrow.',focus:'werde'},
    {de:'Er wird Arzt werden.',en:'He will become a doctor.',focus:'wird'},
    {de:'Wir werden dich anrufen.',en:'We will call you.',focus:'werden'},
  ],'werden'),
  gram('fut-present-as-future','verb','A2','Present tense + time word often replaces Futur I in spoken German (<b>morgen gehe ich</b>).',[
    {de:'Morgen fahre ich nach München.',en:'Tomorrow I am going to Munich.',focus:'fahre'},
    {de:'Nächste Woche beginnt der Kurs.',en:'Next week the course starts.',focus:'beginnt'},
    {de:'Heute Abend koche ich.',en:'This evening I am going to cook.',focus:'koche'},
  ]),
];

// ─── IMPERATIVE ───────────────────────────────────────────────────────────────

const IMPERATIVE: CardDef[] = [
  gram('imp-du','verb','A2','Imperative <b>du</b> — stem often without -e: <em>Komm!</em> <em>Lies!</em> <em>Iss!</em>',[
    {de:'Komm her!',en:'Come here!',focus:'Komm'},
    {de:'Iss dein Gemüse!',en:'Eat your vegetables!',focus:'Iss'},
    {de:'Hör mir zu!',en:'Listen to me!',focus:'Hör'},
  ]),
  gram('imp-ihr','verb','A2','Imperative <b>ihr</b> — same as ihr-form without pronoun: <em>Kommt!</em> <em>Geht!</em>',[
    {de:'Kommt bitte herein!',en:'Please come in!',focus:'Kommt'},
    {de:'Geht nach Hause!',en:'Go home!',focus:'Geht'},
    {de:'Macht die Hausaufgaben!',en:'Do the homework!',focus:'Macht'},
  ]),
  gram('imp-sie','verb','A2','Imperative <b>Sie</b> (formal) — Infinitiv + Sie: <em>Kommen Sie!</em> <em>Warten Sie!</em>',[
    {de:'Kommen Sie bitte herein!',en:'Please come in!',focus:'Kommen Sie'},
    {de:'Warten Sie einen Moment!',en:'Wait a moment!',focus:'Warten Sie'},
    {de:'Nehmen Sie Platz!',en:'Take a seat!',focus:'Nehmen Sie'},
  ]),
];

// ─── ACCUSATIVE DRILLS ────────────────────────────────────────────────────────

const ACCUSATIVE: CardDef[] = [
  gram('acc-einen','pronoun','A1','Masculine Akk. indefinite: <b>einen</b> (+ noun)',[
    {de:'Ich kaufe einen Apfel.',en:'I buy an apple.',focus:'einen'},
    {de:'Er liest einen Roman.',en:'He is reading a novel.',focus:'einen'},
    {de:'Sie hat einen Hund.',en:'She has a dog.',focus:'einen'},
  ],'einen'),
  gram('acc-eine','pronoun','A1','Feminine Akk. indefinite: <b>eine</b> (+ noun)',[
    {de:'Ich habe eine Katze.',en:'I have a cat.',focus:'eine'},
    {de:'Er sucht eine Wohnung.',en:'He is looking for an apartment.',focus:'eine'},
    {de:'Sie trinkt eine Tasse Kaffee.',en:'She drinks a cup of coffee.',focus:'eine'},
  ],'eine'),
  gram('acc-ein','pronoun','A1','Neuter Akk. indefinite: <b>ein</b> (+ noun)',[
    {de:'Ich kaufe ein Brot.',en:'I buy a bread roll.',focus:'ein'},
    {de:'Er braucht ein Ticket.',en:'He needs a ticket.',focus:'ein'},
    {de:'Sie liest ein Buch.',en:'She is reading a book.',focus:'ein'},
  ],'ein'),
];

// ─── CONJUNCTIONS ─────────────────────────────────────────────────────────────

const CONJUNCTIONS: CardDef[] = [
  gram('conj-weil','conjunction','A2','<b>weil</b> — "because" → subordinating: verb moves to <em>end</em>.',[
    {de:'Ich lerne Deutsch, weil ich in Berlin wohne.',en:'I learn German because I live in Berlin.',focus:'weil'},
    {de:'Er bleibt zu Hause, weil er krank ist.',en:'He stays home because he is ill.',focus:'weil'},
    {de:'Sie isst nicht, weil sie keinen Hunger hat.',en:'She doesn\'t eat because she isn\'t hungry.',focus:'weil'},
  ],'weil'),
  gram('conj-dass','conjunction','A2','<b>dass</b> — "that" (complementizer) → verb to end.',[
    {de:'Ich weiß, dass er kommt.',en:'I know that he is coming.',focus:'dass'},
    {de:'Sie sagt, dass das Essen gut ist.',en:'She says that the food is good.',focus:'dass'},
    {de:'Ich hoffe, dass du gesund bist.',en:'I hope that you are healthy.',focus:'dass'},
  ],'dass'),
  gram('conj-wenn','conjunction','A2','<b>wenn</b> — "when/if" (repeated/conditional) → verb to end.',[
    {de:'Wenn ich Zeit habe, lese ich.',en:'When I have time, I read.',focus:'wenn'},
    {de:'Ruf mich an, wenn du ankommst.',en:'Call me when you arrive.',focus:'wenn'},
    {de:'Wenn es regnet, bleiben wir drinnen.',en:'If it rains, we stay inside.',focus:'wenn'},
  ],'wenn'),
  gram('conj-als','conjunction','A2','<b>als</b> — "when" (single past event) → verb to end.',[
    {de:'Als ich jung war, spielte ich Fußball.',en:'When I was young, I played football.',focus:'als'},
    {de:'Als er ankam, war sie schon weg.',en:'When he arrived, she was already gone.',focus:'als'},
    {de:'Ich war glücklich, als ich das hörte.',en:'I was happy when I heard that.',focus:'als'},
  ],'als'),
  gram('conj-ob','conjunction','A2','<b>ob</b> — "whether/if" (indirect yes/no question) → verb to end.',[
    {de:'Ich weiß nicht, ob er kommt.',en:'I don\'t know whether he is coming.',focus:'ob'},
    {de:'Sie fragt, ob du Hunger hast.',en:'She asks whether you are hungry.',focus:'ob'},
    {de:'Er fragt, ob sie kommen will.',en:'He asks whether she wants to come.',focus:'ob'},
  ],'ob'),
];

// ─── EXPORT ───────────────────────────────────────────────────────────────────

const HAND_CURATED: CardDef[] = [
  ...VERBS, ...NOUNS, ...PREPS, ...WH, ...PRONOUNS,
  ...POSSESSIVES, ...ADJECTIVES, ...MODALS, ...PERFEKT,
  ...NEGATION, ...COMPARATIVE, ...REFLEXIVE,
  ...PRAETERITUM, ...FUTURE, ...IMPERATIVE, ...ACCUSATIVE,
  ...CONJUNCTIONS,
  ...DEPTH_CARDS,
];

// De-duplicate generated cards against hand-curated ones (by id and by lemma per type).
const handIds = new Set(HAND_CURATED.map((c) => c.id));
const handKeys = new Set(
  HAND_CURATED.map((c) => `${c.type}::${(c.verb || c.noun || c.word || '').toLowerCase()}`).filter(
    (k) => !k.endsWith('::'),
  ),
);
const generatedDeduped = CARDS_GENERATED.filter((c) => {
  if (handIds.has(c.id)) return false;
  const key = `${c.type}::${(c.verb || c.noun || c.word || '').toLowerCase()}`;
  if (handKeys.has(key)) return false;
  return true;
});

export const CARDS_DE: CardDef[] = [...HAND_CURATED, ...generatedDeduped];

/** @deprecated use CARDS_DE */
export const CARDS_DATA = CARDS_DE;

