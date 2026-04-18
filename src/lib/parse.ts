import type { Coords } from '../types/records'

export function parseTimestamp(value: string | undefined): Date | null {
  if (!value) return null
  const match = value.trim().match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{1,2}):(\d{2})$/)
  if (!match) {
    const fallback = new Date(value)
    return Number.isNaN(fallback.getTime()) ? null : fallback
  }
  const [, dd, mm, yyyy, hh, mi] = match
  const d = new Date(
    Number(yyyy),
    Number(mm) - 1,
    Number(dd),
    Number(hh),
    Number(mi),
  )
  return Number.isNaN(d.getTime()) ? null : d
}

export function parseCoords(value: string | undefined): Coords | null {
  if (!value) return null
  const parts = value.split(',').map((s) => Number(s.trim()))
  if (parts.length !== 2) return null
  const [lat, lng] = parts
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return [lat, lng]
}

export function parseMentioned(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}
