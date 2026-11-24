import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { AdBanner } from '@/kit/ads';
import { todayKey } from '@/kit/dates';
import { PaywallSheet } from '@/kit/Paywall';
import { usePremium } from '@/kit/premium';
import { useTheme } from '@/kit/theme';
import { Body, Button, Card, EmptyState, H1, Muted, ProgressBar, Row, Screen, Stack, Strong } from '@/kit/ui';
import { dueIn, GEMS, health } from '@/domain/plants';
import { FREE_PLANTS } from '@/brand';
import { useCare } from '@/components/useWater';
import { useGarden } from '@/state/garden';
import { league, personality } from '@/domain/library';
import '@/arcade';
import { ArcadeEntry } from '@/kit/arcade/screens';

const dueText = (d: number) => (d > 1 ? `Water in ${d} days` : d === 1 ? 'Water tomorrow' : d === 0 ? 'Water today' : `${-d} ${d === -1 ? 'day' : 'days'} overdue`);

export default function Garden() {
  const { c, font } = useTheme();
  const g = useGarden();
  const care = useCare();
  const { isPremium } = usePremium();
  const [paywall, setPaywall] = useState(false);
  const today = todayKey();
  const sorted = [...g.plants].sort((a, b) => dueIn(a, 'water', today) - dueIn(b, 'water', today));
  const dying = g.plants.find((p) => health(p, today) === 0 && g.mourned[p.id] !== today);
  const add = () => (!isPremium && g.plants.length >= FREE_PLANTS ? setPaywall(true) : router.push('/plant/new'));

  return (
    <Screen testID="garden" banner={<AdBanner placement="plants_banner" />}>
      <Row style={{ justifyContent: 'space-between' }}>
        <H1>Your garden</H1>
        <Text testID="gems" style={{ fontFamily: font.display, fontSize: 20, color: c.text }} accessibilityLabel={`${g.gems} gems`}>{`💎 ${g.gems}`}</Text>
      </Row>
      {g.plants.length === 0 ? (
        <EmptyState icon="leaf-outline" title="No plants yet" body="Add your first plant and Thirsty will remind you when it's thirsty." action={<Button title="Add a plant" icon="add" onPress={add} testID="add-plant" />} />
      ) : (
        <>
          <Card tone="alt" testID="league">
            <Strong>{`${league(g.plants).emoji} ${league(g.plants).name} league · ${league(g.plants).points} pts`}</Strong>
            <Muted>{league(g.plants).next ? `${league(g.plants).next!.needs} pts to ${league(g.plants).next!.name}. Rarer plants score more.` : 'Top league. Legendary.'}</Muted>
            {personality(g.plants).slice(0, 2).map((l) => (
              <Body key={l}>{`“${l}”`}</Body>
            ))}
          </Card>
          <Stack gap={10}>
            {sorted.map((p) => {
              const d = dueIn(p, 'water', today);
              const h = health(p, today);
              return (
                <Card key={p.id} onPress={() => router.push(`/plant/${p.id}`)} testID={`plant-${p.nickname}`} accessibilityLabel={`${p.nickname}, ${dueText(d)}, health ${h} percent`}>
                  <Row gap={12}>
                    <Text style={{ fontSize: 40 }}>{h === 0 ? '🥀' : p.emoji}</Text>
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Strong>{p.nickname}</Strong>
                      <Muted testID={`due-${p.nickname}`}>{`${p.type} · ${dueText(d)}`}</Muted>
                      <ProgressBar value={h / 100} label={`${p.nickname} health`} height={8} color={h > 50 ? c.primary : h > 0 ? c.accent : c.danger} />
                    </Stack>
                    <Button small variant={d <= 0 ? 'primary' : 'secondary'} title="💧" accessibilityLabel={`Water ${p.nickname}`} onPress={() => care(p, 'water')} testID={`water-${p.nickname}`} />
                  </Row>
                </Card>
              );
            })}
          </Stack>
          <Button title="Add a plant" icon="add" variant="secondary" onPress={add} testID="add-plant" />
        </>
      )}

      <Modal visible={!!dying} animationType="fade" onRequestClose={() => dying && g.mourn(dying.id)}>
        {dying ? (
          <View style={{ flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }} testID="drama">
            <Text style={{ fontSize: 96 }}>🥀</Text>
            <Text style={{ fontSize: 40 }}>🎻</Text>
            <Text style={{ fontFamily: font.display, fontSize: 30, color: '#fff', textAlign: 'center' }}>{`NOOOOOOO!!!! NOT ${dying.nickname.toUpperCase()}!!!!`}</Text>
            <Body center color="#ddd">{`${dying.nickname}'s in-app health hit zero (the real one is probably just thirsty). Bring it back:`}</Body>
            <Button title={`Water ${dying.nickname} now`} onPress={() => { care(dying, 'water'); g.mourn(dying.id); }} testID="drama-water" />
            <Button variant="accent" title={`Revive for ${GEMS.reviveCost} 💎 (you have ${g.gems})`} disabled={g.gems < GEMS.reviveCost} onPress={() => { g.revive(dying.id); g.mourn(dying.id); }} testID="drama-revive" />
            <Button variant="ghost" title="Not now" onPress={() => g.mourn(dying.id)} testID="drama-close" />
          </View>
        ) : null}
      </Modal>
      <PaywallSheet visible={paywall} onClose={() => setPaywall(false)} reason={`Free Thirsty looks after ${FREE_PLANTS} plants. Jungle at home? Premium has no limit.`} />
      <ArcadeEntry />
    </Screen>
  );
}
