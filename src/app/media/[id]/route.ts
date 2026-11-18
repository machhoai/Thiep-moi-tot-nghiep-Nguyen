import { db } from "@/lib/db";

export async function GET(_request: Request, context: RouteContext<"/media/[id]">) {
  const { id } = await context.params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const row = db().prepare("SELECT bytes FROM photos WHERE id = ? AND bytes IS NOT NULL").get(id) as { bytes: Uint8Array } | undefined;
  if (!row) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(row.bytes), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
