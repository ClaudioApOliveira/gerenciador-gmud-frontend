import type { ReactNode } from 'react'

type SummaryItemProps = {
    label: string
    value: ReactNode
}

export function SummaryItem({ label, value }: Readonly<SummaryItemProps>) {
    return (
        <div className="summary-item">
            <span className="muted-text">{label}</span>
            <strong>{value}</strong>
        </div>
    )
}
