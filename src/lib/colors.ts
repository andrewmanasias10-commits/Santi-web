import type { BrandColor } from "./site";

/**
 * Clases literales por color de marca.
 * Deben escribirse completas para que Tailwind v4 las incluya en el build
 * (las clases construidas dinámicamente como `bg-${color}` NO se detectan).
 */
export const colorMap: Record<
  BrandColor,
  {
    text: string;
    bg: string;
    tint: string;
    soft: string;
    border: string;
    gradient: string;
  }
> = {
  pink: {
    text: "text-pink",
    bg: "bg-pink",
    tint: "bg-pink-tint",
    soft: "bg-pink-soft",
    border: "border-pink",
    gradient: "from-pink to-orange",
  },
  sky: {
    text: "text-sky",
    bg: "bg-sky",
    tint: "bg-sky-tint",
    soft: "bg-sky-soft",
    border: "border-sky",
    gradient: "from-sky to-green",
  },
  green: {
    text: "text-green",
    bg: "bg-green",
    tint: "bg-green-tint",
    soft: "bg-green-soft",
    border: "border-green",
    gradient: "from-green to-sky",
  },
  orange: {
    text: "text-orange",
    bg: "bg-orange",
    tint: "bg-orange-tint",
    soft: "bg-orange-soft",
    border: "border-orange",
    gradient: "from-orange to-pink",
  },
};
