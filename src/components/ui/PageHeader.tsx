import type { ReactNode } from 'react'

type PageHeaderProps = {
    eyebrow: string
    title: ReactNode
    description?: string
    compact?: boolean
}

export function PageHeader({
    eyebrow,
    title,
    description,
    compact = false,
}: Readonly<PageHeaderProps>) {
    return (
        <div className={`section-header${compact ? ' section-header--compact' : ''}`}>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
            {description ? <p className="muted-text">{description}</p> : null}
        </div>
    )
}
