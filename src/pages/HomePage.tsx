import { SOURCES } from '../api/forms'
import RecordCard from '../components/RecordCard'
import { useAllRecords } from '../hooks/useAllRecords'
import { SOURCE_LABEL } from '../types/records'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { bySource, records, isLoading, isError, errors } = useAllRecords()

  const latest = records.slice(0, 6)

  return (
    <>
      <header className={styles.header}>
        <h1>Overview</h1>
        <p className={styles.subtitle}>
          Tracking Podo's last known movements across five data sources.
        </p>
      </header>

      {isError && (
        <div className={styles.errorBox}>
          <strong>Failed to load some sources.</strong>
          <ul>
            {errors.map((e, i) => (
              <li key={i}>{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      <section className={styles.stats}>
        {SOURCES.map((s) => (
          <div key={s} className={styles.stat}>
            <div className={styles.statLabel}>{SOURCE_LABEL[s]}</div>
            <div className={styles.statValue}>
              {isLoading ? '…' : (bySource[s]?.length ?? 0)}
            </div>
          </div>
        ))}
      </section>

      <h2 className={styles.sectionTitle}>
        Latest activity <small>{isLoading ? 'loading…' : `${records.length} total`}</small>
      </h2>
      <section className={styles.grid}>
        {latest.map((r) => (
          <RecordCard key={`${r.source}-${r.id}`} record={r} />
        ))}
        {!isLoading && latest.length === 0 && (
          <p style={{ color: 'var(--text-soft)' }}>No records yet.</p>
        )}
      </section>
    </>
  )
}
