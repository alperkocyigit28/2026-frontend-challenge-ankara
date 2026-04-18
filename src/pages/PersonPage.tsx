import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import RecordCard from '../components/RecordCard'
import { useAllRecords } from '../hooks/useAllRecords'
import { buildPeople } from '../lib/derive'
import { formatDateTime } from '../lib/format'
import styles from './PersonPage.module.css'

export default function PersonPage() {
  const { name: rawName } = useParams<{ name: string }>()
  const decoded = rawName ? decodeURIComponent(rawName) : ''
  const { records, isLoading } = useAllRecords()

  const people = useMemo(() => buildPeople(records), [records])
  const person = useMemo(
    () => people.find((p) => p.name.toLowerCase() === decoded.toLowerCase()),
    [people, decoded],
  )

  if (isLoading) {
    return <p style={{ color: 'var(--text-soft)' }}>Loading…</p>
  }

  if (!person) {
    return (
      <>
        <Link to="/people" className={styles.back}>
          ← Back to people
        </Link>
        <div className={styles.empty}>
          No person named <strong>{decoded}</strong> found.
        </div>
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
            {person.lastSeenWith.length > 0
              ? person.lastSeenWith.join(', ')
              : '—'}
          </div>
        </div>
      </section>

      <h2 className={styles.sectionTitle}>All records</h2>
      <section className={styles.grid}>
        {person.records.map((r) => (
          <RecordCard key={`${r.source}-${r.id}`} record={r} />
        ))}
      </section>
    </>
  )
}
