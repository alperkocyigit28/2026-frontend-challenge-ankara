import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SearchInput from '../../components/SearchInput'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import { useAllRecords } from '../../hooks/useAllRecords'
import { useUrlQuery } from '../../hooks/useUrlQuery'
import { useI18n } from '../../i18n'
import { buildPeople } from '../../lib/derive'
import { matchesFuzzyText } from '../../lib/search'
import styles from './style.module.css'

export default function PeoplePage() {
  const { copy } = useI18n()
  const { records, isLoading, isError, errors, refetch } = useAllRecords()
  const [query, setQuery] = useUrlQuery('q')

  const people = useMemo(() => buildPeople(records), [records])
  const filtered = useMemo(() => {
    if (!query.trim()) return people
    return people.filter((p) => matchesFuzzyText(p.name, query))
  }, [people, query])

  return (
    <>
      <header className={styles.header}>
        <h1>{copy.people.title}</h1>
        <p className={styles.subtitle} aria-live="polite">
          {isLoading
            ? copy.common.loading
            : query
              ? copy.people.matchCount(filtered.length, people.length, query)
              : copy.people.totalCount(people.length)}
        </p>
      </header>

      <div className={styles.search}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={copy.people.searchPlaceholder}
        />
      </div>

      {isError && people.length === 0 ? (
        <ErrorState errors={errors} onRetry={refetch} />
      ) : isLoading ? (
        <SkeletonGrid count={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={query ? copy.people.noMatchTitle(query) : copy.people.emptyTitle}
          hint={query ? copy.people.noMatchHint : copy.people.emptyHint}
        />
      ) : (
        <section className={styles.grid}>
          {filtered.map((p) => (
            <Link
              key={p.name}
              to={`/people/${encodeURIComponent(p.name)}`}
              className={styles.card}
            >
              <div className={styles.name}>{p.name}</div>
              <div className={styles.meta}>
                {copy.common.recordCount(p.records.length)}
              </div>
              <div className={styles.badges}>
                {p.suspicionScore > 0 && (
                  <span className={`${styles.badge} ${styles.suspicion}`}>
                    {copy.common.suspicionScore(p.suspicionScore)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </section>
      )}
    </>
  )
}
