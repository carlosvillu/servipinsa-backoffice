import * as React from 'react'

import { cn } from '~/lib/utils'

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full font-mono bg-white border border-[#383838] px-4 py-3 text-[#383838] placeholder:text-[#757575] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2BA5FF] focus-visible:border-[#2BA5FF] disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
