import { useI18n } from '../../i18n'
import styles from './style.module.css'

interface EmptyProps {
  title?: string
  hint?: string
  children?: React.ReactNode
}

export function EmptyState({ title, hint, children }: EmptyProps) {
  const { copy } = useI18n()
  return (
    <div className={styles.empty}>
      <div className={styles.emptyTitle}>{title ?? copy.state.emptyTitle}</div>
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
  title,
  errors,
  onRetry,
}: ErrorProps) {
  const { copy } = useI18n()
  return (
    <div className={styles.error} role="alert">
      <div className={styles.errorTitle}>{title ?? copy.state.errorTitle}</div>
      {errors.length > 0 && (
        <ul className={styles.errorList}>
          {errors.map((e, i) => (
            <li key={i}>{e.message}</li>
          ))}
        </ul>
      )}
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          {copy.state.retry}
        </button>
      )}
    </div>
  )
}
