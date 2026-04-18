import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAllRecords } from '../hooks/useAllRecords'
import { buildLocations } from '../lib/derive'
import styles from './LocationsPage.module.css'

export default function LocationsPage() {
  const { records, isLoading } = useAllRecords()
  const locations = useMemo(() => buildLocations(records), [records])

  return (
    <>
      <header className={styles.header}>
        <h1>Locations</h1>
        <p className={styles.subtitle}>
          {isLoading
            ? 'Loading…'
            : `${locations.length} place${locations.length === 1 ? '' : 's'} mentioned across all records.`}
        </p>
      </header>

      <section className={styles.grid}>
        {locations.map((loc) => (
          <Link
            key={loc.name}
            to={`/locations/${encodeURIComponent(loc.name)}`}
            className={styles.card}
          >
            <div className={styles.name}>{loc.name}</div>
            <div className={styles.meta}>
              {loc.records.length} event{loc.records.length === 1 ? '' : 's'}
            </div>
            {loc.coords && (
              <div className={styles.coords}>
                {loc.coords[0].toFixed(4)}, {loc.coords[1].toFixed(4)}
              </div>
            )}
          </Link>
        ))}
        {!isLoading && locations.length === 0 && (
          <p style={{ color: 'var(--text-soft)' }}>No locations yet.</p>
        )}
      </section>
    </>
  )
}
