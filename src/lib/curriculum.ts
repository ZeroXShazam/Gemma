import type { CardDef, Language, SRSState } from './types';
import {
  ALL_SECTION_IDS,
  CURRICULUM_DE,
  cardSection as cardSectionDe,
  computeSectionStats as computeSectionStatsDe,
  sectionTitle as sectionTitleDe,
  type SectionId as SectionIdDe,
} from './curriculum-de';
import {
  ALL_SECTION_IDS_IT,
  CURRICULUM_IT,
  cardSectionIt,
  computeSectionStatsIt,
  sectionTitleIt,
  type SectionIdIt,
} from './curriculum-it';

export type SectionId = SectionIdDe | SectionIdIt;

export function curriculumFor(lang: Language) {
  return lang === 'it' ? CURRICULUM_IT : CURRICULUM_DE;
}

export function allSectionIds(lang: Language): SectionId[] {
  return lang === 'it' ? [...ALL_SECTION_IDS_IT] : [...ALL_SECTION_IDS];
}

export function sectionTitle(id: SectionId, lang: Language): string {
  if (lang === 'it') return sectionTitleIt(id as SectionIdIt);
  return sectionTitleDe(id as SectionIdDe);
}

export function cardSection(card: CardDef): SectionId {
  if (card.language === 'it' || card.id.startsWith('it-')) return cardSectionIt(card);
  return cardSectionDe(card);
}

export function computeSectionStats(
  sectionId: SectionId,
  cards: CardDef[],
  pm: Record<string, SRSState>,
  lang: Language,
  now = Date.now(),
) {
  if (lang === 'it') return computeSectionStatsIt(sectionId as SectionIdIt, cards, pm, now);
  return computeSectionStatsDe(sectionId as SectionIdDe, cards, pm, now);
}

export { ALL_SECTION_IDS, ALL_SECTION_IDS_IT, CURRICULUM_DE, CURRICULUM_IT };
