"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { site } from "@/lib/site";
import { segments } from "@/lib/content";

const inputBase =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-muted focus:border-pink focus-visible:outline-none";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nombre = String(form.get("nombre") ?? "");
    const servicio = String(form.get("servicio") ?? "");
    const telefono = String(form.get("telefono") ?? "");
    const mensaje = String(form.get("mensaje") ?? "");

    const texto = [
      `¡Hola SANTI! Me gustaría contactarlos.`,
      ``,
      `Nombre: ${nombre}`,
      servicio && `Motivo de contacto: ${servicio}`,
      telefono && `Teléfono: ${telefono}`,
      mensaje && `Mensaje: ${mensaje}`,
    ]
      .filter(Boolean)
      .join("\n");

    const url = `${site.contact.whatsapp}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="mb-1.5 block text-sm font-bold text-ink">
          Nombre y apellido
        </label>
        <input id="nombre" name="nombre" required placeholder="Tu nombre" className={inputBase} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="telefono" className="mb-1.5 block text-sm font-bold text-ink">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            inputMode="tel"
            placeholder="+51 ..."
            className={inputBase}
          />
        </div>
        <div>
          <label htmlFor="servicio" className="mb-1.5 block text-sm font-bold text-ink">
            Motivo de contacto
          </label>
          <select id="servicio" name="servicio" className={inputBase} defaultValue="">
            <option value="" disabled>
              Selecciona…
            </option>
            {segments.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Consulta inicial">Consulta inicial</option>
            <option value="Evaluación">Evaluación</option>
            <option value="Prácticas pre profesionales">Prácticas pre profesionales</option>
            <option value="Quiero ser aliado / convenio">Quiero ser aliado / convenio</option>
            <option value="Aún no estoy seguro/a">Aún no estoy seguro/a</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="mensaje" className="mb-1.5 block text-sm font-bold text-ink">
          Cuéntanos brevemente tu caso
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={4}
          placeholder="¿En qué podemos ayudarte?"
          className={`${inputBase} resize-none`}
        />
      </div>

      <Button type="submit" variant="green" size="lg" className="w-full">
        <Icon name="phone" className="h-5 w-5" />
        Enviar por WhatsApp
      </Button>

      {sent && (
        <p className="rounded-2xl bg-sky-tint px-4 py-3 text-center text-sm font-semibold text-ink">
          Abrimos WhatsApp con tu mensaje listo. Si no se abrió, escríbenos al{" "}
          {site.contact.phone}.
        </p>
      )}

      <p className="text-center text-xs text-ink-muted">
        Al enviar, se abrirá WhatsApp con tu mensaje prellenado. También puedes
        escribirnos a{" "}
        <a href={`mailto:${site.contact.email}`} className="font-semibold text-pink">
          {site.contact.email}
        </a>
        .
      </p>
    </form>
  );
}
