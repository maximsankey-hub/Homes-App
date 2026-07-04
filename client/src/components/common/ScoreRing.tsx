interface ScoreRingProps {
  score: number | null;
  color: string;
  size?: number;
}

export function ScoreRing({ score, color, size = 52 }: ScoreRingProps) {
  const r = size / 2 - 5;
  const circumference = 2 * Math.PI * r;
  const fraction = score !== null ? Math.min(Math.max(score / 10, 0), 1) : 0;
  const dash = `${circumference * fraction} ${circumference * (1 - fraction)}`;

  return (
    <div className="sr" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        {score !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={dash}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="rn" style={score === null ? { fontSize: 11, color: 'var(--text-muted)' } : undefined}>
        {score !== null ? score.toFixed(1) : '—'}
      </div>
    </div>
  );
}
