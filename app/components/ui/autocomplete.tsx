import * as React from 'react'
import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'

import { cn } from '~/lib/utils'
import { inputClassName } from '~/components/ui/input'

type AutocompleteProps = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: readonly string[]
  placeholder?: string
  className?: string
  name?: string
  id?: string
  'data-slot'?: string
}

export function Autocomplete({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  className,
  name,
  id,
  'data-slot': dataSlot,
}: AutocompleteProps) {
  return (
    <BaseAutocomplete.Root
      items={options as readonly string[]}
      value={value}
      onValueChange={(next) => onChange(next)}
      openOnInputClick
    >
      <BaseAutocomplete.Input
        name={name}
        id={id}
        placeholder={placeholder}
        onBlur={onBlur}
        data-slot={dataSlot ?? 'autocomplete-input'}
        className={cn(inputClassName, className)}
      />
      <BaseAutocomplete.Portal>
        <BaseAutocomplete.Positioner
          sideOffset={4}
          className="z-[60] w-[var(--anchor-width)]"
        >
          <BaseAutocomplete.Popup
            data-slot="autocomplete-popup"
            className={cn(
              'bg-white text-[#383838] border-[#383838] max-h-64 overflow-y-auto border p-1 origin-[var(--transform-origin)]',
              'data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95',
            )}
          >
            <BaseAutocomplete.Empty className="text-[#757575] px-2 py-1.5 text-sm">
              Sin coincidencias
            </BaseAutocomplete.Empty>
            <BaseAutocomplete.List>
              {(item: string) => (
                <BaseAutocomplete.Item
                  key={item}
                  value={item}
                  className="data-[highlighted]:bg-[#F4EFEA] data-[highlighted]:text-[#383838] text-[#383838] relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none"
                >
                  {item}
                </BaseAutocomplete.Item>
              )}
            </BaseAutocomplete.List>
          </BaseAutocomplete.Popup>
        </BaseAutocomplete.Positioner>
      </BaseAutocomplete.Portal>
    </BaseAutocomplete.Root>
  )
}
