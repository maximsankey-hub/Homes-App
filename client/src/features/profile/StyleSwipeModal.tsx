import { useState } from 'react';
import { Icon } from '../../components/common/Icon';
import { useUiStore } from '../../store/uiStore';
import { useCreateCustomMetric } from './useCustomMetrics';
import { useInvalidateStyleProfile, useStylePhotos, useStyleProfile, useSwipeStylePhoto } from './useStylePhotos';

export function StyleSwipeModal() {
  const closeModal = useUiStore((s) => s.closeModal);
  const modalContext = useUiStore((s) => s.modalContext) as { roomType: string } | null;
  const roomType = modalContext?.roomType ?? null;

  const { data: photos, isLoading } = useStylePhotos(roomType);
  const { data: profile, refetch: refetchProfile } = useStyleProfile();
  const swipe = useSwipeStylePhoto();
  const invalidateProfile = useInvalidateStyleProfile();
  const createMetric = useCreateCustomMetric();

  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [addedSuggestion, setAddedSuggestion] = useState(false);

  if (!roomType) return null;

  const handleSwipe = async (liked: boolean) => {
    const photo = photos?.[index];
    if (!photo) return;
    await swipe.mutateAsync({ id: photo.id, liked });
    if (index + 1 >= (photos?.length ?? 0)) {
      invalidateProfile();
      await refetchProfile();
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const roomProgress = profile?.find((p) => p.roomType === roomType);

  const handleAddSuggestion = () => {
    if (!roomProgress?.topStyle) return;
    createMetric.mutate(
      { label: `${roomProgress.topStyle} aesthetic (${roomType})`, category: 'EMOTIONAL', scope: 'ROOM', targetRoomName: roomType },
      { onSuccess: () => setAddedSuggestion(true) },
    );
  };

  const front = photos?.[index];
  const behind = photos?.[index + 1];

  return (
    <div className="mover open" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{roomType} style</h3>

        {isLoading && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading photos…</p>}

        {!isLoading && (!photos || photos.length === 0) && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            No photos seeded for {roomType} yet — this catalog gets built out via a one-time setup step.
          </p>
        )}

        {!isLoading && photos && photos.length > 0 && !finished && front && (
          <>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {index + 1} of {photos.length} — swipe right to like, left to pass
            </div>
            <div className="sw-stack">
              {behind && (
                <div className="sw-c behind">
                  <div className="sw-img">
                    <img src={behind.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              )}
              <div className="sw-c front">
                <div className="sw-img">
                  <img src={front.imageUrl} alt={front.styleName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </div>
            <div className="sw-btns">
              <button className="sw-btn sno" disabled={swipe.isPending} onClick={() => handleSwipe(false)}>
                <Icon name="ti-x" size={18} />
              </button>
              <button className="sw-btn sye" disabled={swipe.isPending} onClick={() => handleSwipe(true)}>
                <Icon name="ti-heart" size={18} />
              </button>
            </div>
          </>
        )}

        {finished && (
          <div style={{ textAlign: 'center', padding: '14px 0' }}>
            <Icon name="ti-check" size={40} color="#1D9E75" />
            <div style={{ fontSize: 15, fontWeight: 500, marginTop: 8, marginBottom: 6 }}>That's everything for {roomType}</div>
            {roomProgress?.topStyle ? (
              <>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  You seem to like {roomProgress.topStyle} {roomType.toLowerCase()}s.
                </p>
                <button
                  className="btn btnp btnf"
                  style={{ marginBottom: 8 }}
                  disabled={addedSuggestion || createMetric.isPending}
                  onClick={handleAddSuggestion}
                >
                  {addedSuggestion ? 'Added to priorities' : `Add as a priority for ${roomType}`}
                </button>
              </>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                No clear favorite yet — swipe through again anytime to refine it.
              </p>
            )}
          </div>
        )}

        <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={closeModal}>
          {finished ? 'Done' : 'Close'}
        </button>
      </div>
    </div>
  );
}
