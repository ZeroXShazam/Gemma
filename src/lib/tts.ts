import type { Language } from './types';

const LANG_BCP47: Record<Language, string> = {
  de: 'de-DE',
  it: 'it-IT',
};

let cachedVoices: SpeechSynthesisVoice[] | null = null;

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (cachedVoices && cachedVoices.length > 0) return cachedVoices;
  cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    cachedVoices = window.speechSynthesis.getVoices();
  });
}

// Ranks higher = better. Disqualified (lang mismatch) returns -1.
function voiceScore(v: SpeechSynthesisVoice, bcp47: string): number {
  const prefix = bcp47.split('-')[0].toLowerCase();
  const vLang = v.lang.toLowerCase();
  let langScore = 0;
  if (vLang === bcp47.toLowerCase()) langScore = 100;
  else if (vLang.startsWith(prefix)) langScore = 50;
  else return -1;

  const name = v.name.toLowerCase();
  let quality = 0;
  if (name.includes('premium')) quality = 50;
  else if (name.includes('enhanced')) quality = 35;
  else if (name.includes('natural')) quality = 30;
  else if (name.includes('neural')) quality = 25;
  else if (name.includes('siri')) quality = 20;

  if (v.localService) quality += 10; // prefer offline voices (lower latency, no quota)
  return langScore + quality;
}

function pickVoice(bcp47: string): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (voices.length === 0) return null;
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const v of voices) {
    const s = voiceScore(v, bcp47);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return best;
}

export function ttsAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, language: Language): void {
  if (!ttsAvailable() || !text) return;
  const bcp47 = LANG_BCP47[language];
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = bcp47;
  utter.rate = 0.95;
  utter.pitch = 1;
  const voice = pickVoice(bcp47);
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

export function cancelSpeech(): void {
  if (!ttsAvailable()) return;
  window.speechSynthesis.cancel();
}
