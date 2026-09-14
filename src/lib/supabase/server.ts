import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseUrl, supabaseAnonKey } from "./config";

/**
 * Cliente de Supabase para Server Components / Server Actions / Route Handlers.
 * En Next 16, `cookies()` es asíncrono.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Llamado desde un Server Component sin escritura de cookies: ignorar.
          // La sesión se refresca en proxy.ts.
        }
      },
    },
  });
}
