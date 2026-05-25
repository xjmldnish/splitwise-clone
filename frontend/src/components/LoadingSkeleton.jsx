export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div className="skeleton-container" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-item">
          <div className="skeleton skeleton-avatar" aria-hidden="true" />
          <div className="skeleton-lines">
            <div className="skeleton skeleton-line" aria-hidden="true" />
            <div className="skeleton skeleton-line skeleton-line-short" aria-hidden="true" />
          </div>
        </div>
      ))}
    </div>
  )
}
