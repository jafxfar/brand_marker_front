import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      maxLength={255}
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-[#9AA1AD] selection:bg-brand-50 selection:text-ink h-11 w-full min-w-0 rounded-[10px] border border-line bg-white px-3.5 text-[15px] shadow-none outline-none transition-[color,border-color,box-shadow] duration-150 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium hover:border-[#C9CED6] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-brand-600 focus-visible:ring-4 focus-visible:ring-brand-600/10',
        'aria-invalid:border-red-500 aria-invalid:bg-red-50/40 aria-invalid:ring-4 aria-invalid:ring-red-500/10',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
