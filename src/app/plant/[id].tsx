import { router, Stack as RouterStack, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useCelebrate } from '@/kit/celebrate';
import { formatDay, todayKey } from '@/kit/dates';
import { useFeedback } from '@/kit/feedback';
import { shareText } from '@/kit/share';
import { useTheme } from '@/kit/theme';
import { Body, Button, Card, EmptyState, Muted, ProgressBar, Row, Screen, Section, Stack, Stat, Strong } from '@/kit/ui';
import { dueIn, health, intervalFor, isWinter, lastCare, milestones, PRESETS } from '@/domain/plants';
import { libPlant, PLAYS, RARITY_LABEL, twin } from '@/domain/library';
import { CardView, type CardPack } from '@/kit/cards';
import { Note, Sheet } from '@/kit/ui';
import { useState } from 'react';
import cardsRaw from '@/content/cards.json';

const cards = (cardsRaw as CardPack).cards;
import { useCare } from '@/components/useWater';
import { useGarden } from '@/state/garden';

export default function PlantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = useGarden((s) => s.plants.find((x) => x.id === id));
  const { c } = useTheme();
  const care = useCare();
  const celebrate = useCelebrate();
  const { confirm, toast } = useFeedback();
  const [openCard, setOpenCard] = useState<string | null>(null);
  const [doctor, setDoctor] = useState(false);
  const today = todayKey();
  if (!p) return <Screen edges={[]}><EmptyState title="Plant not found" action={<Button title="Back" onPress={() => router.replace('/')} />} /></Screen>;
  const h = health(p, today);
  const w = dueIn(p, 'water', today);
  const f = dueIn(p, 'feed', today);
  const ms = milestones(p, today);
  const lib = libPlant(p.libraryId);
  const tip = lib ? null : PRESETS.find((x) => x.type === p.type)?.tip;
  const tw = twin(p, h, today);
  const mine = lib ? cards.filter((x) => x.plants?.includes(lib.id)).slice(0, 4) : [];
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
      {lib ? (
        <Section title={`Care for ${lib.name} · ${RARITY_LABEL[lib.rarity]}`}>
          <Card testID="care">
            <Body>{`☀️ ${lib.light}`}</Body>
            <Body>{`💧 Every ${intervalFor(p, 'water', today)} days${isWinter(today) ? ' (winter rhythm)' : ''}. Check the compost first.`}</Body>
            <Body>{`🍽️ ${lib.feedWhat}`}</Body>
            <Body>{`💨 Humidity: ${lib.humidity} · 🌡️ ${lib.temperature}`}</Body>
            <Body>{`🪴 ${lib.soil}`}</Body>
            {lib.toxicToPets ? <Note tone="warning">Toxic to cats and dogs. Keep it out of reach of pets.</Note> : null}
            <Muted>{`Source: ${lib.source.name}`}</Muted>
          </Card>
          <Button small variant="secondary" title="🩺 Plant doctor: something wrong?" onPress={() => setDoctor(true)} testID="doctor" />
        </Section>
      ) : null}

      <Section title={`${p.nickname}'s digital twin · level ${tw.level}`}>
        <Card tone="alt" testID="twin">
          <Row gap={12}>
            <Text style={{ fontSize: 48 }}>{p.emoji}</Text>
            <Text style={{ fontSize: 32 }} testID="twin-face">{tw.face}</Text>
            <Stack gap={2} style={{ flex: 1 }}>
              <Strong>{`Feeling ${tw.mood}`}</Strong>
              <Muted>{`${tw.playsLeft} plays left today · grows with care and play`}</Muted>
            </Stack>
          </Row>
          <Row wrap gap={8}>
            {PLAYS.map((pl) => (
              <Button key={pl.kind} small variant="secondary" title={`${pl.emoji} ${pl.label}`} disabled={tw.playsLeft === 0 || h === 0} onPress={() => { useGarden.getState().play(p.id, pl.kind); toast(pl.reply); }} testID={`play-${pl.kind}`} />
            ))}
          </Row>
        </Card>
      </Section>

      {mine.length ? (
        <Section title={`Good to know for your ${lib?.name}`}>
          {mine.map((x) => (
            <Card key={x.id} onPress={() => setOpenCard(x.id)} testID={`tip-${x.id}`}>
              <Strong>{x.title}</Strong>
              <Muted>{x.topic}</Muted>
            </Card>
          ))}
        </Section>
      ) : null}
      <Sheet visible={!!openCard} onClose={() => setOpenCard(null)} title="Plant care">
        {openCard ? <CardView card={cards.find((x) => x.id === openCard)!} app="thirsty" onDone={() => setOpenCard(null)} /> : null}
      </Sheet>
      <Sheet visible={doctor} onClose={() => setDoctor(false)} title="🩺 Plant doctor">
        <Stack>
          {lib?.problems.map((pr) => (
            <Card key={pr.symptom}>
              <Strong>{pr.symptom}</Strong>
              <Muted>{`Likely: ${pr.cause}`}</Muted>
              <Body>{pr.fix}</Body>
            </Card>
          ))}
        </Stack>
      </Sheet>

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
