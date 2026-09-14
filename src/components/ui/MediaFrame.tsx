import { Icon } from "@/components/ui/Icon";
import { colorMap } from "@/lib/colors";
import { cn } from "@/lib/cn";
import type { BrandColor } from "@/lib/site";

/**
 * Marco de imagen. Si `src` existe muestra la imagen; si no, un placeholder de
 * marca (para llenar cuando se tengan las fotos reales).
 */
export function MediaFrame({
  src,
  alt = "",
  color = "pink",
  ratio = "4 / 3",
  label = "Espacio para imagen",
  className,
}: {
  src?: string;
  alt?: string;
  color?: BrandColor;
  ratio?: string;
  label?: string;
  className?: string;
}) {
  const c = colorMap[color];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-line shadow-soft",
        className,
      )}
      style={{ aspectRatio: ratio }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className={cn("flex h-full w-full flex-col items-center justify-center gap-3 text-center", c.tint)}>
          <span className={cn("inline-flex h-16 w-16 items-center justify-center rounded-2xl", c.soft, c.text)}>
            <Icon name="image" className="h-8 w-8" />
          </span>
          <span className={cn("text-sm font-bold", c.text)}>{label}</span>
        </div>
      )}
    </div>
  );
}
