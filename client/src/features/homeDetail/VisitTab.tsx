import { useState } from 'react';
import { useParams } from 'react-router-dom';
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

interface NeighborhoodDraft {
  curbAppeal: number;
  streetVibe: number;
  feeling: string;
  note: string;
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
  const [neighborhoodExpanded, setNeighborhoodExpanded] = useState(false);
  const [neighborhoodDraft, setNeighborhoodDraft] = useState<NeighborhoodDraft | null>(null);
  const [prioritiesExpanded, setPrioritiesExpanded] = useState(false);
  const [prioritiesDraft, setPrioritiesDraft] = useState<Record<string, number> | null>(null);

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

  const saveDraft = (roomId: string) => {
    if (!draft) return;
    const { customValues, ...rest } = draft;
    const customScores = customMetrics.filter((m) => m.scope === 'ROOM').map((m) => ({ metricId: m.id, value: customValues[m.id] ?? 5 }));
    updateScore.mutate(
      { roomId, ...rest, feeling: FEELING_ENUM[draft.feeling] ?? 'CALM', customScores },
      { onSuccess: () => setExpandedRoomId(null) },
    );
  };

  const toggleNeighborhood = () => {
    if (!property.neighborhoodScore) return;
    if (neighborhoodExpanded) {
      setNeighborhoodExpanded(false);
      setNeighborhoodDraft(null);
      return;
    }
    setNeighborhoodExpanded(true);
    setNeighborhoodDraft({
      curbAppeal: property.neighborhoodScore.curbAppeal,
      streetVibe: property.neighborhoodScore.streetVibe,
      feeling: FEELING_LABEL[property.neighborhoodScore.feeling] ?? 'Calm',
      note: property.neighborhoodScore.note ?? '',
    });
  };

  const saveNeighborhoodDraft = () => {
    if (!neighborhoodDraft) return;
    updateNeighborhood.mutate(
      { ...neighborhoodDraft, feeling: FEELING_ENUM[neighborhoodDraft.feeling] ?? 'CALM' },
      { onSuccess: () => setNeighborhoodExpanded(false) },
    );
  };

  const propertyMetrics = customMetrics.filter((m) => m.scope === 'PROPERTY');

  const togglePriorities = () => {
    if (prioritiesExpanded) {
      setPrioritiesExpanded(false);
      setPrioritiesDraft(null);
      return;
    }
    setPrioritiesExpanded(true);
    const existing = Object.fromEntries(property.metricScores.map((s) => [s.metricId, s.value]));
    setPrioritiesDraft(Object.fromEntries(propertyMetrics.map((m) => [m.id, existing[m.id] ?? 5])));
  };

  const savePrioritiesDraft = () => {
    if (!prioritiesDraft) return;
    updatePropertyMetrics.mutate(
      Object.entries(prioritiesDraft).map(([metricId, value]) => ({ metricId, value })),
      { onSuccess: () => setPrioritiesExpanded(false) },
    );
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
                  {customMetrics.filter((m) => m.scope === 'ROOM').map((metric) => (
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
                  <button className="btn btnp btnf" disabled={updateScore.isPending} onClick={() => saveDraft(room.id)}>
                    {updateScore.isPending ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="div" />

      <div className="slbl">Neighborhood</div>
      <div className="card" style={{ padding: '10px 12px' }}>
        {!property.neighborhoodScore ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-muted)', fontSize: 12 }}>
            <Icon name="ti-map-pin" size={26} />
            <div style={{ marginTop: 6 }}>Not scored yet — score it from Visit mode.</div>
          </div>
        ) : (
          <>
            <div className="rrow" style={{ cursor: 'pointer' }} onClick={toggleNeighborhood}>
              <div className="ri">
                <Icon name="ti-map-pin" size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Neighborhood feel</div>
                <span className="badge bb" style={{ fontSize: 10, marginTop: 3, display: 'inline-block' }}>
                  {FEELING_LABEL[property.neighborhoodScore.feeling]}
                </span>
                {property.neighborhoodScore.note && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{property.neighborhoodScore.note}</div>
                )}
              </div>
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
            </div>

            {neighborhoodExpanded && neighborhoodDraft && (
              <div style={{ padding: '4px 8px 10px 40px' }} onClick={(e) => e.stopPropagation()}>
                {(['curbAppeal', 'streetVibe'] as const).map((key) => (
                  <div className="fr" key={key}>
                    <span className="frl">{key === 'curbAppeal' ? 'Curb appeal' : 'Street / block vibe'}</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={neighborhoodDraft[key]}
                      style={{ flex: 1 }}
                      onChange={(e) => setNeighborhoodDraft({ ...neighborhoodDraft, [key]: Number(e.target.value) })}
                    />
                    <span className="frv">{neighborhoodDraft[key]}</span>
                  </div>
                ))}
                <div style={{ margin: '8px 0' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {FEELING_OPTIONS.map((feeling) => (
                      <button
                        key={feeling}
                        className={`tag${neighborhoodDraft.feeling === feeling ? ' sb' : ''}`}
                        onClick={() => setNeighborhoodDraft({ ...neighborhoodDraft, feeling })}
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
                  value={neighborhoodDraft.note}
                  onChange={(e) => setNeighborhoodDraft({ ...neighborhoodDraft, note: e.target.value })}
                />
                <button className="btn btnp btnf" disabled={updateNeighborhood.isPending} onClick={saveNeighborhoodDraft}>
                  {updateNeighborhood.isPending ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="div" />

      <div className="slbl">Priorities</div>
      <div className="card" style={{ padding: '10px 12px' }}>
        {propertyMetrics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-muted)', fontSize: 12 }}>
            <Icon name="ti-target" size={26} />
            <div style={{ marginTop: 6 }}>No priorities set yet — add some from your profile.</div>
          </div>
        ) : (
          <>
            <div className="rrow" style={{ cursor: 'pointer' }} onClick={togglePriorities}>
              <div className="ri">
                <Icon name="ti-target" size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>What matters to us</div>
                <span className="badge bb" style={{ fontSize: 10, marginTop: 3, display: 'inline-block' }}>
                  {property.metricScores.length} of {propertyMetrics.length} scored
                </span>
              </div>
            </div>

            {prioritiesExpanded && prioritiesDraft && (
              <div style={{ padding: '4px 8px 10px 40px' }} onClick={(e) => e.stopPropagation()}>
                {propertyMetrics.map((metric) => (
                  <div className="fr" key={metric.id}>
                    <span className="frl">{metric.label}</span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={prioritiesDraft[metric.id] ?? 5}
                      style={{ flex: 1 }}
                      onChange={(e) => setPrioritiesDraft({ ...prioritiesDraft, [metric.id]: Number(e.target.value) })}
                    />
                    <span className="frv">{prioritiesDraft[metric.id] ?? 5}</span>
                  </div>
                ))}
                <button className="btn btnp btnf" disabled={updatePropertyMetrics.isPending} onClick={savePrioritiesDraft}>
                  {updatePropertyMetrics.isPending ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}
          </>
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
