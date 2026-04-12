import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  await supabase.rpc("increment_event_click", { event_id: id });

  return NextResponse.json({ ok: true });
}
