import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Skip tracking for prefetch requests
  const purpose = request.headers.get("purpose") ?? request.headers.get("sec-purpose") ?? "";
  const isPrefetch = purpose.includes("prefetch");

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("id, url, click_count")
    .eq("id", id)
    .maybeSingle();

  if (error || !event?.url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Only increment for real user navigations, not prefetch
  if (!isPrefetch) {
    // Usar função SQL para incremento atômico e evitar race conditions
    await supabase.rpc('increment_click_count', { event_id: id });
  }

  // Use first URL if multiple sources (deduplicated events)
  const firstUrl = event.url.split("|")[0].trim();
  return NextResponse.redirect(firstUrl);
}
