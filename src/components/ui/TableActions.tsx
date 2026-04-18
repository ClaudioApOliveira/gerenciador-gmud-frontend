import type { ReactNode } from 'react'

type TableActionsProps = {
    children: ReactNode
}

export function TableActions({ children }: Readonly<TableActionsProps>) {
    return <div className="table-actions">{children}</div>
}
