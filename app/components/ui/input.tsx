import * as React from "react"

import { cn } from "~/lib/utils"

export const inputClassName = cn(
  "font-mono placeholder:text-[#757575] selection:bg-[#2BA5FF] selection:text-white border-[#383838] h-9 w-full min-w-0 border bg-white px-4 py-3 text-base text-[#383838] transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  "focus-visible:border-[#2BA5FF] focus-visible:ring-[#2BA5FF]/50 focus-visible:ring-2",
  "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
)

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        inputClassName,
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  )
}

export { Input }
