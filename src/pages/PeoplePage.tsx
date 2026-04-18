import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import SearchInput from '../components/SearchInput'
import { useAllRecords } from '../hooks/useAllRecords'
import { useUrlQuery } from '../hooks/useUrlQuery'
import { buildPeople } from '../lib/derive'
import styles from './PeoplePage.module.css'

export default function PeoplePage() {
  const { records, isLoading } = useAllRecords()
  const [query, setQuery] = useUrlQuery('q')

  const people = useMemo(() => buildPeople(records), [records])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return people
    return people.filter((p) => p.name.toLowerCase().includes(q))
  }, [people, query])

  return (
    <>
      <header className={styles.header}>
        <h1>People</h1>
        <p className={styles.subtitle} aria-live="polite">
          {isLoading
            ? 'Loading…'
            : query
              ? `${filtered.length} of ${people.length} people match "${query}".`
              : `${people.length} people mentioned across all sources.`}
        </p>
      </header>

      <div className={styles.search}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by name…"
        />
      </div>

      <section className={styles.grid}>
        {filtered.map((p) => (
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
        {!isLoading && filtered.length === 0 && (
          <p style={{ color: 'var(--text-soft)' }}>
            {query ? `No people match "${query}".` : 'No people yet.'}
          </p>
        )}
      </section>
    </>
  )
}
