import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Skip tracking for prefetch requests (multiple headers to check)
  const purpose = request.headers.get("purpose") ?? request.headers.get("sec-purpose") ?? "";
  const isPrefetch = purpose.includes("prefetch");

  // Skip tracking for bots
  const userAgent = request.headers.get("user-agent") ?? "";
  const isBot = /bot|crawler|spider|crawl|facebookexternalhit|twitterbot|linkedinbot|whatsapp/i.test(userAgent);

  // Skip tracking for HEAD requests (prefetch often uses HEAD)
  const method = request.method;
  const isHeadRequest = method === "HEAD";

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

  // Only increment for real user navigations, not prefetch, bots, or HEAD requests
  if (!isPrefetch && !isBot && !isHeadRequest) {
    // Incrementar cliques com UPDATE direto (sem depender de função SQL)
    await supabase
      .from("events")
      .update({ click_count: (event.click_count || 0) + 1 })
      .eq("id", event.id);
  }

  // Use first URL if multiple sources (deduplicated events)
  const firstUrl = event.url.split("|")[0].trim();
  return NextResponse.redirect(firstUrl);
}
