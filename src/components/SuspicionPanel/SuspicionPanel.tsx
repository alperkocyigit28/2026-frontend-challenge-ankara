import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import type { Person } from '../../types/entities'
import type { InvestigationRecord } from '../../types/records'
import { suspicionBreakdown } from '../../lib/derive'
import { personKey } from '../../lib/person'
import styles from './style.module.css'

interface Props {
  people: Person[]
  records: InvestigationRecord[]
  limit?: number
}

export default function SuspicionPanel({ people, records, limit = 4 }: Props) {
  const { locale, copy } = useI18n()
  const ranked = [...people]
    .filter((p) => personKey(p.name) !== 'podo' && p.suspicionScore > 0)
    .sort((a, b) => b.suspicionScore - a.suspicionScore)
    .slice(0, limit)

  return (
    <section className={styles.panel} aria-label={copy.suspicionPanel.ariaLabel}>
      <div className={styles.head}>
        <span className={styles.title}>{copy.suspicionPanel.title}</span>
        <span className={styles.hint}>{copy.suspicionPanel.hint}</span>
      </div>
      {ranked.length === 0 ? (
        <p className={styles.empty}>{copy.suspicionPanel.empty}</p>
      ) : (
        <ul className={styles.list}>
          {ranked.map((p, i) => {
            const { reasons } = suspicionBreakdown(p.name, records, locale)
            const top = reasons.sort((a, b) => b.points - a.points)[0]
            return (
              <li key={p.name}>
                <Link
                  to={`/people/${encodeURIComponent(p.name)}`}
                  className={styles.row}
                >
                  <span className={styles.rank}>#{i + 1}</span>
                  <div className={styles.main}>
                    <div className={styles.name}>{p.name}</div>
                    {top && (
                      <div className={styles.reason}>{top.label}</div>
                    )}
                  </div>
                  <span className={styles.score}>{p.suspicionScore}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
