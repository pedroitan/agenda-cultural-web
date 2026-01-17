import { getSupabaseServerClient } from "./supabaseServer";

export type InstagramEvent = {
  id: string;
  title: string;
  start_datetime: string;
  venue_name: string | null;
  image_url: string | null;
  price_text: string | null;
  is_free: boolean;
  category: string | null;
  url: string;
  click_count: number;
};

/**
 * Query 1: Evento Destaque do Dia
 * Retorna o evento com mais cliques nos próximos 7 dias
 */
export async function getHighlightEvent(): Promise<InstagramEvent | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select("id, title, start_datetime, venue_name, image_url, price_text, is_free, category, url, click_count")
    .gt("start_datetime", new Date().toISOString())
    .lt("start_datetime", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("click_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching highlight event:", error);
    return null;
  }

  return data;
}

/**
 * Query 2: Lista "Hoje em Salvador"
 * Retorna até 5 eventos que acontecem hoje, priorizando gratuitos
 */
export async function getEventsToday(): Promise<InstagramEvent[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from("events")
    .select("id, title, start_datetime, venue_name, image_url, price_text, is_free, category, url, click_count")
    .gte("start_datetime", today.toISOString())
    .lt("start_datetime", tomorrow.toISOString())
    .order("is_free", { ascending: false })
    .order("click_count", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error fetching today events:", error);
    return [];
  }

  return data || [];
}

/**
 * Query 3: Fim de Semana (roda quinta-feira)
 * Retorna até 8 eventos do próximo fim de semana
 */
export async function getWeekendEvents(): Promise<InstagramEvent[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const now = new Date();
  const dayOfWeek = now.getDay();
  
  // Calculate next Saturday (day 6)
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSaturday);
  saturday.setHours(0, 0, 0, 0);
  
  // Calculate Sunday
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  sunday.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("events")
    .select("id, title, start_datetime, venue_name, image_url, price_text, is_free, category, url, click_count")
    .gte("start_datetime", saturday.toISOString())
    .lte("start_datetime", sunday.toISOString())
    .order("click_count", { ascending: false })
    .limit(8);

  if (error) {
    console.error("Error fetching weekend events:", error);
    return [];
  }

  return data || [];
}

/**
 * Query 4: Grátis Hoje
 * Retorna até 3 eventos gratuitos que acontecem hoje
 */
export async function getFreeEventsToday(): Promise<InstagramEvent[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from("events")
    .select("id, title, start_datetime, venue_name, image_url, price_text, is_free, category, url, click_count")
    .eq("is_free", true)
    .gte("start_datetime", today.toISOString())
    .lt("start_datetime", tomorrow.toISOString())
    .order("click_count", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Error fetching free events today:", error);
    return [];
  }

  return data || [];
}
