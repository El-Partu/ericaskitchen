import Link from "next/link";
import { ComponentProps } from "react";

type ButtonVariant = "primary" | "primary-light" | "outline" | "white";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

type ButtonAsButton = ButtonBaseProps &
  Omit<ComponentProps<"button">, keyof ButtonBaseProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps &
  Omit<ComponentProps<typeof Link>, keyof ButtonBaseProps> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  "primary-light": "bg-primary-light text-white hover:bg-primary-light/90",
  outline: "border border-foreground text-foreground hover:bg-foreground/5",
  white: "bg-white text-black hover:bg-white/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-5 py-2 text-base",
  md: "px-6 py-3 text-lg",
  lg: "px-8 py-4 text-2xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center rounded-[10px] font-body transition-colors cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonAsButton)}>
      {children}
    </button>
  );
}
