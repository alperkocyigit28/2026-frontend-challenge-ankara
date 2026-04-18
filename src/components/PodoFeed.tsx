import LocationChip from './LocationChip'
import PersonChip from './PersonChip'
import SourceBadge from './SourceBadge'
import { formatDateTime, formatRelative } from '../lib/format'
import { podoActivity } from '../lib/derive'
import type { InvestigationRecord } from '../types/records'
import styles from './PodoFeed.module.css'

interface Props {
  records: InvestigationRecord[]
  limit?: number
}

export default function PodoFeed({ records, limit = 5 }: Props) {
  const recent = podoActivity(records, limit)

  return (
    <section className={styles.panel} aria-label="Podo's recent activity">
      <div className={styles.head}>
        <span className={styles.title}>Where is Podo?</span>
        <span className={styles.hint}>most recent mentions</span>
      </div>
      {recent.length === 0 ? (
        <p className={styles.empty}>No records mention Podo yet.</p>
      ) : (
        <ul className={styles.list}>
          {recent.map((r) => (
            <li key={`${r.source}-${r.id}`} className={styles.row}>
              <span className={styles.dot} aria-hidden="true" />
              <div className={styles.body}>
                <div className={styles.meta}>
                  <SourceBadge source={r.source} />
                  <span className={styles.time} title={formatDateTime(r.at)}>
                    {formatRelative(r.at)}
                  </span>
                </div>
                <div className={styles.line}>
                  <PodoLine record={r} />
                  {r.location && <LocationChip name={r.location} />}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function PodoLine({ record }: { record: InvestigationRecord }) {
  switch (record.source) {
    case 'checkin':
      return (
        <>
          <PersonChip name={record.person} />
          <span>checked in at</span>
        </>
      )
    case 'message':
      return (
        <>
          <PersonChip name={record.sender} />
          <span>messaged</span>
          <PersonChip name={record.recipient} />
          <span>from</span>
        </>
      )
    case 'sighting':
      return (
        <>
          <PersonChip name={record.person} />
          <span>seen with</span>
          <PersonChip name={record.seenWith} />
          <span>at</span>
        </>
      )
    case 'note':
      return (
        <>
          <PersonChip name={record.author} />
          <span>wrote about Podo at</span>
        </>
      )
    case 'tip':
      return (
        <>
          <span>Tip on</span>
          <PersonChip name={record.suspect} />
          <span>near</span>
        </>
      )
  }
}
