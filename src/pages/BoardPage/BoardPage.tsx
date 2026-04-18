import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ForceGraph2D from 'react-force-graph-2d'
import { SkeletonCard } from '../../components/Skeleton'
import { EmptyState, ErrorState } from '../../components/StateView'
import RecordCard from '../../components/RecordCard'
import { useAllRecords } from '../../hooks/useAllRecords'
import { useUrlList, useUrlQuery } from '../../hooks/useUrlQuery'
import { useI18n } from '../../i18n'
import { getEdgeLabel } from '../../lib/copy'
import { buildGraph, type EdgeKind, type GraphLink, type GraphNode } from '../../lib/graph'
import { suspicionBreakdown } from '../../lib/derive'
import styles from './style.module.css'

const EDGE_KINDS: EdgeKind[] = ['sighting', 'message', 'mention']

const COLOR = {
  neutral: '#c8c5bd',
  podo: '#8b1f2a',
  suspectLow: '#e8b4a3',
  suspectMid: '#d87860',
  suspectHigh: '#b8322b',
  ink: '#2a2824',
  board: '#f4ede1',
  accent: '#8b1f2a',
}

function nodeColor(n: GraphNode) {
  if (n.isPodo) return COLOR.podo
  if (n.suspicion >= 4) return COLOR.suspectHigh
  if (n.suspicion >= 2) return COLOR.suspectMid
  if (n.suspicion >= 1) return COLOR.suspectLow
  return COLOR.neutral
}

function edgeStroke(l: GraphLink) {
  if (l.kind === 'sighting') return '#8a5a0a'
  if (l.kind === 'message') return l.urgent ? '#c9393b' : '#2a6df4'
  if (l.kind === 'mention') return '#9aa0ae'
  return '#000'
}

export default function BoardPage() {
  const { locale, copy } = useI18n()
  const { records, isLoading, isError, errors, refetch } = useAllRecords()
  const [rawKinds, setKinds] = useUrlList('edge')
  const activeKinds = (
    rawKinds.length ? rawKinds : EDGE_KINDS
  ) as EdgeKind[]
  const [selected, setSelected] = useUrlQuery('who')

  const graph = useMemo(() => buildGraph(records), [records])

  const filteredLinks = useMemo(
    () => graph.links.filter((l) => activeKinds.includes(l.kind)),
    [graph.links, activeKinds],
  )

  const graphData = useMemo(
    () => ({
      nodes: graph.nodes.map((n) => ({ ...n })),
      links: filteredLinks.map((l) => ({ ...l })),
    }),
    [graph.nodes, filteredLinks],
  )

  const selectedNode = useMemo(
    () => graph.nodes.find((n) => n.name === selected) ?? null,
    [graph.nodes, selected],
  )

  const breakdown = useMemo(
    () =>
      selectedNode
        ? suspicionBreakdown(selectedNode.name, records, locale)
        : null,
    [selectedNode, records, locale],
  )

  const neighbors = useMemo(() => {
    if (!selectedNode) return new Set<string>()
    const set = new Set<string>()
    for (const l of filteredLinks) {
      const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).name
      const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).name
      if (s === selectedNode.name) set.add(t)
      else if (t === selectedNode.name) set.add(s)
    }
    return set
  }, [selectedNode, filteredLinks])

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const fgRef = useRef<{
    d3Force: (name: string) => { strength?: (s: number) => unknown; distance?: (fn: (l: GraphLink) => number) => unknown } | undefined
  } | null>(null)
  const [size, setSize] = useState({ w: 800, h: 560 })

  useEffect(() => {
    if (!wrapRef.current) return
    const el = wrapRef.current
    const measure = () => {
      const r = el.getBoundingClientRect()
      setSize({ w: Math.max(320, r.width), h: Math.max(360, r.height) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    fg.d3Force('charge')?.strength?.(-180)
    fg.d3Force('link')?.distance?.((l: GraphLink) => 60 + 8 / Math.max(1, l.weight))
  }, [graphData])

  const toggleKind = (k: EdgeKind) => {
    if (activeKinds.includes(k)) {
      const next = activeKinds.filter((x) => x !== k)
      setKinds(next.length ? next : EDGE_KINDS)
    } else {
      setKinds([...activeKinds, k])
    }
  }

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{copy.board.title}</h1>
          <p className={styles.subtitle}>{copy.board.subtitle}</p>
        </div>
        <div className={styles.filters} role="group" aria-label={copy.board.filterAria}>
          {EDGE_KINDS.map((k) => {
            const active = activeKinds.includes(k)
            return (
              <button
                key={k}
                type="button"
                className={styles.chip}
                data-active={active}
                data-kind={k}
                onClick={() => toggleKind(k)}
                aria-pressed={active}
              >
                <span className={styles.chipDot} data-kind={k} />
                {getEdgeLabel(locale, k)}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : isError && records.length === 0 ? (
        <ErrorState errors={errors} onRetry={refetch} />
      ) : graph.nodes.length === 0 ? (
        <EmptyState
          title={copy.board.emptyTitle}
          hint={copy.board.emptyHint}
        />
      ) : (
        <div className={styles.split}>
          <div ref={wrapRef} className={styles.board}>
            <div className={styles.boardInner}>
              <ForceGraph2D
                ref={fgRef as never}
                graphData={graphData}
                width={size.w}
                height={size.h}
                backgroundColor={COLOR.board}
                cooldownTicks={120}
                nodeRelSize={5}
                nodeVal={(n: GraphNode) =>
                  Math.max(1, 1 + n.suspicion * 1.5 + n.recordCount * 0.25)
                }
                linkColor={(l) => {
                  const link = l as unknown as GraphLink
                  if (selectedNode) {
                    const s =
                      typeof link.source === 'string'
                        ? link.source
                        : (link.source as GraphNode).name
                    const t =
                      typeof link.target === 'string'
                        ? link.target
                        : (link.target as GraphNode).name
                    const touches =
                      s === selectedNode.name || t === selectedNode.name
                    if (!touches) return 'rgba(150,145,135,0.18)'
                  }
                  return edgeStroke(link)
                }}
                linkWidth={(l) => {
                  const link = l as unknown as GraphLink
                  const base = Math.min(4, 1 + (link.weight - 1) * 0.8)
                  return link.urgent || link.kind === 'sighting' ? base + 0.5 : base
                }}
                linkLineDash={(l) => {
                  const link = l as unknown as GraphLink
                  return link.kind === 'mention' ? [4, 4] : null
                }}
                linkDirectionalArrowLength={(l) => {
                  const link = l as unknown as GraphLink
                  return link.kind === 'message' ? 4 : 0
                }}
                linkDirectionalArrowRelPos={1}
                onNodeClick={(n) => {
                  const node = n as unknown as GraphNode
                  setSelected(node.name === selected ? '' : node.name)
                }}
                onBackgroundClick={() => setSelected('')}
                nodeCanvasObject={(n, ctx, globalScale) => {
                  const node = n as unknown as GraphNode & { x: number; y: number }
                  const focused =
                    !selectedNode ||
                    selectedNode.name === node.name ||
                    neighbors.has(node.name)
                  const r = Math.sqrt(
                    Math.max(1, 1 + node.suspicion * 1.5 + node.recordCount * 0.25),
                  ) * 5
                  const fill = nodeColor(node)
                  ctx.globalAlpha = focused ? 1 : 0.25

                  // pin shadow
                  ctx.beginPath()
                  ctx.arc(node.x + 0.8, node.y + 1.4, r, 0, Math.PI * 2)
                  ctx.fillStyle = 'rgba(0,0,0,0.18)'
                  ctx.fill()

                  // body
                  ctx.beginPath()
                  ctx.arc(node.x, node.y, r, 0, Math.PI * 2)
                  ctx.fillStyle = fill
                  ctx.fill()
                  ctx.lineWidth = 1.5 / globalScale
                  ctx.strokeStyle = '#ffffff'
                  ctx.stroke()

                  // selected ring
                  if (selectedNode?.name === node.name) {
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, r + 4 / globalScale, 0, Math.PI * 2)
                    ctx.strokeStyle = COLOR.accent
                    ctx.lineWidth = 2 / globalScale
                    ctx.stroke()
                  }

                  // podo halo
                  if (node.isPodo) {
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, r + 2.5 / globalScale, 0, Math.PI * 2)
                    ctx.strokeStyle = 'rgba(139,31,42,0.42)'
                    ctx.lineWidth = 1.5 / globalScale
                    ctx.stroke()
                  }

                  // tip dots (small red dots around node indicating tips)
                  if (node.tipCount > 0 && focused) {
                    const dots = Math.min(node.tipCount, 3)
                    for (let i = 0; i < dots; i++) {
                      const angle = -Math.PI / 2 + (i - (dots - 1) / 2) * 0.45
                      const dx = node.x + Math.cos(angle) * (r + 3.5)
                      const dy = node.y + Math.sin(angle) * (r + 3.5)
                      ctx.beginPath()
                      ctx.arc(dx, dy, 1.8 / globalScale + 1, 0, Math.PI * 2)
                      ctx.fillStyle = '#c9393b'
                      ctx.fill()
                    }
                  }

                  // label
                  const fontSize = Math.max(10, 12 / globalScale)
                  ctx.font = `${node.isPodo ? '600 ' : ''}${fontSize}px var(--sans, system-ui)`
                  ctx.textAlign = 'center'
                  ctx.textBaseline = 'top'
                  ctx.fillStyle = COLOR.ink
                  ctx.fillText(node.name, node.x, node.y + r + 3)
                  ctx.globalAlpha = 1
                }}
                nodePointerAreaPaint={(n, color, ctx) => {
                  const node = n as unknown as GraphNode & {
                    x: number
                    y: number
                  }
                  const r = Math.sqrt(
                    Math.max(1, 1 + node.suspicion * 1.5 + node.recordCount * 0.25),
                  ) * 5
                  ctx.fillStyle = color
                  ctx.beginPath()
                  ctx.arc(node.x, node.y, r + 2, 0, Math.PI * 2)
                  ctx.fill()
                }}
              />
            </div>
            <div className={styles.legend} aria-hidden>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: COLOR.podo }} />
                {copy.board.legendPodo}
              </span>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: COLOR.suspectHigh }} />
                {copy.board.legendHighSuspicion}
              </span>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: COLOR.neutral }} />
                {copy.board.legendClean}
              </span>
              <span className={styles.legendDivider} />
              <span className={styles.legendItem}>
                <span className={styles.tipDot} /> {copy.board.legendTips}
              </span>
            </div>
          </div>

          <aside className={styles.side}>
            {!selectedNode ? (
              <EmptyPanel total={graph.nodes.length} linkCount={graph.links.length} />
            ) : (
              <NodePanel
                node={selectedNode}
                breakdown={breakdown}
                neighbors={[...neighbors]}
                onClose={() => setSelected('')}
              />
            )}
          </aside>
        </div>
      )}
    </>
  )
}

function EmptyPanel({ total, linkCount }: { total: number; linkCount: number }) {
  const { copy } = useI18n()
  return (
    <div className={styles.empty}>
      <h2 className={styles.emptyTitle}>{copy.board.panelTitle}</h2>
      <p className={styles.emptyText}>{copy.board.panelText(total, linkCount)}</p>
      <ul className={styles.hints}>
        <li>{copy.board.hint1}</li>
        <li>{copy.board.hint2}</li>
        <li>{copy.board.hint3}</li>
        <li>{copy.board.hint4}</li>
      </ul>
    </div>
  )
}

function NodePanel({
  node,
  breakdown,
  neighbors,
  onClose,
}: {
  node: GraphNode
  breakdown: ReturnType<typeof suspicionBreakdown> | null
  neighbors: string[]
  onClose: () => void
}) {
  const { copy } = useI18n()
  return (
    <div className={styles.profile}>
      <header className={styles.profileHead}>
        <div>
          <div className={styles.profileName}>
            {node.name}
            {node.isPodo && <span className={styles.podoTag}>{copy.board.missingTag}</span>}
          </div>
          <div className={styles.profileMeta}>
            {copy.board.profileMeta(node.recordCount, node.suspicion, node.tipCount)}
          </div>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={copy.common.clearSelection}
        >
          ×
        </button>
      </header>

      {breakdown && breakdown.reasons.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{copy.board.whySuspicious}</h3>
          <ul className={styles.reasons}>
            {breakdown.reasons.map((r, i) => (
              <li key={i} className={styles.reason}>
                <span className={styles.reasonPoints}>+{r.points}</span>
                <span>{r.label}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {neighbors.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>{copy.common.connectedTo}</h3>
          <div className={styles.neighbors}>
            {neighbors.map((n) => (
              <Link
                key={n}
                to={`/people/${encodeURIComponent(n)}`}
                className={styles.neighbor}
              >
                {n}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{copy.common.evidence}</h3>
        <div className={styles.records}>
          {node.records.slice(0, 8).map((r) => (
            <RecordCard key={`${r.source}-${r.id}`} record={r} />
          ))}
        </div>
        {node.records.length > 8 && (
          <Link
            to={`/people/${encodeURIComponent(node.name)}`}
            className={styles.more}
          >
            {copy.board.fullProfile(node.records.length)}
          </Link>
        )}
      </section>
    </div>
  )
}
