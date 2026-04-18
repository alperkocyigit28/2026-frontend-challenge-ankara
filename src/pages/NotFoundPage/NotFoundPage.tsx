import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'

export default function NotFoundPage() {
  const { copy } = useI18n()
  return (
    <div
      style={{
        padding: '64px 24px',
        textAlign: 'center',
        color: 'var(--text-soft)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          fontSize: '56px',
          fontWeight: 600,
          color: 'var(--text-h)',
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        404
      </div>
      <div style={{ color: 'var(--text-h)', fontSize: '18px', fontWeight: 500 }}>
        {copy.notFound.title}
      </div>
      <p style={{ maxWidth: 420, lineHeight: 1.5 }}>
        {copy.notFound.body}
      </p>
      <div style={{ marginTop: 8 }}>
        <Link to="/">{copy.notFound.back}</Link>
      </div>
    </div>
  )
}
