import { type ReactNode } from 'react'

interface PlaceholderPageProps {
  title: string
  description: string
  icon: ReactNode
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-3xl bg-cream-200 flex items-center justify-center mx-auto mb-6 text-charcoal-500">
          {icon}
        </div>
        <h1 className="font-display text-3xl font-medium text-charcoal-900 mb-3">{title}</h1>
        <p className="text-charcoal-500 text-base leading-relaxed">{description}</p>
        <p className="mt-6 text-2xs text-charcoal-400 uppercase tracking-widest">Coming in Phase 2+</p>
      </div>
    </div>
  )
}
