import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log('[CLICK TRACKING] Event ID:', id);

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    redirect("/");
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("id,url,title")
    .eq("id", id)
    .maybeSingle();

  if (error || !event?.url) {
    console.error('[CLICK TRACKING] Error fetching event:', error);
    redirect("/");
  }

  console.log('[CLICK TRACKING] Incrementing click for:', event.title, 'ID:', event.id);

  const { error: rpcError } = await supabase.rpc("increment_event_click", { event_id: event.id });
  
  if (rpcError) {
    console.error('[CLICK TRACKING] Error incrementing click:', rpcError);
  } else {
    console.log('[CLICK TRACKING] Click incremented successfully');
  }

  redirect(event.url);
}
