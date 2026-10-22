import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AdminCardProps {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function AdminCard({ title, action, children, className, bodyClassName = 'p-6' }: AdminCardProps) {
  return (
    <section className={cn('overflow-hidden rounded-2xl border border-border bg-white', className)}>
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
          {title && <h2 className="font-sans text-base font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
