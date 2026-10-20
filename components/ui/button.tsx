import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-[15px] font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-4 focus-visible:ring-brand-600/10 active:scale-[0.98] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-brand-600 text-white border border-brand-600 shadow-[0_1px_2px_rgba(16,24,40,.12)] hover:bg-brand-700',
        dark:
          'bg-ink text-white border border-ink hover:bg-black',
        outline:
          'bg-white text-ink border border-line hover:border-ink/40 hover:bg-canvas',
        secondary:
          'bg-brand-50 text-brand-700 border border-transparent hover:bg-brand-100',
        ghost:
          'text-ink/80 border border-transparent hover:text-ink hover:bg-canvas',
        safe:
          'bg-safe-500 text-white border border-safe-500 hover:bg-safe-700',
        destructive:
          'bg-red-600 text-white border border-red-600 hover:bg-red-700',
        'destructive-outline':
          'bg-white text-red-700 border border-red-200 hover:bg-red-50',
        link: 'text-brand-700 underline-offset-4 hover:underline active:scale-100 h-auto px-0',
      },
      size: {
        default: 'h-11 px-4 has-[>svg]:px-3.5',
        sm: 'h-9 rounded-lg gap-1.5 px-3 text-[14px] has-[>svg]:px-2.5',
        lg: 'h-12 px-6 text-[16px] has-[>svg]:px-5',
        icon: 'size-11',
        'icon-sm': 'size-9 rounded-lg',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
