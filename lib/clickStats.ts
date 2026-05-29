import type { SupabaseClient } from "@supabase/supabase-js";

type ClickEvent = {
  id: string;
  title: string;
  venue_name: string | null;
  start_datetime: string;
  click_count: number | null;
  cta_click_count: number | null;
  source: string;
  url: string | null;
};

export type TopClickedEvent = {
  id: string;
  title: string;
  click_count: number;
  source: string;
  url: string | null;
};

export type ClickStats = {
  totalClicks: number;
  totalCta: number;
  topClicked: TopClickedEvent[];
};

function dedupKey(e: ClickEvent): string {
  const titleNormalized = (e.title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const dateMatch = (e.start_datetime || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  const dateKey = dateMatch ? `${dateMatch[2]}-${dateMatch[3]}` : "";
  const venueKey = (e.venue_name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return `${titleNormalized}-${dateKey}-${venueKey}`;
}

async function fetchAllClickEvents(
  supabase: SupabaseClient,
  citySlug: string
): Promise<ClickEvent[]> {
  const pageSize = 1000;
  let from = 0;
  const all: ClickEvent[] = [];

  while (true) {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, venue_name, start_datetime, click_count, cta_click_count, source, url")
      .eq("city", citySlug)
      .or("click_count.gt.0,cta_click_count.gt.0")
      .range(from, from + pageSize - 1);

    if (error || !data || data.length === 0) break;
    all.push(...(data as ClickEvent[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

export async function getClickStats(
  supabase: SupabaseClient,
  citySlug: string
): Promise<ClickStats> {
  const events = await fetchAllClickEvents(supabase, citySlug);

  const repByGroup = new Map<string, ClickEvent>();
  const maxClickByGroup = new Map<string, number>();
  const maxCtaByGroup = new Map<string, number>();

  for (const e of events) {
    const key = dedupKey(e);
    const existing = repByGroup.get(key);
    if (!existing || (e.click_count || 0) > (existing.click_count || 0)) {
      repByGroup.set(key, e);
    }
    maxClickByGroup.set(key, Math.max(maxClickByGroup.get(key) || 0, e.click_count || 0));
    maxCtaByGroup.set(key, Math.max(maxCtaByGroup.get(key) || 0, e.cta_click_count || 0));
  }

  const totalClicks = Array.from(maxClickByGroup.values()).reduce((sum, c) => sum + c, 0);
  const totalCta = Array.from(maxCtaByGroup.values()).reduce((sum, c) => sum + c, 0);

  const topClicked: TopClickedEvent[] = Array.from(repByGroup.values())
    .filter((e) => (e.click_count || 0) > 0)
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
    .slice(0, 10)
    .map((e) => ({
      id: e.id,
      title: e.title,
      click_count: e.click_count || 0,
      source: e.source,
      url: e.url,
    }));

  return { totalClicks, totalCta, topClicked };
}
