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

  // Check if user already clicked this event (cookie-based)
  const clickCookie = request.headers.get("cookie") ?? "";
  const hasClicked = clickCookie.includes(`clicked_${id}=1`);

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

  // Only increment for real user navigations, not prefetch or already clicked
  if (!isPrefetch && !hasClicked) {
    await supabase.rpc('increment_click_count', { event_id: id });
    
    // Set cookie to prevent duplicate counting (expires in 1 hour)
    const response = NextResponse.redirect(event.url.split("|")[0].trim());
    response.cookies.set(`clicked_${id}`, '1', {
      httpOnly: true,
      maxAge: 86400, // 24 hours
      path: '/',
    });
    return response;
  }

  // Use first URL if multiple sources (deduplicated events)
  const firstUrl = event.url.split("|")[0].trim();
  return NextResponse.redirect(firstUrl);
}
