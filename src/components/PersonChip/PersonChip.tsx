import { Link } from 'react-router-dom'
import clsx from 'clsx'
import styles from './style.module.css'

interface Props {
  name: string
  className?: string
}

export default function PersonChip({ name, className }: Props) {
  const trimmed = name.trim()
  if (!trimmed) return <span className={styles.plain}>unknown</span>
  const isPodo = trimmed.toLowerCase() === 'podo'
  return (
    <Link
      to={`/people/${encodeURIComponent(trimmed)}`}
      className={clsx(styles.chip, styles.person, isPodo && styles.podo, className)}
    >
      {trimmed}
    </Link>
  )
}
