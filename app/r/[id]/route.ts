import { redirect } from "next/navigation";

import { getSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log('[CLICK TRACKING] Event ID(s):', id);

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    redirect("/");
  }

  // ID can be comma-separated for deduplicated events
  const ids = id.split(',');
  const primaryId = ids[0];

  const { data: event, error } = await supabase
    .from("events")
    .select("id,url,title")
    .eq("id", primaryId)
    .maybeSingle();

  if (error || !event?.url) {
    console.error('[CLICK TRACKING] Error fetching event:', error);
    redirect("/");
  }

  console.log('[CLICK TRACKING] Incrementing clicks for', ids.length, 'event(s):', event.title);

  // Increment click count for all IDs in the group
  for (const eventId of ids) {
    const { error: rpcError } = await supabase.rpc("increment_event_click", { event_id: eventId });
    
    if (rpcError) {
      console.error('[CLICK TRACKING] Error incrementing click for ID', eventId, ':', rpcError);
    } else {
      console.log('[CLICK TRACKING] Click incremented for ID:', eventId);
    }
  }

  // Use first URL from the event (they should all point to same place for deduplicated events)
  const firstUrl = event.url.split('|')[0];
  redirect(firstUrl);
}
