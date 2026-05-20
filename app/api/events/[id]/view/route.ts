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
  // Next.js router prefetch
  if (request.headers.get('next-router-prefetch') === '1') return true;
  if (request.headers.get('x-purpose') === 'prefetch') return true;
  return false;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1) Filtrar prefetch
  if (isPrefetch(request)) {
    return NextResponse.json({ skipped: 'prefetch' });
  }

  // 2) Filtrar bots por User-Agent
  const userAgent = request.headers.get('user-agent') ?? '';
  if (!userAgent || isBot(userAgent)) {
    return NextResponse.json({ skipped: 'bot' });
  }

  // 3) Dedup via cookie httpOnly (mesmo dispositivo só conta 1x por evento em 24h)
  const cookieHeader = request.headers.get('cookie') ?? '';
  const alreadyClicked = cookieHeader.includes(`clicked_${id}=1`);
  if (alreadyClicked) {
    return NextResponse.json({ skipped: 'already_counted' });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 });
  }

  // 4) Incrementar atomicamente
  const { error: rpcError } = await supabase.rpc('increment_click_count', { event_id: id });
  if (rpcError) {
    console.error('[track-view] RPC error:', rpcError.message, 'event_id:', id);
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  // 5) Setar cookie httpOnly de dedup (24h)
  const response = NextResponse.json({ success: true });
  response.cookies.set(`clicked_${id}`, '1', {
    httpOnly: true,
    maxAge: 86400, // 24h
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
