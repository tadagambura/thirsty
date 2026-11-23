import { dueIn, gemsFor, health, milestones, overWatering, plantError, type Plant } from '../plants';

const plant = (o: Partial<Plant> = {}): Plant => ({ id: 'p', nickname: 'Cyphicus', type: 'Pothos', emoji: '🌿', waterEvery: 7, feedEvery: 30, adopted: '2026-11-01', care: [], events: [], ...o });

test('watering is due a set number of days after the last one', () => {
  const p = plant({ care: [{ day: '2026-11-20', kind: 'water' }] });
  expect(dueIn(p, 'water', '2026-11-23')).toBe(4);
  expect(dueIn(p, 'water', '2026-11-29')).toBe(-2);
  expect(dueIn(plant(), 'water', '2026-11-05')).toBe(3); // never watered: counts from adoption
});

test('health is full until overdue, then drops 25 a day, and a revive resets it', () => {
  const p = plant({ care: [{ day: '2026-11-10', kind: 'water' }] });
  expect(health(p, '2026-11-17')).toBe(100);
  expect(health(p, '2026-11-19')).toBe(50);
  expect(health(p, '2026-11-25')).toBe(0);
  expect(health({ ...p, revivedOn: '2026-11-25' }, '2026-11-25')).toBe(100); // a revive restarts the clock
  expect(health({ ...plant(), revivedOn: '2026-11-25' }, '2026-11-26')).toBe(100);
});

test('over-watering and gems', () => {
  const p = plant({ care: [{ day: '2026-11-22', kind: 'water' }] });
  expect(overWatering(p, '2026-11-23')).toBe(true);
  expect(overWatering(p, '2026-11-25')).toBe(false);
  expect(gemsFor(p, 'water', '2026-11-29')).toBe(2);
  expect(gemsFor(p, 'water', '2026-12-05')).toBe(1);
});

test('milestones from age and logged events', () => {
  const m = milestones(plant({ events: [{ day: '2026-11-15', kind: 'new-leaf' }] }), '2026-12-05');
  const reached = m.filter((x) => x.reached).map((x) => x.id);
  expect(reached).toEqual(['week', 'leaf', 'month']);
});

test('validation', () => {
  expect(plantError({ nickname: '', waterEvery: 7, feedEvery: 30 })).toMatch(/name/);
  expect(plantError({ nickname: 'A', waterEvery: 0, feedEvery: 30 })).toMatch(/Watering/);
  expect(plantError({ nickname: 'A', waterEvery: 7, feedEvery: 30 })).toBeNull();
});
