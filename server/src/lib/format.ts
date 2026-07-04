export function formatK(amount: number): string {
  return `$${Math.round(amount / 1000)}K`;
}

export function formatMoney(amount: number): string {
  return `$${amount.toLocaleString()}`;
}
