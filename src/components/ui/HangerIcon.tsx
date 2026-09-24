interface HangerIconProps {
  size?: number
  strokeWidth?: number
  className?: string
}

/** Clothes-hanger icon drawn to match lucide-react's style (24×24 grid, round strokes) — lucide has no hanger. */
export function HangerIcon({ size = 24, strokeWidth = 2, className }: HangerIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Hook */}
      <path d="M10 7a2 2 0 1 1 3 1.73c-.6.35-1 .98-1 1.67v1.1" />
      {/* Body — triangle with rounded bottom corners */}
      <path d="M12 11.5 3.2 16.1A1.5 1.5 0 0 0 4 18.9h16a1.5 1.5 0 0 0 .8-2.8Z" />
    </svg>
  )
}
