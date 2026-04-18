import styles from './style.module.css'

interface EmptyProps {
  title?: string
  hint?: string
  children?: React.ReactNode
}

export function EmptyState({ title = 'Nothing here yet', hint, children }: EmptyProps) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyTitle}>{title}</div>
      {hint && <div className={styles.emptyHint}>{hint}</div>}
      {children}
    </div>
  )
}

interface ErrorProps {
  title?: string
  errors: Error[]
  onRetry?: () => void
}

export function ErrorState({
  title = 'Failed to load some sources.',
  errors,
  onRetry,
}: ErrorProps) {
  return (
    <div className={styles.error} role="alert">
      <div className={styles.errorTitle}>{title}</div>
      {errors.length > 0 && (
        <ul className={styles.errorList}>
          {errors.map((e, i) => (
            <li key={i}>{e.message}</li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}
