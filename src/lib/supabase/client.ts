"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseUrl, supabaseAnonKey } from "./config";

/** Cliente de Supabase para el navegador (componentes cliente). */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
