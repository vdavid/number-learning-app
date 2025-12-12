import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    children: ReactNode
    className?: string
    onClick?: () => void
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
}

/**
 * Styled button component with variants.
 */
export function Button({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    onClick,
    disabled,
    type = 'button',
}: ButtonProps) {
    const baseStyles = `
        inline-flex items-center justify-center
        font-semibold rounded-xl
        transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed
    `

    const variants = {
        primary: `
            bg-[var(--accent-primary)] text-[var(--bg-deep)]
            hover:bg-[var(--accent-primary-dim)]
            shadow-lg shadow-[var(--accent-primary-glow)]
        `,
        secondary: `
            bg-[var(--bg-surface)] text-[var(--text-primary)]
            hover:bg-[var(--bg-elevated)]
            border border-[var(--bg-hover)]
        `,
        ghost: `
            text-[var(--text-secondary)]
            hover:text-[var(--text-primary)]
            hover:bg-[var(--bg-surface)]
        `,
    }

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    }

    return (
        <motion.button
            type={type}
            onClick={onClick}
            disabled={disabled}
            whileTap={{ scale: 0.98 }}
            whileHover={{ scale: 1.02 }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </motion.button>
    )
}
