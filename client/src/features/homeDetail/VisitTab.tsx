import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { CustomMetric } from 'shared';
import { Badge } from '../../components/common/Badge';
import { FactorBar } from '../../components/common/FactorBar';
import { Icon } from '../../components/common/Icon';
import { FEELING_ENUM, FEELING_LABEL, FEELING_OPTIONS } from '../visitMode/roomOptions';
import { useUiStore } from '../../store/uiStore';
import { useProperty } from '../homes/useProperties';
import { useHousehold } from '../household/useHousehold';
import { useCustomMetrics } from '../profile/useCustomMetrics';
import { useUpdateNeighborhoodScore, useUpdatePropertyMetricScores, useUpdateRoomScore } from './useRoomScore';

interface ScoreDraft {
  layout: number;
  storage: number;
  light: number;
  vibe: number;
  feeling: string;
  note: string;
  customValues: Record<string, number>;
}

interface PropertyDraft {
  curbAppeal: number;
  streetVibe: number;
  feeling: string;
  note: string;
  metricValues: Record<string, number>;
}

// A ROOM-scoped metric with no targetRoomName applies to every room (matches old behavior for
// custom, non-catalog metrics); one with a targetRoomName only applies to a matching room.
function matchesRoom(metric: CustomMetric, roomName: string): boolean {
  return metric.scope === 'ROOM' && (!metric.targetRoomName || metric.targetRoomName.toLowerCase() === roomName.toLowerCase());
}

export function VisitTab() {
  const { propertyId = '' } = useParams();
  const { data: property, isLoading } = useProperty(propertyId);
  const { data: household } = useHousehold();
  const { data: customMetrics = [] } = useCustomMetrics();
  const openModal = useUiStore((s) => s.openModal);
  const updateScore = useUpdateRoomScore(propertyId);
  const updateNeighborhood = useUpdateNeighborhoodScore(propertyId);
  const updatePropertyMetrics = useUpdatePropertyMetricScores(propertyId);
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ScoreDraft | null>(null);
  const [propertyExpanded, setPropertyExpanded] = useState(false);
  const [propertyDraft, setPropertyDraft] = useState<PropertyDraft | null>(null);

  if (isLoading || !property) return <div>Loading…</div>;

  const myScorerId = household?.members.find((m) => m.isYou)?.id;
  const rooms = property.rooms.map((room) => ({
    ...room,
    myScore: room.scores.find((s) => s.scorer.id === myScorerId),
  }));

  const toggleRoom = (room: (typeof rooms)[number]) => {
    if (!room.myScore) return;
    if (expandedRoomId === room.id) {
      setExpandedRoomId(null);
      setDraft(null);
      return;
    }
    setExpandedRoomId(room.id);
    setDraft({
      layout: room.myScore.layout,
      storage: room.myScore.storage,
      light: room.myScore.light,
      vibe: room.myScore.vibe,
      feeling: FEELING_LABEL[room.myScore.feeling] ?? 'Calm',
      note: room.myScore.note ?? '',
      customValues: Object.fromEntries(room.myScore.customScores.map((c) => [c.metricId, c.value])),
    });
  };

  const saveDraft = (roomId: string, roomName: string) => {
    if (!draft) return;
    const { customValues, ...rest } = draft;
    const customScores = customMetrics.filter((m) => matchesRoom(m, roomName)).map((m) => ({ metricId: m.id, value: customValues[m.id] ?? 5 }));
    updateScore.mutate(
      { roomId, ...rest, feeling: FEELING_ENUM[draft.feeling] ?? 'CALM', customScores },
      { onSuccess: () => setExpandedRoomId(null) },
    );
  };

  const propertyMetrics = customMetrics.filter((m) => m.scope === 'PROPERTY');

  const toggleProperty = () => {
    if (propertyExpanded) {
      setPropertyExpanded(false);
      setPropertyDraft(null);
      return;
    }
    setPropertyExpanded(true);
    const existingMetricValues = Object.fromEntries(property.metricScores.map((s) => [s.metricId, s.value]));
    setPropertyDraft({
      curbAppeal: property.neighborhoodScore?.curbAppeal ?? 5,
      streetVibe: property.neighborhoodScore?.streetVibe ?? 5,
      feeling: FEELING_LABEL[property.neighborhoodScore?.feeling ?? 'CALM'] ?? 'Calm',
      note: property.neighborhoodScore?.note ?? '',
      metricValues: Object.fromEntries(propertyMetrics.map((m) => [m.id, existingMetricValues[m.id] ?? 5])),
    });
  };

  const savePropertyDraft = async () => {
    if (!propertyDraft) return;
    await Promise.all([
      updateNeighborhood.mutateAsync({
        curbAppeal: propertyDraft.curbAppeal,
        streetVibe: propertyDraft.streetVibe,
        feeling: FEELING_ENUM[propertyDraft.feeling] ?? 'CALM',
        note: propertyDraft.note,
      }),
      updatePropertyMetrics.mutateAsync(Object.entries(propertyDraft.metricValues).map(([metricId, value]) => ({ metricId, value }))),
    ]);
    setPropertyExpanded(false);
  };

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
            <div key={room.id}>
              <div className="rrow" style={{ cursor: room.myScore ? 'pointer' : 'default' }} onClick={() => toggleRoom(room)}>
                <div className="ri">
                  <Icon name={room.icon} size={17} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{room.name}</div>
                  {room.myScore && (
                    <span className="badge bb" style={{ fontSize: 10, marginTop: 3, display: 'inline-block' }}>
                      {FEELING_LABEL[room.myScore.feeling]}
                    </span>
                  )}
                  {room.myScore?.note && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{room.myScore.note}</div>
                  )}
                </div>
                {room.myScore && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div className="ms">
                      <span className="mn" style={{ color: '#1D9E75' }}>
                        {room.myScore.emotionalAvg.toFixed(1)}
                      </span>
                      <span className="ml">Emo</span>
                    </div>
                    <div className="ms">
                      <span className="mn" style={{ color: 'var(--text-accent)' }}>
                        {room.myScore.functionalAvg.toFixed(1)}
                      </span>
                      <span className="ml">Func</span>
                    </div>
                  </div>
                )}
                <button
                  className="btn btns"
                  style={{ marginLeft: 6, padding: '5px 7px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal('addRenovation', { propertyId, room: room.name });
                  }}
                  aria-label={`Add renovation idea for ${room.name}`}
                >
                  <Icon name="ti-hammer" size={13} />
                </button>
              </div>

              {expandedRoomId === room.id && draft && (
                <div style={{ padding: '4px 8px 10px 40px' }} onClick={(e) => e.stopPropagation()}>
                  {(['layout', 'storage', 'light', 'vibe'] as const).map((key) => (
                    <div className="fr" key={key}>
                      <span className="frl">
                        {key === 'layout' ? 'Layout flow' : key === 'storage' ? 'Storage' : key === 'light' ? 'Natural light' : 'Vibe / feel'}
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={draft[key]}
                        style={{ flex: 1 }}
                        onChange={(e) => setDraft({ ...draft, [key]: Number(e.target.value) })}
                      />
                      <span className="frv">{draft[key]}</span>
                    </div>
                  ))}
                  {customMetrics.filter((m) => matchesRoom(m, room.name)).map((metric) => (
                    <div className="fr" key={metric.id}>
                      <span className="frl">{metric.label}</span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={draft.customValues[metric.id] ?? 5}
                        style={{ flex: 1 }}
                        onChange={(e) =>
                          setDraft({ ...draft, customValues: { ...draft.customValues, [metric.id]: Number(e.target.value) } })
                        }
                      />
                      <span className="frv">{draft.customValues[metric.id] ?? 5}</span>
                    </div>
                  ))}
                  <div style={{ margin: '8px 0' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {FEELING_OPTIONS.map((feeling) => (
                        <button
                          key={feeling}
                          className={`tag${draft.feeling === feeling ? ' sb' : ''}`}
                          onClick={() => setDraft({ ...draft, feeling })}
                        >
                          {feeling}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="na"
                    placeholder="Quick thought or voice note..."
                    style={{ marginBottom: 8 }}
                    value={draft.note}
                    onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                  />
                  <button className="btn btnp btnf" disabled={updateScore.isPending} onClick={() => saveDraft(room.id, room.name)}>
                    {updateScore.isPending ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="div" />

      <div className="slbl">Property & Neighborhood</div>
      <div className="card" style={{ padding: '10px 12px' }}>
        <div className="rrow" style={{ cursor: 'pointer' }} onClick={toggleProperty}>
          <div className="ri">
            <Icon name="ti-map-pin" size={17} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Neighborhood feel & priorities</div>
            {property.neighborhoodScore ? (
              <span className="badge bb" style={{ fontSize: 10, marginTop: 3, display: 'inline-block' }}>
                {FEELING_LABEL[property.neighborhoodScore.feeling]}
              </span>
            ) : (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Not scored yet</span>
            )}
            {propertyMetrics.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {property.metricScores.length} of {propertyMetrics.length} priorities scored
              </div>
            )}
          </div>
          {property.neighborhoodScore && (
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="ms">
                <span className="mn" style={{ color: 'var(--text-accent)' }}>
                  {property.neighborhoodScore.curbAppeal}
                </span>
                <span className="ml">Curb</span>
              </div>
              <div className="ms">
                <span className="mn" style={{ color: '#1D9E75' }}>
                  {property.neighborhoodScore.streetVibe}
                </span>
                <span className="ml">Vibe</span>
              </div>
            </div>
          )}
        </div>

        {propertyExpanded && propertyDraft && (
          <div style={{ padding: '4px 8px 10px 40px' }} onClick={(e) => e.stopPropagation()}>
            <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', margin: '4px 0' }}>Neighborhood</p>
            {(['curbAppeal', 'streetVibe'] as const).map((key) => (
              <div className="fr" key={key}>
                <span className="frl">{key === 'curbAppeal' ? 'Curb appeal' : 'Street / block vibe'}</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={propertyDraft[key]}
                  style={{ flex: 1 }}
                  onChange={(e) => setPropertyDraft({ ...propertyDraft, [key]: Number(e.target.value) })}
                />
                <span className="frv">{propertyDraft[key]}</span>
              </div>
            ))}
            <div style={{ margin: '8px 0' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {FEELING_OPTIONS.map((feeling) => (
                  <button
                    key={feeling}
                    className={`tag${propertyDraft.feeling === feeling ? ' sb' : ''}`}
                    onClick={() => setPropertyDraft({ ...propertyDraft, feeling })}
                  >
                    {feeling}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="na"
              placeholder="Quick thought about the block, street noise, neighbors..."
              style={{ marginBottom: 8 }}
              value={propertyDraft.note}
              onChange={(e) => setPropertyDraft({ ...propertyDraft, note: e.target.value })}
            />

            {propertyMetrics.length > 0 && (
              <>
                <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', margin: '10px 0 4px' }}>What matters to us</p>
                {propertyMetrics.map((metric) => (
                  <div className="fr" key={metric.id}>
                    <span className="frl">{metric.label}</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={propertyDraft.metricValues[metric.id] ?? 5}
                      style={{ flex: 1 }}
                      onChange={(e) =>
                        setPropertyDraft({ ...propertyDraft, metricValues: { ...propertyDraft.metricValues, [metric.id]: Number(e.target.value) } })
                      }
                    />
                    <span className="frv">{propertyDraft.metricValues[metric.id] ?? 5}</span>
                  </div>
                ))}
              </>
            )}

            <button
              className="btn btnp btnf"
              style={{ marginTop: 8 }}
              disabled={updateNeighborhood.isPending || updatePropertyMetrics.isPending}
              onClick={savePropertyDraft}
            >
              {updateNeighborhood.isPending || updatePropertyMetrics.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>

      <button className="addbtn" style={{ marginTop: 8 }} onClick={() => openModal('addRenovation', { propertyId })}>
        <Icon name="ti-plus" size={16} />
        Add renovation idea
      </button>

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
