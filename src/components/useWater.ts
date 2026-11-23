import { track } from '@/kit/analytics';
import { useCelebrate } from '@/kit/celebrate';
import { todayKey } from '@/kit/dates';
import { useFeedback } from '@/kit/feedback';
import { overWatering, type CareKind, type Plant } from '@/domain/plants';
import { useGarden } from '@/state/garden';

export function useCare() {
  const { toast } = useFeedback();
  const celebrate = useCelebrate();
  return (p: Plant, kind: CareKind) => {
    const soggy = kind === 'water' && overWatering(p, todayKey());
    const { gems } = useGarden.getState().care(p.id, kind);
    track('core_action_completed', { what: kind, soggy });
    if (soggy) {
      celebrate({ scene: 'snorkel', emoji: '🤿', title: 'Glug glug…', body: `${p.nickname} pops up wearing a snorkel. It was watered recently: check the soil before the next drink.` });
      return;
    }
    toast(kind === 'water' ? `${p.nickname} gulps it down and burps a tiny bubble. +${gems} 💎` : `${p.nickname} is fed. +${gems} 💎`, {
      actionLabel: 'Undo',
      onAction: () => useGarden.getState().undoCare(p.id, kind, gems),
    });
  };
}
