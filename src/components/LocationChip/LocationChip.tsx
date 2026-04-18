import { Link } from 'react-router-dom'
import clsx from 'clsx'
import styles from './style.module.css'

interface Props {
  name: string
  className?: string
}

export default function LocationChip({ name, className }: Props) {
  const trimmed = name.trim()
  if (!trimmed) return null
  return (
    <Link
      to={`/locations/${encodeURIComponent(trimmed)}`}
      className={clsx(styles.chip, styles.location, className)}
    >
      {trimmed}
    </Link>
  )
}
