import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { track } from '@/kit/analytics';
import { PaywallSheet } from '@/kit/Paywall';
import { usePremium } from '@/kit/premium';
import { useTheme } from '@/kit/theme';
import { Button, Field, Muted, Note, Row, Screen, Section, Stack, Strong } from '@/kit/ui';
import { RARITY_LABEL, searchLibrary, type LibPlant } from '@/domain/library';
import { plantError } from '@/domain/plants';
import { useGarden } from '@/state/garden';

export default function NewPlant() {
  const { c, radius } = useTheme();
  const { isPremium } = usePremium();
  const [q, setQ] = useState('');
  const [pick, setPick] = useState<LibPlant | 'other' | null>(null);
  const [nickname, setNickname] = useState('');
  const [water, setWater] = useState('7');
  const [feed, setFeed] = useState('30');
  const [err, setErr] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const results = searchLibrary(q, isPremium);

  const choose = (p: LibPlant, locked: boolean) => {
    if (locked) return setPaywall(true);
    setPick(p);
    setWater(String(p.waterEvery));
    setFeed(String(p.feedEvery));
  };
  const save = () => {
    const input = { nickname: nickname.trim(), waterEvery: Number(water), feedEvery: Number(feed) };
    const e = plantError(input);
    if (e) return setErr(e);
    const lib = pick && pick !== 'other' ? pick : null;
    const id = useGarden.getState().add({ ...input, type: lib?.name ?? 'Other', emoji: lib?.emoji ?? '🪴', libraryId: lib?.id, winterWaterEvery: lib?.winterWaterEvery });
    track('core_action_completed', { what: 'plant_added', rarity: lib?.rarity ?? 'other' });
    router.replace(`/plant/${id}`);
  };

  if (!pick) {
    return (
      <Screen edges={['bottom']} testID="plant-new">
        <Field label="What kind of plant?" value={q} onChangeText={setQ} placeholder="Search: pothos, monstera, basil…" testID="plant-search" />
        <Stack gap={6}>
          {results.map(({ plant: p, locked }) => (
            <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={`${p.name}, ${RARITY_LABEL[p.rarity]}${locked ? ', Premium' : ''}`} onPress={() => choose(p, locked)} testID={`lib-${p.id}`} style={{ padding: 12, borderRadius: radius, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, opacity: locked ? 0.6 : 1 }}>
              <Row gap={10}>
                <Text style={{ fontSize: 24 }}>{p.emoji}</Text>
                <Stack gap={0} style={{ flex: 1 }}>
                  <Strong>{p.name}</Strong>
                  <Muted>{`${p.latin} · ${RARITY_LABEL[p.rarity]}`}</Muted>
                </Stack>
                <Text>{locked ? '🔒' : ''}</Text>
              </Row>
            </Pressable>
          ))}
        </Stack>
        <Button title="My plant isn't listed" variant="ghost" onPress={() => setPick('other')} testID="lib-other" />
        <PaywallSheet visible={paywall} onClose={() => setPaywall(false)} reason="Free Thirsty covers the 20 most common houseplants. Premium unlocks every plant, rare and legendary too." />
      </Screen>
    );
  }
  return (
    <Screen edges={['bottom']} testID="plant-new" footer={<Button title="Add to my garden" onPress={save} testID="plant-save" />}>
      <Strong>{pick === 'other' ? '🪴 Your own plant' : `${pick.emoji} ${pick.name}`}</Strong>
      {pick !== 'other' ? <Muted>{pick.personality}</Muted> : null}
      <Field label="Nickname" value={nickname} onChangeText={(t) => { setNickname(t); setErr(null); }} placeholder="e.g. Cyphicus" maxLength={24} testID="plant-name" />
      <Section title="Care rhythm (adjust to your home)">
        <Row gap={10}>
          <Field label="Water every (days)" value={water} onChangeText={setWater} inputMode="numeric" keyboardType="number-pad" maxLength={2} testID="plant-water" style={{ minWidth: 120 }} />
          <Field label="Feed every (days, 0 = never)" value={feed} onChangeText={setFeed} inputMode="numeric" keyboardType="number-pad" maxLength={3} testID="plant-feed" style={{ minWidth: 120 }} />
        </Row>
        {pick !== 'other' ? <Muted>{`Slows to every ${pick.winterWaterEvery} days in winter. Always check the compost first.`}</Muted> : null}
      </Section>
      {err ? <Note tone="warning">{err}</Note> : null}
      <Button title="Choose a different plant" variant="ghost" onPress={() => setPick(null)} />
    </Screen>
  );
}
