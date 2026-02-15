export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function formatTimeLeft(isoDate: string) {
  const now = new Date();
  const due = new Date(isoDate);
  const diffMs = due.getTime() - now.getTime();
  const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  if (days >= 365) {
    const years = Math.max(1, Math.floor(days / 365));
    return `${years} years to go`;
  }
  if (days >= 30) {
    const months = Math.max(1, Math.floor(days / 30));
    return `${months} months to go`;
  }
  return `${days} days to go`;
}

export function formatTime(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDate));
}
