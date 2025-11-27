import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#01B395] text-white shadow hover:bg-[#00A085] hover:shadow-lg",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-[#01B395] bg-transparent text-[#01B395] shadow-sm hover:bg-[#01B395]/10",
        secondary:
          "bg-[#252628] text-white shadow-sm hover:bg-[#2A2B2D] border border-[#2A2B2D]",
        ghost: "hover:bg-[#252628] hover:text-[#01B395] text-gray-400",
        link: "text-[#01B395] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 md:h-9 px-4 py-2 text-base md:text-sm",
        sm: "h-10 md:h-8 rounded-md px-3 text-sm md:text-xs min-h-[44px] md:min-h-0",
        lg: "h-12 md:h-10 rounded-md px-8 text-base md:text-sm",
        icon: "h-11 w-11 md:h-9 md:w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
