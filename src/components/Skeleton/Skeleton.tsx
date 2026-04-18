import styles from './style.module.css'

interface BlockProps {
  width?: string | number
  height?: string | number
  radius?: number
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 12, radius, style }: BlockProps) {
  return (
    <span
      className={styles.skeleton}
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.cardHead}>
        <Skeleton width={70} height={18} radius={999} />
        <Skeleton width={50} height={12} />
      </div>
      <Skeleton width="70%" height={16} />
      <Skeleton width="100%" height={12} />
      <Skeleton width="85%" height={12} />
      <Skeleton width={110} height={20} radius={999} />
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className={styles.grid} role="status" aria-label="Loading records">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
