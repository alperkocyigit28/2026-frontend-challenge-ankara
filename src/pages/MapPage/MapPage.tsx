import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import SourceFilter from '../../components/SourceFilter'
import { SkeletonCard } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import { useAllRecords } from '../../hooks/useAllRecords'
import { useUrlList } from '../../hooks/useUrlQuery'
import { recordPeople, recordPreview, recordHeadline } from '../../lib/derive'
import { formatDateTime } from '../../lib/format'
import {
  SOURCE_LABEL,
  type InvestigationRecord,
  type Source,
} from '../../types/records'
import styles from './style.module.css'

const ANKARA: [number, number] = [39.9334, 32.8597]

const SOURCE_COLOR: Record<Source, string> = {
  checkin: '#0f9488',
  message: '#2a6df4',
  sighting: '#c6791b',
  note: '#5b6170',
  tip: '#c9393b',
}

function makeIcon(source: Source, isPodo: boolean) {
  const color = SOURCE_COLOR[source]
  const size = isPodo ? 22 : 16
  const ring = isPodo ? 'box-shadow:0 0 0 4px rgba(170,59,255,0.35);' : ''
  const html = `<span style="
    display:block;
    width:${size}px;height:${size}px;
    background:${color};
    border:2px solid #fff;
    border-radius:999px;
    ${ring}
  "></span>`
  return L.divIcon({
    html,
    className: styles.marker,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

function popupHtml(r: InvestigationRecord): string {
  const when = r.at ? formatDateTime(r.at) : 'unknown time'
  const preview = recordPreview(r).replace(/</g, '&lt;')
  const headline = recordHeadline(r).replace(/</g, '&lt;')
  const location = (r.location || 'unknown location').replace(/</g, '&lt;')
  return `
    <div class="${styles.popup}">
      <div class="${styles.popupHead}">
        <span class="${styles.popupBadge}" style="background:${SOURCE_COLOR[r.source]}">
          ${SOURCE_LABEL[r.source]}
        </span>
        <span class="${styles.popupTime}">${when}</span>
      </div>
      <div class="${styles.popupTitle}">${headline}</div>
      <p class="${styles.popupText}">${preview}</p>
      <div class="${styles.popupMeta}">at ${location}</div>
    </div>
  `
}

export default function MapPage() {
  const { records, isLoading, isError, errors, refetch } = useAllRecords()
  const [rawSources, setSources] = useUrlList('source')
  const sources = rawSources as Source[]
  const [selected, setSelected] = useState<InvestigationRecord | null>(null)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)

  const mapped = useMemo(
    () =>
      records.filter(
        (r) =>
          r.coords &&
          (sources.length === 0 || sources.includes(r.source)),
      ),
    [records, sources],
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: ANKARA,
      zoom: 12,
      scrollWheelZoom: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()
    const markers: L.Marker[] = []
    for (const r of mapped) {
      if (!r.coords) continue
      const isPodo = recordPeople(r).some((p) => p.trim().toLowerCase() === 'podo')
      const marker = L.marker(r.coords, { icon: makeIcon(r.source, isPodo) })
      marker.bindPopup(popupHtml(r), { maxWidth: 280 })
      marker.on('click', () => setSelected(r))
      marker.addTo(layer)
      markers.push(marker)
    }
    if (markers.length > 0) {
      const group = L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.15), { animate: false })
    }
  }, [mapped])

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Map</h1>
          <p className={styles.subtitle}>
            {mapped.length} event{mapped.length === 1 ? '' : 's'} plotted across Ankara.
            Podo's sightings are highlighted.
          </p>
        </div>
        <SourceFilter value={sources} onChange={(v) => setSources(v)} />
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : isError && records.length === 0 ? (
        <ErrorState errors={errors} onRetry={refetch} />
      ) : (
        <div className={styles.mapWrap}>
          <div ref={containerRef} className={styles.map} />
          {mapped.length === 0 && (
            <div className={styles.overlay}>
              <EmptyState
                title="No mappable events"
                hint="No records have coordinates for the current filter."
              />
            </div>
          )}
          {selected && (
            <aside className={styles.sidebar}>
              <button
                type="button"
                className={styles.close}
                onClick={() => setSelected(null)}
                aria-label="Close details"
              >
                ×
              </button>
              <div className={styles.sideHead}>
                <span
                  className={styles.popupBadge}
                  style={{ background: SOURCE_COLOR[selected.source] }}
                >
                  {SOURCE_LABEL[selected.source]}
                </span>
                <time className={styles.popupTime}>
                  {selected.at ? formatDateTime(selected.at) : ''}
                </time>
              </div>
              <h2 className={styles.sideTitle}>{recordHeadline(selected)}</h2>
              <p className={styles.sideText}>{recordPreview(selected)}</p>
              {selected.location && (
                <Link
                  to={`/locations/${encodeURIComponent(selected.location)}`}
                  className={styles.sideLink}
                >
                  View {selected.location} →
                </Link>
              )}
            </aside>
          )}
        </div>
      )}
    </>
  )
}
