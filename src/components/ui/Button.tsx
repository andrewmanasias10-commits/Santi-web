import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "pink" | "sky" | "orange" | "green" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-bold transition-all duration-200 active:scale-[0.97] focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  pink: "bg-pink text-white shadow-soft hover:brightness-105 hover:shadow-card",
  sky: "bg-sky text-white shadow-soft hover:brightness-105 hover:shadow-card",
  orange: "bg-orange text-white shadow-soft hover:brightness-105 hover:shadow-card",
  green: "bg-green text-white shadow-soft hover:brightness-105 hover:shadow-card",
  outline: "border-2 border-ink/15 bg-white text-ink hover:border-pink hover:text-pink",
  ghost: "text-ink hover:bg-ink/5",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-[0.95rem]",
  lg: "px-8 py-4 text-lg",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "pink",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "pink",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}
