import type { ReactNode } from 'react'

type FormFieldProps = {
    label: string
    error?: string
    fullWidth?: boolean
    children: ReactNode
}

export function FormField({
    label,
    error,
    fullWidth = false,
    children,
}: Readonly<FormFieldProps>) {
    return (
        <label className={`field${fullWidth ? ' field--full' : ''}`}>
            <span>{label}</span>
            {children}
            {error ? <small className="field-error">{error}</small> : null}
        </label>
    )
}
