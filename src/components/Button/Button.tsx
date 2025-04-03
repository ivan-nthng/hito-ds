import React from "react";
import clsx from "clsx";

export type ButtonStyle = "primary" | "secondary" | "ghost" | "plain" | "link";
export type ButtonState = "default" | "hover" | "focused" | "push" | "disabled";
export type ButtonSize = "sm" | "md" | "lg" | "xl";
export type ButtonFeedback = "default" | "error" | "success";

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style"> {
	/**
	 * The visual style of the button
	 * @default 'primary'
	 */
	style?: ButtonStyle;

	/**
	 * The state of the button
	 * @default 'default'
	 */
	state?: ButtonState;

	/**
	 * The size of the button
	 * @default 'md'
	 */
	size?: ButtonSize;

	/**
	 * The feedback state of the button
	 * @default 'default'
	 */
	feedback?: ButtonFeedback;

	/**
	 * Whether to show content on the left side
	 * @default false
	 */
	left?: boolean;

	/**
	 * Whether to show content on the right side
	 * @default false
	 */
	right?: boolean;

	/**
	 * Content to render on the left side
	 */
	leftContent?: React.ReactNode;

	/**
	 * Content to render on the right side
	 */
	rightContent?: React.ReactNode;

	/**
	 * Whether the button is in a loading state
	 * @default false
	 */
	isLoading?: boolean;

	/**
	 * The content of the button
	 */
	children: React.ReactNode;
}

const styleClasses: Record<ButtonStyle, string> = {
	primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
	secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
	ghost: "bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500",
	plain: "bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-500",
	link: "bg-transparent text-primary-600 hover:text-primary-700 focus:ring-primary-500",
};

const stateClasses: Record<ButtonState, string> = {
	default: "",
	hover: "hover:scale-105",
	focused: "focus:ring-2 focus:ring-offset-2",
	push: "active:scale-95",
	disabled: "opacity-50 cursor-not-allowed pointer-events-none",
};

const feedbackClasses: Record<ButtonFeedback, string> = {
	default: "",
	error: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
	success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "px-3 py-1.5 text-sm",
	md: "px-4 py-2 text-base",
	lg: "px-6 py-3 text-lg",
	xl: "px-8 py-4 text-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			style = "primary",
			state = "default",
			size = "md",
			feedback = "default",
			left = false,
			right = false,
			leftContent,
			rightContent,
			isLoading = false,
			className,
			children,
			disabled,
			...props
		},
		ref
	) => {
		const isDisabled = disabled || state === "disabled" || isLoading;

		return (
			<button
				ref={ref}
				className={clsx(
					"inline-flex items-center justify-center rounded-md font-medium transition-all",
					"focus:outline-none",
					styleClasses[style],
					stateClasses[state],
					feedbackClasses[feedback],
					sizeClasses[size],
					className
				)}
				disabled={isDisabled}
				{...props}
			>
				{isLoading && (
					<svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
				)}
				{left && leftContent && <span className="mr-2">{leftContent}</span>}
				{children}
				{right && rightContent && <span className="ml-2">{rightContent}</span>}
			</button>
		);
	}
);

Button.displayName = "Button";
