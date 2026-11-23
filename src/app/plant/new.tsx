import { router } from 'expo-router';
import { useState } from 'react';
import { track } from '@/kit/analytics';
import { Button, Chip, Field, Muted, Note, Row, Screen, Section } from '@/kit/ui';
import { plantError, PRESETS } from '@/domain/plants';
import { useGarden } from '@/state/garden';

export default function NewPlant() {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [nickname, setNickname] = useState('');
  const [water, setWater] = useState(String(PRESETS[0].waterEvery));
  const [feed, setFeed] = useState(String(PRESETS[0].feedEvery));
  const [err, setErr] = useState<string | null>(null);
  const save = () => {
    const input = { nickname: nickname.trim(), waterEvery: Number(water), feedEvery: Number(feed) };
    const e = plantError(input);
    if (e) return setErr(e);
    const id = useGarden.getState().add({ ...input, type: preset.type, emoji: preset.emoji });
    track('core_action_completed', { what: 'plant_added', type: preset.type });
    router.replace(`/plant/${id}`);
  };
  return (
    <Screen edges={['bottom']} testID="plant-new" footer={<Button title="Add to my garden" onPress={save} testID="plant-save" />}>
      <Section title="What kind of plant?">
        <Row wrap gap={8}>
          {PRESETS.map((p) => (
            <Chip key={p.type} label={`${p.emoji} ${p.type}`} selected={preset.type === p.type} onPress={() => { setPreset(p); setWater(String(p.waterEvery)); setFeed(String(p.feedEvery)); }} testID={`preset-${p.type}`} />
          ))}
        </Row>
        <Muted>{preset.tip}</Muted>
      </Section>
      <Field label="Nickname" value={nickname} onChangeText={(t) => { setNickname(t); setErr(null); }} placeholder="e.g. Cyphicus" maxLength={24} testID="plant-name" />
      <Row gap={10}>
        <Field label="Water every (days)" value={water} onChangeText={setWater} inputMode="numeric" keyboardType="number-pad" maxLength={2} testID="plant-water" style={{ minWidth: 120 }} />
        <Field label="Feed every (days)" value={feed} onChangeText={setFeed} inputMode="numeric" keyboardType="number-pad" maxLength={3} testID="plant-feed" style={{ minWidth: 120 }} />
      </Row>
      <Muted>These are general starting points. Every home is different, so adjust them to suit your plant.</Muted>
      {err ? <Note tone="warning">{err}</Note> : null}
    </Screen>
  );
}
