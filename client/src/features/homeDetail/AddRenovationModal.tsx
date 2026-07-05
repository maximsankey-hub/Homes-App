import { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useCreateRenovation, useEstimateRenovationCost } from './useRenovations';

type CostMode = 'AI' | 'MANUAL';
type IdeaType = 'COSMETIC' | 'STRUCTURAL';

export function AddRenovationModal() {
  const closeModal = useUiStore((s) => s.closeModal);
  const modalContext = useUiStore((s) => s.modalContext) as { propertyId: string; room?: string } | null;
  const createRenovation = useCreateRenovation(modalContext?.propertyId ?? '');
  const estimateCost = useEstimateRenovationCost();

  const [title, setTitle] = useState('');
  const [room, setRoom] = useState('');
  const [type, setType] = useState<IdeaType>('COSMETIC');
  const [costMode, setCostMode] = useState<CostMode>('AI');
  const [description, setDescription] = useState('');
  const [estimate, setEstimate] = useState<{ costLow: number; costHigh: number } | null>(null);
  const [costLow, setCostLow] = useState('');
  const [costHigh, setCostHigh] = useState('');

  if (!modalContext) return null;
  const fixedRoom = modalContext.room;

  const canSubmit =
    title.trim().length > 0 && (costMode === 'MANUAL' ? costLow !== '' && costHigh !== '' : estimate !== null);

  const submit = () => {
    if (!canSubmit) return;
    createRenovation.mutate(
      {
        title: title.trim(),
        room: (fixedRoom ?? room).trim() || undefined,
        type,
        costLow: costMode === 'MANUAL' ? Number(costLow) : estimate!.costLow,
        costHigh: costMode === 'MANUAL' ? Number(costHigh) : estimate!.costHigh,
      },
      { onSuccess: () => closeModal() },
    );
  };

  return (
    <div className="mover open" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Add renovation idea</h3>
        <input type="text" placeholder="e.g. Expand master closet" value={title} onChange={(e) => setTitle(e.target.value)} />
        {fixedRoom ? (
          <div className="chip" style={{ marginBottom: 10 }}>
            <span>For: {fixedRoom}</span>
          </div>
        ) : (
          <input
            type="text"
            placeholder="Room (optional — assign later if left blank)"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
        )}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button
            type="button"
            className={`tag${type === 'COSMETIC' ? ' sb' : ''}`}
            onClick={() => setType('COSMETIC')}
          >
            Cosmetic
          </button>
          <button
            type="button"
            className={`tag${type === 'STRUCTURAL' ? ' sb' : ''}`}
            onClick={() => setType('STRUCTURAL')}
          >
            Structural
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button
            type="button"
            className={`tag${costMode === 'AI' ? ' sb' : ''}`}
            onClick={() => setCostMode('AI')}
          >
            AI estimate
          </button>
          <button
            type="button"
            className={`tag${costMode === 'MANUAL' ? ' sb' : ''}`}
            onClick={() => setCostMode('MANUAL')}
          >
            Manual entry
          </button>
        </div>

        {costMode === 'AI' ? (
          <div style={{ marginBottom: 10 }}>
            <textarea
              className="ft2"
              style={{ minHeight: 55 }}
              placeholder="Briefly describe the work, e.g. 'redo the kitchen countertops and backsplash'"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setEstimate(null);
              }}
            />
            <button
              type="button"
              className="btn btns"
              style={{ marginTop: 6 }}
              disabled={!description.trim() || estimateCost.isPending}
              onClick={() => estimateCost.mutate({ description: description.trim(), type }, { onSuccess: setEstimate })}
            >
              {estimateCost.isPending ? 'Estimating…' : 'Get AI estimate'}
            </button>
            {estimate && (
              <div style={{ fontSize: 12, color: 'var(--text-accent)', marginTop: 6 }}>
                Estimated: ${estimate.costLow.toLocaleString()}–${estimate.costHigh.toLocaleString()}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              placeholder="Low cost"
              value={costLow}
              onChange={(e) => setCostLow(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <input
              type="text"
              placeholder="High cost"
              value={costHigh}
              onChange={(e) => setCostHigh(e.target.value.replace(/[^0-9]/g, ''))}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={closeModal}>
            Cancel
          </button>
          <button
            className="btn btnp"
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={!canSubmit || createRenovation.isPending}
            onClick={submit}
          >
            {createRenovation.isPending ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
