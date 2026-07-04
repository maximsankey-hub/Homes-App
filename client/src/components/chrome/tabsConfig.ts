export interface TabConfig {
  path: string;
  icon: string;
  label: string;
}

export const BUY_TABS: TabConfig[] = [
  { path: '/buy/homes', icon: 'ti-home', label: 'Homes' },
  { path: '/buy/visit', icon: 'ti-clipboard-check', label: 'Visit' },
  { path: '/buy/compare', icon: 'ti-chart-bar', label: 'Compare' },
  { path: '/buy/profile', icon: 'ti-user', label: 'Profile' },
];

export const SELL_TABS: TabConfig[] = [
  { path: '/sell/dashboard', icon: 'ti-layout-dashboard', label: 'Dashboard' },
  { path: '/sell/market', icon: 'ti-chart-bar', label: 'Market' },
  { path: '/sell/buyers', icon: 'ti-users', label: 'Buyers' },
  { path: '/sell/improve', icon: 'ti-hammer', label: 'Improve' },
];
