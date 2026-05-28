import type { Language } from './types';

export const VERB_GLOSS: Record<Language, Record<string, string>> = {
  de: {
    sein: 'to be', haben: 'to have', gehen: 'to go', kommen: 'to come',
    lesen: 'to read', essen: 'to eat', trinken: 'to drink', fahren: 'to travel / drive',
    sprechen: 'to speak', sehen: 'to see', nehmen: 'to take', geben: 'to give',
    finden: 'to find', wissen: 'to know', machen: 'to do / make', arbeiten: 'to work',
    wohnen: 'to live', lernen: 'to learn', heißen: 'to be called', helfen: 'to help',
    schlafen: 'to sleep', verstehen: 'to understand', bleiben: 'to stay',
    treffen: 'to meet', denken: 'to think', schreiben: 'to write',
    bringen: 'to bring', laufen: 'to run', stellen: 'to place / put',
    können: 'can', müssen: 'must', wollen: 'to want', sollen: 'should',
    dürfen: 'may', mögen: 'to like', möchten: 'would like',
  },
  it: {
    essere: 'to be', avere: 'to have', andare: 'to go', venire: 'to come',
    fare: 'to do / make', mangiare: 'to eat', bere: 'to drink', parlare: 'to speak',
    leggere: 'to read', scrivere: 'to write', lavorare: 'to work', studiare: 'to study',
    costare: 'to cost',
  },
};

export const TYPE_TIPS: Record<Language, Partial<Record<string, string>>> = {
  de: {
    prep: 'The preposition decides the case of the noun that follows — watch Wo? (location) vs Wohin? (movement) for two-way preps.',
    conjunction: 'After subordinating conjunctions, the conjugated verb moves to the end of the clause.',
    pronoun: 'Personal pronouns replace nouns and change form by person, number, and case.',
    verb: 'Match the verb ending to the subject: ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie -en.',
    modal: 'Modal verbs send the main verb to the end in infinitive form: Ich muss <em>gehen</em>.',
    noun: 'Learn the article with the noun — gender affects adjectives and case forms throughout the sentence.',
    perfekt: 'Perfekt = auxiliary (haben/sein) + Partizip II at the end.',
    reflexive: 'Reflexive verbs use <em>sich</em> matching the subject: ich wasche <em>mich</em>.',
    adjective: 'Adjective endings change with gender, case, and whether the article is definite or indefinite.',
  },
  it: {
    prep: 'Italian prepositions often combine with articles: di + il = del, a + la = alla.',
    conjunction: 'Che-clauses often use the subjunctive in formal Italian; here we stick to indicative patterns.',
    pronoun: 'Subject pronouns are often dropped — the verb ending shows the person.',
    verb: 'Regular -are / -ere / -ire verbs follow predictable present-tense endings.',
    noun: 'Every noun has a gender (il/la) — the article must agree.',
    perfekt: 'Passato prossimo = avere/essere + past participle.',
  },
};
