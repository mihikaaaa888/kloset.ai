import { type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

type BadgeVariant = 'neutral' | 'gold' | 'dark' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'bg-cream-200 text-charcoal-600',
  gold: 'bg-gold-muted text-stone-warm',
  dark: 'bg-charcoal-800 text-cream-50',
  outline: 'border border-charcoal-400 text-charcoal-600',
}

export function Badge({ variant = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1',
        'text-2xs font-medium uppercase tracking-widest',
        'rounded-full',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
