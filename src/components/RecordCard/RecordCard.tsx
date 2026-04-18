import type { MouseEvent, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import type { InvestigationRecord } from '../../types/records'
import { recordPreview } from '../../lib/derive'
import { formatDateTime, formatRelative } from '../../lib/format'
import SourceBadge from '../SourceBadge'
import PersonChip from '../PersonChip'
import LocationChip from '../LocationChip'
import styles from './style.module.css'

interface Props {
  record: InvestigationRecord
}

export default function RecordCard({ record }: Props) {
  const navigate = useNavigate()
  const preview = recordPreview(record)
  const mappable = !!record.coords

  const openOnMap = () => {
    navigate(`/map?selected=${encodeURIComponent(`${record.source}-${record.id}`)}`)
  }

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    if (!mappable) return
    if (e.target instanceof HTMLElement && e.target.closest('a,button')) return
    openOnMap()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!mappable) return
    if (e.key !== 'Enter' && e.key !== ' ') return
    if (e.target instanceof HTMLElement && e.target.closest('a,button')) return
    e.preventDefault()
    openOnMap()
  }

  return (
    <article
      className={clsx(styles.card, mappable && styles.clickable)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={mappable ? 'button' : undefined}
      tabIndex={mappable ? 0 : undefined}
      aria-label={mappable ? 'Open on map' : undefined}
    >
      <div className={styles.head}>
        <SourceBadge source={record.source} />
        <span className={styles.time} title={formatDateTime(record.at)}>
          {formatRelative(record.at)}
        </span>
      </div>

      <Headline record={record} />

      {preview && (
        <p className={styles.preview} title={preview}>
          {preview}
        </p>
      )}

      <Meta record={record} />

      {mappable && (
        <span className={styles.mapHint} aria-hidden>
          View on map →
        </span>
      )}
    </article>
  )
}

function Headline({ record }: { record: InvestigationRecord }) {
  switch (record.source) {
    case 'checkin':
      return (
        <div className={styles.headline}>
          <PersonChip name={record.person} />
          <span>checked in</span>
        </div>
      )
    case 'message':
      return (
        <div className={styles.headline}>
          <PersonChip name={record.sender} />
          <span>→</span>
          <PersonChip name={record.recipient} />
        </div>
      )
    case 'sighting':
      return (
        <div className={styles.headline}>
          <PersonChip name={record.person} />
          <span>seen with</span>
          <PersonChip name={record.seenWith} />
        </div>
      )
    case 'note':
      return (
        <div className={styles.headline}>
          <PersonChip name={record.author} />
          <span>wrote a note</span>
        </div>
      )
    case 'tip':
      return (
        <div className={styles.headline}>
          <span>Tip on</span>
          <PersonChip name={record.suspect} />
        </div>
      )
  }
}

function Meta({ record }: { record: InvestigationRecord }) {
  return (
    <div className={styles.meta}>
      {record.location && <LocationChip name={record.location} />}
      {record.source === 'tip' && (
        <span
          className={`${styles.tag} ${record.confidence === 'high' ? styles.tagHigh : record.confidence === 'medium' ? styles.tagMed : ''}`}
        >
          confidence: {record.confidence}
        </span>
      )}
      {record.source === 'message' && (
        <span
          className={`${styles.tag} ${record.urgency === 'high' ? styles.tagHigh : record.urgency === 'medium' ? styles.tagMed : ''}`}
        >
          urgency: {record.urgency}
        </span>
      )}
      {record.source === 'note' && record.mentioned.length > 0 && (
        <span className={styles.mentions}>
          <span className={styles.mentionsLabel}>mentions:</span>
          {record.mentioned.map((n) => (
            <PersonChip key={n} name={n} />
          ))}
        </span>
      )}
    </div>
  )
}
