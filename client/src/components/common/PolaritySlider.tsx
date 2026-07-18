interface PolaritySliderProps {
  leftLabel: string;
  rightLabel: string;
  value: number;
  onChange: (value: number) => void;
}

export function PolaritySlider({ leftLabel, rightLabel, value, onChange }: PolaritySliderProps) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        style={{ width: '100%' }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
