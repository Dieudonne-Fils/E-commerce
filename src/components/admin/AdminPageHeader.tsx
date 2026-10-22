import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface AdminPageHeaderProps {
  title: string
  description?: ReactNode
  action?: ReactNode
  back?: { href: string; label: string }
}

export function AdminPageHeader({ title, description, action, back }: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl">{title}</h1>
          {description && <div className="mt-1 text-muted-foreground">{description}</div>}
        </div>
        {action && <div className="flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  )
}
