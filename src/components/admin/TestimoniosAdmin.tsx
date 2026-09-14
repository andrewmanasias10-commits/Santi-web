"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Row = {
  id: string;
  segment: string;
  name: string;
  role: string | null;
  rating: number;
  quote: string;
  approved: boolean;
  created_at: string;
};

const segLabel = (s: string) =>
  s === "ninos" ? "Niños" : s === "jovenes-adultos" ? "Jóvenes y adultos" : s;

export function TestimoniosAdmin() {
  const sb = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await sb
      .from("testimonios_publicos")
      .select("id,segment,name,role,rating,quote,approved,created_at")
      .order("created_at", { ascending: false });
    if (err) setError("No se pudo cargar. ¿Ya corriste supabase/testimonios.sql?");
    setRows((data as Row[]) ?? []);
    setLoading(false);
  }, [sb]);

  useEffect(() => {
    load();
  }, [load]);

  async function setAprobado(id: string, approved: boolean) {
    setError("");
    const { data, error: err } = await sb
      .from("testimonios_publicos")
      .update({ approved })
      .eq("id", id)
      .select();
    if (err) {
      setError(
        "No se pudo actualizar: " +
          err.message +
          ". Ejecuta supabase/testimonios.sql en Supabase (permisos de moderación).",
      );
      return;
    }
    if (!data || data.length === 0) {
      setError(
        "No se aplicó el cambio (permiso denegado). Ejecuta supabase/testimonios.sql en Supabase.",
      );
      return;
    }
    load();
  }
  const aprobar = (id: string) => setAprobado(id, true);
  const ocultar = (id: string) => setAprobado(id, false);
  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este comentario definitivamente?")) return;
    setError("");
    const { error: err } = await sb.from("testimonios_publicos").delete().eq("id", id);
    if (err) {
      setError("No se pudo eliminar: " + err.message);
      return;
    }
    load();
  }

  const pendientes = rows.filter((r) => !r.approved);
  const publicados = rows.filter((r) => r.approved);

  const Card = ({ r }: { r: Row }) => (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink">{r.name}</span>
          <span className="text-orange" aria-label={`${r.rating} estrellas`}>
            {"★".repeat(r.rating)}
            <span className="text-line">{"★".repeat(5 - r.rating)}</span>
          </span>
        </div>
        <span className="rounded-full bg-line/60 px-2 py-0.5 text-xs font-semibold text-ink-soft">
          {segLabel(r.segment)}
        </span>
      </div>
      {r.role && <p className="text-xs text-ink-muted">{r.role}</p>}
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.quote}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {!r.approved ? (
          <button
            type="button"
            onClick={() => aprobar(r.id)}
            className="rounded-full bg-green px-4 py-1.5 text-sm font-bold text-white"
          >
            Aprobar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => ocultar(r.id)}
            className="rounded-full border border-line px-4 py-1.5 text-sm font-bold text-ink-soft"
          >
            Ocultar
          </button>
        )}
        <button
          type="button"
          onClick={() => eliminar(r.id)}
          className="rounded-full border border-line px-4 py-1.5 text-sm font-bold text-pink"
        >
          Eliminar
        </button>
      </div>
    </div>
  );

  return (
    <section className="rounded-3xl border border-line bg-white/60 p-5 sm:p-6">
      <h2 className="text-lg font-bold text-ink">Testimonios (comentarios)</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Aprueba los comentarios para que se muestren en la web.
      </p>

      {error && <p className="mt-3 text-sm font-semibold text-pink">{error}</p>}
      {loading ? (
        <p className="mt-4 text-sm text-ink-muted">Cargando…</p>
      ) : (
        <>
          <h3 className="mt-5 text-sm font-bold text-ink">
            Pendientes de aprobar ({pendientes.length})
          </h3>
          {pendientes.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">No hay comentarios pendientes.</p>
          ) : (
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {pendientes.map((r) => (
                <Card key={r.id} r={r} />
              ))}
            </div>
          )}

          <h3 className="mt-6 text-sm font-bold text-ink">Publicados ({publicados.length})</h3>
          {publicados.length === 0 ? (
            <p className="mt-2 text-sm text-ink-muted">Aún no hay comentarios publicados.</p>
          ) : (
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {publicados.map((r) => (
                <Card key={r.id} r={r} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
