export type Source = 'checkin' | 'message' | 'sighting' | 'note' | 'tip'

export type Urgency = 'low' | 'medium' | 'high'
export type Confidence = 'low' | 'medium' | 'high'

export type Coords = [number, number]

interface BaseRecord {
  id: string
  source: Source
  at: Date | null
  atRaw: string
  location: string
  coords: Coords | null
  createdAt: string
}

export interface Checkin extends BaseRecord {
  source: 'checkin'
  person: string
  note: string
}

export interface Message extends BaseRecord {
  source: 'message'
  sender: string
  recipient: string
  text: string
  urgency: Urgency
}

export interface Sighting extends BaseRecord {
  source: 'sighting'
  person: string
  seenWith: string
  note: string
}

export interface PersonalNote extends BaseRecord {
  source: 'note'
  author: string
  note: string
  mentioned: string[]
}

export interface AnonymousTip extends BaseRecord {
  source: 'tip'
  suspect: string
  tip: string
  confidence: Confidence
}

export type InvestigationRecord =
  | Checkin
  | Message
  | Sighting
  | PersonalNote
  | AnonymousTip

export const SOURCE_LABEL: Record<Source, string> = {
  checkin: 'Checkin',
  message: 'Message',
  sighting: 'Sighting',
  note: 'Personal Note',
  tip: 'Anonymous Tip',
}
