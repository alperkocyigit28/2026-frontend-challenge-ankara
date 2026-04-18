import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SearchInput from '../../components/SearchInput'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import { useAllRecords } from '../../hooks/useAllRecords'
import { useUrlQuery } from '../../hooks/useUrlQuery'
import { buildLocations } from '../../lib/derive'
import styles from './style.module.css'

export default function LocationsPage() {
  const { records, isLoading, isError, errors, refetch } = useAllRecords()
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

      {isError && locations.length === 0 ? (
        <ErrorState errors={errors} onRetry={refetch} />
      ) : isLoading ? (
        <SkeletonGrid count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={query ? `No locations match "${query}"` : 'No locations yet'}
          hint={
            query
              ? 'Try a shorter or different place name.'
              : 'Locations are derived from submitted records.'
          }
        />
      ) : (
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
        </section>
      )}
    </>
  )
}
