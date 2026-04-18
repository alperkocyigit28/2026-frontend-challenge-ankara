import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div
      style={{
        padding: '48px',
        textAlign: 'center',
        color: 'var(--text-soft)',
      }}
    >
      <h1 style={{ fontSize: '32px' }}>404</h1>
      <p style={{ marginTop: '8px' }}>
        This trail has gone cold.{' '}
        <Link to="/">Return to the overview</Link>.
      </p>
    </div>
  )
}
