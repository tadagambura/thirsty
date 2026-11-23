import { diffDays, todayKey, type DayKey } from '@/kit/dates';
import { persisted, uid } from '@/kit/store';
import { GEMS, gemsFor, lastCare, type CareKind, type Event, type Plant } from '@/domain/plants';

/** Care repeated within a third of its interval earns no gems, so tapping can't farm them. */
function tooSoon(p: Plant, kind: CareKind, today: DayKey) {
  const last = lastCare(p, kind);
  const every = kind === 'water' ? p.waterEvery : p.feedEvery;
  return !!last && diffDays(last, today) < Math.max(1, Math.floor(every / 3));
}

type GardenState = {
  plants: Plant[];
  gems: number;
  mourned: Record<string, DayKey>; // plant → day its 'death' scene was shown
  add: (p: Omit<Plant, 'id' | 'adopted' | 'care' | 'events'>) => string;
  update: (id: string, patch: Partial<Plant>) => void;
  care: (id: string, kind: CareKind) => { gems: number };
  undoCare: (id: string, kind: CareKind, gems: number) => void;
  event: (id: string, kind: Event['kind']) => void;
  revive: (id: string) => boolean;
  mourn: (id: string) => void;
  remove: (id: string) => Plant | undefined;
  restore: (p: Plant) => void;
};

export const useGarden = persisted<GardenState>('thirsty.garden', 1, (set, get) => ({
  plants: [],
  gems: 0,
  mourned: {},
  add: (p) => {
    const id = uid('p');
    set((s) => ({ plants: [...s.plants, { ...p, id, adopted: todayKey(), care: [], events: [] }] }));
    return id;
  },
  update: (id, patch) => set((s) => ({ plants: s.plants.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  care: (id, kind) => {
    const p = get().plants.find((x) => x.id === id)!;
    const gems = tooSoon(p, kind, todayKey()) ? 0 : gemsFor(p, kind, todayKey());
    set((s) => ({ gems: s.gems + gems, plants: s.plants.map((x) => (x.id === id ? { ...x, care: [...x.care, { day: todayKey(), kind }] } : x)) }));
    return { gems };
  },
  undoCare: (id, kind, gems) =>
    set((s) => ({
      gems: Math.max(0, s.gems - gems),
      plants: s.plants.map((x) => {
        if (x.id !== id) return x;
        const i = x.care.map((c) => c.kind).lastIndexOf(kind);
        return i < 0 ? x : { ...x, care: x.care.filter((_, j) => j !== i) };
      }),
    })),
  event: (id, kind) =>
    set((s) => {
      const p = s.plants.find((x) => x.id === id);
      // Milestone gems at most once a week per kind of event.
      const recent = p?.events.some((e) => e.kind === kind && diffDays(e.day, todayKey()) < 7);
      return { gems: s.gems + (recent ? 0 : GEMS.milestone), plants: s.plants.map((x) => (x.id === id ? { ...x, events: [...x.events, { day: todayKey(), kind }] } : x)) };
    }),
  revive: (id) => {
    if (get().gems < GEMS.reviveCost) return false;
    set((s) => ({ gems: s.gems - GEMS.reviveCost, plants: s.plants.map((p) => (p.id === id ? { ...p, revivedOn: todayKey() } : p)) }));
    return true;
  },
  mourn: (id) => set((s) => ({ mourned: { ...s.mourned, [id]: todayKey() } })),
  remove: (id) => {
    const p = get().plants.find((x) => x.id === id);
    set((s) => ({ plants: s.plants.filter((x) => x.id !== id) }));
    return p;
  },
  restore: (p) => set((s) => ({ plants: [...s.plants, p] })),
}));
