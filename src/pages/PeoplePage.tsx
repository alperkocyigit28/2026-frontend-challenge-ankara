import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAllRecords } from '../hooks/useAllRecords'
import { buildPeople } from '../lib/derive'
import styles from './PeoplePage.module.css'

export default function PeoplePage() {
  const { records, isLoading } = useAllRecords()
  const people = useMemo(() => buildPeople(records), [records])

  return (
    <>
      <header className={styles.header}>
        <h1>People</h1>
        <p className={styles.subtitle}>
          {isLoading ? 'Loading…' : `${people.length} people mentioned across all sources.`}
        </p>
      </header>

      <section className={styles.grid}>
        {people.map((p) => (
          <Link
            key={p.name}
            to={`/people/${encodeURIComponent(p.name)}`}
            className={styles.card}
          >
            <div className={styles.name}>{p.name}</div>
            <div className={styles.meta}>
              {p.records.length} record{p.records.length === 1 ? '' : 's'}
            </div>
            <div className={styles.badges}>
              {p.suspicionScore > 0 && (
                <span className={`${styles.badge} ${styles.suspicion}`}>
                  suspicion {p.suspicionScore}
                </span>
              )}
            </div>
          </Link>
        ))}
        {!isLoading && people.length === 0 && (
          <p style={{ color: 'var(--text-soft)' }}>No people yet.</p>
        )}
      </section>
    </>
  )
}
