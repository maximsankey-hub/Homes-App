import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { useUiStore } from '../../store/uiStore';
import { CaptureButtons } from '../visitMode/CaptureButtons';
import { useAssignRenovationRoom, useDeleteRenovation, useRenovations, useUploadRenovationMedia } from './useRenovations';

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  COSMETIC: { bg: '#EAF3DE', color: '#27500A' },
  STRUCTURAL: { bg: '#FCEBEB', color: '#791F1F' },
};

export function RenoTab() {
  const { propertyId } = useParams();
  const { data: ideas, isLoading } = useRenovations(propertyId);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [roomDraft, setRoomDraft] = useState<Record<string, string>>({});
  const openModal = useUiStore((s) => s.openModal);
  const deleteRenovation = useDeleteRenovation(propertyId ?? '');
  const assignRoom = useAssignRenovationRoom(propertyId ?? '');
  const uploadMedia = useUploadRenovationMedia(propertyId ?? '');

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
                  <span className={`badge ${idea.room ? 'bb' : ''}`} style={idea.room ? undefined : { background: 'var(--surface-1)', color: 'var(--text-muted)' }}>
                    {idea.room ?? 'Unassigned'}
                  </span>
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

              {!idea.room && (
                <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
                  <input
                    type="text"
                    placeholder="Assign to a room..."
                    value={roomDraft[idea.id] ?? ''}
                    onChange={(e) => setRoomDraft((prev) => ({ ...prev, [idea.id]: e.target.value }))}
                    style={{ marginBottom: 0, flex: 1 }}
                  />
                  <button
                    className="btn btns"
                    disabled={!roomDraft[idea.id]?.trim() || assignRoom.isPending}
                    onClick={() => assignRoom.mutate({ id: idea.id, room: roomDraft[idea.id].trim() })}
                  >
                    Assign
                  </button>
                </div>
              )}

              {idea.media.length > 0 && (
                <div className="mgrid" style={{ margin: '8px 0' }}>
                  {idea.media.map((media, i) => (
                    <div
                      className="mth"
                      key={media.id}
                      onClick={() => openModal('viewMedia', { media: idea.media, index: i })}
                    >
                      {media.type === 'PHOTO' ? (
                        <img src={media.filePath} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="tb">
                          <Icon name={media.type === 'VIDEO' ? 'ti-video' : 'ti-microphone'} size={22} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 11, fontWeight: 500, margin: '8px 0 6px' }}>Attach photos</p>
              <CaptureButtons
                onCapture={(file, kind) => uploadMedia.mutate({ renovationIdeaId: idea.id, file, kind })}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <button className="btn btns" style={{ flex: 1 }} onClick={() => toggle(idea.id)}>
                {isOpen ? 'Hide details' : 'View details'}
              </button>
              <button
                className="btn btns"
                style={{ color: 'var(--text-danger)' }}
                onClick={() => {
                  if (window.confirm(`Delete "${idea.title}"?`)) deleteRenovation.mutate(idea.id);
                }}
                aria-label="Delete renovation idea"
              >
                <Icon name="ti-trash" size={14} />
              </button>
            </div>
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
