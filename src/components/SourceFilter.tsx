import clsx from 'clsx'
import { SOURCES } from '../api/forms'
import { SOURCE_LABEL, type Source } from '../types/records'
import styles from './SourceFilter.module.css'

interface Props {
  value: Source[]
  onChange: (next: Source[]) => void
}

export default function SourceFilter({ value, onChange }: Props) {
  const toggle = (s: Source) => {
    if (value.includes(s)) {
      onChange(value.filter((x) => x !== s))
    } else {
      onChange([...value, s])
    }
  }
  return (
    <div className={styles.row} role="group" aria-label="Filter by source">
      {SOURCES.map((s) => {
        const active = value.includes(s)
        return (
          <button
            key={s}
            type="button"
            className={clsx(styles.chip, active && styles.active)}
            aria-pressed={active}
            onClick={() => toggle(s)}
          >
            {SOURCE_LABEL[s]}
          </button>
        )
      })}
    </div>
  )
}
