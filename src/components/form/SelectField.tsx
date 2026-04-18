import type { ComponentPropsWithoutRef } from 'react'
import { FormField } from './FormField'

export type SelectOption = {
    readonly value: string
    readonly label: string
}

type SelectFieldProps = {
    label: string
    options: ReadonlyArray<SelectOption>
    error?: string
    fullWidth?: boolean
} & ComponentPropsWithoutRef<'select'>

export function SelectField({
    label,
    options,
    error,
    fullWidth = false,
    ...selectProps
}: Readonly<SelectFieldProps>) {
    return (
        <FormField label={label} error={error} fullWidth={fullWidth}>
            <select {...selectProps}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </FormField>
    )
}
