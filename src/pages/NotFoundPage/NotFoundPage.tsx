import { Link } from 'react-router-dom'

export default function NotFoundPage() {
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
        This trail has gone cold.
      </div>
      <p style={{ maxWidth: 420, lineHeight: 1.5 }}>
        The page you're looking for doesn't exist in the investigation.
      </p>
      <div style={{ marginTop: 8 }}>
        <Link to="/">← Return to the overview</Link>
      </div>
    </div>
  )
}
