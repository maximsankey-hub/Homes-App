interface FactorBarProps {
  label: string;
  value: number;
  max?: number;
}

export function FactorBar({ label, value, max = 10 }: FactorBarProps) {
  return (
    <div className="fb">
      <span className="fl">{label}</span>
      <div className="ft">
        <div className="ff" style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
      </div>
      <span className="fv">{value.toFixed(1)}</span>
    </div>
  );
}
