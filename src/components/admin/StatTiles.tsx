import { LucideIcon } from 'lucide-react'

interface StatTile {
  label: string
  value: string
  icon?: LucideIcon
  hint?: string
}

export function StatTiles({ items }: { items: StatTile[] }) {
  return (
    <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map(({ label, value, icon: Icon, hint }) => (
        <div key={label} className="rounded-2xl border border-border bg-white p-5">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
            {label}
          </dt>
          <dd className="mt-2 text-2xl font-semibold tracking-tight">{value}</dd>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
      ))}
    </dl>
  )
}
