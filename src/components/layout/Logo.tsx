import { siteConfig } from '@/lib/site'
import { cn } from '@/lib/utils'

// The mark is the app icon itself (src/app/icon.svg), so the logo and the favicon can never drift apart.
// Its size follows the text size set by the caller.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-serif font-semibold tracking-tight', className)}>
      <img src="/icon.svg" alt="" className="h-[1.1em] w-[1.1em] shrink-0" />
      {siteConfig.name}
    </span>
  )
}
