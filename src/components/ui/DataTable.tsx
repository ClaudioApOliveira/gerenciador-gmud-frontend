import type { ReactNode } from 'react'

type DataTableProps = {
    headers: string[]
    children: ReactNode
}

export function DataTable({ headers, children }: Readonly<DataTableProps>) {
    return (
        <div className="table-wrap">
            <table className="table">
                <thead>
                    <tr>
                        {headers.map((header) => (
                            <th key={header}>{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    )
}
