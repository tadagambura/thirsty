// The plant library: tailored care, the plant doctor, rarity leagues, "what your plants say about
// you", and the digital twin. Content: src/content/plants.json (RHS-led sources, reviewed: false).
import type { DayKey } from '@/kit/dates';
import raw from '@/content/plants.json';
import type { Plant } from './plants';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type LibPlant = {
  id: string;
  name: string;
  latin: string;
  emoji: string;
  rarity: Rarity;
  free: boolean;
  waterEvery: number;
  winterWaterEvery: number;
  feedEvery: number;
  feedWhat: string;
  light: string;
  humidity: string;
  temperature: string;
  soil: string;
  toxicToPets: boolean | null;
  personality: string;
  problems: { symptom: string; cause: string; fix: string }[];
  source: { name: string; url: string };
};

export const LIBRARY = (raw as { plants: LibPlant[] }).plants;
export const libPlant = (id?: string) => (id ? LIBRARY.find((p) => p.id === id) : undefined);

export function searchLibrary(q: string, premium: boolean): { plant: LibPlant; locked: boolean }[] {
  const t = q.trim().toLowerCase();
  return LIBRARY.filter((p) => !t || p.name.toLowerCase().includes(t) || p.latin.toLowerCase().includes(t)).map((plant) => ({ plant, locked: !plant.free && !premium }));
}

export const RARITY_POINTS: Record<Rarity, number> = { common: 1, uncommon: 3, rare: 8, legendary: 20 };
export const RARITY_LABEL: Record<Rarity, string> = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', legendary: 'Legendary' };

const LEAGUES = [
  { min: 0, name: 'Seedling', emoji: '🌱' },
  { min: 5, name: 'Sprout', emoji: '🌿' },
  { min: 15, name: 'Gardener', emoji: '🪴' },
  { min: 35, name: 'Botanist', emoji: '🔬' },
  { min: 70, name: 'Collector', emoji: '💎' },
  { min: 140, name: 'Legend', emoji: '👑' },
];

/** League from your collection: more plants and rarer plants score more. */
export function league(plants: Plant[]) {
  const points = plants.reduce((s, p) => s + RARITY_POINTS[libPlant(p.libraryId)?.rarity ?? 'common'], 0);
  let i = 0;
  while (i + 1 < LEAGUES.length && points >= LEAGUES[i + 1].min) i++;
  const next = LEAGUES[i + 1];
  return { ...LEAGUES[i], points, next: next ? { name: next.name, needs: next.min - points } : null };
}

/** "What your plants say about you": a light-hearted mix of each plant's personality line. */
export function personality(plants: Plant[]): string[] {
  const lines = plants.map((p) => libPlant(p.libraryId)?.personality).filter((x): x is string => !!x);
  const rare = plants.filter((p) => ['rare', 'legendary'].includes(libPlant(p.libraryId)?.rarity ?? '')).length;
  const out = [...new Set(lines)].slice(0, 3);
  if (rare >= 2) out.push('A serious collector. Your plants have better provenance than most furniture.');
  if (plants.length >= 10) out.push('Your home is basically a greenhouse with a sofa in it.');
  return out;
}

// ---------- Digital twin ----------
export const PLAYS = [
  { kind: 'pet', label: 'Stroke its leaves', emoji: '🤲', reply: 'The leaves wiggle. That was nice.' },
  { kind: 'sing', label: 'Sing to it', emoji: '🎤', reply: 'It sways along, slightly off-beat.' },
  { kind: 'sun', label: 'Sunbathe together', emoji: '😎', reply: 'Sunglasses on. Photosynthesis vibes.' },
  { kind: 'joke', label: 'Tell it a joke', emoji: '🤭', reply: 'It snorts. A tiny leaf falls off from laughing.' },
] as const;
export const PLAYS_PER_DAY = 3;

export function twin(p: Plant, health: number, today: DayKey) {
  const plays = p.plays ?? [];
  const xp = p.care.length * 2 + plays.length;
  const level = Math.floor(xp / 10) + 1;
  const playsToday = plays.filter((x) => x.day === today).length;
  const mood = health === 0 ? 'wilted' : health < 60 ? 'thirsty' : playsToday > 0 ? 'delighted' : 'content';
  const face = { wilted: '😵', thirsty: '🥺', delighted: '🤩', content: '🙂' }[mood];
  return { level, xp, into: xp % 10, mood, face, playsLeft: Math.max(0, PLAYS_PER_DAY - playsToday) };
}
