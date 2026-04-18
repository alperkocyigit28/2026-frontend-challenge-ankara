import type { Coords, InvestigationRecord } from './records'

export interface Person {
  name: string
  records: InvestigationRecord[]
  lastSeenAt: Date | null
  lastSeenWith: string[]
  suspicionScore: number
}

export interface Location {
  name: string
  coords: Coords | null
  records: InvestigationRecord[]
}
