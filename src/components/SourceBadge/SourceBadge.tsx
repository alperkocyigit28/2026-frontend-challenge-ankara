import { useI18n } from '../../i18n'
import { getSourceLabel } from '../../lib/copy'
import type { Source } from '../../types/records'
import styles from './style.module.css'

interface Props {
  source: Source
}

export default function SourceBadge({ source }: Props) {
  const { locale } = useI18n()
  return (
    <span className={`${styles.badge} ${styles[source]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {getSourceLabel(locale, source)}
    </span>
  )
}
