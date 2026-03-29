import { Toaster as SonnerToaster } from 'sonner'
import type { ComponentProps } from 'react'

type ToasterProps = ComponentProps<typeof SonnerToaster>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-[#383838] group-[.toaster]:border group-[.toaster]:border-[#383838] group-[.toaster]:shadow-none',
          description: 'group-[.toast]:text-[#757575]',
          actionButton: 'group-[.toast]:bg-[#383838] group-[.toast]:text-[#F4EFEA]',
          cancelButton: 'group-[.toast]:bg-[#F4EFEA] group-[.toast]:text-[#383838]',
        },
      }}
      {...props}
    />
  )
}
