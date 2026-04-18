import { getCopy, LOCALE_TAG, type Locale } from './copy'

export function formatDateTime(d: Date | null, locale: Locale = 'en'): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatRelative(
  d: Date | null,
  locale: Locale = 'en',
  now: Date = new Date(),
): string {
  if (!d) return '—'
  const copy = getCopy(locale)
  const diff = Math.round((now.getTime() - d.getTime()) / 1000)
  const abs = Math.abs(diff)
  if (abs < 60) return diff >= 0 ? copy.relative.justNow : copy.relative.inMoment
  if (abs < 3600) return fmt(diff, 60, copy.relative.unit.minute, locale)
  if (abs < 86_400) return fmt(diff, 3600, copy.relative.unit.hour, locale)
  if (abs < 86_400 * 30) return fmt(diff, 86_400, copy.relative.unit.day, locale)
  if (abs < 86_400 * 365) {
    return fmt(diff, 86_400 * 30, copy.relative.unit.month, locale)
  }
  return fmt(diff, 86_400 * 365, copy.relative.unit.year, locale)
}

function fmt(diff: number, unit: number, label: string, locale: Locale): string {
  const copy = getCopy(locale)
  const n = Math.round(Math.abs(diff) / unit)
  return diff >= 0
    ? copy.relative.past(n, label)
    : copy.relative.future(n, label)
}
