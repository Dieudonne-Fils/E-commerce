import { ButtonHTMLAttributes, cloneElement, forwardRef, isValidElement } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  // Applies the button styles to the single child element (e.g. a Link) instead of rendering a <button>
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      {
        'bg-primary text-primary-foreground hover:bg-primary/85': variant === 'default',
        'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
        'border border-input bg-white text-foreground hover:bg-secondary': variant === 'outline',
        'bg-secondary text-secondary-foreground hover:bg-secondary/70': variant === 'secondary',
        'hover:bg-secondary hover:text-accent-foreground': variant === 'ghost',
        'text-primary underline-offset-4 hover:underline': variant === 'link',
      },
      {
        'h-10 px-5 py-2': size === 'default',
        'h-9 px-4': size === 'sm',
        'h-12 px-7 text-base': size === 'lg',
        'h-10 w-10': size === 'icon',
      },
      className
    )

    if (asChild && isValidElement<{ className?: string }>(children)) {
      return cloneElement(children, { className: cn(classes, children.props.className) })
    }

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }