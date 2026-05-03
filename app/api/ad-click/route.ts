import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ad_id } = body;

    if (!ad_id) {
      return NextResponse.json(
        { error: "Missing ad_id" },
        { status: 400 }
      );
    }

    // Criar cliente Supabase dentro da função
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Incrementar cliques no banco
    const { error } = await supabase.rpc("increment_ad_click", { ad_id });

    if (error) {
      console.error("Error incrementing ad click:", error);
      return NextResponse.json(
        { error: "Failed to increment click" },
        { status: 500 }
      );
    }

    // Buscar o anúncio para obter a URL de destino
    const { data: ad, error: adError } = await supabase
      .from("ads")
      .select("target_url")
      .eq("id", ad_id)
      .single();

    if (adError || !ad) {
      return NextResponse.json(
        { error: "Ad not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ target_url: ad.target_url });
  } catch (error) {
    console.error("Ad click error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
