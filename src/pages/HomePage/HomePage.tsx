import { useMemo } from 'react'
import { SOURCES } from '../../api/forms'
import RecordCard from '../../components/RecordCard'
import SearchInput from '../../components/SearchInput'
import SourceFilter from '../../components/SourceFilter'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import SuspicionPanel from '../../components/SuspicionPanel'
import PodoFeed from '../../components/PodoFeed'
import { useAllRecords } from '../../hooks/useAllRecords'
import { useUrlList, useUrlQuery } from '../../hooks/useUrlQuery'
import { buildPeople } from '../../lib/derive'
import { filterRecords } from '../../lib/search'
import { SOURCE_LABEL, type Source } from '../../types/records'
import styles from './style.module.css'

export default function HomePage() {
  const { bySource, records, isLoading, isError, errors, refetch } =
    useAllRecords()
  const [query, setQuery] = useUrlQuery('q')
  const [sourceList, setSourceList] = useUrlList('source')

  const activeSources = useMemo(
    () => sourceList.filter((s): s is Source => SOURCES.includes(s as Source)),
    [sourceList],
  )

  const filtered = useMemo(
    () => filterRecords(records, query, activeSources),
    [records, query, activeSources],
  )

  const people = useMemo(() => buildPeople(records), [records])

  const hasFilters = Boolean(query) || activeSources.length > 0

  return (
    <>
      <header className={styles.header}>
        <h1>Overview</h1>
        <p className={styles.subtitle}>
          Tracking Podo's last known movements across five data sources.
        </p>
      </header>

      {isError && records.length === 0 && (
        <div style={{ marginBottom: 24 }}>
          <ErrorState errors={errors} onRetry={refetch} />
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

      {!isLoading && records.length > 0 && (
        <section className={styles.panels}>
          <PodoFeed records={records} />
          <SuspicionPanel people={people} records={records} />
        </section>
      )}

      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>
          {hasFilters ? 'Matching records' : 'Latest activity'}
        </h2>
        <span className={styles.count} aria-live="polite">
          {isLoading
            ? 'loading…'
            : hasFilters
              ? `${filtered.length} of ${records.length}`
              : `${records.length} total`}
        </span>
        <div className={styles.searchWrap}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search people, places, notes…"
          />
        </div>
      </div>

      <div className={styles.filters}>
        <SourceFilter
          value={activeSources}
          onChange={(next) => setSourceList(next)}
        />
      </div>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'No matching records' : 'No records yet'}
          hint={
            hasFilters
              ? 'Try clearing the search or adjusting the source filters.'
              : 'Submissions will appear here once they arrive.'
          }
        />
      ) : (
        <section className={styles.grid}>
          {(hasFilters ? filtered : filtered.slice(0, 12)).map((r) => (
            <RecordCard key={`${r.source}-${r.id}`} record={r} />
          ))}
        </section>
      )}
    </>
  )
}
