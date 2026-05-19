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
  const dow = nowBRT.getDay(); // 0=Dom, 6=Sáb

  // Days until next Saturday (if already Saturday, 0; if Sunday, 6)
  const daysToSat = dow === 6 ? 0 : (6 - dow);

  const sat = new Date(nowBRT);
  sat.setDate(nowBRT.getDate() + daysToSat);
  sat.setHours(0, 0, 0, 0);

  const sun = new Date(sat);
  sun.setDate(sat.getDate() + 1);
  sun.setHours(23, 59, 59, 999);

  const fmt = (d: Date) =>
    d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return { start: sat, end: sun, label: `${fmt(sat)} e ${fmt(sun)}` };
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
Crie até 3 roteiros de fim de semana. Cada roteiro deve ter um PERFIL DE PÚBLICO claro e todos os eventos devem ser coerentes com esse perfil.

PERÍODO: ${label}

EVENTOS DISPONÍVEIS (${events.length} eventos):
${eventLines}
${nearbySection}

═══════════════════════════════════════════
REGRA 1 — PERFIL DE PÚBLICO (MAIS IMPORTANTE)
═══════════════════════════════════════════
Cada roteiro deve se encaixar em UM destes perfis:
- "familia" → eventos para pais com filhos pequenos, teatro infantil, parques, atividades educativas, horário diurno
- "jovem-adulto" → shows, baladas, bares, música ao vivo, noite, eventos 18+
- "cultura" → museus, exposições, teatro adulto, ópera, cinema, arte
- "casual-dia" → feiras, mercados, gastronomia, lazer ao ar livre, passeios

REGRAS DE COERÊNCIA DE PÚBLICO (PROIBIÇÕES):
❌ NUNCA misture "familia" com "jovem-adulto" no mesmo roteiro
❌ NUNCA coloque teatro infantil junto com shows de rock, bares ou eventos noturnos
❌ NUNCA misture eventos para crianças com eventos adultos/18+
❌ Se um evento é claramente noturno (começa após 20h), não misture com eventos matinais para família
✅ Dentro do mesmo perfil, categorias COMPLEMENTARES são bem-vindas (ex: show + bar = ok para jovem-adulto; teatro adulto + exposição = ok para cultura)

═══════════════════════════════════════════
REGRA 2 — PROXIMIDADE GEOGRÁFICA
═══════════════════════════════════════════
- Todos os eventos de um roteiro: mesmo bairro ou bairros adjacentes (máx 2 km)
- Use os pares computados acima como guia

═══════════════════════════════════════════
REGRA 3 — SEQUÊNCIA TEMPORAL
═══════════════════════════════════════════
- Ordene do mais cedo para o mais tarde
- Mínimo 30 min de intervalo entre eventos (deslocamento)
- Não ultrapasse 8h de duração total por roteiro

═══════════════════════════════════════════
REGRA 4 — DIVERSIDADE ENTRE ROTEIROS
═══════════════════════════════════════════
- Crie roteiros com perfis DIFERENTES entre si (não crie 2 roteiros "jovem-adulto")
- Não repita o mesmo evento em roteiros diferentes
- Mínimo 2, máximo 4 eventos por roteiro

Retorne SOMENTE JSON válido (sem markdown), com este formato exato:
[
  {
    "title": "Título curto e atrativo (máx 60 chars)",
    "description": "2 frases descrevendo o passeio e o perfil de quem vai aproveitar",
    "perfil": "familia" | "jovem-adulto" | "cultura" | "casual-dia",
    "day": "Sábado" | "Domingo",
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
      generationConfig: { temperature: 0.6, maxOutputTokens: 8192, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });

  if (!gemRes.ok) {
    const errText = await gemRes.text();
    return NextResponse.json({ error: `Gemini error ${gemRes.status}: ${errText}` }, { status: 500 });
  }

  const gemData = await gemRes.json();
  console.log('[tours/generate] Gemini response structure:', JSON.stringify(gemData, null, 2).slice(0, 2000));

  // Support both regular models and thinking models (parts may include thought:true)
  const allParts: any[] = gemData.candidates?.[0]?.content?.parts || [];
  console.log('[tours/generate] Parts count:', allParts.length);
  allParts.forEach((p: any, i: number) => {
    console.log(`[tours/generate] Part ${i}:`, p.thought ? 'THOUGHT' : 'OUTPUT', typeof p.text === 'string' ? p.text.slice(0, 100) : 'no text');
  });

  const rawText: string = allParts
    .filter((p: any) => !p.thought && typeof p.text === "string")
    .map((p: any) => p.text as string)
    .join("") || "";

  console.log('[tours/generate] Extracted text length:', rawText.length);
  console.log('[tours/generate] First 500 chars:', rawText.slice(0, 500));

  // Robust JSON extraction: handle markdown fences, raw arrays, or objects with array values
  function extractJsonArray(text: string): any[] | null {
    // Strip markdown code fences
    const stripped = text.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    // Try direct array match
    const arrMatch = stripped.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]); } catch {}
    }
    // Try full parse (model might return just the array)
    try {
      const parsed = JSON.parse(stripped);
      if (Array.isArray(parsed)) return parsed;
      // Object wrapping array: { roteiros: [...] } or { tours: [...] }
      const arrVal = Object.values(parsed).find((v) => Array.isArray(v));
      if (arrVal) return arrVal as any[];
    } catch {}
    return null;
  }

  const roteiros = extractJsonArray(rawText);
  if (!roteiros) {
    return NextResponse.json({ error: "Gemini não retornou JSON", raw: rawText.slice(0, 1000), partsCount: allParts.length }, { status: 500 });
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
        curator_bio: `Roteiro gerado por IA para ${r.day || "o fim de semana"} — ${r.neighborhood || ""}${r.perfil ? ` · Perfil: ${r.perfil}` : ""}`.trim(),
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
