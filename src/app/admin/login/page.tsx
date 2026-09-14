"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Logo } from "@/components/brand/Logo";

const inputCls =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-muted focus:border-pink focus-visible:outline-none";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError("Supabase aún no está configurado. Agrega las claves en .env.local.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm rounded-[2rem] border border-line bg-white p-8 shadow-card">
        <div className="flex justify-center">
          <Logo horizontal height={56} />
        </div>
        <h1 className="mt-6 text-center text-2xl text-ink">Panel de administración</h1>
        <p className="mt-1 text-center text-sm text-ink-soft">
          Ingresa para gestionar el blog.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-ink">
              Correo
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="admin@santi.pe"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-ink">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-pink-tint px-4 py-2.5 text-sm font-semibold text-pink">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-pink px-6 py-3 font-display font-bold text-white shadow-soft transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
