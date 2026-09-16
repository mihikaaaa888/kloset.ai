import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** 'sheet' slides up from bottom on all screens; 'dialog' is centered */
  variant?: 'dialog' | 'sheet'
  maxWidth?: string
}

export function Modal({
  open,
  onClose,
  title,
  children,
  variant = 'dialog',
  maxWidth = 'max-w-lg',
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const content =
    variant === 'sheet' ? (
      // Bottom sheet — slides up from bottom
      <div className="fixed inset-0 z-50 flex flex-col justify-end">
        <div
          className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
        <div className="relative bg-cream-50 rounded-t-3xl shadow-lifted animate-slide-up max-h-[92vh] flex flex-col">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-cream-300" />
          </div>
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 flex-shrink-0">
              <h2 className="font-serif text-xl font-medium text-charcoal-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div className="overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    ) : (
      // Centered dialog
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-charcoal-900/50 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
        <div
          className={clsx(
            'relative bg-cream-50 rounded-3xl shadow-lifted animate-fade-up w-full flex flex-col',
            maxWidth,
            'max-h-[90vh]'
          )}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-5 border-b border-cream-200 flex-shrink-0">
              <h2 className="font-serif text-xl font-medium text-charcoal-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div className="overflow-y-auto flex-1">{children}</div>
        </div>
      </div>
    )

  return createPortal(content, document.body)
}
