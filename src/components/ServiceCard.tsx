import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { colorMap } from "@/lib/colors";
import type { BrandColor } from "@/lib/site";

type ServiceCardData = {
  slug: string;
  age: string;
  title: string;
  summary: string;
  image: string;
  color: BrandColor;
};

export function ServiceCard({ service }: { service: ServiceCardData }) {
  const c = colorMap[service.color];
  return (
    <Link
      href={`/servicios/${service.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-none border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
    >
      {/* Barra de color superior */}
      <span className={`block h-1.5 ${c.bg}`} />

      {/* Portada ilustrada */}
      <div className={`relative aspect-[16/5] overflow-hidden ${c.tint}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className={`font-alt text-[0.7rem] font-bold uppercase tracking-[0.12em] ${c.text}`}>
          {service.age}
        </span>
        <h3 className="mt-1 text-base text-ink sm:text-lg">{service.title}</h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">
          {service.summary}
        </p>
        <span className={`mt-3 inline-flex items-center gap-2 font-display text-sm font-bold ${c.text}`}>
          Conocer más
          <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
