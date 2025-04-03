import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary:
          "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
        ghost:
          "bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500",
        plain:
          "bg-transparent text-gray-900 hover:text-blue-600 focus:ring-blue-500",
        link: "bg-transparent text-blue-600 hover:text-blue-700 underline focus:ring-blue-500",
        "primary-icon":
          "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 p-2",
        "secondary-icon":
          "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 p-2",
        "ghost-icon":
          "bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500 p-2",
        "plain-icon":
          "bg-transparent text-gray-900 hover:text-blue-600 focus:ring-blue-500 p-2",
      },
      size: {
        sm: "text-sm px-3 py-1.5",
        md: "text-base px-4 py-2",
        lg: "text-lg px-5 py-2.5",
        xl: "text-xl px-6 py-3",
      },
      state: {
        default: "",
        hover: "hover:bg-opacity-90",
        focused: "ring-2",
        push: "transform active:translate-y-0.5",
        disabled: "opacity-50 cursor-not-allowed",
        loading: "opacity-70 cursor-wait",
      },
      feedback: {
        default: "",
        error: "!bg-red-600 !text-white hover:!bg-red-700 focus:!ring-red-500",
        success:
          "!bg-green-600 !text-white hover:!bg-green-700 focus:!ring-green-500",
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
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style">,
    VariantProps<typeof buttonVariants> {
  style?: VariantProps<typeof buttonVariants>["variant"];
  left?: boolean;
  right?: boolean;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      style,
      size,
      state,
      feedback,
      left,
      right,
      leftContent,
      rightContent,
      isLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || state === "disabled"}
        className={cn(
          buttonVariants({
            variant: style,
            size,
            state: isLoading ? "loading" : state,
            feedback,
          }),
          className
        )}
        {...props}
      >
        {left && leftContent}
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          children
        )}
        {right && rightContent}
      </button>
    );
  }
);

Button.displayName = "Button";
