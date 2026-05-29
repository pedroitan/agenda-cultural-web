import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getCityConfig } from "@/config/cities";
import { getClickStats } from "@/lib/clickStats";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ total: 0, cta_total: 0 });

  const cityConfig = getCityConfig();
  const { totalClicks, totalCta } = await getClickStats(supabase, cityConfig.slug);

  return NextResponse.json({ total: totalClicks, cta_total: totalCta });
}
