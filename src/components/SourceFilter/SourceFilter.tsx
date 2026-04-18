import clsx from 'clsx'
import { SOURCES } from '../../api/forms'
import { useI18n } from '../../i18n'
import { getSourceLabel } from '../../lib/copy'
import type { Source } from '../../types/records'
import styles from './style.module.css'

interface Props {
  value: Source[]
  onChange: (next: Source[]) => void
}

export default function SourceFilter({ value, onChange }: Props) {
  const { locale, copy } = useI18n()
  const toggle = (s: Source) => {
    if (value.includes(s)) {
      onChange(value.filter((x) => x !== s))
    } else {
      onChange([...value, s])
    }
  }
  return (
    <div className={styles.row} role="group" aria-label={copy.sourceFilter.ariaLabel}>
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
            {getSourceLabel(locale, s)}
          </button>
        )
      })}
    </div>
  )
}
