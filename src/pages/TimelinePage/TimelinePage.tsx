import { useMemo, useState } from 'react'
import SourceBadge from '../../components/SourceBadge'
import PersonChip from '../../components/PersonChip'
import LocationChip from '../../components/LocationChip'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import { useAllRecords } from '../../hooks/useAllRecords'
import { useI18n } from '../../i18n'
import { LOCALE_TAG } from '../../lib/copy'
import { recordPeople, recordPreview, recordHeadline } from '../../lib/derive'
import { formatDateTime } from '../../lib/format'
import { personKey } from '../../lib/person'
import type { InvestigationRecord } from '../../types/records'
import styles from './style.module.css'

const isPodo = (name: string) => personKey(name) === 'podo'

function dayKey(d: Date, localeTag: string): string {
  return d.toLocaleDateString(localeTag, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function groupByDay(records: InvestigationRecord[], localeTag: string) {
  const groups = new Map<string, InvestigationRecord[]>()
  for (const r of records) {
    if (!r.at) continue
    const key = dayKey(r.at, localeTag)
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
  const { locale, copy } = useI18n()
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

  const groups = useMemo(
    () => groupByDay(filtered, LOCALE_TAG[locale]),
    [filtered, locale],
  )

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{copy.timeline.title}</h1>
          <p className={styles.subtitle}>
            {podoOnly ? copy.timeline.subtitlePodo : copy.timeline.subtitleAll}
          </p>
        </div>
        <div className={styles.toggle} role="group" aria-label={copy.timeline.scopeAria}>
          <button
            type="button"
            className={styles.toggleBtn}
            data-active={podoOnly}
            onClick={() => setPodoOnly(true)}
          >
            {copy.timeline.podoTrail}
          </button>
          <button
            type="button"
            className={styles.toggleBtn}
            data-active={!podoOnly}
            onClick={() => setPodoOnly(false)}
          >
            {copy.timeline.allRecords}
          </button>
        </div>
      </div>

      {isLoading ? (
        <SkeletonGrid count={4} />
      ) : isError && records.length === 0 ? (
        <ErrorState errors={errors} onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={copy.timeline.emptyTitle}
          hint={podoOnly ? copy.timeline.emptyHintPodo : copy.timeline.emptyHintAll}
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
                          {r.at ? formatDateTime(r.at, locale) : ''}
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
  const { locale, copy } = useI18n()
  switch (r.source) {
    case 'checkin':
      return (
        <>
          <PersonChip name={r.person} /> <span>{copy.record.checkedIn}</span>
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
          <PersonChip name={r.person} /> <span>{copy.record.seenWith}</span>{' '}
          <PersonChip name={r.seenWith} />
        </>
      )
    case 'note':
      return (
        <>
          <PersonChip name={r.author} /> <span>{copy.record.noted}</span>
        </>
      )
    case 'tip':
      return (
        <>
          <span>{copy.record.tipOnLower}</span> <PersonChip name={r.suspect} />
        </>
      )
    default:
      return <>{recordHeadline(r, locale)}</>
  }
}
