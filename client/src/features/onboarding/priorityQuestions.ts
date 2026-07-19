export interface PriorityMetricItem {
  key: string;
  label: string;
  category: 'EMOTIONAL' | 'FUNCTIONAL';
  scope: 'ROOM' | 'PROPERTY';
  // Only meaningful when scope is ROOM. Matched case-insensitively against a property's room
  // names; if no room matches, the question just doesn't show up anywhere (rather than guessing).
  targetRoomName?: string;
  // Only meaningful in the Pets group. Item only shows once the household has selected this pet
  // type on the intro question; omit for pet questions that apply regardless of pet type.
  requiresPetType?: string;
  hint?: string;
}

export interface PriorityGroup {
  key: string;
  title: string;
  icon: string;
  items: PriorityMetricItem[];
}

export const PET_TYPE_OPTIONS = ['Dog', 'Cat', 'Bird', 'Rabbit'] as const;

export const HOUSEHOLD_COMPOSITION_OPTIONS = [
  'Family with kids',
  'Family without kids',
  'Individual',
  'Individual with roommates',
  'Looking for a rental property',
  'Other',
] as const;

// Each item becomes a household-wide CustomMetric when toggled on. ROOM-scoped items only get
// graded from a matching room's editor (via targetRoomName); PROPERTY-scoped items are graded
// once per house from the Visit tab's "Property & Neighborhood" section. "Pets" is only shown
// when the household answered the intro pet question with yes, and within it, items with
// requiresPetType only show once that pet type is selected.
export const PRIORITY_GROUPS: PriorityGroup[] = [
  {
    key: 'healthy-living',
    title: 'Healthy living',
    icon: 'ti-activity',
    items: [
      { key: 'gym-yoga', label: 'Gym or yoga studio nearby', category: 'FUNCTIONAL', scope: 'PROPERTY' },
      { key: 'kitchen-pantry', label: 'Kitchen & pantry space for healthy cooking', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Kitchen' },
      { key: 'friends-family', label: 'Proximity to close friends & family', category: 'EMOTIONAL', scope: 'PROPERTY' },
    ],
  },
  {
    key: 'pets',
    title: 'Pets',
    icon: 'ti-paw',
    items: [
      { key: 'pet-friendly-rules', label: 'Pet-friendly building / HOA rules', category: 'FUNCTIONAL', scope: 'PROPERTY' },
      { key: 'nearby-vet-care', label: 'Nearby vet or pet care services', category: 'FUNCTIONAL', scope: 'PROPERTY' },
      { key: 'dog-self-let-out', label: 'Backyard our dog can access on their own', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Backyard', requiresPetType: 'Dog' },
      { key: 'dog-yard-space', label: 'Yard space for our dog to run and play', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Backyard', requiresPetType: 'Dog' },
      { key: 'dog-park', label: 'Off-leash dog park within walking distance or a short drive', category: 'FUNCTIONAL', scope: 'PROPERTY', requiresPetType: 'Dog' },
      { key: 'cat-window-perches', label: 'Window perches or sunny spots for cats', category: 'EMOTIONAL', scope: 'PROPERTY', requiresPetType: 'Cat' },
      { key: 'cat-outdoor-access', label: 'Screened-in porch or cat-safe outdoor access', category: 'FUNCTIONAL', scope: 'PROPERTY', requiresPetType: 'Cat' },
      { key: 'bird-quiet-space', label: 'Quiet space away from noise for a bird', category: 'FUNCTIONAL', scope: 'PROPERTY', requiresPetType: 'Bird' },
      { key: 'bird-aviary-room', label: 'Room for a large cage or aviary setup', category: 'FUNCTIONAL', scope: 'PROPERTY', requiresPetType: 'Bird' },
      { key: 'rabbit-roam-space', label: 'Safe indoor or outdoor space for a rabbit to roam', category: 'FUNCTIONAL', scope: 'PROPERTY', requiresPetType: 'Rabbit' },
    ],
  },
  {
    key: 'outdoor-living',
    title: 'Outdoor living',
    icon: 'ti-trees',
    items: [
      { key: 'backyard-size', label: 'Backyard size & usable space', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Backyard' },
      { key: 'backyard-privacy', label: 'Backyard privacy from neighbors', category: 'EMOTIONAL', scope: 'ROOM', targetRoomName: 'Backyard' },
      { key: 'low-maintenance-yard', label: 'Low-maintenance yard / xeriscape potential', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Backyard' },
      { key: 'outdoor-entertaining', label: 'Space for a hot tub, fire pit, or dining area', category: 'EMOTIONAL', scope: 'ROOM', targetRoomName: 'Backyard' },
      { key: 'garden-space', label: 'Garden space', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Backyard' },
    ],
  },
  {
    key: 'wfh',
    title: 'Work from home',
    icon: 'ti-desk',
    items: [
      { key: 'wfh-room', label: 'Quiet, private room with natural light for an office', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Office' },
    ],
  },
  {
    key: 'hosting',
    title: 'Hosting & guests',
    icon: 'ti-users',
    items: [
      { key: 'main-floor-guest-room', label: 'Guest bedroom on the main floor for extended stays', category: 'FUNCTIONAL', scope: 'PROPERTY' },
      { key: 'second-guest-room', label: 'Second guest bedroom on a separate floor for privacy', category: 'FUNCTIONAL', scope: 'PROPERTY' },
      { key: 'hosting-space', label: 'Space to comfortably host friends', category: 'EMOTIONAL', scope: 'PROPERTY' },
      { key: 'dinner-party', label: 'Ability to host a large dinner party', category: 'FUNCTIONAL', scope: 'PROPERTY' },
      { key: 'outdoor-games', label: 'Space for outdoor games (bags, bocce)', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Backyard' },
    ],
  },
  {
    key: 'privacy',
    title: 'Privacy',
    icon: 'ti-shield-check',
    items: [
      { key: 'street-distance', label: 'Distance or screening from the sidewalk / street', category: 'FUNCTIONAL', scope: 'PROPERTY' },
      { key: 'second-floor-bedrooms', label: 'Second-floor bedrooms for separation from street level', category: 'EMOTIONAL', scope: 'PROPERTY' },
      { key: 'backyard-sightlines', label: "Neighbors can't easily see into the backyard or windows", category: 'EMOTIONAL', scope: 'ROOM', targetRoomName: 'Backyard' },
    ],
  },
  {
    key: 'community',
    title: 'Neighborhood & community',
    icon: 'ti-map-pin',
    items: [
      { key: 'neighborhood-association', label: 'Active neighborhood association with regular events', category: 'EMOTIONAL', scope: 'PROPERTY' },
      { key: 'similar-values-neighbors', label: 'Neighbors likely to share similar values / parenting style', category: 'EMOTIONAL', scope: 'PROPERTY' },
      { key: 'walkable-businesses', label: "Walkable local businesses we'd actually frequent", category: 'FUNCTIONAL', scope: 'PROPERTY' },
    ],
  },
  {
    key: 'beauty-charm',
    title: 'Beauty & charm',
    icon: 'ti-sparkles',
    items: [
      { key: 'historic-character', label: 'Historic character or architectural charm', category: 'EMOTIONAL', scope: 'PROPERTY' },
      { key: 'high-ceilings', label: 'High ceilings and abundant natural light', category: 'EMOTIONAL', scope: 'PROPERTY' },
      { key: 'closet-space', label: 'Closet & organizational space', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Primary bed' },
    ],
  },
  {
    key: 'walkability',
    title: 'Walkability',
    icon: 'ti-building-store',
    items: [
      { key: 'walk-park', label: 'Walk to a major park within 15 minutes', category: 'FUNCTIONAL', scope: 'PROPERTY' },
      { key: 'walk-grocery', label: 'Walk to a farmers market or grocery store within 10 minutes', category: 'FUNCTIONAL', scope: 'PROPERTY' },
      { key: 'walk-school', label: "Walkable to kids' school", category: 'FUNCTIONAL', scope: 'PROPERTY' },
      { key: 'errands-no-driving', label: 'Errands without driving, overall', category: 'FUNCTIONAL', scope: 'PROPERTY' },
    ],
  },
  {
    key: 'life-at-home',
    title: 'Life at home',
    icon: 'ti-sofa',
    items: [
      { key: 'reading-nook', label: 'Quiet reading / study nook', category: 'EMOTIONAL', scope: 'ROOM', targetRoomName: 'Office' },
      { key: 'gathering-space', label: 'Comfortable gathering space to relax together', category: 'EMOTIONAL', scope: 'ROOM', targetRoomName: 'Living room' },
      { key: 'restful-bedrooms', label: 'Bedrooms with good airflow & quiet for sleep', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Primary bed' },
      { key: 'alone-space', label: 'Private space to be alone — reading, instrument, art', category: 'EMOTIONAL', scope: 'ROOM', targetRoomName: 'Secondary bed' },
      { key: 'wellness-space', label: 'Home gym, yoga, or wellness space', category: 'FUNCTIONAL', scope: 'PROPERTY' },
      { key: 'vanity-area', label: 'Vanity or dressing area', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Primary bed' },
      { key: 'home-office-admin', label: 'Home office / life-admin area', category: 'FUNCTIONAL', scope: 'ROOM', targetRoomName: 'Office' },
    ],
  },
];
