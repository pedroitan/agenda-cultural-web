import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ad_id } = body;

    if (!ad_id) {
      return NextResponse.json({ error: "Missing ad_id" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: ad, error: fetchError } = await supabase
      .from("ads")
      .select("impressions")
      .eq("id", ad_id)
      .single();

    if (fetchError || !ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    await supabase
      .from("ads")
      .update({ impressions: (ad.impressions || 0) + 1 })
      .eq("id", ad_id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
