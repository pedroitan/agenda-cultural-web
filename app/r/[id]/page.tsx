import { redirect, notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function RedirectPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) notFound();

  const { data: event } = await supabase
    .from("events")
    .select("id, url, click_count")
    .eq("id", params.id)
    .single();

  if (!event) notFound();

  // Increment click count (fire and forget - don't block redirect)
  await supabase
    .from("events")
    .update({ click_count: (event.click_count || 0) + 1 })
    .eq("id", event.id);

  // Redirect to first URL (may be pipe-separated for multi-source events)
  const targetUrl = event.url.split("|")[0].trim();
  redirect(targetUrl);
}
