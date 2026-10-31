import type { ReactNode } from 'react'

type SectionHeadingProps = {
  title: string
  description?: string
  action?: ReactNode
  id?: string
}

export function SectionHeading({
  title,
  description,
  action,
  id,
}: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <h2 id={id} className="section-heading__title">
          {title}
        </h2>
        {description ? (
          <p className="section-heading__description">{description}</p>
        ) : null}
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  )
}
