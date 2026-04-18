import type { ReactNode } from 'react'

type CardProps = {
    children: ReactNode
    title?: string
    action?: ReactNode
}

export function Card({ children, title, action }: Readonly<CardProps>) {
    return (
        <div className="card">
            {title || action ? (
                <div className="card-header">
                    {title ? <h3>{title}</h3> : <span />}
                    {action}
                </div>
            ) : null}
            {children}
        </div>
    )
}
