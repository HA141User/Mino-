type EmptyStateProps = {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state__eyebrow">Tidak ada hasil</p>
      <h3>{title}</h3>
      {description ? (
        <p className="empty-state__description">{description}</p>
      ) : null}
      {onAction && actionLabel ? (
        <button type="button" className="button button--quiet" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
