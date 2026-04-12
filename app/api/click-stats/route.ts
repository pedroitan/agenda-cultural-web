import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ total: 0 });

  const { data } = await supabase.from("events").select("click_count");
  const total = data?.reduce((s, e) => s + (e.click_count || 0), 0) ?? 0;

  return NextResponse.json({ total });
}
