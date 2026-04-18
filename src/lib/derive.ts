import type { Person, Location } from '../types/entities'
import type { InvestigationRecord } from '../types/records'
import { canonicalPersonName, personKey } from './person'

export function recordPeople(r: InvestigationRecord): string[] {
  switch (r.source) {
    case 'checkin':
      return [r.person]
    case 'message':
      return [r.sender, r.recipient]
    case 'sighting':
      return [r.person, r.seenWith]
    case 'note':
      return [r.author, ...r.mentioned]
    case 'tip':
      return [r.suspect]
  }
}

export function recordPreview(r: InvestigationRecord): string {
  switch (r.source) {
    case 'checkin':
      return r.note
    case 'message':
      return r.text
    case 'sighting':
      return r.note
    case 'note':
      return r.note
    case 'tip':
      return r.tip
  }
}

export function recordHeadline(r: InvestigationRecord): string {
  switch (r.source) {
    case 'checkin':
      return `${r.person} checked in`
    case 'message':
      return `${r.sender} → ${r.recipient}`
    case 'sighting':
      return `${r.person} seen with ${r.seenWith}`
    case 'note':
      return `${r.author}'s note`
    case 'tip':
      return `Tip on ${r.suspect}`
  }
}

export function buildPeople(records: InvestigationRecord[]): Person[] {
  const map = new Map<string, { name: string; records: InvestigationRecord[] }>()

  for (const r of records) {
    for (const raw of recordPeople(r)) {
      const k = personKey(raw)
      if (!k) continue
      let entry = map.get(k)
      if (!entry) {
        entry = { name: canonicalPersonName(raw), records: [] }
        map.set(k, entry)
      }
      entry.records.push(r)
    }
  }

  const people: Person[] = []
  for (const entry of map.values()) {
    const records = [...entry.records].sort((a, b) => {
      const ta = a.at?.getTime() ?? 0
      const tb = b.at?.getTime() ?? 0
      return tb - ta
    })

    const lastSeen = lastSeenWith(entry.name, records)

    people.push({
      name: entry.name,
      records,
      lastSeenAt: records[0]?.at ?? null,
      lastSeenWith: lastSeen,
      suspicionScore: scoreSuspicion(entry.name, records),
    })
  }

  people.sort((a, b) => a.name.localeCompare(b.name))
  return people
}

function lastSeenWith(name: string, records: InvestigationRecord[]): string[] {
  const k = personKey(name)
  const seen = new Map<string, string>()
  for (const r of records) {
    if (r.source !== 'sighting') continue
    const other =
      personKey(r.person) === k
        ? r.seenWith
        : personKey(r.seenWith) === k
          ? r.person
          : ''
    const otherKey = personKey(other)
    if (otherKey && otherKey !== k && !seen.has(otherKey)) {
      seen.set(otherKey, canonicalPersonName(other))
    }
    if (seen.size >= 3) break
  }
  return [...seen.values()]
}

export interface SuspicionReason {
  label: string
  points: number
  recordId: string
  source: InvestigationRecord['source']
}

export interface SuspicionBreakdown {
  total: number
  reasons: SuspicionReason[]
}

export function suspicionBreakdown(
  name: string,
  records: InvestigationRecord[],
): SuspicionBreakdown {
  const k = personKey(name)
  const reasons: SuspicionReason[] = []

  for (const r of records) {
    if (r.source === 'tip' && personKey(r.suspect) === k) {
      const points =
        r.confidence === 'high' ? 3 : r.confidence === 'medium' ? 2 : 1
      reasons.push({
        label: `${r.confidence}-confidence anonymous tip`,
        points,
        recordId: r.id,
        source: r.source,
      })
    }
    if (
      r.source === 'sighting' &&
      (personKey(r.person) === 'podo' || personKey(r.seenWith) === 'podo') &&
      (personKey(r.person) === k || personKey(r.seenWith) === k) &&
      k !== 'podo'
    ) {
      reasons.push({
        label: `sighted with Podo at ${r.location || 'unknown place'}`,
        points: 1,
        recordId: r.id,
        source: r.source,
      })
    }
    if (
      r.source === 'message' &&
      personKey(r.sender) === k &&
      r.urgency === 'high'
    ) {
      reasons.push({
        label: `sent high-urgency message to ${canonicalPersonName(
          r.recipient,
        )}`,
        points: 1,
        recordId: r.id,
        source: r.source,
      })
    }
  }

  return {
    total: reasons.reduce((sum, r) => sum + r.points, 0),
    reasons,
  }
}

export function scoreSuspicion(
  name: string,
  records: InvestigationRecord[],
): number {
  return suspicionBreakdown(name, records).total
}

export function podoActivity(
  records: InvestigationRecord[],
  limit = 5,
): InvestigationRecord[] {
  return records
    .filter((r) => recordPeople(r).some((p) => personKey(p) === 'podo'))
    .slice(0, limit)
}

export function buildLocations(records: InvestigationRecord[]): Location[] {
  const map = new Map<
    string,
    { name: string; coords: Location['coords']; records: InvestigationRecord[] }
  >()
  for (const r of records) {
    const name = r.location
    if (!name) continue
    const k = name.toLowerCase()
    let entry = map.get(k)
    if (!entry) {
      entry = { name, coords: r.coords, records: [] }
      map.set(k, entry)
    } else if (!entry.coords && r.coords) {
      entry.coords = r.coords
    }
    entry.records.push(r)
  }
  const locations: Location[] = [...map.values()].map((e) => ({
    name: e.name,
    coords: e.coords,
    records: [...e.records].sort((a, b) => {
      const ta = a.at?.getTime() ?? 0
      const tb = b.at?.getTime() ?? 0
      return tb - ta
    }),
  }))
  locations.sort((a, b) => b.records.length - a.records.length)
  return locations
}
