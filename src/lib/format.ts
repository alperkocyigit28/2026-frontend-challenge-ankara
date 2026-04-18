export function formatDateTime(d: Date | null): string {
  if (!d) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatRelative(d: Date | null, now: Date = new Date()): string {
  if (!d) return '—'
  const diff = Math.round((now.getTime() - d.getTime()) / 1000)
  const abs = Math.abs(diff)
  if (abs < 60) return diff >= 0 ? 'just now' : 'in a moment'
  if (abs < 3600) return fmt(diff, 60, 'min')
  if (abs < 86_400) return fmt(diff, 3600, 'h')
  if (abs < 86_400 * 30) return fmt(diff, 86_400, 'd')
  if (abs < 86_400 * 365) return fmt(diff, 86_400 * 30, 'mo')
  return fmt(diff, 86_400 * 365, 'y')
}

function fmt(diff: number, unit: number, label: string): string {
  const n = Math.round(Math.abs(diff) / unit)
  return diff >= 0 ? `${n}${label} ago` : `in ${n}${label}`
}
