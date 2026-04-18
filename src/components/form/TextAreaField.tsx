import type { ComponentPropsWithoutRef } from 'react'
import { FormField } from './FormField'

type TextAreaFieldProps = {
    label: string
    error?: string
    fullWidth?: boolean
} & ComponentPropsWithoutRef<'textarea'>

export function TextAreaField({
    label,
    error,
    fullWidth = false,
    ...textAreaProps
}: Readonly<TextAreaFieldProps>) {
    return (
        <FormField label={label} error={error} fullWidth={fullWidth}>
            <textarea {...textAreaProps} />
        </FormField>
    )
}
