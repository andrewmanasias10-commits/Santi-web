import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, supabaseAnonKey } from "./config";

/**
 * Cliente anónimo sin sesión, para lecturas públicas del blog.
 * (No usa cookies, así las páginas públicas siguen siendo cacheables.)
 */
export function createPublicClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
