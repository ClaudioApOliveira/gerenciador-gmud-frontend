import { Link, type LinkProps } from 'react-router-dom'
import type { ReactNode } from 'react'

type ButtonLinkProps = {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'ghost'
} & LinkProps

export function ButtonLink({
    children,
    variant = 'primary',
    className = '',
    ...props
}: Readonly<ButtonLinkProps>) {
    let variantClass = ''

    if (variant === 'secondary') {
        variantClass = ' button--secondary'
    }

    if (variant === 'ghost') {
        variantClass = ' button--ghost'
    }

    return (
        <Link className={`button${variantClass} ${className}`.trim()} {...props}>
            {children}
        </Link>
    )
}
