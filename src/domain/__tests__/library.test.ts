import { league, LIBRARY, personality, searchLibrary, twin } from '../library';
import { dueIn, intervalFor, type Plant } from '../plants';

const plant = (libraryId: string, o: Partial<Plant> = {}): Plant => ({ id: libraryId, nickname: 'x', type: 'x', emoji: '🌿', waterEvery: 7, winterWaterEvery: 14, feedEvery: 30, adopted: '2026-10-01', care: [], events: [], libraryId, ...o });

test('library: 60 plants, 20 free common, every plant has problems and a source', () => {
  expect(LIBRARY).toHaveLength(60);
  expect(LIBRARY.filter((p) => p.free)).toHaveLength(20);
  expect(LIBRARY.filter((p) => p.free).every((p) => p.rarity === 'common')).toBe(true);
  for (const p of LIBRARY) {
    expect(p.problems.length).toBeGreaterThanOrEqual(3);
    expect(p.source.url).toMatch(/^https:\/\//);
    expect(p.waterEvery).toBeGreaterThan(0);
  }
});

test('search: free users see rare plants as locked', () => {
  const all = searchLibrary('', false);
  expect(all.filter((x) => !x.locked)).toHaveLength(20);
  expect(searchLibrary('', true).every((x) => !x.locked)).toBe(true);
  expect(searchLibrary('monstera', false).length).toBeGreaterThan(0);
});

test('winter watering slows down', () => {
  const p = plant(LIBRARY[0].id, { care: [{ day: '2026-12-01', kind: 'water' }] });
  expect(intervalFor(p, 'water', '2026-12-05')).toBe(14);
  expect(intervalFor(p, 'water', '2026-06-05')).toBe(7);
  expect(dueIn(p, 'water', '2026-12-05')).toBe(10);
  expect(intervalFor({ ...p, feedEvery: 0 }, 'feed', '2026-06-05')).toBe(9999);
});

test('leagues reward more and rarer plants', () => {
  const common = LIBRARY.find((p) => p.rarity === 'common')!.id;
  const legendary = LIBRARY.find((p) => p.rarity === 'legendary')!.id;
  expect(league([plant(common)]).name).toBe('Seedling');
  expect(league([plant(legendary)]).name).toBe('Gardener');
  expect(league(Array.from({ length: 7 }, () => plant(legendary))).name).toBe('Legend');
  expect(league([plant(common)]).next).toEqual({ name: 'Sprout', needs: 4 });
  expect(personality([plant(legendary), plant(legendary)]).some((l) => l.includes('collector'))).toBe(true);
});

test('digital twin: levels from care and play, mood from health, 3 plays a day', () => {
  const p = plant(LIBRARY[0].id, { care: Array.from({ length: 5 }, (_, i) => ({ day: `2026-11-0${i + 1}`, kind: 'water' as const })), plays: [{ day: '2026-11-23', kind: 'pet' }] });
  const t = twin(p, 100, '2026-11-23');
  expect(t.level).toBe(2);
  expect(t.mood).toBe('delighted');
  expect(t.playsLeft).toBe(2);
  expect(twin(p, 0, '2026-11-24').mood).toBe('wilted');
});
