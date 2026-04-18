import { useAllRecords } from '../hooks/useAllRecords'
import { SOURCES } from '../api/forms'
import { SOURCE_LABEL } from '../types/records'

export default function HomePage() {
  const { bySource, isLoading, isError, errors, records } = useAllRecords()

  return (
    <main style={{ padding: '48px', maxWidth: '960px', margin: '0 auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1>Missing Podo — Investigation Dashboard</h1>
        <p style={{ marginTop: '8px', color: 'var(--text-soft)' }}>
          Data layer wired. {records.length} total records across{' '}
          {SOURCES.length} sources.
        </p>
      </header>

      {isLoading && <p>Loading records…</p>}
      {isError && (
        <div
          style={{
            padding: '16px',
            border: '1px solid #f0c4c4',
            background: '#fff5f5',
            borderRadius: 'var(--radius-md)',
            color: '#8a2c2c',
          }}
        >
          <strong>Failed to load some sources.</strong>
          <ul style={{ margin: '8px 0 0 18px' }}>
            {errors.map((e, i) => (
              <li key={i}>{e.message}</li>
            ))}
          </ul>
        </div>
      )}

      {!isLoading && !isError && (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
        >
          {SOURCES.map((s) => (
            <div
              key={s}
              style={{
                padding: '20px',
                background: 'var(--bg-elev)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ color: 'var(--text-soft)', fontSize: '13px' }}>
                {SOURCE_LABEL[s]}
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 600,
                  color: 'var(--text-h)',
                  marginTop: '4px',
                }}
              >
                {bySource[s]?.length ?? 0}
              </div>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}
