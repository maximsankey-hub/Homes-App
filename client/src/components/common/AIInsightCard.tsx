import type { AIInsight } from 'shared';
import { Icon } from './Icon';

interface AIInsightCardProps extends AIInsight {
  variant?: 'buy' | 'sell';
}

export function AIInsightCard({ label, icon, text, variant = 'buy' }: AIInsightCardProps) {
  return (
    <div className="aic">
      <div className={`aico ${variant === 'buy' ? 'aicob' : 'aicos'}`}>
        <Icon name={icon} size={14} />
      </div>
      <div>
        <div className={variant === 'buy' ? 'ailb' : 'ails'}>{label}</div>
        <div className="ait">{text}</div>
      </div>
    </div>
  );
}
