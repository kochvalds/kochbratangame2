export function formatMoney(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 10_000) {
    return `$${(amount / 1_000).toFixed(1)}k`;
  }
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatExactMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatPercent(percent: number): string {
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

export const MONTH_NAMES_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export function getPrestigeRank(points: number): { title: string; color: string; tier: number } {
  if (points >= 500_000) return { title: 'Apex Ascended Mogger', color: 'text-amber-300', tier: 7 };
  if (points >= 200_000) return { title: 'Giga Chad Tycoon', color: 'text-yellow-400', tier: 6 };
  if (points >= 80_000) return { title: 'Billionaire Syndicate', color: 'text-purple-400', tier: 5 };
  if (points >= 30_000) return { title: 'High Roller Elite', color: 'text-emerald-400', tier: 4 };
  if (points >= 10_000) return { title: 'Upper Class Mogger', color: 'text-blue-400', tier: 3 };
  if (points >= 2_500) return { title: 'Rising Alpha', color: 'text-cyan-400', tier: 2 };
  return { title: 'Starting Hustler', color: 'text-neutral-400', tier: 1 };
}
