import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { useProfile, useUpdateProfile } from './useProfile';
import { useCreateCustomMetric, useCustomMetrics, useDeleteCustomMetric, useUpdateCustomMetricWeight } from './useCustomMetrics';
import { PriorityGroupCard } from './PriorityGroupCard';
import { PRIORITY_GROUPS } from '../onboarding/priorityQuestions';

export function ProfileScreen() {
  const { data: profile, isLoading } = useProfile();
  const { data: customMetrics } = useCustomMetrics();
  const updateProfile = useUpdateProfile();
  const updateWeight = useUpdateCustomMetricWeight();
  const createMetric = useCreateCustomMetric();
  const deleteMetric = useDeleteCustomMetric();
  const navigate = useNavigate();
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState<'EMOTIONAL' | 'FUNCTIONAL'>('EMOTIONAL');
  const [newScope, setNewScope] = useState<'ROOM' | 'PROPERTY'>('PROPERTY');
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null);

  if (isLoading || !profile) return <div className="pad">Loading…</div>;

  const handleAddMetric = () => {
    const label = newLabel.trim();
    if (!label) return;
    createMetric.mutate({ label, category: newCategory, scope: newScope }, { onSuccess: () => setNewLabel('') });
  };

  const visibleGroups = PRIORITY_GROUPS.filter((g) => g.key !== 'pets' || profile.hasPets);

  return (
    <div className="pad">
      <div className="slbl">Active profile</div>
      <div className="card">
        <div style={{ lineHeight: 2.2 }}>
          {profile.tags.length === 0 ? (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No preferences set yet.</span>
          ) : (
            profile.tags.map((tag) => (
              <span className={`ppill ${tag.source === 'AI_MAPPED' ? 'ppm' : 'ppe'}`} key={tag.id}>
                {tag.source === 'AI_MAPPED' && <Icon name="ti-writing" size={10} />}
                {tag.label}
              </span>
            ))
          )}
        </div>
      </div>

      {profile.patterns.length > 0 && (
        <>
          <div className="slbl">Patterns noticed</div>
          {profile.patterns.map((pattern) => (
            <div className="ppc" key={pattern.title}>
              <div className="pper">
                <div className="ppic" style={{ background: pattern.iconBg }}>
                  <Icon name={pattern.icon} size={18} color={pattern.iconColor} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{pattern.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{pattern.subtitle}</div>
                </div>
              </div>
              {pattern.barValues && pattern.barLabels && (
                <>
                  <div className="sb-bar">
                    {pattern.barValues.map((v, i) => (
                      <div key={i} style={{ height: `${(v / 10) * 100}%` }} className={v >= 7 ? 'hi' : ''} />
                    ))}
                  </div>
                  <div className="tr">
                    {pattern.barLabels.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </div>
                </>
              )}
              {pattern.chip && (
                <div className="chip" style={{ marginTop: 4 }}>
                  <Icon name={pattern.chip.icon} size={15} color={pattern.chip.color} />
                  <span>{pattern.chip.text}</span>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <div className="div" />

      <div className="card">
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Score weighting</p>
        {(
          [
            { key: 'weightEmotional' as const, label: 'Emotional fit' },
            { key: 'weightStorage' as const, label: 'Storage' },
            { key: 'weightLight' as const, label: 'Natural light' },
            { key: 'weightNeighborhood' as const, label: 'Neighborhood appeal' },
          ]
        ).map(({ key, label }) => (
          <div className="fr" key={key}>
            <span className="frl">{label}</span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={profile[key]}
              style={{ flex: 1 }}
              onChange={(e) => updateProfile.mutate({ [key]: Number(e.target.value) })}
            />
            <span className="frv">{profile[key]}</span>
          </div>
        ))}
        {customMetrics?.map((metric) => (
          <div className="fr" key={metric.id}>
            <span className="frl">{metric.label}</span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={metric.weight}
              style={{ flex: 1 }}
              onChange={(e) => updateWeight.mutate({ id: metric.id, weight: Number(e.target.value) })}
            />
            <span className="frv">{metric.weight}</span>
          </div>
        ))}
      </div>

      <div className="div" />

      <div className="slbl">Your priorities</div>
      <div className="card" style={{ marginBottom: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Do you have a pet whose needs matter in this search?</p>
        <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
          <button className={`tag${profile.hasPets ? ' sb' : ''}`} onClick={() => updateProfile.mutate({ hasPets: true })}>
            Yes
          </button>
          <button className={`tag${!profile.hasPets ? ' sb' : ''}`} onClick={() => updateProfile.mutate({ hasPets: false })}>
            No
          </button>
        </div>
        <div className="fr">
          <span className="frl">Financial flexibility vs. dream house</span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={profile.priorityBudgetVsDream}
            style={{ flex: 1 }}
            onChange={(e) => updateProfile.mutate({ priorityBudgetVsDream: Number(e.target.value) })}
          />
          <span className="frv">{profile.priorityBudgetVsDream}</span>
        </div>
        <div className="fr">
          <span className="frl">Move-in ready vs. open to renovations</span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={profile.priorityMoveInReadyVsReno}
            style={{ flex: 1 }}
            onChange={(e) => updateProfile.mutate({ priorityMoveInReadyVsReno: Number(e.target.value) })}
          />
          <span className="frv">{profile.priorityMoveInReadyVsReno}</span>
        </div>
      </div>

      {visibleGroups.map((group) => {
        const open = openGroupKey === group.key;
        return (
          <div key={group.key} style={{ marginBottom: 6 }}>
            <div
              className="rrow"
              style={{ cursor: 'pointer' }}
              onClick={() => setOpenGroupKey(open ? null : group.key)}
            >
              <div className="ri">
                <Icon name={group.icon} size={17} />
              </div>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{group.title}</div>
              <div style={{ transform: open ? 'rotate(90deg)' : undefined, transition: 'transform 0.15s' }}>
                <Icon name="ti-chevron-right" size={14} />
              </div>
            </div>
            {open && <PriorityGroupCard group={group} />}
          </div>
        );
      })}

      <div className="div" />

      <div className="card">
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Custom scoring metrics</p>
        {(!customMetrics || customMetrics.length === 0) && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No custom metrics yet — add one below.</span>
        )}
        {customMetrics?.map((metric) => (
          <div key={metric.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ fontSize: 13 }}>
              {metric.label}{' '}
              <span className={`badge ${metric.category === 'EMOTIONAL' ? 'bp' : 'bt'}`}>
                {metric.category === 'EMOTIONAL' ? 'Emotional' : 'Functional'}
              </span>
            </span>
            <button
              className="btn btns"
              style={{ color: 'var(--text-danger)' }}
              onClick={() => {
                if (window.confirm(`Delete "${metric.label}"?`)) deleteMetric.mutate(metric.id);
              }}
              aria-label={`Delete ${metric.label}`}
            >
              <Icon name="ti-trash" size={14} />
            </button>
          </div>
        ))}
        <div className="div" />
        <input
          type="text"
          placeholder="New metric name (e.g. Accessibility)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
          {(['EMOTIONAL', 'FUNCTIONAL'] as const).map((cat) => (
            <button key={cat} className={`tag${newCategory === cat ? ' sb' : ''}`} onClick={() => setNewCategory(cat)}>
              {cat === 'EMOTIONAL' ? 'Emotional' : 'Functional'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {(['PROPERTY', 'ROOM'] as const).map((sc) => (
            <button key={sc} className={`tag${newScope === sc ? ' sb' : ''}`} onClick={() => setNewScope(sc)}>
              {sc === 'PROPERTY' ? 'Whole house' : 'Per room'}
            </button>
          ))}
        </div>
        <button className="btn btnp btnf" disabled={!newLabel.trim() || createMetric.isPending} onClick={handleAddMetric}>
          <Icon name="ti-plus" size={14} /> Add metric
        </button>
      </div>

      <div className="div" />

      <button className="btn btnp btnf" style={{ marginBottom: 8 }} onClick={() => navigate('/buy/onboarding')}>
        <Icon name="ti-refresh" size={15} /> Update profile
      </button>
    </div>
  );
}
