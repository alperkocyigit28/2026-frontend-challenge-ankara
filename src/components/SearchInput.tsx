import { useEffect, useState } from 'react'
import { useDebounced } from '../hooks/useDebounced'
import styles from './SearchInput.module.css'

interface Props {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  delay?: number
  ariaLabel?: string
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  delay = 200,
  ariaLabel = 'Search',
}: Props) {
  const [local, setLocal] = useState(value)
  const debounced = useDebounced(local, delay)

  useEffect(() => {
    if (debounced !== value) onChange(debounced)
  }, [debounced, onChange, value])

  useEffect(() => {
    if (value !== local) setLocal(value)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.wrapper}>
      <svg
        className={styles.icon}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="7" cy="7" r="5" />
        <path d="m14 14-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        className={styles.input}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      {local && (
        <button
          type="button"
          className={styles.clear}
          onClick={() => setLocal('')}
          aria-label="Clear search"
          title="Clear"
        >
          ×
        </button>
      )}
    </div>
  )
}
