// Thirsty: care schedules, the in-app plant health meter, gems and milestones.
// Health is a game meter about the app's reminders, never a claim about the real plant.
import { diffDays, type DayKey } from '@/kit/dates';

export type Preset = { type: string; emoji: string; waterEvery: number; feedEvery: number; tip: string };

// General starting points for indoor plants; people adjust them to their home.
export const PRESETS: Preset[] = [
  { type: 'Pothos', emoji: '🌿', waterEvery: 7, feedEvery: 30, tip: 'Water when the top few cm of soil are dry.' },
  { type: 'Monstera', emoji: '🪴', waterEvery: 7, feedEvery: 30, tip: 'Likes bright, indirect light.' },
  { type: 'Snake plant', emoji: '🌵', waterEvery: 14, feedEvery: 60, tip: 'Happy to be ignored. Less water in winter.' },
  { type: 'Spider plant', emoji: '🕷️', waterEvery: 7, feedEvery: 30, tip: 'Babies on runners can be potted up.' },
  { type: 'Peace lily', emoji: '🤍', waterEvery: 6, feedEvery: 45, tip: 'Droops dramatically when thirsty.' },
  { type: 'Cactus or succulent', emoji: '🌵', waterEvery: 21, feedEvery: 90, tip: 'Soak, then let it dry out completely.' },
  { type: 'Fern', emoji: '🌱', waterEvery: 4, feedEvery: 30, tip: 'Likes humidity: bathrooms are great.' },
  { type: 'Herbs', emoji: '🌿', waterEvery: 3, feedEvery: 21, tip: 'A sunny windowsill and regular trims.' },
  { type: 'Other', emoji: '🪴', waterEvery: 7, feedEvery: 30, tip: 'Start weekly and adjust.' },
];

export type CareKind = 'water' | 'feed';
export type Care = { day: DayKey; kind: CareKind };
export type Event = { day: DayKey; kind: 'new-leaf' | 'repotted' };

export type Plant = {
  id: string;
  nickname: string;
  type: string;
  emoji: string;
  waterEvery: number;
  feedEvery: number;
  adopted: DayKey;
  care: Care[];
  events: Event[];
  revivedOn?: DayKey;
};

export function lastCare(p: Plant, kind: CareKind): DayKey | null {
  let last: DayKey | null = null;
  for (const c of p.care) if (c.kind === kind && (!last || c.day > last)) last = c.day;
  return last;
}

/** Days until the next watering (negative = overdue). Counts from adoption if never watered. */
export function dueIn(p: Plant, kind: CareKind, today: DayKey): number {
  const candidates = [lastCare(p, kind), kind === 'water' ? p.revivedOn : undefined, p.adopted].filter(Boolean) as DayKey[];
  const from = candidates.reduce((a, b) => (b > a ? b : a));
  const every = kind === 'water' ? p.waterEvery : p.feedEvery;
  return every - diffDays(from, today);
}

/** In-app health 0–100: full until a watering is overdue, then −25 a day. Revived plants restart at full. */
export function health(p: Plant, today: DayKey): number {
  const d = dueIn(p, 'water', today);
  if (d >= 0) return 100;
  return Math.max(0, 100 + d * 25);
}

/** Watered again too soon (within a third of the interval)? Cue the snorkel. */
export function overWatering(p: Plant, today: DayKey): boolean {
  const last = lastCare(p, 'water');
  return !!last && diffDays(last, today) < Math.max(1, Math.floor(p.waterEvery / 3));
}

export const GEMS = { onTime: 2, late: 1, milestone: 5, reviveCost: 10, freezeCost: 6 };

/** Gems for a care action: on-time care earns more, but late care still earns something. */
export function gemsFor(p: Plant, kind: CareKind, today: DayKey): number {
  return dueIn(p, kind, today) >= -1 ? GEMS.onTime : GEMS.late;
}

export type Milestone = { id: string; label: string; emoji: string; reached: DayKey | null };

export function milestones(p: Plant, today: DayKey): Milestone[] {
  const age = diffDays(p.adopted, today);
  const at = (days: number) => (age >= days ? p.adopted : null);
  const leaf = p.events.find((e) => e.kind === 'new-leaf');
  const repot = p.events.find((e) => e.kind === 'repotted');
  return [
    { id: 'week', label: 'First week together', emoji: '🌱', reached: at(7) },
    { id: 'leaf', label: 'First new leaf', emoji: '🍃', reached: leaf?.day ?? null },
    { id: 'month', label: 'One month', emoji: '📅', reached: at(30) },
    { id: 'repot', label: 'Repotted', emoji: '🪴', reached: repot?.day ?? null },
    { id: 'half', label: 'Six months', emoji: '🌿', reached: at(182) },
    { id: 'year', label: 'One year together', emoji: '🎂', reached: at(365) },
  ];
}

export function plantError(p: { nickname: string; waterEvery: number; feedEvery: number }): string | null {
  if (!p.nickname.trim()) return 'Every plant deserves a name.';
  if (!Number.isInteger(p.waterEvery) || p.waterEvery < 1 || p.waterEvery > 60) return 'Watering every 1 to 60 days.';
  if (!Number.isInteger(p.feedEvery) || p.feedEvery < 7 || p.feedEvery > 180) return 'Feeding every 7 to 180 days.';
  return null;
}
