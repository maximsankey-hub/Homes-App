export interface RoomOption {
  name: string;
  icon: string;
}

export const ROOM_OPTIONS: RoomOption[] = [
  { name: 'Kitchen', icon: 'ti-tools-kitchen-2' },
  { name: 'Living room', icon: 'ti-sofa' },
  { name: 'Primary bed', icon: 'ti-bed' },
  { name: 'Secondary bed', icon: 'ti-bed' },
  { name: 'Bathroom', icon: 'ti-bath' },
  { name: 'Backyard', icon: 'ti-plant' },
  { name: 'Garage', icon: 'ti-car' },
  { name: 'Office', icon: 'ti-desk' },
  { name: 'Basement', icon: 'ti-stairs-down' },
];

export const REFLECTION_PROMPTS: Record<string, string> = {
  Kitchen: 'Can you imagine hosting comfortably here? Does the layout invite gathering?',
  'Living room': 'Does this space feel calming or overwhelming? Can you see yourself unwinding here?',
  'Primary bed': 'Would you wake up feeling restored here? Think about light, quiet, and your morning routine.',
  'Secondary bed': 'Could this room flex between guest space, office, or future needs?',
  Bathroom: 'Does this feel like a place to actually relax, or purely functional?',
  Backyard: 'Can you picture using this outdoor space regularly?',
  Garage: 'Does this utility space fit how you live?',
  Office: 'Could you focus here? Consider light, acoustics, and separation from the home.',
  Basement: 'Does this space feel usable, or just extra square footage?',
};

export const FEELING_OPTIONS = ['Excited', 'Calm', 'Uncertain', 'Overwhelmed', 'Inspired'] as const;
