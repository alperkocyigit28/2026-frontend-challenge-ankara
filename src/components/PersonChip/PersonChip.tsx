import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { canonicalPersonName, personKey } from '../../lib/person'
import styles from './style.module.css'

interface Props {
  name: string
  className?: string
}

export default function PersonChip({ name, className }: Props) {
  const trimmed = name.trim()
  if (!trimmed) return <span className={styles.plain}>unknown</span>
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
