import { KitSettings } from '@/kit/Settings';
import { Card, ListRow, Section } from '@/kit/ui';
import { GEMS } from '@/domain/plants';

export default function Settings() {
  return (
    <KitSettings reminder={{ title: 'Thirsty', body: 'Someone in your garden is thirsty. 💧', explain: 'One daily check at a time you choose. Never more.' }}>
      <Section title="Gems">
        <Card>
          <ListRow icon="diamond-outline" title="How gems work" subtitle={`+${GEMS.onTime} for on-time care, +${GEMS.late} if late, +${GEMS.milestone} for milestones. Spend ${GEMS.reviveCost} to revive a plant.`} />
        </Card>
      </Section>
    </KitSettings>
  );
}
