import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    redirect("/");
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("id,url")
    .eq("id", id)
    .maybeSingle();

  if (error || !event?.url) {
    redirect("/");
  }

  await supabase.rpc("increment_event_click", { event_id: event.id });

  redirect(event.url);
}
