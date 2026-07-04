import { useState } from 'react';
import { Icon } from '../../components/common/Icon';
import { useUiStore } from '../../store/uiStore';
import { useListingImprovements } from './useListing';

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  COSMETIC: { bg: '#EAF3DE', color: '#27500A' },
  STRUCTURAL: { bg: '#FCEBEB', color: '#791F1F' },
};

const DEMAND_BADGE: Record<string, string> = { HIGH: 'bt', MODERATE: 'ba2', LOW: 'bb' };
const DEMAND_LABEL: Record<string, string> = { HIGH: 'High demand', MODERATE: 'Moderate demand', LOW: 'Low demand' };

export function Improve() {
  const { data: plan, isLoading } = useListingImprovements();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const openModal = useUiStore((s) => s.openModal);

  if (isLoading || !plan) return <div className="pad">Loading…</div>;

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="pad">
      <div className="aic" style={{ marginBottom: 10 }}>
        <div className="aico aicos">
          <Icon name="ti-sparkles" size={14} />
        </div>
        <div>
          <div className="ails">AI summary</div>
          <div className="ait">{plan.summary}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '8px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-success)' }}>${(plan.totalLow / 1000).toFixed(0)}K</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Low spend</div>
        </div>
        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '8px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-accent)' }}>${(plan.totalHigh / 1000).toFixed(0)}K</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>High spend</div>
        </div>
        <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '8px 4px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#1D9E75' }}>${(plan.totalUplift / 1000).toFixed(0)}K+</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Value uplift</div>
        </div>
      </div>

      {plan.ideas.map((idea) => {
        const style = TYPE_STYLE[idea.type] ?? TYPE_STYLE.COSMETIC;
        const isOpen = expanded.has(idea.id);
        return (
          <div className="rc2" key={idea.id}>
            <div className="rt">
              <div>
                <div className="rtt">{idea.title}</div>
                <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                  <span className={`badge ${DEMAND_BADGE[idea.demandLevel]}`}>{DEMAND_LABEL[idea.demandLevel]}</span>
                  <span className="badge" style={{ background: style.bg, color: style.color }}>
                    {idea.type === 'COSMETIC' ? 'Cosmetic' : 'Structural'}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-success)', whiteSpace: 'nowrap' }}>
                +${(idea.valueLift / 1000).toFixed(0)}K
              </span>
            </div>
            <div className={`re${isOpen ? ' open' : ''}`}>
              <div className="vr">
                <div className="vc">
                  <div className="vv" style={{ color: 'var(--text-success)' }}>
                    ${(idea.costLow / 1000).toFixed(0)}K–${(idea.costHigh / 1000).toFixed(0)}K
                  </div>
                  <div className="vl">Estimated cost</div>
                </div>
                <div className="vc">
                  <div className="vv" style={{ color: '#1D9E75' }}>
                    ~${(idea.valueLift / 1000).toFixed(0)}K
                  </div>
                  <div className="vl">Value lift</div>
                </div>
              </div>
              {idea.supportingNotes.map((note, i) => (
                <div className="chip" key={i}>
                  <Icon name={i === 0 ? 'ti-users' : 'ti-info-circle'} size={14} color={i === 0 ? '#1D9E75' : 'var(--text-muted)'} />
                  <span>{note}</span>
                </div>
              ))}
            </div>
            <button className="btn btns" style={{ marginTop: 7 }} onClick={() => toggle(idea.id)}>
              {isOpen ? 'Hide details' : 'View details'}
            </button>
          </div>
        );
      })}

      <button className="addbtn" onClick={() => openModal('addImprovement')}>
        <Icon name="ti-plus" size={16} />
        Add your own improvement idea
      </button>
    </div>
  );
}
