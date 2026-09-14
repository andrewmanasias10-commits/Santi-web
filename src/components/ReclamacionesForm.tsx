"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { site } from "@/lib/site";
import { CheckCircle2, Loader2 } from "lucide-react";

const label = "mb-1.5 block text-sm font-bold text-ink";
const input =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-pink";
const sectionTitle = "flex items-center gap-3 text-lg font-bold text-ink";
const numberBadge =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink font-display text-sm font-bold text-white";

export function ReclamacionesForm() {
  const sb = useMemo(() => (isSupabaseConfigured ? createClient() : null), []);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ codigo: string; fecha: string } | null>(null);
  const [esMenor, setEsMenor] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const f = new FormData(e.currentTarget);
    const data = {
      nombre: String(f.get("nombre") || "").trim(),
      documento_tipo: String(f.get("documento_tipo") || "DNI"),
      documento_numero: String(f.get("documento_numero") || "").trim(),
      domicilio: String(f.get("domicilio") || "").trim() || null,
      telefono: String(f.get("telefono") || "").trim() || null,
      email: String(f.get("email") || "").trim(),
      es_menor: esMenor,
      apoderado: esMenor ? String(f.get("apoderado") || "").trim() || null : null,
      bien_tipo: String(f.get("bien_tipo") || "servicio"),
      bien_monto: f.get("bien_monto") ? Number(f.get("bien_monto")) : null,
      bien_descripcion: String(f.get("bien_descripcion") || "").trim(),
      tipo: String(f.get("tipo") || "reclamo"),
      detalle: String(f.get("detalle") || "").trim(),
      pedido: String(f.get("pedido") || "").trim(),
    };

    if (!data.nombre || !data.documento_numero || !data.email || !data.bien_descripcion || !data.detalle || !data.pedido) {
      setErr("Por favor completa todos los campos obligatorios (*).");
      return;
    }
    if (!sb) {
      setErr("El libro de reclamaciones aún no está conectado. Escríbenos a " + site.contact.email + ".");
      return;
    }

    setSending(true);
    const { data: row, error } = await sb
      .from("reclamaciones")
      .insert(data)
      .select("numero, created_at")
      .single();
    setSending(false);

    if (error) {
      setErr(error.message || "No se pudo registrar la reclamación. Inténtalo nuevamente.");
      return;
    }
    const numero = (row?.numero as number) ?? 0;
    const codigo = `SANTI-${String(numero).padStart(6, "0")}`;
    const fecha = new Date(row?.created_at ?? Date.now()).toLocaleString("es-PE", {
      dateStyle: "long",
      timeStyle: "short",
    });
    setDone({ codigo, fecha });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-line bg-white p-8 text-center shadow-soft sm:p-12">
        <CheckCircle2 className="mx-auto h-14 w-14 text-green" />
        <h2 className="mt-4 text-2xl text-ink">Reclamación registrada</h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Tu hoja de reclamación fue registrada con el código:
        </p>
        <p className="mt-3 inline-block rounded-full bg-pink-tint px-5 py-2 font-display text-lg font-bold text-pink">
          {done.codigo}
        </p>
        <p className="mt-4 text-sm text-ink-muted">Registrada el {done.fecha}.</p>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Guarda este código. Daremos respuesta a tu reclamo en un plazo no mayor a{" "}
          <strong className="text-ink">quince (15) días hábiles</strong>, comunicándonos al correo
          que registraste. Ante cualquier consulta escríbenos a{" "}
          <a href={`mailto:${site.contact.email}`} className="font-semibold text-pink">
            {site.contact.email}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-8">
      {/* Datos del proveedor (informativo) */}
      <div className="rounded-2xl border border-line bg-white p-5 text-sm text-ink-soft">
        <p>
          <strong className="text-ink">Proveedor:</strong> {site.fullName}
        </p>
        <p className="mt-1">
          <strong className="text-ink">RUC:</strong> {site.ruc}
        </p>
        <p className="mt-1">
          <strong className="text-ink">Dirección:</strong> {site.contact.address}, {site.contact.city}
        </p>
      </div>

      {/* 1. Consumidor */}
      <fieldset className="rounded-2xl border border-line bg-white p-6">
        <legend className={sectionTitle}>
          <span className={numberBadge}>1</span> Identificación del consumidor reclamante
        </legend>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={label} htmlFor="nombre">Nombre y apellidos *</label>
            <input id="nombre" name="nombre" className={input} required />
          </div>
          <div>
            <label className={label} htmlFor="documento_tipo">Tipo de documento *</label>
            <select id="documento_tipo" name="documento_tipo" className={input} defaultValue="DNI">
              <option value="DNI">DNI</option>
              <option value="CE">Carné de extranjería</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          </div>
          <div>
            <label className={label} htmlFor="documento_numero">N° de documento *</label>
            <input id="documento_numero" name="documento_numero" className={input} required />
          </div>
          <div>
            <label className={label} htmlFor="telefono">Teléfono</label>
            <input id="telefono" name="telefono" type="tel" className={input} />
          </div>
          <div>
            <label className={label} htmlFor="email">Correo electrónico *</label>
            <input id="email" name="email" type="email" className={input} required />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="domicilio">Domicilio</label>
            <input id="domicilio" name="domicilio" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <input type="checkbox" checked={esMenor} onChange={(e) => setEsMenor(e.target.checked)} className="h-4 w-4 accent-pink" />
              El consumidor es menor de edad
            </label>
          </div>
          {esMenor && (
            <div className="sm:col-span-2">
              <label className={label} htmlFor="apoderado">Nombre del padre, madre o apoderado *</label>
              <input id="apoderado" name="apoderado" className={input} required={esMenor} />
            </div>
          )}
        </div>
      </fieldset>

      {/* 2. Bien contratado */}
      <fieldset className="rounded-2xl border border-line bg-white p-6">
        <legend className={sectionTitle}>
          <span className={numberBadge}>2</span> Identificación del bien contratado
        </legend>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="bien_tipo">Tipo *</label>
            <select id="bien_tipo" name="bien_tipo" className={input} defaultValue="servicio">
              <option value="servicio">Servicio</option>
              <option value="producto">Producto</option>
            </select>
          </div>
          <div>
            <label className={label} htmlFor="bien_monto">Monto reclamado (S/)</label>
            <input id="bien_monto" name="bien_monto" type="number" step="0.01" min="0" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="bien_descripcion">Descripción del bien o servicio *</label>
            <textarea id="bien_descripcion" name="bien_descripcion" rows={2} className={input} required />
          </div>
        </div>
      </fieldset>

      {/* 3. Detalle */}
      <fieldset className="rounded-2xl border border-line bg-white p-6">
        <legend className={sectionTitle}>
          <span className={numberBadge}>3</span> Detalle de la reclamación y pedido
        </legend>
        <div className="mt-5 space-y-4">
          <div>
            <span className={label}>Tipo *</span>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-line p-3 text-sm has-[:checked]:border-pink has-[:checked]:bg-pink-tint">
                <input type="radio" name="tipo" value="reclamo" defaultChecked className="mt-0.5 accent-pink" />
                <span>
                  <strong className="text-ink">Reclamo</strong>
                  <span className="block text-xs text-ink-muted">Disconformidad relacionada al servicio o producto.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-line p-3 text-sm has-[:checked]:border-pink has-[:checked]:bg-pink-tint">
                <input type="radio" name="tipo" value="queja" className="mt-0.5 accent-pink" />
                <span>
                  <strong className="text-ink">Queja</strong>
                  <span className="block text-xs text-ink-muted">Malestar respecto a la atención, no relacionado al servicio.</span>
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className={label} htmlFor="detalle">Detalle *</label>
            <textarea id="detalle" name="detalle" rows={4} className={input} required />
          </div>
          <div>
            <label className={label} htmlFor="pedido">Pedido del consumidor *</label>
            <textarea id="pedido" name="pedido" rows={3} className={input} required />
          </div>
        </div>
      </fieldset>

      <p className="text-xs leading-relaxed text-ink-muted">
        La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es
        requisito previo para interponer una denuncia ante el INDECOPI. El proveedor debe dar
        respuesta al reclamo en un plazo no mayor a quince (15) días hábiles, prorrogable por igual
        plazo previa comunicación al consumidor.
      </p>

      {err && <p className="rounded-xl bg-pink-tint px-4 py-3 text-sm font-semibold text-pink">{err}</p>}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-pink px-8 py-4 font-display text-lg font-bold text-white shadow-soft transition-transform hover:scale-[1.01] disabled:opacity-60 sm:w-auto"
      >
        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        Enviar reclamación
      </button>
    </form>
  );
}
