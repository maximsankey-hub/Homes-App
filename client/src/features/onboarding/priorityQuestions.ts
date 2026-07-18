export interface PriorityMetricItem {
  key: string;
  label: string;
  category: 'EMOTIONAL' | 'FUNCTIONAL';
  hint?: string;
}

export interface PriorityGroup {
  key: string;
  title: string;
  icon: string;
  items: PriorityMetricItem[];
}

// Every item here becomes a household-wide, PROPERTY-scoped CustomMetric when toggled on,
// so it can be graded per-house from the Visit tab. "Pets" is only shown when the household
// answered the intro pet question with yes.
export const PRIORITY_GROUPS: PriorityGroup[] = [
  {
    key: 'healthy-living',
    title: 'Healthy living',
    icon: 'ti-activity',
    items: [
      { key: 'gym-yoga', label: 'Gym or yoga studio nearby', category: 'FUNCTIONAL' },
      { key: 'kitchen-pantry', label: 'Kitchen & pantry space for healthy cooking', category: 'FUNCTIONAL' },
      { key: 'friends-family', label: 'Proximity to close friends & family', category: 'EMOTIONAL' },
    ],
  },
  {
    key: 'pets',
    title: 'Pets',
    icon: 'ti-paw',
    items: [
      { key: 'dog-self-let-out', label: 'Backyard our dog can access on their own', category: 'FUNCTIONAL' },
      { key: 'dog-yard-space', label: 'Yard space for our dog to run and play', category: 'FUNCTIONAL' },
      { key: 'dog-park', label: 'Off-leash dog park within walking distance or a short drive', category: 'FUNCTIONAL' },
    ],
  },
  {
    key: 'outdoor-living',
    title: 'Outdoor living',
    icon: 'ti-trees',
    items: [
      { key: 'backyard-size', label: 'Backyard size & usable space', category: 'FUNCTIONAL' },
      { key: 'backyard-privacy', label: 'Backyard privacy from neighbors', category: 'EMOTIONAL' },
      { key: 'low-maintenance-yard', label: 'Low-maintenance yard / xeriscape potential', category: 'FUNCTIONAL' },
      { key: 'outdoor-entertaining', label: 'Space for a hot tub, fire pit, or dining area', category: 'EMOTIONAL' },
      { key: 'garden-space', label: 'Garden space', category: 'FUNCTIONAL' },
    ],
  },
  {
    key: 'wfh',
    title: 'Work from home',
    icon: 'ti-desk',
    items: [
      { key: 'wfh-room', label: 'Quiet, private room with natural light for an office', category: 'FUNCTIONAL' },
    ],
  },
  {
    key: 'hosting',
    title: 'Hosting & guests',
    icon: 'ti-users',
    items: [
      { key: 'main-floor-guest-room', label: 'Guest bedroom on the main floor for extended stays', category: 'FUNCTIONAL' },
      { key: 'second-guest-room', label: 'Second guest bedroom on a separate floor for privacy', category: 'FUNCTIONAL' },
      { key: 'hosting-space', label: 'Space to comfortably host friends', category: 'EMOTIONAL' },
    ],
  },
  {
    key: 'privacy',
    title: 'Privacy',
    icon: 'ti-shield-check',
    items: [
      { key: 'street-distance', label: 'Distance or screening from the sidewalk / street', category: 'FUNCTIONAL' },
      { key: 'second-floor-bedrooms', label: 'Second-floor bedrooms for separation from street level', category: 'EMOTIONAL' },
      { key: 'backyard-sightlines', label: "Neighbors can't easily see into the backyard or windows", category: 'EMOTIONAL' },
    ],
  },
  {
    key: 'community',
    title: 'Neighborhood & community',
    icon: 'ti-map-pin',
    items: [
      { key: 'neighborhood-association', label: 'Active neighborhood association with regular events', category: 'EMOTIONAL' },
      { key: 'similar-values-neighbors', label: 'Neighbors likely to share similar values / parenting style', category: 'EMOTIONAL' },
      { key: 'walkable-businesses', label: "Walkable local businesses we'd actually frequent", category: 'FUNCTIONAL' },
    ],
  },
  {
    key: 'beauty-charm',
    title: 'Beauty & charm',
    icon: 'ti-sparkles',
    items: [
      { key: 'historic-character', label: 'Historic character or architectural charm', category: 'EMOTIONAL' },
      { key: 'high-ceilings', label: 'High ceilings and abundant natural light', category: 'EMOTIONAL' },
      { key: 'closet-space', label: 'Closet & organizational space', category: 'FUNCTIONAL' },
    ],
  },
  {
    key: 'walkability',
    title: 'Walkability',
    icon: 'ti-building-store',
    items: [
      { key: 'walk-park', label: 'Walk to a major park within 15 minutes', category: 'FUNCTIONAL' },
      { key: 'walk-grocery', label: 'Walk to a farmers market or grocery store within 10 minutes', category: 'FUNCTIONAL' },
      { key: 'walk-school', label: "Walkable to kids' school", category: 'FUNCTIONAL' },
      { key: 'errands-no-driving', label: 'Errands without driving, overall', category: 'FUNCTIONAL' },
    ],
  },
  {
    key: 'life-at-home',
    title: 'Life at home',
    icon: 'ti-sofa',
    items: [
      { key: 'reading-nook', label: 'Quiet reading / study nook', category: 'EMOTIONAL' },
      { key: 'gathering-space', label: 'Comfortable gathering space to relax together', category: 'EMOTIONAL' },
      { key: 'restful-bedrooms', label: 'Bedrooms with good airflow & quiet for sleep', category: 'FUNCTIONAL' },
      { key: 'alone-space', label: 'Private space to be alone — reading, instrument, art', category: 'EMOTIONAL' },
      { key: 'wellness-space', label: 'Home gym, yoga, or wellness space', category: 'FUNCTIONAL' },
      { key: 'vanity-area', label: 'Vanity or dressing area', category: 'FUNCTIONAL' },
      { key: 'home-office-admin', label: 'Home office / life-admin area', category: 'FUNCTIONAL' },
    ],
  },
];
