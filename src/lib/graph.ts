import type { InvestigationRecord, Source } from '../types/records'
import type { Person } from '../types/entities'
import { buildPeople } from './derive'
import { personKey } from './person'

export type EdgeKind = 'sighting' | 'message' | 'mention' | 'accusation'

export interface GraphNode {
  id: string
  name: string
  isPodo: boolean
  suspicion: number
  tipCount: number
  recordCount: number
  records: InvestigationRecord[]
}

export interface GraphLink {
  source: string
  target: string
  kind: EdgeKind
  weight: number
  urgent?: boolean
  highConfidence?: boolean
  records: InvestigationRecord[]
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export function buildGraph(records: InvestigationRecord[]): GraphData {
  const people: Person[] = buildPeople(records)
  const byKey = new Map<string, Person>()
  for (const p of people) byKey.set(personKey(p.name), p)

  const nodes: GraphNode[] = people.map((p) => {
    const k = personKey(p.name)
    const tipCount = records.filter(
      (r) => r.source === 'tip' && personKey(r.suspect) === k,
    ).length
    return {
      id: p.name,
      name: p.name,
      isPodo: k === 'podo',
      suspicion: p.suspicionScore,
      tipCount,
      recordCount: p.records.length,
      records: p.records,
    }
  })

  const linkMap = new Map<string, GraphLink>()
  const addLink = (
    a: string,
    b: string,
    kind: EdgeKind,
    record: InvestigationRecord,
    extra?: Partial<Pick<GraphLink, 'urgent' | 'highConfidence'>>,
  ) => {
    const aName = byKey.get(personKey(a))?.name
    const bName = byKey.get(personKey(b))?.name
    if (!aName || !bName || aName === bName) return
    const id = `${kind}::${[aName, bName].sort().join('⟷')}`
    let link = linkMap.get(id)
    if (!link) {
      link = {
        source: aName,
        target: bName,
        kind,
        weight: 0,
        records: [],
        ...extra,
      }
      linkMap.set(id, link)
    }
    link.weight += 1
    link.records.push(record)
    if (extra?.urgent) link.urgent = true
    if (extra?.highConfidence) link.highConfidence = true
  }

  for (const r of records) {
    switch (r.source) {
      case 'sighting':
        addLink(r.person, r.seenWith, 'sighting', r)
        break
      case 'message':
        addLink(r.sender, r.recipient, 'message', r, {
          urgent: r.urgency === 'high',
        })
        break
      case 'note':
        for (const m of r.mentioned) addLink(r.author, m, 'mention', r)
        break
      case 'tip':
        // anonymous — no accuser to link; node decoration handles this
        break
    }
  }

  return { nodes, links: [...linkMap.values()] }
}

export const EDGE_LABEL: Record<EdgeKind, string> = {
  sighting: 'seen with',
  message: 'messaged',
  mention: 'mentioned in note',
  accusation: 'accused',
}

export const SOURCE_FOR_EDGE: Record<EdgeKind, Source> = {
  sighting: 'sighting',
  message: 'message',
  mention: 'note',
  accusation: 'tip',
}
