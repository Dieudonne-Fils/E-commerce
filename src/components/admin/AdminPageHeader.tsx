import { ReactNode } from 'react'

interface AdminPageHeaderProps {
  title: string
  description: string
  action?: ReactNode
}

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600">{description}</p>
      </div>
      {action}
    </div>
  )
}
