import { clsx } from 'clsx'
import { ArrowUpRight, Check, Plus } from 'lucide-react'
import { formatINR, type ShoppingLook } from '@/lib/shopping'

interface LookCardProps {
  look: ShoppingLook
  isInWardrobe: (catalogId: string) => boolean
  onAddLook: () => void
}

/** A complete, shoppable outfit — photo collage, piece list with prices, total. */
export function LookCard({ look, isInWardrobe, onAddLook }: LookCardProps) {
  const allAdded = look.pieces.every((p) => isInWardrobe(p.id))
  const [hero, ...rest] = look.pieces

  return (
    <article className="flex flex-col">
      {/* Collage — the base piece large on the left, the rest stacked on the right */}
      <div className="grid grid-cols-3 grid-rows-3 gap-1 aspect-[4/3] bg-warm-cream">
        <img src={hero.imageUrl} alt={hero.name} loading="lazy" className="col-span-2 row-span-3 w-full h-full object-cover bg-cream-200" />
        {rest.slice(0, 3).map((p, i) => (
          <img
            key={p.id}
            src={p.imageUrl}
            alt={p.name}
            loading="lazy"
            className={clsx('w-full h-full object-cover bg-cream-200', rest.length === 2 && i === 1 && 'row-span-2')}
          />
        ))}
      </div>

      <div className="pt-5">
        <p className="text-2xs uppercase tracking-widest text-text-muted">{look.pieces.length} pieces · {look.style}</p>
        <h3 className="font-display text-2xl font-medium text-text-primary mt-1">{look.title}</h3>

        <ul className="mt-4 divide-y divide-text-primary/10 border-y border-text-primary/10">
          {look.pieces.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 py-2.5">
              <span className="text-sm text-text-primary truncate">{p.name}</span>
              <span className="flex items-center gap-4 flex-shrink-0">
                <span className="text-sm text-text-primary tabular-nums">{formatINR(p.estimatedPrice)}</span>
                <a
                  href={p.shopUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => console.log('[shop] open look piece', { look: look.id, piece: p.id })}
                  className="flex items-center gap-0.5 -my-2 py-3 pl-2 text-2xs uppercase tracking-widest font-semibold text-butter-yellow hover:underline underline-offset-4"
                >
                  Buy <ArrowUpRight size={11} />
                </a>
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-4 pt-4">
          <p className="text-sm text-text-primary">
            <span className="text-text-muted uppercase tracking-widest text-2xs mr-2">Total</span>
            <span className="font-semibold tabular-nums">{formatINR(look.total)}</span>
          </p>
          <button
            type="button"
            onClick={onAddLook}
            disabled={allAdded}
            className="flex items-center gap-1.5 -my-3 py-3 text-2xs uppercase tracking-widest font-semibold text-text-primary hover:text-butter-yellow disabled:text-text-muted/60 disabled:cursor-default transition-colors"
          >
            {allAdded ? <Check size={12} /> : <Plus size={12} />}
            {allAdded ? 'Look in your Kloset' : 'Add look to Kloset'}
          </button>
        </div>
      </div>
    </article>
  )
}
