import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 md:h-9 w-full rounded-md border border-[#2A2B2D] bg-[#252628] px-3 py-2 md:py-1 text-base text-white shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#01B395] focus-visible:border-[#01B395] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-[44px] md:min-h-0",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
