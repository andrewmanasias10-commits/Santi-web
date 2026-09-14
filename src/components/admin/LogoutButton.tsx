"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
      className="rounded-full px-4 py-2 text-sm font-bold text-ink-soft hover:text-pink"
    >
      Salir
    </button>
  );
}
