// Shared look for the admin data tables and filter controls
export const tableStyles = {
  // relative: absolutely positioned cells content (sr-only labels) must be clipped by the scroller, not widen the page
  scroll: 'relative overflow-x-auto',
  table: 'w-full text-sm',
  head: 'border-b border-border bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground',
  th: 'whitespace-nowrap px-4 py-3 font-medium',
  row: 'border-b border-border last:border-0 transition-colors hover:bg-secondary/40',
  td: 'px-4 py-3',
}

export const selectClass = 'h-11 rounded-lg border border-input bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20'

export const errorBoxClass = 'rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800'
