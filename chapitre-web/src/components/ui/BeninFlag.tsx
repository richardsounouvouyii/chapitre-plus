type BeninFlagProps = {
  className?: string
  title?: string
}

/** Drapeau du Bénin en SVG (vert / jaune / rouge) — toujours visible, sans emoji. */
export function BeninFlag({ className = 'h-4 w-6', title = 'Drapeau du Bénin' }: BeninFlagProps) {
  return (
    <svg
      viewBox="0 0 36 24"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <rect width="36" height="24" rx="2" fill="#FCD116" />
      <rect y="12" width="36" height="12" fill="#E8112D" />
      <rect width="12" height="24" fill="#008751" />
    </svg>
  )
}
