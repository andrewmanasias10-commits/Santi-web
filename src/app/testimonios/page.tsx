import { redirect } from "next/navigation";

// Los testimonios ahora viven dentro de cada segmento de Servicios.
export default function TestimoniosRedirect() {
  redirect("/servicios");
}
