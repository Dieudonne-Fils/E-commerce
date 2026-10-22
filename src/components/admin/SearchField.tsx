import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
}

export function SearchField({ value, onChange, placeholder, label }: SearchFieldProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} aria-label={label} className="pl-9" />
    </div>
  )
}
