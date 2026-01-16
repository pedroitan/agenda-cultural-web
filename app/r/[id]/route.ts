import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

// Simple in-memory cache to prevent double-counting within 2 seconds
const recentClicks = new Map<string, number>();

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

  // Check if this event was clicked recently (within 2 seconds)
  const now = Date.now();
  const lastClick = recentClicks.get(event.id);
  
  if (!lastClick || now - lastClick > 2000) {
    // Increment click count only if not a duplicate within 2 seconds
    await supabase.rpc("increment_event_click", { event_id: event.id });
    recentClicks.set(event.id, now);
    
    // Clean up old entries (older than 5 seconds)
    for (const [key, timestamp] of recentClicks.entries()) {
      if (now - timestamp > 5000) {
        recentClicks.delete(key);
      }
    }
  }

  // Use first URL if multiple sources (deduplicated events)
  const firstUrl = event.url.split('|')[0];
  redirect(firstUrl);
}
