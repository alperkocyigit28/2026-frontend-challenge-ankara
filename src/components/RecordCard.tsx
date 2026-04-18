import type { InvestigationRecord } from '../types/records'
import { recordHeadline, recordPreview } from '../lib/derive'
import { formatDateTime, formatRelative } from '../lib/format'
import SourceBadge from './SourceBadge'
import styles from './RecordCard.module.css'

interface Props {
  record: InvestigationRecord
}

export default function RecordCard({ record }: Props) {
  const preview = recordPreview(record)
  const title = recordHeadline(record)

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <SourceBadge source={record.source} />
        <span className={styles.time} title={formatDateTime(record.at)}>
          {formatRelative(record.at)}
        </span>
      </div>
      <div className={styles.title}>{title}</div>
      {preview && <p className={styles.preview}>{preview}</p>}
      <div className={styles.meta}>
        {record.location && <span>{record.location}</span>}
        {record.source === 'tip' && (
          <>
            <span className={styles.dot}>·</span>
            <span>confidence: {record.confidence}</span>
          </>
        )}
        {record.source === 'message' && (
          <>
            <span className={styles.dot}>·</span>
            <span>urgency: {record.urgency}</span>
          </>
        )}
      </div>
    </article>
  )
}
