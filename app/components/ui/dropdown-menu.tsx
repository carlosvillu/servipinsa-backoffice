import * as React from 'react'
import { Menu } from '@base-ui/react/menu'
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react'

import { cn } from '~/lib/utils'

function DropdownMenu({ children, ...props }: React.ComponentProps<typeof Menu.Root>) {
  return (
    <Menu.Root data-slot="dropdown-menu" {...props}>
      {children}
    </Menu.Root>
  )
}

function DropdownMenuTrigger({
  className,
  render,
  ...props
}: React.ComponentProps<typeof Menu.Trigger> & { render?: React.ReactElement }) {
  return <Menu.Trigger data-slot="dropdown-menu-trigger" className={className} render={render} {...props} />
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: {
  className?: string
  sideOffset?: number
  children?: React.ReactNode
  align?: 'start' | 'end' | 'center'
  side?: 'top' | 'bottom' | 'left' | 'right'
} & Omit<React.ComponentProps<typeof Menu.Popup>, 'className'>) {
  const align = props.align ?? 'start'
  const side = props.side ?? 'bottom'

  return (
    <Menu.Portal>
      <Menu.Positioner
        data-slot="dropdown-menu-positioner"
        sideOffset={sideOffset}
        side={side}
        align={align}
        className="z-[60]"
      >
        <Menu.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            'bg-white text-[#383838] border-[#383838] z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto border p-1 origin-[var(--transform-origin)]',
            'data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95',
            className
          )}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

function DropdownMenuGroup({
  children,
  ...props
}: React.ComponentProps<typeof Menu.Group>) {
  return (
    <Menu.Group data-slot="dropdown-menu-group" {...props}>
      {children}
    </Menu.Group>
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  onClick,
  render,
  children,
  ...props
}: {
  className?: string
  inset?: boolean
  variant?: 'default' | 'destructive'
  onClick?: () => void
  render?: React.ReactElement
  children?: React.ReactNode
} & Omit<React.ComponentProps<typeof Menu.Item>, 'className' | 'onClick'>) {
  return (
    <Menu.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "text-[#383838] data-[highlighted]:bg-[#F4EFEA] data-[highlighted]:text-[#383838] data-[variant=destructive]:text-destructive data-[variant=destructive]:data-[highlighted]:bg-destructive/10 data-[variant=destructive]:data-[highlighted]:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      onClick={onClick}
      render={render}
      {...props}
    >
      {children}
    </Menu.Item>
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  ...props
}: {
  className?: string
  children?: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
} & Omit<React.ComponentProps<typeof Menu.CheckboxItem>, 'className' | 'checked' | 'onCheckedChange'>) {
  return (
    <Menu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "data-[highlighted]:bg-[#F4EFEA] data-[highlighted]:text-[#383838] relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <Menu.CheckboxItemIndicator>
          <CheckIcon className="size-4" />
        </Menu.CheckboxItemIndicator>
      </span>
      {children}
    </Menu.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof Menu.RadioGroup>) {
  return <Menu.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Menu.RadioItem>) {
  return (
    <Menu.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "data-[highlighted]:bg-[#F4EFEA] data-[highlighted]:text-[#383838] relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <Menu.RadioItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </Menu.RadioItemIndicator>
      </span>
      {children}
    </Menu.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<'div'> & { inset?: boolean }) {
  return (
    <Menu.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn('px-2 py-1.5 text-sm font-medium data-[inset]:pl-8', className)}
      render={<div {...props} />}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Separator>) {
  return (
    <Menu.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn('text-muted-foreground ml-auto text-xs tracking-widest', className)}
      {...props}
    />
  )
}

function DropdownMenuSub({ children, ...props }: React.ComponentProps<typeof Menu.Root>) {
  return <Menu.Root data-slot="dropdown-menu-sub" {...props}>{children}</Menu.Root>
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof Menu.SubmenuTrigger> & { inset?: boolean }) {
  return (
    <Menu.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "data-[highlighted]:bg-[#F4EFEA] data-[highlighted]:text-[#383838] data-[open]:bg-[#F4EFEA] data-[open]:text-[#383838] [&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </Menu.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  className,
  children,
  ...props
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup
          data-slot="dropdown-menu-sub-content"
          className={cn(
            'bg-white text-[#383838] border-[#383838] z-50 min-w-[8rem] overflow-hidden border p-1 shadow-hard origin-[var(--transform-origin)]',
            'data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95',
            className
          )}
          {...props}
        >
          {children}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
