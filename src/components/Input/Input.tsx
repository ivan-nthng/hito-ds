import React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { sizeSpacing } from "@/tokens/spacing";
import { sizeBorderRadius } from "@/tokens/border";

const inputVariants = cva(
  "w-full border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-sm rounded-[4px]", // Using sm rounded = space/1 (4px)
        md: "h-10 px-4 text-base rounded-[6px]", // Using md rounded = space/1.5 (6px)
        lg: "h-12 px-5 text-lg rounded-[8px]", // Using lg rounded = space/2 (8px)
        xl: "h-14 px-6 text-xl rounded-[10px]", // Using xl rounded = space/2.5 (10px)
      },
      state: {
        default: "",
        hover: "hover:border-gray-400",
        focused: "border-blue-500 ring-blue-500",
        push: "border-gray-400 bg-gray-50",
        disabled: "cursor-not-allowed opacity-50",
      },
      variant: {
        primary: "border-gray-300 bg-white",
        secondary: "border-gray-200 bg-gray-50",
        inline: "border-transparent bg-transparent",
        header: "border-gray-200 bg-gray-100",
      },
      feedback: {
        default: "",
        error: "border-red-500 focus:ring-red-500",
        success: "border-green-500 focus:ring-green-500",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
      variant: "primary",
      feedback: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      size,
      state,
      variant,
      feedback,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          className={cn(
            inputVariants({ size, state, variant, feedback }),
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
