import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/common/Icon';
import type { PriorityGroup, PriorityMetricItem } from '../onboarding/priorityQuestions';
import { useCreateCustomMetric, useCustomMetrics, useDeleteCustomMetric, useUpdateCustomMetricWeight } from './useCustomMetrics';

const WEIGHT_COMMIT_DELAY_MS = 350;

interface PriorityGroupCardProps {
  group: PriorityGroup;
}

export function PriorityGroupCard({ group }: PriorityGroupCardProps) {
  const { data: customMetrics } = useCustomMetrics();
  const createMetric = useCreateCustomMetric();
  const updateWeight = useUpdateCustomMetricWeight();
  const deleteMetric = useDeleteCustomMetric();
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [weightDrafts, setWeightDrafts] = useState<Record<string, number>>({});
  const commitTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const timers = commitTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const findMetric = (item: PriorityMetricItem) => customMetrics?.find((m) => m.label === item.label);

  const setPending = (key: string, pending: boolean) => {
    setPendingKeys((prev) => {
      const next = new Set(prev);
      if (pending) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const handleToggle = (item: PriorityMetricItem) => {
    const existing = findMetric(item);
    setPending(item.key, true);
    if (existing) {
      deleteMetric.mutate(existing.id, { onSettled: () => setPending(item.key, false) });
    } else {
      createMetric.mutate({ label: item.label, category: item.category, scope: 'PROPERTY' }, { onSettled: () => setPending(item.key, false) });
    }
  };

  const handleWeightChange = (item: PriorityMetricItem, metricId: string, weight: number) => {
    setWeightDrafts((prev) => ({ ...prev, [item.key]: weight }));
    clearTimeout(commitTimers.current[item.key]);
    commitTimers.current[item.key] = setTimeout(() => {
      updateWeight.mutate({ id: metricId, weight });
    }, WEIGHT_COMMIT_DELAY_MS);
  };

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name={group.icon} size={15} /> {group.title}
      </p>
      {group.items.map((item) => {
        const existing = findMetric(item);
        const on = !!existing;
        const weight = weightDrafts[item.key] ?? existing?.weight ?? 5;
        return (
          <div key={item.key} style={{ padding: '6px 0', borderTop: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 13 }}>{item.label}</span>
              <button
                className={`tag${on ? ' sb' : ''}`}
                style={{ flexShrink: 0 }}
                disabled={pendingKeys.has(item.key)}
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
                  value={weight}
                  style={{ flex: 1 }}
                  onChange={(e) => handleWeightChange(item, existing.id, Number(e.target.value))}
                />
                <span className="frv">{weight}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
