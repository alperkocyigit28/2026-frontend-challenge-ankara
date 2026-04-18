import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SearchInput from '../../components/SearchInput'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import { useAllRecords } from '../../hooks/useAllRecords'
import { useUrlQuery } from '../../hooks/useUrlQuery'
import { useI18n } from '../../i18n'
import { buildLocations } from '../../lib/derive'
import styles from './style.module.css'

export default function LocationsPage() {
  const { copy } = useI18n()
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
        <h1>{copy.locations.title}</h1>
        <p className={styles.subtitle} aria-live="polite">
          {isLoading
            ? copy.common.loading
            : query
              ? copy.locations.matchCount(filtered.length, locations.length, query)
              : copy.locations.totalCount(locations.length)}
        </p>
      </header>

      <div className={styles.search}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={copy.locations.searchPlaceholder}
        />
      </div>

      {isError && locations.length === 0 ? (
        <ErrorState errors={errors} onRetry={refetch} />
      ) : isLoading ? (
        <SkeletonGrid count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={query ? copy.locations.noMatchTitle(query) : copy.locations.emptyTitle}
          hint={query ? copy.locations.noMatchHint : copy.locations.emptyHint}
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
                {copy.common.eventCount(loc.records.length)}
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
