import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import clsx from 'clsx'
import SearchInput from '../../components/SearchInput'
import SourceFilter from '../../components/SourceFilter'
import { SkeletonCard } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import { useAllRecords } from '../../hooks/useAllRecords'
import { useUrlList, useUrlQuery } from '../../hooks/useUrlQuery'
import { useI18n } from '../../i18n'
import {
  getSourceLabel,
  recordHeadlineForLocale,
  type Locale,
} from '../../lib/copy'
import { recordPreview, recordHeadline } from '../../lib/derive'
import { filterRecords } from '../../lib/search'
import { formatRelative } from '../../lib/format'
import { type InvestigationRecord, type Source } from '../../types/records'
import styles from './style.module.css'

const ANKARA: [number, number] = [39.9334, 32.8597]

const SOURCE_COLOR: Record<Source, string> = {
  checkin: '#0f9488',
  message: '#2a6df4',
  sighting: '#c6791b',
  note: '#5b6170',
  tip: '#c9393b',
}

const recordKey = (r: InvestigationRecord) => `${r.source}-${r.id}`
const coordKey = (c: [number, number]) =>
  `${c[0].toFixed(5)},${c[1].toFixed(5)}`

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

function popupHtml(
  r: InvestigationRecord,
  others: InvestigationRecord[],
  locale: Locale,
) {
  const when = r.at ? formatRelative(r.at, locale) : ''
  const headline = escapeHtml(recordHeadline(r, locale))
  const preview = escapeHtml(recordPreview(r))
  const location = r.location ? escapeHtml(r.location) : ''
  const sourceLabel = getSourceLabel(locale, r.source)
  const othersBlock =
    others.length > 0
      ? `
    <div class="${styles.popupOthers}">
      <div class="${styles.popupOthersLabel}">
        ${locale === 'tr'
          ? `${others.length} başka olay bu noktada`
          : `${others.length} other event${others.length === 1 ? '' : 's'} at this spot`}
      </div>
      <ul class="${styles.popupOthersList}">
        ${others
          .map(
            (o) => `
          <li>
            <button type="button" class="${styles.popupOtherBtn}" data-rkey="${escapeHtml(
              recordKey(o),
            )}">
              <span class="${styles.popupOtherDot}" style="background:${SOURCE_COLOR[o.source]}"></span>
              <span class="${styles.popupOtherLabel}">${escapeHtml(getSourceLabel(locale, o.source))}</span>
              <span class="${styles.popupOtherText}">${escapeHtml(recordHeadline(o, locale))}</span>
            </button>
          </li>
        `,
          )
          .join('')}
      </ul>
    </div>
  `
      : ''
  const locationLink = r.location
    ? `<button type="button" class="${styles.popupLocLink}" data-location="${escapeHtml(
        r.location,
      )}">${locale === 'tr' ? `${location} konumunu aç →` : `View ${location} →`}</button>`
    : ''
  return `
    <div class="${styles.popup}">
      <div class="${styles.popupHead}">
        <span class="${styles.popupBadge}" style="background:${SOURCE_COLOR[r.source]}">
          ${escapeHtml(sourceLabel)}
        </span>
        <span class="${styles.popupTime}">${escapeHtml(when)}</span>
      </div>
      <div class="${styles.popupTitle}">${headline}</div>
      ${preview ? `<p class="${styles.popupText}">${preview}</p>` : ''}
      ${locationLink}
      ${othersBlock}
    </div>
  `
}

function makeIcon(source: Source, isSelected: boolean) {
  const color = SOURCE_COLOR[source]
  const size = isSelected ? 26 : 16
  const shadow = isSelected
    ? 'box-shadow: 0 0 0 3px #ffffff, 0 0 0 6px #aa3bff, 0 6px 16px rgba(170,59,255,0.45);'
    : ''
  const html = `<span style="
    display:block;
    width:${size}px;height:${size}px;
    background:${color};
    border:2px solid #fff;
    border-radius:999px;
    ${shadow}
  "></span>`
  return L.divIcon({
    html,
    className: styles.marker,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

export default function MapPage() {
  const { locale, copy } = useI18n()
  const navigate = useNavigate()
  const { records, isLoading, isError, errors, refetch } = useAllRecords()
  const [rawSources, setSources] = useUrlList('source')
  const sources = rawSources as Source[]
  const [query, setQuery] = useUrlQuery('q')
  const [selectedParam, setSelectedParam] = useUrlQuery('selected')
  const selectedKey = selectedParam || null
  const setSelectedKey = (next: string | null) => setSelectedParam(next ?? '')

  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const listRef = useRef<HTMLUListElement | null>(null)
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map())
  const userInteractedRef = useRef(false)

  const mapped = useMemo(
    () =>
      filterRecords(records, query, sources).filter((r) => r.coords),
    [records, query, sources],
  )

  const selected = useMemo(
    () => mapped.find((r) => recordKey(r) === selectedKey) ?? null,
    [mapped, selectedKey],
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
      markersRef.current.clear()
    }
  }, [])

  const coordGroups = useMemo(() => {
    const m = new Map<string, InvestigationRecord[]>()
    for (const r of mapped) {
      if (!r.coords) continue
      const k = coordKey(r.coords)
      const list = m.get(k)
      if (list) list.push(r)
      else m.set(k, [r])
    }
    return m
  }, [mapped])

  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()
    markersRef.current.clear()

    const markers: L.Marker[] = []
    for (const r of mapped) {
      if (!r.coords) continue
      const key = recordKey(r)
      const isSelected = key === selectedKey
      const siblings =
        coordGroups.get(coordKey(r.coords))?.filter(
          (o) => recordKey(o) !== key,
        ) ?? []
      const marker = L.marker(r.coords, {
        icon: makeIcon(r.source, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      })
      marker.bindPopup(() => popupHtml(r, siblings, locale), {
        maxWidth: 280,
        className: styles.leafletPopup,
      })
      marker.on('click', () => {
        userInteractedRef.current = true
        setSelectedKey(key)
      })
      marker.on('popupopen', (e) => {
        const el = e.popup.getElement()
        if (!el) return
        el.querySelectorAll<HTMLButtonElement>('[data-rkey]').forEach((btn) => {
          btn.addEventListener('click', (ev) => {
            ev.preventDefault()
            ev.stopPropagation()
            const next = btn.getAttribute('data-rkey')
            if (next) {
              userInteractedRef.current = true
              setSelectedKey(next)
            }
          })
        })
        el.querySelectorAll<HTMLButtonElement>('[data-location]').forEach(
          (btn) => {
            btn.addEventListener('click', (ev) => {
              ev.preventDefault()
              ev.stopPropagation()
              const loc = btn.getAttribute('data-location')
              if (loc) navigate(`/locations/${encodeURIComponent(loc)}`)
            })
          },
        )
      })
      marker.addTo(layer)
      markers.push(marker)
      markersRef.current.set(key, marker)
    }

    if (!userInteractedRef.current && markers.length > 0) {
      const group = L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.15), { animate: false })
    }
  }, [mapped, coordGroups, selectedKey, locale])

  useEffect(() => {
    if (!selectedKey) return
    if (!selected) {
      setSelectedKey(null)
      return
    }
    const map = mapRef.current
    const marker = markersRef.current.get(selectedKey)
    if (map && selected.coords) {
      map.flyTo(selected.coords, Math.max(map.getZoom(), 14), {
        duration: 0.45,
      })
    }
    if (marker) {
      setTimeout(() => marker.openPopup?.(), 300)
    }
    const row = rowRefs.current.get(selectedKey)
    if (row) row.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedKey, selected])

  const registerRow = (key: string) => (el: HTMLLIElement | null) => {
    if (el) rowRefs.current.set(key, el)
    else rowRefs.current.delete(key)
  }

  const handleListClick = (r: InvestigationRecord) => {
    userInteractedRef.current = true
    setSelectedKey(recordKey(r))
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{copy.map.title}</h1>
          <p className={styles.subtitle}>{copy.map.subtitle(mapped.length)}</p>
        </div>
        <SourceFilter value={sources} onChange={(v) => setSources(v)} />
      </div>

      <div className={styles.searchRow}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={copy.map.searchPlaceholder}
        />
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : isError && records.length === 0 ? (
        <ErrorState errors={errors} onRetry={refetch} />
      ) : (
        <div className={styles.split}>
          <div className={styles.mapWrap}>
            <div ref={containerRef} className={styles.map} />
            {mapped.length === 0 && (
              <div className={styles.overlay}>
                <EmptyState
                  title={copy.map.emptyTitle}
                  hint={copy.map.emptyHint}
                />
              </div>
            )}
          </div>

          <aside className={styles.listPane} aria-label={copy.map.listAria}>
            <header className={styles.listHead}>
              <span className={styles.listCount}>
                {copy.common.resultCount(mapped.length)}
              </span>
              {selected && (
                <button
                  type="button"
                  className={styles.clear}
                  onClick={() => setSelectedKey(null)}
                >
                  {copy.common.clearSelection}
                </button>
              )}
            </header>
            {mapped.length === 0 ? (
              <div className={styles.listEmpty}>{copy.map.noMatches}</div>
            ) : (
              <ul ref={listRef} className={styles.list}>
                {mapped.map((r) => {
                  const key = recordKey(r)
                  const active = key === selectedKey
                  return (
                    <li
                      key={key}
                      ref={registerRow(key)}
                      className={clsx(
                        styles.listItem,
                        active && styles.listItemActive,
                      )}
                    >
                      <button
                        type="button"
                        className={styles.listBtn}
                        onClick={() => handleListClick(r)}
                        aria-pressed={active}
                      >
                        <span
                          className={styles.listDot}
                          style={{ background: SOURCE_COLOR[r.source] }}
                          aria-hidden
                        />
                        <span className={styles.listBody}>
                          <span className={styles.listTop}>
                            <span className={styles.listSource}>
                              {getSourceLabel(locale, r.source)}
                            </span>
                            <span className={styles.listTime}>
                              {r.at ? formatRelative(r.at, locale) : ''}
                            </span>
                          </span>
                          <span className={styles.listTitle}>
                            {recordHeadlineForLocale(r, locale)}
                          </span>
                          <span className={styles.listPreview}>
                            {recordPreview(r)}
                          </span>
                          {r.location && (
                            <span className={styles.listLocation}>
                              {r.location}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </aside>
        </div>
      )}

    </>
  )
}
