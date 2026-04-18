import { useMemo, useState } from 'react'
import SourceBadge from '../../components/SourceBadge'
import PersonChip from '../../components/PersonChip'
import LocationChip from '../../components/LocationChip'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import { useAllRecords } from '../../hooks/useAllRecords'
import { recordPeople, recordPreview, recordHeadline } from '../../lib/derive'
import { formatDateTime } from '../../lib/format'
import { personKey } from '../../lib/person'
import type { InvestigationRecord } from '../../types/records'
import styles from './style.module.css'

const isPodo = (name: string) => personKey(name) === 'podo'

function dayKey(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function groupByDay(records: InvestigationRecord[]) {
  const groups = new Map<string, InvestigationRecord[]>()
  for (const r of records) {
    if (!r.at) continue
    const key = dayKey(r.at)
    let list = groups.get(key)
    if (!list) {
      list = []
      groups.set(key, list)
    }
    list.push(r)
  }
  return [...groups.entries()]
}

export default function TimelinePage() {
  const { records, isLoading, isError, errors, refetch } = useAllRecords()
  const [podoOnly, setPodoOnly] = useState(true)

  const filtered = useMemo(() => {
    const withTime = records.filter((r) => r.at)
    const scoped = podoOnly
      ? withTime.filter((r) => recordPeople(r).some(isPodo))
      : withTime
    return [...scoped].sort(
      (a, b) => (a.at?.getTime() ?? 0) - (b.at?.getTime() ?? 0),
    )
  }, [records, podoOnly])

  const groups = useMemo(() => groupByDay(filtered), [filtered])

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Timeline</h1>
          <p className={styles.subtitle}>
            {podoOnly
              ? "Chronological trail of every record where Podo appears."
              : 'Every record in chronological order.'}
          </p>
        </div>
        <div className={styles.toggle} role="group" aria-label="Timeline scope">
          <button
            type="button"
            className={styles.toggleBtn}
            data-active={podoOnly}
            onClick={() => setPodoOnly(true)}
          >
            Podo's trail
          </button>
          <button
            type="button"
            className={styles.toggleBtn}
            data-active={!podoOnly}
            onClick={() => setPodoOnly(false)}
          >
            All records
          </button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid count={4} />
      ) : isError && records.length === 0 ? (
        <ErrorState errors={errors} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nothing on this timeline yet"
          hint={
            podoOnly
              ? 'No records mention Podo. Try "All records" to see everything.'
              : 'No records with timestamps were found.'
          }
        />
      ) : (
        <div className={styles.timeline}>
          {groups.map(([day, items]) => (
            <section key={day} className={styles.day}>
              <h2 className={styles.dayTitle}>{day}</h2>
              <ol className={styles.events}>
                {items.map((r) => (
                  <li key={`${r.source}-${r.id}`} className={styles.event}>
                    <span className={styles.dot} data-source={r.source} />
                    <div className={styles.card}>
                      <div className={styles.cardHead}>
                        <SourceBadge source={r.source} />
                        <time className={styles.time}>
                          {r.at ? formatDateTime(r.at) : ''}
                        </time>
                      </div>
                      <div className={styles.headline}>
                        <Headline record={r} />
                      </div>
                      <p className={styles.preview}>{recordPreview(r)}</p>
                      {r.location && (
                        <div className={styles.meta}>
                          <LocationChip name={r.location} />
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </>
  )
}

function Headline({ record: r }: { record: InvestigationRecord }) {
  switch (r.source) {
    case 'checkin':
      return (
        <>
          <PersonChip name={r.person} /> <span>checked in</span>
        </>
      )
    case 'message':
      return (
        <>
          <PersonChip name={r.sender} /> <span>→</span>{' '}
          <PersonChip name={r.recipient} />
        </>
      )
    case 'sighting':
      return (
        <>
          <PersonChip name={r.person} /> <span>seen with</span>{' '}
          <PersonChip name={r.seenWith} />
        </>
      )
    case 'note':
      return (
        <>
          <PersonChip name={r.author} /> <span>noted</span>
        </>
      )
    case 'tip':
      return (
        <>
          <span>tip on</span> <PersonChip name={r.suspect} />
        </>
      )
    default:
      return <>{recordHeadline(r)}</>
  }
}
