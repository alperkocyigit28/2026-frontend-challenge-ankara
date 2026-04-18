import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import RecordCard from '../../components/RecordCard'
import PersonChip from '../../components/PersonChip'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import { useAllRecords } from '../../hooks/useAllRecords'
import { buildPeople, suspicionBreakdown } from '../../lib/derive'
import { formatDateTime } from '../../lib/format'
import { useI18n } from '../../i18n'
import { personKey } from '../../lib/person'
import styles from './style.module.css'

export default function PersonPage() {
  const { locale, copy } = useI18n()
  const { name: rawName } = useParams<{ name: string }>()
  const decoded = rawName ? decodeURIComponent(rawName) : ''
  const { records, isLoading, isError, errors, refetch } = useAllRecords()

  const people = useMemo(() => buildPeople(records), [records])
  const person = useMemo(
    () => people.find((p) => personKey(p.name) === personKey(decoded)),
    [people, decoded],
  )

  if (isLoading) {
    return (
      <>
        <Link to="/people" className={styles.back}>
          {copy.common.backToPeople}
        </Link>
        <SkeletonGrid count={4} />
      </>
    )
  }

  if (isError && people.length === 0) {
    return (
      <>
        <Link to="/people" className={styles.back}>
          {copy.common.backToPeople}
        </Link>
        <ErrorState errors={errors} onRetry={refetch} />
      </>
    )
  }

  if (!person) {
    return (
      <>
        <Link to="/people" className={styles.back}>
          {copy.common.backToPeople}
        </Link>
        <EmptyState
          title={copy.person.missingTitle(decoded)}
          hint={copy.person.missingHint}
        />
      </>
    )
  }

  return (
    <>
      <Link to="/people" className={styles.back}>
        {copy.common.backToPeople}
      </Link>

      <div className={styles.header}>
        <h1 className={styles.name}>{person.name}</h1>
        {person.suspicionScore > 0 && (
          <span className={styles.score}>{copy.common.suspicionScore(person.suspicionScore)}</span>
        )}
      </div>
      <p className={styles.subtitle}>{copy.common.recordCount(person.records.length)}</p>

      <section className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>{copy.common.lastSeen}</div>
          <div className={styles.summaryValue}>
            {formatDateTime(person.lastSeenAt, locale)}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>{copy.common.lastSeenWith}</div>
          <div className={styles.summaryValue}>
            {person.lastSeenWith.length > 0 ? (
              <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
                {person.lastSeenWith.map((n) => (
                  <PersonChip key={n} name={n} />
                ))}
              </span>
            ) : (
              copy.common.noValue
            )}
          </div>
        </div>
      </section>

      {person.suspicionScore > 0 && (
        <SuspicionBreakdown name={person.name} records={records} />
      )}

      <h2 className={styles.sectionTitle}>{copy.common.allRecords}</h2>
      <section className={styles.grid}>
        {person.records.map((r) => (
          <RecordCard key={`${r.source}-${r.id}`} record={r} />
        ))}
      </section>
    </>
  )
}

function SuspicionBreakdown({
  name,
  records,
}: {
  name: string
  records: ReturnType<typeof useAllRecords>['records']
}) {
  const { locale, copy } = useI18n()
  const { total, reasons } = suspicionBreakdown(name, records, locale)
  return (
    <section className={styles.breakdown} aria-label={copy.person.breakdownAria}>
      <div className={styles.breakdownHead}>
        <span className={styles.breakdownTitle}>{copy.person.breakdownTitle}</span>
        <span className={styles.breakdownTotal}>{copy.common.totalScore(total)}</span>
      </div>
      <ul className={styles.breakdownList}>
        {reasons.map((r, i) => (
          <li key={`${r.recordId}-${i}`} className={styles.breakdownRow}>
            <span className={styles.breakdownPoints}>+{r.points}</span>
            <span className={styles.breakdownLabel}>{r.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
