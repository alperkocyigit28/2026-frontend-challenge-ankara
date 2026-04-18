import type { InvestigationRecord, Source } from '../types/records'
import { recordPeople, recordPreview } from './derive'

export function searchableText(r: InvestigationRecord): string {
  const parts = [...recordPeople(r), r.location, recordPreview(r)]
  return parts.filter(Boolean).join(' ').toLowerCase()
}

export function matchesQuery(
  r: InvestigationRecord,
  query: string,
): boolean {
  if (!query) return true
  return searchableText(r).includes(query.trim().toLowerCase())
}

export function filterRecords(
  records: InvestigationRecord[],
  query: string,
  sources: Source[] = [],
): InvestigationRecord[] {
  const q = query.trim().toLowerCase()
  const hasSourceFilter = sources.length > 0
  return records.filter((r) => {
    if (hasSourceFilter && !sources.includes(r.source)) return false
    if (!q) return true
    return searchableText(r).includes(q)
  })
}
