import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useCelebrate } from '@/kit/celebrate';
import { formatDay, todayKey } from '@/kit/dates';
import { useFeedback } from '@/kit/feedback';
import { shareText } from '@/kit/share';
import { useTheme } from '@/kit/theme';
import { Body, Button, Card, EmptyState, Muted, ProgressBar, Row, Screen, Section, Stack, Stat, Strong } from '@/kit/ui';
import { dueIn, health, lastCare, milestones, PRESETS } from '@/domain/plants';
import { useCare } from '@/components/useWater';
import { useGarden } from '@/state/garden';

export default function PlantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = useGarden((s) => s.plants.find((x) => x.id === id));
  const { c } = useTheme();
  const care = useCare();
  const celebrate = useCelebrate();
  const { confirm, toast } = useFeedback();
  const today = todayKey();
  if (!p) return <Screen edges={[]}><EmptyState title="Plant not found" action={<Button title="Back" onPress={() => router.replace('/')} />} /></Screen>;
  const h = health(p, today);
  const w = dueIn(p, 'water', today);
  const f = dueIn(p, 'feed', today);
  const ms = milestones(p, today);
  const tip = PRESETS.find((x) => x.type === p.type)?.tip;
  const lw = lastCare(p, 'water');

  return (
    <Screen edges={[]} testID="plant">
      <RouterStack.Screen options={{ title: p.nickname }} />
      <Card tone="alt">
        <Row gap={14}>
          <Text style={{ fontSize: 64 }}>{h === 0 ? '🥀' : p.emoji}</Text>
          <Stack gap={4} style={{ flex: 1 }}>
            <Strong>{`${p.nickname} the ${p.type.toLowerCase()}`}</Strong>
            <Muted>{`Together since ${formatDay(p.adopted)}`}</Muted>
            <ProgressBar value={h / 100} label="In-app health" color={h > 50 ? c.primary : h > 0 ? c.accent : c.danger} />
            <Muted testID="health">{`Health ${h}%`}</Muted>
          </Stack>
        </Row>
      </Card>
      <Row>
        <Stat label="Water" value={w > 0 ? `in ${w}d` : w === 0 ? 'today' : `${-w}d late`} testID="water-due" />
        <Stat label="Feed" value={f > 0 ? `in ${f}d` : f === 0 ? 'today' : `${-f}d late`} />
        <Stat label="Last watered" value={lw ? formatDay(lw).slice(4) : 'never'} />
      </Row>
      <Row gap={8}>
        <Button title="💧 Watered" onPress={() => care(p, 'water')} testID="watered" style={{ flex: 1 }} />
        <Button title="🌱 Fed" variant="secondary" onPress={() => care(p, 'feed')} testID="fed" style={{ flex: 1 }} />
      </Row>
      {tip ? <Muted>{`Tip: ${tip}`}</Muted> : null}

      <Section title="Milestones">
        {ms.map((m) => (
          <Row key={m.id} gap={10}>
            <Text style={{ fontSize: 22, opacity: m.reached ? 1 : 0.3 }}>{m.emoji}</Text>
            <Body style={{ flex: 1 }} color={m.reached ? undefined : c.textMuted}>{m.label}</Body>
            {m.reached ? <Muted>✓</Muted> : null}
          </Row>
        ))}
        <Row wrap gap={8}>
          <Button
            small
            variant="secondary"
            title="New leaf! 🍃"
            testID="new-leaf"
            onPress={() => {
              useGarden.getState().event(p.id, 'new-leaf');
              celebrate({ scene: 'leaf', emoji: '🍃', title: 'Ta-da!', body: `${p.nickname} does a victory dance as the leaf unfurls.` });
            }}
          />
          <Button small variant="secondary" title="Repotted 🪴" onPress={() => { useGarden.getState().event(p.id, 'repotted'); toast(`${p.nickname} has a new home.`); }} />
          <Button small variant="ghost" title="Share" icon="share-outline" onPress={() => shareText(`${p.emoji} ${p.nickname} and I have been together since ${formatDay(p.adopted)}. Kept alive with Thirsty.`, 'plant')} />
        </Row>
      </Section>
      <Muted>Health is a game meter based on your watering schedule, not a reading of your real plant.</Muted>
      <Button
        title="Remove plant"
        variant="danger"
        onPress={async () => {
          if (!(await confirm({ title: `Remove ${p.nickname}?`, confirmLabel: 'Remove', destructive: true }))) return;
          const removed = useGarden.getState().remove(p.id);
          router.back();
          toast('Plant removed.', { actionLabel: 'Undo', onAction: () => removed && useGarden.getState().restore(removed) });
        }}
      />
    </Screen>
  );
}
