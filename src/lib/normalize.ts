import type { RawAnswer, RawSubmission } from '../api/jotform'
import type {
  AnonymousTip,
  Checkin,
  Confidence,
  InvestigationRecord,
  Message,
  PersonalNote,
  Sighting,
  Source,
  Urgency,
} from '../types/records'
import { parseCoords, parseMentioned, parseTimestamp } from './parse'

function byName(answers: Record<string, RawAnswer>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key of Object.keys(answers)) {
    const a = answers[key]
    if (!a?.name) continue
    const v = a.answer
    if (typeof v === 'string') out[a.name] = v
  }
  return out
}

function asLevel<T extends string>(
  raw: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  const v = (raw ?? '').trim().toLowerCase()
  return (allowed as readonly string[]).includes(v) ? (v as T) : fallback
}

const URGENCY_VALUES = ['low', 'medium', 'high'] as const
const CONFIDENCE_VALUES = ['low', 'medium', 'high'] as const

export function normalize(
  source: Source,
  raw: RawSubmission,
): InvestigationRecord | null {
  const a = byName(raw.answers)
  const atRaw = a.timestamp ?? ''
  const base = {
    id: raw.id,
    atRaw,
    at: parseTimestamp(atRaw),
    location: (a.location ?? '').trim(),
    coords: parseCoords(a.coordinates),
    createdAt: raw.created_at,
  }

  switch (source) {
    case 'checkin': {
      const rec: Checkin = {
        ...base,
        source: 'checkin',
        person: (a.personName ?? '').trim(),
        note: a.note ?? '',
      }
      return rec
    }
    case 'message': {
      const rec: Message = {
        ...base,
        source: 'message',
        sender: (a.senderName ?? '').trim(),
        recipient: (a.recipientName ?? '').trim(),
        text: a.text ?? '',
        urgency: asLevel<Urgency>(a.urgency, URGENCY_VALUES, 'low'),
      }
      return rec
    }
    case 'sighting': {
      const rec: Sighting = {
        ...base,
        source: 'sighting',
        person: (a.personName ?? '').trim(),
        seenWith: (a.seenWith ?? '').trim(),
        note: a.note ?? '',
      }
      return rec
    }
    case 'note': {
      const rec: PersonalNote = {
        ...base,
        source: 'note',
        author: (a.authorName ?? '').trim(),
        note: a.note ?? '',
        mentioned: parseMentioned(a.mentionedPeople),
      }
      return rec
    }
    case 'tip': {
      const rec: AnonymousTip = {
        ...base,
        source: 'tip',
        suspect: (a.suspectName ?? '').trim(),
        tip: a.tip ?? '',
        confidence: asLevel<Confidence>(
          a.confidence,
          CONFIDENCE_VALUES,
          'low',
        ),
      }
      return rec
    }
  }
}

export function normalizeAll(
  source: Source,
  raws: RawSubmission[],
): InvestigationRecord[] {
  return raws
    .map((r) => normalize(source, r))
    .filter((r): r is InvestigationRecord => r !== null)
}
