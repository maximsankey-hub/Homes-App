import { useEffect, useRef, useState } from 'react';
import { Icon } from '../../components/common/Icon';
import type { PriorityGroup, PriorityMetricItem } from '../onboarding/priorityQuestions';
import { useCreateCustomMetric, useCustomMetrics, useDeleteCustomMetric, useUpdateCustomMetricWeight } from './useCustomMetrics';

const WEIGHT_COMMIT_DELAY_MS = 350;

interface PriorityGroupCardProps {
  group: PriorityGroup;
  // Only relevant for the Pets group: items with `requiresPetType` only show once that pet type
  // is in this list. Ignored for every other group.
  petTypes?: string[];
}

export function PriorityGroupCard({ group, petTypes = [] }: PriorityGroupCardProps) {
  const { data: customMetrics } = useCustomMetrics();
  const createMetric = useCreateCustomMetric();
  const updateWeight = useUpdateCustomMetricWeight();
  const deleteMetric = useDeleteCustomMetric();
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [weightDrafts, setWeightDrafts] = useState<Record<string, number>>({});
  const commitTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState<'EMOTIONAL' | 'FUNCTIONAL'>('EMOTIONAL');

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
      createMetric.mutate(
        { label: item.label, category: item.category, scope: item.scope, targetRoomName: item.targetRoomName },
        { onSettled: () => setPending(item.key, false) },
      );
    }
  };

  const handleWeightChange = (item: PriorityMetricItem, metricId: string, weight: number) => {
    setWeightDrafts((prev) => ({ ...prev, [item.key]: weight }));
    clearTimeout(commitTimers.current[item.key]);
    commitTimers.current[item.key] = setTimeout(() => {
      updateWeight.mutate({ id: metricId, weight });
    }, WEIGHT_COMMIT_DELAY_MS);
  };

  const visibleItems = group.items.filter((item) => !item.requiresPetType || petTypes.includes(item.requiresPetType));
  const customTopicMetrics = customMetrics?.filter((m) => m.topicKey === group.key) ?? [];

  const handleAddCustom = () => {
    const label = newLabel.trim();
    if (!label) return;
    createMetric.mutate({ label, category: newCategory, scope: 'PROPERTY', topicKey: group.key }, { onSuccess: () => setNewLabel('') });
  };

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon name={group.icon} size={15} /> {group.title}
      </p>
      {visibleItems.length === 0 && (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Select a pet type above to see relevant questions here.
        </span>
      )}
      {visibleItems.map((item) => {
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
      {customTopicMetrics.map((metric) => {
        const weight = weightDrafts[metric.id] ?? metric.weight;
        return (
          <div key={metric.id} style={{ padding: '6px 0', borderTop: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 13 }}>
                {metric.label}{' '}
                <span className={`badge ${metric.category === 'EMOTIONAL' ? 'bp' : 'bt'}`}>
                  {metric.category === 'EMOTIONAL' ? 'Emotional' : 'Functional'}
                </span>
              </span>
              <button
                className="btn btns"
                style={{ flexShrink: 0, color: 'var(--text-danger)' }}
                onClick={() => deleteMetric.mutate(metric.id)}
                aria-label={`Delete ${metric.label}`}
              >
                <Icon name="ti-trash" size={13} />
              </button>
            </div>
            <div className="fr">
              <span className="frl">Importance</span>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={weight}
                style={{ flex: 1 }}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setWeightDrafts((prev) => ({ ...prev, [metric.id]: v }));
                  clearTimeout(commitTimers.current[metric.id]);
                  commitTimers.current[metric.id] = setTimeout(() => updateWeight.mutate({ id: metric.id, weight: v }), WEIGHT_COMMIT_DELAY_MS);
                }}
              />
              <span className="frv">{weight}</span>
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: '0.5px solid var(--border)' }}>
        <input
          type="text"
          placeholder="+ Add your own question"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          style={{ marginBottom: 6 }}
        />
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {(['EMOTIONAL', 'FUNCTIONAL'] as const).map((cat) => (
            <button key={cat} className={`tag${newCategory === cat ? ' sb' : ''}`} onClick={() => setNewCategory(cat)}>
              {cat === 'EMOTIONAL' ? 'Emotional' : 'Functional'}
            </button>
          ))}
          <button
            className="btn btns btnp"
            style={{ marginLeft: 'auto' }}
            disabled={!newLabel.trim() || createMetric.isPending}
            onClick={handleAddCustom}
          >
            <Icon name="ti-plus" size={13} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
