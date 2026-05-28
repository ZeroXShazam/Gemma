import type { Rating, SRSState } from './types';

// Learning steps in milliseconds: 1min, 10min
const LEARNING_STEPS_MS = [1 * 60 * 1000, 10 * 60 * 1000];
const GRADUATION_INTERVAL = 1; // days
const EASY_GRADUATION_INTERVAL = 4; // days
const MIN_EASE = 1.3;
const MATURE_THRESHOLD = 21; // days

export function defaultSRS(): SRSState {
  return {
    ease: 2.5,
    interval: 0,
    reps: 0,
    lapses: 0,
    due: 0,
    state: 'new',
    step: 0,
    exampleMisses: {},
    recentResults: '',
    lastExampleIdx: undefined,
  };
}

function daysToMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

function msToDays(ms: number): number {
  return ms / (24 * 60 * 60 * 1000);
}

export function computeNext(s: SRSState, rating: Rating): SRSState {
  const now = Date.now();
  const next: SRSState = { ...s };

  if (s.state === 'new' || s.state === 'learning') {
    if (rating === 'again') {
      next.step = 0;
      next.state = 'learning';
      next.due = now + LEARNING_STEPS_MS[0];
      next.lapses++;
    } else if (rating === 'hard') {
      // Stay on current step but use average of current and next step
      const currentDelay = LEARNING_STEPS_MS[s.step] ?? LEARNING_STEPS_MS[LEARNING_STEPS_MS.length - 1];
      const nextDelay = LEARNING_STEPS_MS[s.step + 1] ?? currentDelay;
      next.state = 'learning';
      next.due = now + Math.round((currentDelay + nextDelay) / 2);
    } else if (rating === 'good') {
      // Advance to next step
      const nextStep = s.step + 1;
      if (nextStep >= LEARNING_STEPS_MS.length) {
        // Graduate
        next.state = 'review';
        next.interval = GRADUATION_INTERVAL;
        next.reps = 1;
        next.step = 0;
        next.due = now + daysToMs(GRADUATION_INTERVAL);
      } else {
        next.state = 'learning';
        next.step = nextStep;
        next.due = now + LEARNING_STEPS_MS[nextStep];
      }
    } else if (rating === 'easy') {
      // Graduate early with easy interval
      next.state = 'review';
      next.interval = EASY_GRADUATION_INTERVAL;
      next.ease = Math.min(next.ease + 0.15, 4.0);
      next.reps = 1;
      next.step = 0;
      next.due = now + daysToMs(EASY_GRADUATION_INTERVAL);
    }
  } else {
    // review or mature
    if (rating === 'again') {
      next.ease = Math.max(next.ease - 0.20, MIN_EASE);
      next.lapses++;
      next.step = 0;
      next.state = 'learning';
      next.due = now + LEARNING_STEPS_MS[0];
    } else if (rating === 'hard') {
      next.ease = Math.max(next.ease - 0.15, MIN_EASE);
      next.interval = Math.max(Math.round(next.interval * 1.2), next.interval + 1);
      next.reps++;
      next.due = now + daysToMs(next.interval);
      next.state = next.interval >= MATURE_THRESHOLD ? 'mature' : 'review';
    } else if (rating === 'good') {
      next.interval = Math.max(Math.round(next.interval * next.ease), next.interval + 1);
      next.reps++;
      next.due = now + daysToMs(next.interval);
      next.state = next.interval >= MATURE_THRESHOLD ? 'mature' : 'review';
    } else if (rating === 'easy') {
      next.ease = Math.min(next.ease + 0.15, 4.0);
      next.interval = Math.max(Math.round(next.interval * next.ease * 1.3), next.interval + 1);
      next.reps++;
      next.due = now + daysToMs(next.interval);
      next.state = next.interval >= MATURE_THRESHOLD ? 'mature' : 'review';
    }
  }

  return next;
}

function formatInterval(ms: number, isLearning: boolean, days: number): string {
  if (isLearning && ms < 60 * 60 * 1000) {
    const mins = Math.round(ms / 60000);
    return `${mins}m`;
  }
  if (days < 1) {
    const hours = Math.round(ms / (60 * 60 * 1000));
    return `${hours}h`;
  }
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  return `${months}mo`;
}

export function previewIntervals(s: SRSState): Record<Rating, string> {
  const ratings: Rating[] = ['again', 'hard', 'good', 'easy'];
  const result = {} as Record<Rating, string>;
  for (const r of ratings) {
    const next = computeNext(s, r);
    const isLearning = next.state === 'learning';
    const now = Date.now();
    const ms = next.due - now;
    const days = Math.round(msToDays(ms));
    result[r] = formatInterval(ms, isLearning, days);
  }
  return result;
}
