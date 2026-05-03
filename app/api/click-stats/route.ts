import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ total: 0 });

  const { data } = await supabase.from("events").select("title, venue_name, start_datetime, click_count");
  
  // Deduplicate by title + date + venue (same logic as frontend)
  const grouped = new Map<string, number>();
  (data || []).forEach((e: any) => {
    const titleNormalized = e.title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const dateMatch = e.start_datetime.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const dateKey = dateMatch ? `${dateMatch[2]}-${dateMatch[3]}` : '';
    const venueKey = (e.venue_name || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const key = `${titleNormalized}-${dateKey}-${venueKey}`;
    
    // Keep the highest click_count for duplicates
    const current = grouped.get(key) || 0;
    grouped.set(key, Math.max(current, e.click_count || 0));
  });
  
  const total = Array.from(grouped.values()).reduce((sum, count) => sum + count, 0);

  return NextResponse.json({ total });
}
