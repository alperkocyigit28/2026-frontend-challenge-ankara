import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import RecordCard from '../components/RecordCard'
import { SkeletonGrid } from '../components/Skeleton'
import { EmptyState, ErrorState } from '../components/StateView'
import { useAllRecords } from '../hooks/useAllRecords'
import { buildLocations } from '../lib/derive'
import styles from './PersonPage.module.css'

export default function LocationPage() {
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
          ← Back to locations
        </Link>
        <SkeletonGrid count={4} />
      </>
    )
  }

  if (isError && locations.length === 0) {
    return (
      <>
        <Link to="/locations" className={styles.back}>
          ← Back to locations
        </Link>
        <ErrorState errors={errors} onRetry={refetch} />
      </>
    )
  }

  if (!location) {
    return (
      <>
        <Link to="/locations" className={styles.back}>
          ← Back to locations
        </Link>
        <EmptyState
          title={`No location "${decoded}"`}
          hint="This place may have been removed or the URL is wrong."
        />
      </>
    )
  }

  return (
    <>
      <Link to="/locations" className={styles.back}>
        ← Back to locations
      </Link>

      <div className={styles.header}>
        <h1 className={styles.name}>{location.name}</h1>
      </div>
      <p className={styles.subtitle}>
        {location.records.length} event{location.records.length === 1 ? '' : 's'}
        {location.coords
          ? ` · ${location.coords[0].toFixed(5)}, ${location.coords[1].toFixed(5)}`
          : ''}
      </p>

      <h2 className={styles.sectionTitle}>Events at this location</h2>
      <section className={styles.grid}>
        {location.records.map((r) => (
          <RecordCard key={`${r.source}-${r.id}`} record={r} />
        ))}
      </section>
    </>
  )
}
