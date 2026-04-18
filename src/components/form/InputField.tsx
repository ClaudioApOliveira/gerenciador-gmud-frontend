import type { ComponentPropsWithoutRef } from 'react'
import { FormField } from './FormField'

type InputFieldProps = {
    label: string
    error?: string
    fullWidth?: boolean
} & ComponentPropsWithoutRef<'input'>

export function InputField({
    label,
    error,
    fullWidth = false,
    ...inputProps
}: Readonly<InputFieldProps>) {
    return (
        <FormField label={label} error={error} fullWidth={fullWidth}>
            <input {...inputProps} />
        </FormField>
    )
}
