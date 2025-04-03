import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { sizeSpacing } from "@/tokens/spacing";
import { sizeBorderRadius } from "@/tokens/border";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
        ghost:
          "hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500",
        plain:
          "text-gray-900 underline-offset-4 hover:underline focus-visible:ring-gray-500",
        link: "text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-600",
        "primary-icon":
          "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600 p-2",
        "secondary-icon":
          "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500 p-2",
        "ghost-icon":
          "hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500 p-2",
        "plain-icon":
          "text-gray-900 underline-offset-4 hover:underline focus-visible:ring-gray-500 p-2",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-[4px]", // Using sm rounded = space/1 (4px)
        md: "h-10 px-4 text-base rounded-[6px]", // Using md rounded = space/1.5 (6px)
        lg: "h-12 px-5 text-lg rounded-[8px]", // Using lg rounded = space/2 (8px)
        xl: "h-14 px-6 text-xl rounded-[10px]", // Using xl rounded = space/2.5 (10px)
      },
      state: {
        default: "",
        hover: "",
        focused: "ring-2",
        push: "active:translate-y-px",
        disabled: "opacity-50 cursor-not-allowed",
      },
      feedback: {
        default: "",
        error: "border-red-500 focus-visible:ring-red-500",
        success: "border-green-500 focus-visible:ring-green-500",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      state: "default",
      feedback: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      state,
      feedback,
      leftIcon,
      rightIcon,
      isLoading,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, state, feedback }),
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
