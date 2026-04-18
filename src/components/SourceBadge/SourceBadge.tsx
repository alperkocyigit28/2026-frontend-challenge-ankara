import { SOURCE_LABEL, type Source } from '../../types/records'
import styles from './style.module.css'

interface Props {
  source: Source
}

export default function SourceBadge({ source }: Props) {
  return (
    <span className={`${styles.badge} ${styles[source]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {SOURCE_LABEL[source]}
    </span>
  )
}
