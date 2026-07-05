import { useParams } from 'react-router-dom';
import { Badge } from '../../components/common/Badge';
import { FactorBar } from '../../components/common/FactorBar';
import { Icon } from '../../components/common/Icon';
import { useUiStore } from '../../store/uiStore';
import { useProperty } from '../homes/useProperties';

const FEELING_LABEL: Record<string, string> = {
  EXCITED: 'Excited',
  CALM: 'Calm',
  UNCERTAIN: 'Uncertain',
  OVERWHELMED: 'Overwhelmed',
  INSPIRED: 'Inspired',
};

export function VisitTab() {
  const { propertyId = '' } = useParams();
  const { data: property, isLoading } = useProperty(propertyId);
  const openModal = useUiStore((s) => s.openModal);

  if (isLoading || !property) return <div>Loading…</div>;

  const rooms = property.rooms.map((room) => ({
    ...room,
    selfScore: room.scores.find((s) => s.scorer.role === 'SELF'),
  }));

  return (
    <div>
      <div className="slbl">Room scores</div>
      <div className="card" style={{ padding: '10px 12px' }}>
        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-muted)', fontSize: 12 }}>
            <Icon name="ti-clipboard-check" size={26} />
            <div style={{ marginTop: 6 }}>No rooms scored yet.</div>
          </div>
        ) : (
          rooms.map((room) => (
            <div className="rrow" key={room.id}>
              <div className="ri">
                <Icon name={room.icon} size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{room.name}</div>
                {room.selfScore && (
                  <span className="badge bb" style={{ fontSize: 10, marginTop: 3, display: 'inline-block' }}>
                    {FEELING_LABEL[room.selfScore.feeling]}
                  </span>
                )}
                {room.selfScore?.note && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{room.selfScore.note}</div>
                )}
              </div>
              {room.selfScore && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="ms">
                    <span className="mn" style={{ color: '#1D9E75' }}>
                      {room.selfScore.emotionalAvg.toFixed(1)}
                    </span>
                    <span className="ml">Emo</span>
                  </div>
                  <div className="ms">
                    <span className="mn" style={{ color: 'var(--text-accent)' }}>
                      {room.selfScore.functionalAvg.toFixed(1)}
                    </span>
                    <span className="ml">Func</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="div" />

      <div className="slbl">Photos and videos</div>
      {property.untaggedMedia.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Untagged media</span>
            <Badge text={`${property.untaggedMedia.length} untagged`} variant="warning" />
          </div>
          <div className="ust">
            {property.untaggedMedia.map((media) => (
              <div
                key={media.id}
                className="ui"
                onClick={() =>
                  openModal('tagMedia', {
                    mediaId: media.id,
                    propertyId,
                    rooms: property.rooms.map((r) => ({ id: r.id, name: r.name, icon: r.icon })),
                  })
                }
              >
                <Icon name={media.type === 'PHOTO' ? 'ti-camera' : media.type === 'VIDEO' ? 'ti-video' : 'ti-microphone'} size={20} />
                <div className="utag">
                  <Icon name="ti-tag" size={9} color="#fff" />
                </div>
              </div>
            ))}
          </div>
          <div className="div" />
        </div>
      )}

      {rooms
        .filter((r) => r.media.length > 0)
        .map((room) => (
          <div key={room.id} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>{room.name}</div>
            <div className="mgrid">
              {room.media.map((media, i) => (
                <div
                  className="mth"
                  key={media.id}
                  onClick={() => openModal('viewMedia', { media: room.media, index: i })}
                >
                  {media.type === 'PHOTO' ? (
                    <img src={media.filePath} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="tb">
                      <Icon name={media.type === 'VIDEO' ? 'ti-video' : 'ti-microphone'} size={22} />
                    </div>
                  )}
                  <div className="tt">{media.type.toLowerCase()}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

      <div className="card">
        <div className="ct">Factor breakdown</div>
        {property.factorBreakdown.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No factor data yet.</div>
        ) : (
          property.factorBreakdown.map((f) => <FactorBar key={f.label} label={f.label} value={f.value} />)
        )}
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ textAlign: 'center', padding: 9, background: 'var(--surface-1)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: '#1D9E75' }}>{property.emotionalAvg?.toFixed(1) ?? '—'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Emotional avg</div>
          </div>
          <div style={{ textAlign: 'center', padding: 9, background: 'var(--surface-1)', borderRadius: 'var(--radius)' }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-accent)' }}>{property.functionalAvg?.toFixed(1) ?? '—'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Functional avg</div>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          {property.secondaryInsights.map((insight) => (
            <div className="chip" key={insight.text}>
              <Icon name={insight.icon} size={15} color={insight.color} />
              <span>{insight.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
