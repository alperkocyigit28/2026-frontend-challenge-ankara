import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import RecordCard from '../../components/RecordCard'
import PersonChip from '../../components/PersonChip'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import { useAllRecords } from '../../hooks/useAllRecords'
import { buildPeople, suspicionBreakdown } from '../../lib/derive'
import { formatDateTime } from '../../lib/format'
import styles from './style.module.css'

export default function PersonPage() {
  const { name: rawName } = useParams<{ name: string }>()
  const decoded = rawName ? decodeURIComponent(rawName) : ''
  const { records, isLoading, isError, errors, refetch } = useAllRecords()

  const people = useMemo(() => buildPeople(records), [records])
  const person = useMemo(
    () => people.find((p) => p.name.toLowerCase() === decoded.toLowerCase()),
    [people, decoded],
  )

  if (isLoading) {
    return (
      <>
        <Link to="/people" className={styles.back}>
          ← Back to people
        </Link>
        <SkeletonGrid count={4} />
      </>
    )
  }

  if (isError && people.length === 0) {
    return (
      <>
        <Link to="/people" className={styles.back}>
          ← Back to people
        </Link>
        <ErrorState errors={errors} onRetry={refetch} />
      </>
    )
  }

  if (!person) {
    return (
      <>
        <Link to="/people" className={styles.back}>
          ← Back to people
        </Link>
        <EmptyState
          title={`No person named "${decoded}"`}
          hint="This person may have been removed or the URL is wrong."
        />
      </>
    )
  }

  return (
    <>
      <Link to="/people" className={styles.back}>
        ← Back to people
      </Link>

      <div className={styles.header}>
        <h1 className={styles.name}>{person.name}</h1>
        {person.suspicionScore > 0 && (
          <span className={styles.score}>
            suspicion {person.suspicionScore}
          </span>
        )}
      </div>
      <p className={styles.subtitle}>
        {person.records.length} record{person.records.length === 1 ? '' : 's'}
      </p>

      <section className={styles.summary}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Last seen</div>
          <div className={styles.summaryValue}>
            {formatDateTime(person.lastSeenAt)}
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Last seen with</div>
          <div className={styles.summaryValue}>
            {person.lastSeenWith.length > 0 ? (
              <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px' }}>
                {person.lastSeenWith.map((n) => (
                  <PersonChip key={n} name={n} />
                ))}
              </span>
            ) : (
              '—'
            )}
          </div>
        </div>
      </section>

      {person.suspicionScore > 0 && (
        <SuspicionBreakdown name={person.name} records={records} />
      )}

      <h2 className={styles.sectionTitle}>All records</h2>
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
  const { total, reasons } = suspicionBreakdown(name, records)
  return (
    <section className={styles.breakdown} aria-label="Suspicion score breakdown">
      <div className={styles.breakdownHead}>
        <span className={styles.breakdownTitle}>Why suspicion is high</span>
        <span className={styles.breakdownTotal}>total {total}</span>
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
