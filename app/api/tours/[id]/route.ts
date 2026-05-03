import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 });
  }

  // Buscar roteiro
  const { data: tour, error: tourError } = await supabase
    .from("tours")
    .select("*")
    .eq("id", id)
    .single();

  if (tourError || !tour) {
    return NextResponse.json({ error: "Roteiro não encontrado" }, { status: 404 });
  }

  // Buscar paradas com dados dos eventos
  const { data: stops, error: stopsError } = await supabase
    .from("tour_stops")
    .select(`
      *,
      events (
        id,
        title,
        start_datetime,
        venue_name,
        image_url,
        price_text,
        is_free,
        category,
        url,
        description
      )
    `)
    .eq("tour_id", id)
    .order("order_index", { ascending: true });

  if (stopsError) {
    return NextResponse.json({ error: stopsError.message }, { status: 500 });
  }

  return NextResponse.json({
    ...tour,
    stops: stops || [],
  });
}
