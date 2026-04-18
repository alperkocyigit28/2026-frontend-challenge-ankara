import type { InvestigationRecord, Source } from '../types/records'
import { recordPeople, recordPreview } from './derive'

const SEARCH_FOLD_MAP: Record<string, string> = {
  ı: 'i',
  İ: 'i',
  ğ: 'g',
  Ğ: 'g',
  ş: 's',
  Ş: 's',
  ç: 'c',
  Ç: 'c',
  ö: 'o',
  Ö: 'o',
  ü: 'u',
  Ü: 'u',
}

function foldSearchText(value: string): string {
  return value.replace(
    /[ıİğĞşŞçÇöÖüÜ]/g,
    (char) => SEARCH_FOLD_MAP[char] ?? char,
  )
}

export function normalizeSearchText(value: string): string {
  return foldSearchText(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['.`’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function tokenizeSearchText(value: string): string[] {
  const normalized = normalizeSearchText(value)
  return normalized ? normalized.split(/\s+/) : []
}

function isSubsequence(needle: string, haystack: string): boolean {
  let i = 0
  for (const char of haystack) {
    if (char === needle[i]) i += 1
    if (i >= needle.length) return true
  }
  return needle.length === 0
}

function isWithinEditDistance(
  a: string,
  b: string,
  maxDistance: number,
): boolean {
  const aLen = a.length
  const bLen = b.length
  if (Math.abs(aLen - bLen) > maxDistance) return false

  let prev = Array.from({ length: bLen + 1 }, (_, i) => i)

  for (let i = 1; i <= aLen; i += 1) {
    const next = [i]
    let rowMin = next[0]

    for (let j = 1; j <= bLen; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const value = Math.min(
        prev[j] + 1,
        next[j - 1] + 1,
        prev[j - 1] + cost,
      )
      next.push(value)
      rowMin = Math.min(rowMin, value)
    }

    if (rowMin > maxDistance) return false
    prev = next
  }

  return prev[bLen] <= maxDistance
}

function fuzzyTokenMatch(haystackToken: string, queryToken: string): boolean {
  if (!queryToken) return true
  if (haystackToken.includes(queryToken)) return true

  if (queryToken.length >= 3 && isSubsequence(queryToken, haystackToken)) {
    return true
  }

  const maxDistance =
    queryToken.length >= 8 ? 2 : queryToken.length >= 5 ? 1 : 0

  return (
    maxDistance > 0 &&
    isWithinEditDistance(queryToken, haystackToken, maxDistance)
  )
}

export function matchesFuzzyText(
  haystack: string,
  query: string,
): boolean {
  const normalizedQuery = normalizeSearchText(query)
  if (!normalizedQuery) return true

  const normalizedHaystack = normalizeSearchText(haystack)
  if (!normalizedHaystack) return false
  if (normalizedHaystack.includes(normalizedQuery)) return true

  const haystackTokens = tokenizeSearchText(haystack)
  const queryTokens = tokenizeSearchText(query)

  return queryTokens.every((queryToken) =>
    haystackTokens.some((haystackToken) =>
      fuzzyTokenMatch(haystackToken, queryToken),
    ),
  )
}

export function searchableText(r: InvestigationRecord): string {
  const parts = [...recordPeople(r), r.location, recordPreview(r)]
  return parts.filter(Boolean).join(' ').toLowerCase()
}

export function matchesQuery(
  r: InvestigationRecord,
  query: string,
): boolean {
  return matchesFuzzyText(searchableText(r), query)
}

export function filterRecords(
  records: InvestigationRecord[],
  query: string,
  sources: Source[] = [],
): InvestigationRecord[] {
  const q = normalizeSearchText(query)
  const hasSourceFilter = sources.length > 0
  return records.filter((r) => {
    if (hasSourceFilter && !sources.includes(r.source)) return false
    if (!q) return true
    return matchesFuzzyText(searchableText(r), q)
  })
}
