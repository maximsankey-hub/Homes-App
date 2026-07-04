import { useRef } from 'react';
import { Icon } from '../../components/common/Icon';

type MediaKind = 'PHOTO' | 'VIDEO' | 'VOICE';

const CONFIG: { kind: MediaKind; icon: string; label: string; accept: string }[] = [
  { kind: 'PHOTO', icon: 'ti-camera', label: 'Photo', accept: 'image/*' },
  { kind: 'VIDEO', icon: 'ti-video', label: 'Video', accept: 'video/*' },
  { kind: 'VOICE', icon: 'ti-microphone', label: 'Voice', accept: 'audio/*' },
];

export function CaptureButtons({ onCapture }: { onCapture: (file: File, kind: MediaKind) => void }) {
  const inputRefs = useRef<Record<MediaKind, HTMLInputElement | null>>({ PHOTO: null, VIDEO: null, VOICE: null });

  return (
    <div className="mbr">
      {CONFIG.map(({ kind, icon, label, accept }) => (
        <button key={kind} className="mbtn" type="button" onClick={() => inputRefs.current[kind]?.click()}>
          <Icon name={icon} size={20} />
          {label}
          <input
            ref={(el) => {
              inputRefs.current[kind] = el;
            }}
            type="file"
            accept={accept}
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onCapture(file, kind);
              e.target.value = '';
            }}
          />
        </button>
      ))}
    </div>
  );
}
