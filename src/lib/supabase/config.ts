/** Configuración de Supabase (leída de variables de entorno). */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** true si ya hay credenciales configuradas (si no, el sitio usa datos de ejemplo). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** Nombre del bucket de almacenamiento para imágenes/videos del blog. */
export const BLOG_BUCKET = "blog-media";

/** Bucket para media editable del sitio (fotos del equipo, galería del inicio). */
export const SITE_BUCKET = "site-media";
