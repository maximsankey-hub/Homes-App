import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { PropertyDetail } from 'shared';
import { Icon } from '../../components/common/Icon';
import { useProperty } from '../homes/useProperties';
import { CaptureButtons } from './CaptureButtons';
import { FEELING_ENUM, FEELING_LABEL, FEELING_OPTIONS, REFLECTION_PROMPTS, ROOM_OPTIONS } from './roomOptions';
import { emotionalAvg, functionalAvg, useVisitFlow, type ExistingRoomScore, type FactorKey, type NeighborhoodDraft } from './useVisitFlow';
import { useCreateRoom, useSaveNeighborhoodScore, useSaveRoomScore, useUploadMedia } from './useVisitMutations';

function getExistingScoreForRoom(property: PropertyDetail | undefined, roomName: string): ExistingRoomScore | null {
  const room = property?.rooms.find((r) => r.name === roomName);
  const score = room?.scores.find((s) => s.scorer.role === 'SELF');
  if (!score) return null;
  return {
    layout: score.layout,
    storage: score.storage,
    light: score.light,
    vibe: score.vibe,
    feeling: FEELING_LABEL[score.feeling] ?? 'Calm',
    note: score.note ?? '',
  };
}

function getExistingNeighborhoodScore(property: PropertyDetail | undefined): NeighborhoodDraft | null {
  const score = property?.neighborhoodScore;
  if (!score) return null;
  return {
    curbAppeal: score.curbAppeal,
    streetVibe: score.streetVibe,
    feeling: FEELING_LABEL[score.feeling] ?? 'Calm',
    note: score.note ?? '',
  };
}

export function VisitModeFlow() {
  const { propertyId = '' } = useParams();
  const navigate = useNavigate();
  const { data: property } = useProperty(propertyId);
  const { state, dispatch } = useVisitFlow();
  const [untaggedCount, setUntaggedCount] = useState(0);

  const createRoom = useCreateRoom(propertyId);
  const saveScore = useSaveRoomScore();
  const saveNeighborhood = useSaveNeighborhoodScore(propertyId);
  const uploadMedia = useUploadMedia(propertyId);

  useEffect(() => {
    // Prefill the default room and neighborhood score once property data first loads, so a revisit doesn't start blank.
    if (!property) return;
    const existing = getExistingScoreForRoom(property, state.roomName);
    if (existing) dispatch({ type: 'SELECT_ROOM', name: state.roomName, icon: state.roomIcon, existingScore: existing });
    const existingNeighborhood = getExistingNeighborhoodScore(property);
    if (existingNeighborhood) dispatch({ type: 'PREFILL_NEIGHBORHOOD', data: existingNeighborhood });
  }, [property]);

  const isRevisit = !!getExistingScoreForRoom(property, state.roomName);
  const eAvg = emotionalAvg(state);
  const fAvg = functionalAvg(state);

  const handleQuickCapture = (file: File, kind: 'PHOTO' | 'VIDEO' | 'VOICE') => {
    uploadMedia.mutate({ file, type: kind });
    setUntaggedCount((c) => c + 1);
  };

  const handleSaveRoom = async () => {
    const room = await createRoom.mutateAsync({ name: state.roomName, icon: state.roomIcon });
    await saveScore.mutateAsync({
      roomId: room.id,
      layout: state.layout,
      storage: state.storage,
      light: state.light,
      vibe: state.vibe,
      feeling: FEELING_ENUM[state.feeling] ?? 'CALM',
      note: state.note,
    });
    for (const pending of state.pendingRoomFiles) {
      await uploadMedia.mutateAsync({ file: pending.file, type: pending.kind, roomId: room.id });
    }
    dispatch({
      type: 'ROOM_SAVED',
      summary: { roomName: state.roomName, emotionalAvg: eAvg, functionalAvg: fAvg, feeling: state.feeling },
    });
  };

  const handleSaveNeighborhood = async () => {
    await saveNeighborhood.mutateAsync({
      curbAppeal: state.neighborhood.curbAppeal,
      streetVibe: state.neighborhood.streetVibe,
      feeling: FEELING_ENUM[state.neighborhood.feeling] ?? 'CALM',
      note: state.neighborhood.note,
    });
    dispatch({ type: 'GOTO_STEP', step: 0 });
  };

  return (
    <div>
      <div style={{ padding: '12px 16px', background: 'var(--surface-2)', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ fontSize: 17, fontWeight: 500 }}>{property?.address ?? 'Visit'}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Visit mode</div>
      </div>
      <div className="pad">
        {state.step === 0 && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>Which room are you in?</p>
            <div className="rgrid">
              {ROOM_OPTIONS.map((room) => (
                <div
                  key={room.name}
                  className={`rc${state.roomName === room.name ? ' sel' : ''}`}
                  onClick={() =>
                    dispatch({ type: 'SELECT_ROOM', name: room.name, icon: room.icon, existingScore: getExistingScoreForRoom(property, room.name) })
                  }
                >
                  <Icon name={room.icon} size={20} />
                  <span>{room.name}</span>
                </div>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or type your own room name..."
              value={ROOM_OPTIONS.some((r) => r.name === state.roomName) ? '' : state.roomName}
              onChange={(e) =>
                dispatch({ type: 'SELECT_ROOM', name: e.target.value, icon: 'ti-home', existingScore: getExistingScoreForRoom(property, e.target.value) })
              }
              style={{ marginTop: 8 }}
            />
            <div className="div" />
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Quick capture</p>
            <CaptureButtons onCapture={handleQuickCapture} />
            {untaggedCount > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                {untaggedCount} item{untaggedCount > 1 ? 's' : ''} captured — tag to a room later from the Visit tab.
              </div>
            )}
            <div className="div" />
            <button
              className="btn btns btnf"
              style={{ marginBottom: 8, justifyContent: 'space-between' }}
              onClick={() => dispatch({ type: 'GOTO_STEP', step: 4 })}
            >
              <span>
                <Icon name="ti-map-pin" size={14} /> Score the neighborhood
              </span>
              {property?.neighborhoodScore && <Icon name="ti-check" size={14} color="#1D9E75" />}
            </button>
            <button className="btn btnp btnf" onClick={() => dispatch({ type: 'GOTO_STEP', step: 1 })}>
              Start scoring <Icon name="ti-arrow-right" size={14} />
            </button>
          </div>
        )}

        {state.step === 1 && (
          <div>
            <div className="slbl">
              {state.roomName}
              {isRevisit && (
                <span className="badge bb" style={{ marginLeft: 6, fontSize: 10 }}>
                  Editing previous score
                </span>
              )}
            </div>
            <div className="pcard">
              <p>"{REFLECTION_PROMPTS[state.roomName] ?? REFLECTION_PROMPTS.Kitchen}"</p>
            </div>
            <div style={{ marginTop: 12 }}>
              {(['layout', 'storage', 'light', 'vibe'] as FactorKey[]).map((key) => (
                <div className="fr" key={key}>
                  <span className="frl">
                    {key === 'layout' ? 'Layout flow' : key === 'storage' ? 'Storage' : key === 'light' ? 'Natural light' : 'Vibe / feel'}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={state[key]}
                    style={{ flex: 1 }}
                    onChange={(e) => dispatch({ type: 'SET_FACTOR', key, value: Number(e.target.value) })}
                  />
                  <span className="frv">{state[key]}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '10px 0' }}>
              <div style={{ textAlign: 'center', padding: 9, background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 9 }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: '#1D9E75' }}>{eAvg.toFixed(1)}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Emotional</div>
              </div>
              <div style={{ textAlign: 'center', padding: 9, background: 'var(--surface-2)', border: '0.5px solid var(--border)', borderRadius: 9 }}>
                <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--text-accent)' }}>{fAvg.toFixed(1)}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Functional</div>
              </div>
            </div>
            <textarea
              className="na"
              placeholder="Quick thought or voice note..."
              style={{ marginBottom: 10 }}
              value={state.note}
              onChange={(e) => dispatch({ type: 'SET_NOTE', note: e.target.value })}
            />
            <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 7 }}>Capture this room</p>
            <CaptureButtons onCapture={(file, kind) => dispatch({ type: 'ADD_PENDING_FILE', file, kind })} />
            {state.pendingRoomFiles.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0' }}>
                {state.pendingRoomFiles.length} item{state.pendingRoomFiles.length > 1 ? 's' : ''} ready to save with this room.
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btns" onClick={() => dispatch({ type: 'GOTO_STEP', step: 0 })}>
                <Icon name="ti-arrow-left" size={13} /> Room
              </button>
              <button className="btn btnp btns" style={{ flex: 1, justifyContent: 'center' }} onClick={() => dispatch({ type: 'GOTO_STEP', step: 2 })}>
                Next <Icon name="ti-arrow-right" size={13} />
              </button>
            </div>
          </div>
        )}

        {state.step === 2 && (
          <div>
            <div className="slbl">{state.roomName}</div>
            <div className="pcard">
              <p>"Would storage support how you actually live, or would you constantly fight clutter?"</p>
            </div>
            <div style={{ margin: '10px 0' }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Overall feeling</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {FEELING_OPTIONS.map((feeling) => (
                  <button
                    key={feeling}
                    className={`tag${state.feeling === feeling ? ' sb' : ''}`}
                    onClick={() => dispatch({ type: 'SET_FEELING', feeling })}
                  >
                    {feeling}
                  </button>
                ))}
              </div>
            </div>
            <div className="div" />
            <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 7 }}>Capture this room</p>
            <CaptureButtons onCapture={(file, kind) => dispatch({ type: 'ADD_PENDING_FILE', file, kind })} />
            {state.pendingRoomFiles.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                {state.pendingRoomFiles.length} item{state.pendingRoomFiles.length > 1 ? 's' : ''} ready to save with this room.
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btns" onClick={() => dispatch({ type: 'GOTO_STEP', step: 1 })}>
                <Icon name="ti-arrow-left" size={13} /> Back
              </button>
              <button
                className="btn btnp btns"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={createRoom.isPending || saveScore.isPending}
                onClick={handleSaveRoom}
              >
                {createRoom.isPending || saveScore.isPending ? 'Saving…' : 'Save room'} <Icon name="ti-check" size={13} />
              </button>
            </div>
          </div>
        )}

        {state.step === 3 && state.lastSaved && (
          <div>
            <div style={{ textAlign: 'center', padding: '16px 0 10px' }}>
              <Icon name="ti-check" size={38} color="#1D9E75" />
              <p style={{ fontSize: 15, fontWeight: 500, marginTop: 6 }}>{state.lastSaved.roomName} saved</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                Emotional: {state.lastSaved.emotionalAvg.toFixed(1)} · Functional: {state.lastSaved.functionalAvg.toFixed(1)} · Feeling:{' '}
                {state.lastSaved.feeling}
              </p>
            </div>
            <div className="div" />
            <div className="chip">
              <Icon name="ti-sparkles" size={15} color="var(--text-accent)" />
              <span>
                {state.lastSaved.roomName} scored {state.lastSaved.emotionalAvg >= state.lastSaved.functionalAvg ? 'higher emotionally than functionally' : 'higher functionally than emotionally'} — worth keeping in mind as you compare homes.
              </span>
            </div>
            <button className="btn btnf" style={{ marginTop: 10, marginBottom: 8 }} onClick={() => dispatch({ type: 'RESET_FOR_NEW_ROOM' })}>
              Score another room
            </button>
            <button className="btn btnp btnf" onClick={() => navigate(`/buy/homes/${propertyId}/visit`)}>
              Done with visit
            </button>
          </div>
        )}

        {state.step === 4 && (
          <div>
            <div className="slbl">Neighborhood</div>
            <div className="pcard">
              <p>"Does the block feel like somewhere you'd want to come home to?"</p>
            </div>
            <div style={{ marginTop: 12 }}>
              {(['curbAppeal', 'streetVibe'] as const).map((key) => (
                <div className="fr" key={key}>
                  <span className="frl">{key === 'curbAppeal' ? 'Curb appeal' : 'Street / block vibe'}</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={state.neighborhood[key]}
                    style={{ flex: 1 }}
                    onChange={(e) => dispatch({ type: 'SET_NEIGHBORHOOD_FACTOR', key, value: Number(e.target.value) })}
                  />
                  <span className="frv">{state.neighborhood[key]}</span>
                </div>
              ))}
            </div>
            <div style={{ margin: '10px 0' }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Overall feeling</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {FEELING_OPTIONS.map((feeling) => (
                  <button
                    key={feeling}
                    className={`tag${state.neighborhood.feeling === feeling ? ' sb' : ''}`}
                    onClick={() => dispatch({ type: 'SET_NEIGHBORHOOD_FEELING', feeling })}
                  >
                    {feeling}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="na"
              placeholder="Quick thought about the block, street noise, neighbors..."
              style={{ marginBottom: 10 }}
              value={state.neighborhood.note}
              onChange={(e) => dispatch({ type: 'SET_NEIGHBORHOOD_NOTE', note: e.target.value })}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btns" onClick={() => dispatch({ type: 'GOTO_STEP', step: 0 })}>
                <Icon name="ti-arrow-left" size={13} /> Back
              </button>
              <button
                className="btn btnp btns"
                style={{ flex: 1, justifyContent: 'center' }}
                disabled={saveNeighborhood.isPending}
                onClick={handleSaveNeighborhood}
              >
                {saveNeighborhood.isPending ? 'Saving…' : 'Save neighborhood score'} <Icon name="ti-check" size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
