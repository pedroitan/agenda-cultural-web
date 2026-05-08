import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getCityConfig } from "@/config/cities";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const cityConfig = getCityConfig();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 });
  }

  const { data: tours, error } = await supabase
    .from("tours")
    .select("*")
    .eq("is_published", true)
    .eq("city", cityConfig.slug)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(tours || []);
}
