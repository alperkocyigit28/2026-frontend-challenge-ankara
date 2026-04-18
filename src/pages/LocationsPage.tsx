import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SearchInput from '../components/SearchInput'
import { useAllRecords } from '../hooks/useAllRecords'
import { useUrlQuery } from '../hooks/useUrlQuery'
import { buildLocations } from '../lib/derive'
import styles from './LocationsPage.module.css'

export default function LocationsPage() {
  const { records, isLoading } = useAllRecords()
  const [query, setQuery] = useUrlQuery('q')

  const locations = useMemo(() => buildLocations(records), [records])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return locations
    return locations.filter((l) => l.name.toLowerCase().includes(q))
  }, [locations, query])

  return (
    <>
      <header className={styles.header}>
        <h1>Locations</h1>
        <p className={styles.subtitle} aria-live="polite">
          {isLoading
            ? 'Loading…'
            : query
              ? `${filtered.length} of ${locations.length} locations match "${query}".`
              : `${locations.length} place${locations.length === 1 ? '' : 's'} mentioned across all records.`}
        </p>
      </header>

      <div className={styles.search}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by place name…"
        />
      </div>

      <section className={styles.grid}>
        {filtered.map((loc) => (
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
        {!isLoading && filtered.length === 0 && (
          <p style={{ color: 'var(--text-soft)' }}>
            {query ? `No locations match "${query}".` : 'No locations yet.'}
          </p>
        )}
      </section>
    </>
  )
}
