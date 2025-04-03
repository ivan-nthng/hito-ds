import React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
	size?: number;
}

const defaultProps = {
	size: 24,
};

export const Icons = {
	Plus: React.forwardRef<SVGSVGElement, IconProps>(({ size = 24, ...props }, ref) => (
		<svg
			ref={ref}
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M12 5v14M5 12h14" />
		</svg>
	)),
	Check: React.forwardRef<SVGSVGElement, IconProps>(({ size = 24, ...props }, ref) => (
		<svg
			ref={ref}
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<polyline points="20 6 9 17 4 12" />
		</svg>
	)),
	X: React.forwardRef<SVGSVGElement, IconProps>(({ size = 24, ...props }, ref) => (
		<svg
			ref={ref}
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M18 6L6 18M6 6l12 12" />
		</svg>
	)),
	ArrowRight: React.forwardRef<SVGSVGElement, IconProps>(({ size = 24, ...props }, ref) => (
		<svg
			ref={ref}
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M5 12h14M12 5l7 7-7 7" />
		</svg>
	)),
	ArrowLeft: React.forwardRef<SVGSVGElement, IconProps>(({ size = 24, ...props }, ref) => (
		<svg
			ref={ref}
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M19 12H5M12 19l-7-7 7-7" />
		</svg>
	)),
};

// Add display names for all icons
Object.keys(Icons).forEach((key) => {
	const Icon = Icons[key as keyof typeof Icons];
	Icon.displayName = `Icon.${key}`;
	Icon.defaultProps = defaultProps;
});
