import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

/**
 * Public Events API
 * GET /api/events
 *
 * Query params:
 *   limit    – max number of events (default: 50, max: 200)
 *   category – filter by category (e.g. "Shows e Festas", "Teatro")
 *   date     – filter by date YYYY-MM-DD (e.g. "2026-04-13")
 *   free     – "true" to show only free events
 *   q        – search by title or venue
 */
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const { searchParams } = request.nextUrl;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
  const category = searchParams.get("category");
  const date = searchParams.get("date");
  const freeOnly = searchParams.get("free") === "true";
  const q = searchParams.get("q");

  // Base filter: only future/recent events (same 4h window as main page)
  const now = new Date();
  const nowBRT = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const fourHoursAgo = new Date(nowBRT.getTime() - 4 * 60 * 60 * 1000);

  let query = supabase
    .from("events")
    .select("id,title,start_datetime,venue_name,category,is_free,price_text,image_url,url,source")
    .gte("start_datetime", fourHoursAgo.toISOString())
    .order("start_datetime", { ascending: true })
    .limit(limit);

  if (category) query = query.eq("category", category);
  if (freeOnly) query = query.eq("is_free", true);
  if (date) {
    const start = `${date}T00:00:00`;
    const end = `${date}T23:59:59`;
    query = query.gte("start_datetime", start).lte("start_datetime", end);
  }
  if (q) {
    query = query.or(`title.ilike.%${q}%,venue_name.ilike.%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Format response
  const events = (data ?? []).map((ev) => ({
    id: ev.id,
    title: ev.title,
    start_datetime: ev.start_datetime,
    // Friendly display
    date_display: formatDateBRT(ev.start_datetime),
    venue: ev.venue_name ?? null,
    category: ev.category ?? null,
    is_free: ev.is_free,
    price: ev.price_text ?? null,
    image_url: ev.image_url ?? null,
    url: ev.url.split("|")[0],
    source: ev.source,
  }));

  return NextResponse.json(
    {
      total: events.length,
      updated_at: new Date().toISOString(),
      city: "Salvador, BA, Brasil",
      timezone: "America/Bahia (UTC-3)",
      events,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    }
  );
}

function formatDateBRT(dateStr: string): string {
  const months = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
  ];
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return dateStr;
  const [, , month, day, hour, minute] = m;
  const time = `${hour}:${minute}`;
  const dateLabel = `${parseInt(day)} de ${months[parseInt(month) - 1]}`;
  return time === "00:00" ? dateLabel : `${dateLabel} às ${time}`;
}
