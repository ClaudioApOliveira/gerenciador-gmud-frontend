import { getStatusClass } from '../../data/operationsData'

type StatusBadgeProps = {
    status: string
}

export function StatusBadge({ status }: Readonly<StatusBadgeProps>) {
    return <span className={`status-badge status-badge--${getStatusClass(status)}`}>{status}</span>
}
