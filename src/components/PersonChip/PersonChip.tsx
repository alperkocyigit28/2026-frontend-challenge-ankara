import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useI18n } from '../../i18n'
import { canonicalPersonName, personKey } from '../../lib/person'
import styles from './style.module.css'

interface Props {
  name: string
  className?: string
}

export default function PersonChip({ name, className }: Props) {
  const { copy } = useI18n()
  const trimmed = name.trim()
  if (!trimmed) return <span className={styles.plain}>{copy.common.unknown}</span>
  const canonical = canonicalPersonName(trimmed)
  const isPodo = personKey(trimmed) === 'podo'
  return (
    <Link
      to={`/people/${encodeURIComponent(canonical)}`}
      className={clsx(styles.chip, styles.person, isPodo && styles.podo, className)}
    >
      {canonical}
    </Link>
  )
}
