import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { useUiStore } from '../../store/uiStore';
import { useRenovations } from './useRenovations';

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  COSMETIC: { bg: '#EAF3DE', color: '#27500A' },
  STRUCTURAL: { bg: '#FCEBEB', color: '#791F1F' },
};

export function RenoTab() {
  const { propertyId } = useParams();
  const { data: ideas, isLoading } = useRenovations(propertyId);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const openModal = useUiStore((s) => s.openModal);

  if (isLoading || !ideas) return <div>Loading…</div>;

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalLow = ideas.reduce((sum, i) => sum + i.costLow, 0);
  const totalHigh = ideas.reduce((sum, i) => sum + i.costHigh, 0);
  const totalMid = Math.round((totalLow + totalHigh) / 2);

  return (
    <div>
      <div className="slbl">Renovation ideas</div>
      {ideas.map((idea) => {
        const style = TYPE_STYLE[idea.type] ?? TYPE_STYLE.COSMETIC;
        const isOpen = expanded.has(idea.id);
        return (
          <div className="rc2" key={idea.id}>
            <div className="rt">
              <div>
                <div className="rtt">{idea.title}</div>
                <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
                  <span className="badge" style={{ background: style.bg, color: style.color }}>
                    {idea.type === 'COSMETIC' ? 'Cosmetic' : 'Structural'}
                  </span>
                  <span className="badge bb">{idea.room}</span>
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-accent)' }}>
                ${idea.costLow.toLocaleString()}–${idea.costHigh.toLocaleString()}
              </span>
            </div>
            <div className={`re${isOpen ? ' open' : ''}`}>
              {idea.need && (
                <div className="chip">
                  <Icon name="ti-user" size={14} color="var(--text-accent)" />
                  <span>{idea.need}</span>
                </div>
              )}
              <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-0)', overflow: 'hidden', margin: '5px 0 3px' }}>
                <div
                  style={{
                    height: '100%',
                    borderRadius: 3,
                    background: idea.feasibility >= 80 ? '#1D9E75' : idea.feasibility >= 60 ? '#EF9F27' : '#E24B4A',
                    width: `${idea.feasibility}%`,
                  }}
                />
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 5 }}>{idea.feasibility}% feasible</div>
              {idea.constraintNote && (
                <div className="chip">
                  <Icon name="ti-info-circle" size={14} color="var(--text-muted)" />
                  <span>{idea.constraintNote}</span>
                </div>
              )}
            </div>
            <button className="btn btns" style={{ marginTop: 6 }} onClick={() => toggle(idea.id)}>
              {isOpen ? 'Hide details' : 'View details'}
            </button>
          </div>
        );
      })}

      <div className="card">
        <div className="ct">Cost summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
          <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '8px 4px' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-success)' }}>${totalLow.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Low</div>
          </div>
          <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '8px 4px' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-accent)' }}>${totalMid.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Mid</div>
          </div>
          <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '8px 4px' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-warning)' }}>${totalHigh.toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>High</div>
          </div>
        </div>
      </div>
      <button className="addbtn" onClick={() => openModal('addRenovation', { propertyId })}>
        <Icon name="ti-plus" size={16} />
        Add renovation idea
      </button>
    </div>
  );
}
