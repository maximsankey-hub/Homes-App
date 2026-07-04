export interface RoomOption {
  name: string;
  icon: string;
}

export const ROOM_OPTIONS: RoomOption[] = [
  { name: 'Kitchen', icon: 'ti-tools-kitchen-2' },
  { name: 'Living room', icon: 'ti-sofa' },
  { name: 'Primary bed', icon: 'ti-bed' },
  { name: 'Backyard', icon: 'ti-plant' },
  { name: 'Garage', icon: 'ti-car' },
  { name: 'Office', icon: 'ti-desk' },
];

export const REFLECTION_PROMPTS: Record<string, string> = {
  Kitchen: 'Can you imagine hosting comfortably here? Does the layout invite gathering?',
  'Living room': 'Does this space feel calming or overwhelming? Can you see yourself unwinding here?',
  'Primary bed': 'Would you wake up feeling restored here? Think about light, quiet, and your morning routine.',
  Backyard: 'Can you picture using this outdoor space regularly?',
  Garage: 'Does this utility space fit how you live?',
  Office: 'Could you focus here? Consider light, acoustics, and separation from the home.',
};

export const FEELING_OPTIONS = ['Excited', 'Calm', 'Uncertain', 'Overwhelmed', 'Inspired'] as const;
