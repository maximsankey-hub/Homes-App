import type { Badge as BadgeModel } from 'shared';

const VARIANT_CLASS: Record<BadgeModel['variant'], string> = {
  success: 'bg',
  warning: 'ba2',
  accent: 'bb',
  purple: 'bp',
  teal: 'bt',
};

export function Badge({ text, variant }: BadgeModel) {
  return <span className={`badge ${VARIANT_CLASS[variant]}`}>{text}</span>;
}
