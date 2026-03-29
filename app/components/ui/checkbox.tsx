import * as React from 'react'

import { cn } from '~/lib/utils'

export type CheckboxProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'type'>

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'h-4 w-4 border border-[#383838] bg-white accent-[#383838] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
