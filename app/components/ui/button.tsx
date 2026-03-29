import * as React from 'react'

import { cn } from '~/lib/utils'

const baseClasses =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-mono uppercase font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#2BA5FF] focus-visible:border-[#2BA5FF] aria-invalid:ring-destructive/20 aria-invalid:border-destructive"

const variantClasses = {
  default: 'bg-[#383838] text-[#F4EFEA] border border-[#383838] hover:bg-[#2BA5FF] hover:border-[#2BA5FF] shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px]',
  destructive:
    'bg-destructive text-white border border-destructive hover:bg-destructive/90 focus-visible:ring-destructive/20',
  outline:
    'border border-[#383838] bg-transparent text-[#383838] hover:bg-[#E0E0E0] transition-colors',
  secondary: 'border border-[#383838] text-[#383838] bg-transparent hover:bg-[#383838] hover:text-[#F4EFEA]',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-[#2BA5FF] underline-offset-4 hover:underline',
} as const

const sizeClasses = {
  default: 'h-9 px-4 py-2 has-[>svg]:px-3',
  sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
  lg: 'h-10 px-6 has-[>svg]:px-4',
  icon: 'size-9',
  'icon-sm': 'size-8',
  'icon-lg': 'size-10',
} as const

type ButtonVariant = keyof typeof variantClasses
type ButtonSize = keyof typeof sizeClasses

function buttonVariants(opts?: { variant?: ButtonVariant; size?: ButtonSize; className?: string }) {
  return cn(
    baseClasses,
    variantClasses[opts?.variant ?? 'default'],
    sizeClasses[opts?.size ?? 'default'],
    opts?.className
  )
}

type ButtonProps = React.ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  render?: React.ReactElement
}

function Button({ className, variant, size, render, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className)

  if (render) {
    return React.cloneElement(render, {
      ...props,
      className: cn(classes, (render.props as Record<string, unknown>).className as string),
      'data-slot': 'button',
    } as React.HTMLAttributes<HTMLElement>)
  }

  return <button data-slot="button" className={classes} {...props} />
}

export { Button, buttonVariants }
export type { ButtonVariant, ButtonSize }
