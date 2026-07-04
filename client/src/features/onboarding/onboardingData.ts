export const PRESET_TAGS = [
  { label: 'Natural light', defaultOn: true },
  { label: 'Hosting friends', defaultOn: true },
  { label: 'Quiet and calm', defaultOn: false },
  { label: 'Work from home', defaultOn: true },
  { label: 'Walkability', defaultOn: false },
  { label: 'Privacy', defaultOn: false },
  { label: 'Organization', defaultOn: true },
  { label: 'Pet-friendly', defaultOn: false },
];

export interface SwipeStyle {
  bg: string;
  emoji: string;
  title: string;
  subtitle: string;
}

export const SWIPE_STYLES: SwipeStyle[] = [
  { bg: '#FAEEDA', emoji: '🪵', title: 'Warm, cozy, traditional', subtitle: 'Wood cabinets · farmhouse sink' },
  { bg: '#E1F5EE', emoji: '🍃', title: 'Bright, open, minimal', subtitle: 'White cabinets · island' },
  { bg: '#EEEDFE', emoji: '🏛', title: 'Modern, stone accents', subtitle: 'Quartz counters · matte black' },
  { bg: '#FBEAF0', emoji: '🌸', title: 'Cottage-core, eclectic', subtitle: 'Painted cabinets · open shelving' },
];
