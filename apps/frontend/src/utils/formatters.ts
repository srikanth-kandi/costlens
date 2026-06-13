export function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatCurrencyFull(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateStr);
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function getConfidenceColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

export function getConfidenceBg(score: number): string {
  if (score >= 80) return "bg-green-100";
  if (score >= 60) return "bg-amber-100";
  return "bg-red-100";
}

export function getBudgetUtilizationColor(pct: number): string {
  if (pct >= 100) return "bg-red-500";
  if (pct >= 80) return "bg-amber-500";
  if (pct >= 60) return "bg-blue-500";
  return "bg-green-500";
}

export function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}
