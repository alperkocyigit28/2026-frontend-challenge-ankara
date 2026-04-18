import { useEffect, useMemo } from 'react'
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
import { useI18n } from '../../i18n'
import { getSourceLabel } from '../../lib/copy'
import { buildPeople } from '../../lib/derive'
import { filterRecords } from '../../lib/search'
import type { Source } from '../../types/records'
import styles from './style.module.css'

const PAGE_SIZE = 9

export default function HomePage() {
  const { locale, copy } = useI18n()
  const { bySource, records, isLoading, isError, errors, refetch } =
    useAllRecords()
  const [query, setQuery] = useUrlQuery('q')
  const [sourceList, setSourceList] = useUrlList('source')
  const [pageParam, setPageParam] = useUrlQuery('page')

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
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const requestedPage = Number.parseInt(pageParam, 10)
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1
  const pagedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  useEffect(() => {
    const normalized = currentPage <= 1 ? '' : String(currentPage)
    if (pageParam !== normalized) {
      setPageParam(normalized)
    }
  }, [currentPage, pageParam, setPageParam])

  return (
    <>
      <header className={styles.header}>
        <h1>{copy.home.title}</h1>
        <p className={styles.subtitle}>{copy.home.subtitle}</p>
      </header>

      {isError && records.length === 0 && (
        <div style={{ marginBottom: 24 }}>
          <ErrorState errors={errors} onRetry={refetch} />
        </div>
      )}

      <section className={styles.stats}>
        {SOURCES.map((s) => (
          <div key={s} className={styles.stat}>
            <div className={styles.statLabel}>{getSourceLabel(locale, s)}</div>
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
          {hasFilters ? copy.home.matchingRecords : copy.home.latestActivity}
        </h2>
        <span className={styles.count} aria-live="polite">
          {isLoading
            ? copy.common.loadingInline
            : hasFilters
              ? copy.common.ofTotal(filtered.length, records.length)
              : copy.common.total(records.length)}
        </span>
        <div className={styles.searchWrap}>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={copy.home.searchPlaceholder}
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
          title={hasFilters ? copy.home.noMatchTitle : copy.home.emptyTitle}
          hint={hasFilters ? copy.home.noMatchHint : copy.home.emptyHint}
        />
      ) : (
        <>
          <section className={styles.grid}>
            {pagedRecords.map((r) => (
              <RecordCard key={`${r.source}-${r.id}`} record={r} />
            ))}
          </section>
          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label={copy.home.pageLabel(currentPage, totalPages)}>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPageParam(String(currentPage - 1))}
                disabled={currentPage === 1}
              >
                {copy.home.previousPage}
              </button>
              <span className={styles.pageLabel}>
                {copy.home.pageLabel(currentPage, totalPages)}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                onClick={() => setPageParam(String(currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                {copy.home.nextPage}
              </button>
            </nav>
          )}
        </>
      )}
    </>
  )
}
