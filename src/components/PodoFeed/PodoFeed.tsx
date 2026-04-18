import LocationChip from '../LocationChip'
import PersonChip from '../PersonChip'
import SourceBadge from '../SourceBadge'
import { useI18n } from '../../i18n'
import { formatDateTime, formatRelative } from '../../lib/format'
import { podoActivity } from '../../lib/derive'
import type { InvestigationRecord } from '../../types/records'
import styles from './style.module.css'

interface Props {
  records: InvestigationRecord[]
  limit?: number
}

export default function PodoFeed({ records, limit = 5 }: Props) {
  const { locale, copy } = useI18n()
  const recent = podoActivity(records, limit)

  return (
    <section className={styles.panel} aria-label={copy.podoFeed.ariaLabel}>
      <div className={styles.head}>
        <span className={styles.title}>{copy.podoFeed.title}</span>
        <span className={styles.hint}>{copy.podoFeed.hint}</span>
      </div>
      {recent.length === 0 ? (
        <p className={styles.empty}>{copy.podoFeed.empty}</p>
      ) : (
        <ul className={styles.list}>
          {recent.map((r) => (
            <li key={`${r.source}-${r.id}`} className={styles.row}>
              <span className={styles.dot} aria-hidden="true" />
              <div className={styles.body}>
                <div className={styles.meta}>
                  <SourceBadge source={r.source} />
                  <span className={styles.time} title={formatDateTime(r.at, locale)}>
                    {formatRelative(r.at, locale)}
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
  const { copy } = useI18n()
  switch (record.source) {
    case 'checkin':
      return (
        <>
          <PersonChip name={record.person} />
          <span>{copy.record.checkedInAt}</span>
        </>
      )
    case 'message':
      return (
        <>
          <PersonChip name={record.sender} />
          <span>{copy.record.messaged}</span>
          <PersonChip name={record.recipient} />
          <span>{copy.record.from}</span>
        </>
      )
    case 'sighting':
      return (
        <>
          <PersonChip name={record.person} />
          <span>{copy.record.seenWith}</span>
          <PersonChip name={record.seenWith} />
          <span>{copy.record.at}</span>
        </>
      )
    case 'note':
      return (
        <>
          <PersonChip name={record.author} />
          <span>{copy.record.wroteAboutPodoAt}</span>
        </>
      )
    case 'tip':
      return (
        <>
          <span>{copy.record.tipOnLower}</span>
          <PersonChip name={record.suspect} />
          <span>{copy.record.near}</span>
        </>
      )
  }
}
