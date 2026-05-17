import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 });
  }

  // Usar função SQL para incremento atômico
  const { error: rpcError } = await supabase.rpc('increment_click_count', { event_id: id });
  if (rpcError) {
    console.error('[track-view] RPC error:', rpcError.message, 'event_id:', id);
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
