import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getCityConfig } from "@/config/cities";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

type EventForTour = {
  id: string;
  title: string;
  start_datetime: string;
  venue_name: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  is_free: boolean;
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatEventForPrompt(ev: EventForTour): string {
  const dt = new Date(ev.start_datetime);
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const day = dayNames[dt.getDay()];
  const h = String(dt.getHours()).padStart(2, "0");
  const m = String(dt.getMinutes()).padStart(2, "0");
  const bairro = ev.district || ev.venue_name?.split("-")[0].trim() || "—";
  const preco = ev.is_free ? "Grátis" : "Pago";
  const cat = ev.category || "—";
  const gps = ev.latitude ? ` GPS:${ev.latitude.toFixed(4)},${ev.longitude!.toFixed(4)}` : "";
  return `ID:${ev.id} | "${ev.title}" | ${day} ${h}:${m} | Bairro:${bairro} | ${cat} | ${preco}${gps}`;
}

function getWeekendRange(): { start: Date; end: Date; label: string } {
  const now = new Date();
  const nowBRT = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const dow = nowBRT.getDay(); // 0=Dom...6=Sáb

  // Days until/since last Friday
  const daysToFri =
    dow === 0 ? -2 :
    dow === 6 ? -1 :
    dow === 5 ? 0 :
    5 - dow;

  const fri = new Date(nowBRT);
  fri.setDate(fri.getDate() + daysToFri);
  fri.setHours(0, 0, 0, 0);

  const sun = new Date(fri);
  sun.setDate(sun.getDate() + 2);
  sun.setHours(23, 59, 59, 999);

  const fmt = (d: Date) =>
    d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return { start: fri, end: sun, label: `${fmt(fri)} a ${fmt(sun)}` };
}

export async function POST() {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY não configurada" }, { status: 500 });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 500 });
  }

  const cityConfig = getCityConfig();
  const { start, end, label } = getWeekendRange();

  // ─── 1. Buscar eventos do fim de semana ───────────────────────────────────
  const { data: rawEvents, error: evErr } = await supabase
    .from("events")
    .select("id, title, start_datetime, venue_name, district, latitude, longitude, category, is_free")
    .eq("is_active", true)
    .gte("start_datetime", start.toISOString())
    .lte("start_datetime", end.toISOString())
    .not("venue_name", "is", null)
    .order("start_datetime", { ascending: true })
    .limit(100);

  if (evErr) {
    return NextResponse.json({ error: evErr.message }, { status: 500 });
  }

  const events = (rawEvents || []) as EventForTour[];

  if (events.length < 3) {
    return NextResponse.json(
      { error: `Apenas ${events.length} evento(s) com local definido para o fim de semana.` },
      { status: 400 }
    );
  }

  // ─── 2. Pré-computar grupos por bairro ───────────────────────────────────
  // Agrupar por district; fallback por primeiro token do venue_name
  const groups = new Map<string, EventForTour[]>();
  for (const ev of events) {
    const key = (ev.district || ev.venue_name?.split("-")[0] || "Outros").trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(ev);
  }

  // Para eventos com coordenadas, calcular distâncias entre todos os pares
  // e anotar pares próximos (≤2 km) no prompt
  const withGps = events.filter((e) => e.latitude !== null);
  const nearbyPairs: string[] = [];
  for (let i = 0; i < withGps.length; i++) {
    for (let j = i + 1; j < withGps.length; j++) {
      const a = withGps[i];
      const b = withGps[j];
      const km = haversineKm(a.latitude!, a.longitude!, b.latitude!, b.longitude!);
      if (km <= 2.0) {
        const dtA = new Date(a.start_datetime);
        const dtB = new Date(b.start_datetime);
        const diffMin = Math.abs(dtA.getTime() - dtB.getTime()) / 60000;
        // Só incluir se janela de tempo é compatível (até 4h de diferença)
        if (diffMin <= 240) {
          nearbyPairs.push(
            `"${a.title}" ↔ "${b.title}" (${km.toFixed(1)}km, Δ${Math.round(diffMin)}min)`
          );
        }
      }
    }
  }

  // ─── 3. Montar prompt para o Gemini ──────────────────────────────────────
  const eventLines = events.map(formatEventForPrompt).join("\n");
  const nearbySection =
    nearbyPairs.length > 0
      ? `\nPARES JÁ COMPUTADOS COMO PRÓXIMOS (≤2km + ≤4h):\n${nearbyPairs.slice(0, 30).join("\n")}`
      : "\n(Sem coordenadas GPS suficientes — use bairros como referência principal)";

  const prompt = `Você é um curador cultural especialista em ${cityConfig.name}.
Crie EXATAMENTE 3 roteiros de fim de semana otimizados para conforto e proximidade.

PERÍODO: ${label}

EVENTOS DISPONÍVEIS (${events.length} eventos):
${eventLines}
${nearbySection}

REGRAS OBRIGATÓRIAS — leia com atenção:
1. PROXIMIDADE GEOGRÁFICA (PRIORIDADE MÁXIMA)
   - Todos os eventos de um roteiro devem estar no MESMO BAIRRO ou em bairros adjacentes
   - Distância máxima entre quaisquer dois eventos do roteiro: 2 km
   - Use os pares computados acima como guia quando disponíveis

2. SEQUÊNCIA TEMPORAL CONFORTÁVEL
   - Ordene os eventos do mais cedo para o mais tarde
   - Intervalo mínimo entre o fim de um evento e início do próximo: 30 minutos (tempo de deslocamento)
   - Prefira blocos coerentes: manhã (9h-13h), tarde (13h-18h), noite (18h+)

3. TAMANHO DO ROTEIRO
   - Mínimo 2 eventos, máximo 4 eventos por roteiro

4. DIVERSIDADE
   - Crie roteiros para dias diferentes quando possível (Sexta, Sábado, Domingo)
   - Misture categorias complementares (ex: show + gastronomia)
   - Não repita o mesmo evento em roteiros diferentes

5. CUSTO
   - Prefira incluir pelo menos 1 evento gratuito quando disponível no bairro

Retorne SOMENTE JSON válido (sem markdown), com este formato exato:
[
  {
    "title": "Título curto e atrativo (máx 60 chars)",
    "description": "2 frases descrevendo o passeio, destacando o bairro e o clima",
    "day": "Sexta" | "Sábado" | "Domingo",
    "neighborhood": "Nome do bairro principal",
    "event_ids": ["uuid-do-evento-1", "uuid-do-evento-2"]
  }
]`;

  // ─── 4. Chamar o Gemini ───────────────────────────────────────────────────
  const gemRes = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
    }),
  });

  if (!gemRes.ok) {
    const errText = await gemRes.text();
    return NextResponse.json({ error: `Gemini error ${gemRes.status}: ${errText}` }, { status: 500 });
  }

  const gemData = await gemRes.json();
  // gemini-2.5-flash is a thinking model: parts[0] may be internal thought (thought:true),
  // actual output is in the subsequent parts. Filter and join non-thought text parts.
  const allParts: any[] = gemData.candidates?.[0]?.content?.parts || [];
  const rawText: string = allParts
    .filter((p: any) => !p.thought && typeof p.text === "string")
    .map((p: any) => p.text as string)
    .join("") || "";

  const jsonMatch = rawText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Gemini não retornou JSON", raw: rawText.slice(0, 500) }, { status: 500 });
  }

  let roteiros: any[];
  try {
    roteiros = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "JSON inválido do Gemini", raw: rawText.slice(0, 500) }, { status: 500 });
  }

  // ─── 5. Salvar no banco ───────────────────────────────────────────────────
  const savedTours: any[] = [];

  for (const r of roteiros) {
    const eventIds: string[] = Array.isArray(r.event_ids) ? r.event_ids : [];
    if (eventIds.length < 2) continue;

    // Validar que os IDs existem nos eventos buscados
    const validIds = eventIds.filter((id) => events.some((e) => e.id === id));
    if (validIds.length < 2) continue;

    const { data: tourRow, error: tourErr } = await supabase
      .from("tours")
      .insert({
        title: String(r.title || "Roteiro do Fim de Semana").slice(0, 120),
        description: String(r.description || "").slice(0, 500),
        curator_name: `Agenda Cultural ${cityConfig.name}`,
        curator_bio: `Roteiro gerado por IA para ${r.day || "o fim de semana"} — ${r.neighborhood || ""}`.trim(),
        city: cityConfig.slug,
        is_published: false,
      })
      .select()
      .single();

    if (tourErr || !tourRow) {
      console.error("[tours/generate] tour insert error:", tourErr?.message);
      continue;
    }

    const stops = validIds.map((eid, idx) => ({
      tour_id: tourRow.id,
      event_id: eid,
      order_index: idx,
    }));

    const { error: stopsErr } = await supabase.from("tour_stops").insert(stops);
    if (stopsErr) {
      console.error("[tours/generate] stops insert error:", stopsErr.message);
    }

    savedTours.push({ ...tourRow, stops_count: stops.length });
  }

  return NextResponse.json({
    success: true,
    generated: savedTours.length,
    events_analyzed: events.length,
    nearby_pairs_found: nearbyPairs.length,
    tours: savedTours,
  });
}
