import { CardLibrary, type CardPack } from '@/kit/cards';
import { H1, Muted, Screen } from '@/kit/ui';
import raw from '@/content/cards.json';
import { useGarden } from '@/state/garden';

const pack = raw as CardPack;

export default function Learn() {
  const ids = new Set(useGarden((s) => s.plants).map((p) => p.libraryId).filter(Boolean) as string[]);
  return (
    <Screen testID="learn">
      <H1>Plant health</H1>
      <Muted>Watering, feeding, pests and problems, from the RHS and university extension services.</Muted>
      <CardLibrary pack={pack} app="thirsty" relevant={ids.size ? (c) => (c.plants ?? []).some((id) => ids.has(id)) : undefined} relevantLabel="Only cards for my plants" />
    </Screen>
  );
}
