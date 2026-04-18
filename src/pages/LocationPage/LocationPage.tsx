import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import RecordCard from '../../components/RecordCard'
import { SkeletonGrid } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import { useAllRecords } from '../../hooks/useAllRecords'
import { useI18n } from '../../i18n'
import { buildLocations } from '../../lib/derive'
import styles from './style.module.css'

export default function LocationPage() {
  const { copy } = useI18n()
  const { name: rawName } = useParams<{ name: string }>()
  const decoded = rawName ? decodeURIComponent(rawName) : ''
  const { records, isLoading, isError, errors, refetch } = useAllRecords()

  const locations = useMemo(() => buildLocations(records), [records])
  const location = useMemo(
    () => locations.find((l) => l.name.toLowerCase() === decoded.toLowerCase()),
    [locations, decoded],
  )

  if (isLoading) {
    return (
      <>
        <Link to="/locations" className={styles.back}>
          {copy.common.backToLocations}
        </Link>
        <SkeletonGrid count={4} />
      </>
    )
  }

  if (isError && locations.length === 0) {
    return (
      <>
        <Link to="/locations" className={styles.back}>
          {copy.common.backToLocations}
        </Link>
        <ErrorState errors={errors} onRetry={refetch} />
      </>
    )
  }

  if (!location) {
    return (
      <>
        <Link to="/locations" className={styles.back}>
          {copy.common.backToLocations}
        </Link>
        <EmptyState
          title={copy.locations.locationMissingTitle(decoded)}
          hint={copy.locations.locationMissingHint}
        />
      </>
    )
  }

  return (
    <>
      <Link to="/locations" className={styles.back}>
        {copy.common.backToLocations}
      </Link>

      <div className={styles.header}>
        <h1 className={styles.name}>{location.name}</h1>
      </div>
      <p className={styles.subtitle}>
        {copy.common.eventCount(location.records.length)}
        {location.coords
          ? ` · ${location.coords[0].toFixed(5)}, ${location.coords[1].toFixed(5)}`
          : ''}
      </p>

      <h2 className={styles.sectionTitle}>{copy.locations.eventsAtLocation}</h2>
      <section className={styles.grid}>
        {location.records.map((r) => (
          <RecordCard key={`${r.source}-${r.id}`} record={r} />
        ))}
      </section>
    </>
  )
}
