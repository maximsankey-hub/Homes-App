import { getIcon } from '../../lib/iconMap';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export function Icon({ name, size = 18, className, color }: IconProps) {
  const Cmp = getIcon(name);
  return <Cmp size={size} className={className} color={color} stroke={1.75} />;
}
