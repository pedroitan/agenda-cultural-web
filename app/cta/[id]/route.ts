import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const BOT_UA_PATTERNS = [
  'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
  'python-requests', 'axios', 'go-http-client', 'java/',
  'headlesschrome', 'phantomjs', 'slurp', 'facebookexternalhit',
  'whatsapp', 'telegrambot', 'twitterbot', 'linkedinbot',
  'embedly', 'preview', 'fetch', 'monitor', 'lighthouse',
  'gptbot', 'chatgpt', 'claudebot', 'anthropic', 'perplexity',
  'ccbot', 'google-extended', 'applebot', 'amazonbot',
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_UA_PATTERNS.some((pattern) => ua.includes(pattern));
}

function isPrefetch(request: Request): boolean {
  const purpose = request.headers.get('purpose') ?? request.headers.get('sec-purpose') ?? '';
  if (purpose.includes('prefetch')) return true;
  if (request.headers.get('next-router-prefetch') === '1') return true;
  if (request.headers.get('x-purpose') === 'prefetch') return true;
  return false;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1) Filtrar prefetch
  if (isPrefetch(request)) {
    const supabase = getSupabaseServerClient();
    if (!supabase) return NextResponse.redirect(new URL("/", request.url));
    const { data: event } = await supabase.from("events").select("url").eq("id", id).maybeSingle();
    if (event?.url) return NextResponse.redirect(event.url.split("|")[0].trim());
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2) Filtrar bots por User-Agent
  const userAgent = request.headers.get('user-agent') ?? '';
  if (!userAgent || isBot(userAgent)) {
    const supabase = getSupabaseServerClient();
    if (!supabase) return NextResponse.redirect(new URL("/", request.url));
    const { data: event } = await supabase.from("events").select("url").eq("id", id).maybeSingle();
    if (event?.url) return NextResponse.redirect(event.url.split("|")[0].trim());
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3) Dedup via cookie httpOnly (mesmo dispositivo só conta 1x por evento em 24h)
  const cookieHeader = request.headers.get('cookie') ?? '';
  const alreadyClicked = cookieHeader.includes(`cta_clicked_${id}=1`);
  if (alreadyClicked) {
    const supabase = getSupabaseServerClient();
    if (!supabase) return NextResponse.redirect(new URL("/", request.url));
    const { data: event } = await supabase.from("events").select("url").eq("id", id).maybeSingle();
    if (event?.url) return NextResponse.redirect(event.url.split("|")[0].trim());
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { data: event, error } = await supabase
    .from("events")
    .select("id, url, cta_click_count")
    .eq("id", id)
    .maybeSingle();

  if (error || !event?.url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4) Incrementar CTA clicks
  await supabase
    .from("events")
    .update({ cta_click_count: (event.cta_click_count || 0) + 1 })
    .eq("id", event.id);

  // 5) Setar cookie httpOnly de dedup (24h)
  const firstUrl = event.url.split("|")[0].trim();
  const response = NextResponse.redirect(firstUrl);
  response.cookies.set(`cta_clicked_${id}`, '1', {
    httpOnly: true,
    maxAge: 86400, // 24h
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
