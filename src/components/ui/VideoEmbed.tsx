import { Icon } from "@/components/ui/Icon";
import { colorMap } from "@/lib/colors";
import { cn } from "@/lib/cn";
import { toEmbedUrl } from "@/lib/video";
import type { BrandColor } from "@/lib/site";

/**
 * Área de video. Si `url` (YouTube/Vimeo) existe muestra el video embebido;
 * si no, un placeholder de marca con botón de play.
 */
export function VideoEmbed({
  url,
  provider = "youtube",
  color = "sky",
  label = "Espacio para video",
  className,
}: {
  url?: string;
  provider?: "youtube" | "vimeo";
  color?: BrandColor;
  label?: string;
  className?: string;
}) {
  const c = colorMap[color];
  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-[2rem] border border-line shadow-soft",
        className,
      )}
    >
      {url ? (
        <iframe
          src={toEmbedUrl(url, provider)}
          title={label}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className={cn("flex h-full w-full flex-col items-center justify-center gap-4", c.tint)}>
          <span className={cn("inline-flex h-20 w-20 items-center justify-center rounded-full shadow-soft", c.bg)}>
            <Icon name="play" className="ml-1 h-9 w-9 text-white" />
          </span>
          <span className={cn("text-sm font-bold", c.text)}>{label}</span>
        </div>
      )}
    </div>
  );
}
