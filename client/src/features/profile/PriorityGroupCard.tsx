import { Icon } from '../../components/common/Icon';
import type { PriorityGroup, PriorityMetricItem } from '../onboarding/priorityQuestions';
import { useCreateCustomMetric, useCustomMetrics, useDeleteCustomMetric, useUpdateCustomMetricWeight } from './useCustomMetrics';

interface PriorityGroupCardProps {
  group: PriorityGroup;
}

export function PriorityGroupCard({ group }: PriorityGroupCardProps) {
  const { data: customMetrics } = useCustomMetrics();
  const createMetric = useCreateCustomMetric();
  const updateWeight = useUpdateCustomMetricWeight();
  const deleteMetric = useDeleteCustomMetric();

  const findMetric = (item: PriorityMetricItem) => customMetrics?.find((m) => m.label === item.label);

  const handleToggle = (item: PriorityMetricItem) => {
    const existing = findMetric(item);
    if (existing) {
      deleteMetric.mutate(existing.id);
    } else {
      createMetric.mutate({ label: item.label, category: item.category, scope: 'PROPERTY' });
    }
  };

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name={group.icon} size={15} /> {group.title}
      </p>
      {group.items.map((item) => {
        const existing = findMetric(item);
        const on = !!existing;
        return (
          <div key={item.key} style={{ padding: '6px 0', borderTop: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 13 }}>{item.label}</span>
              <button
                className={`tag${on ? ' sb' : ''}`}
                style={{ flexShrink: 0 }}
                disabled={createMetric.isPending || deleteMetric.isPending}
                onClick={() => handleToggle(item)}
              >
                {on ? 'Matters to us' : 'Add'}
              </button>
            </div>
            {existing && (
              <div className="fr">
                <span className="frl">Importance</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={existing.weight}
                  style={{ flex: 1 }}
                  onChange={(e) => updateWeight.mutate({ id: existing.id, weight: Number(e.target.value) })}
                />
                <span className="frv">{existing.weight}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
