import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { colorMap } from "@/lib/colors";
import { formatDate } from "@/lib/posts";
import type { BrandColor } from "@/lib/site";

type CardPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  color: BrandColor;
  date: string;
  readingMinutes: number;
  cover?: string;
};

export function PostCard({ post }: { post: CardPost }) {
  const c = colorMap[post.color];
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-none border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
    >
      {/* Portada: imagen si existe, si no un degradado de marca */}
      <div className={`relative aspect-[16/9] overflow-hidden bg-gradient-to-br ${c.gradient}`}>
        {post.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover} alt={post.title} className="h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-2xl font-extrabold text-white/85">SANTI</span>
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-alt text-xs font-bold text-ink backdrop-blur">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>{formatDate(post.date)}</span>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min de lectura</span>
        </div>
        <h3 className="mt-2 text-lg leading-snug text-ink">{post.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
        <span className={`mt-4 inline-flex items-center gap-2 font-display text-sm font-bold ${c.text}`}>
          Leer más
          <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
