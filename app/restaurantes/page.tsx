import { getSupabaseServerClient } from "@/lib/supabaseServer"
import Link from "next/link"

type RestaurantRow = {
  id: string
  name: string
  ranking: number | null
  address: string | null
  neighborhood: string | null
  phone: string | null
  description: string | null
  cuisine_type: string | null
  average_price: number | null
  hours: string | null
  instagram_url: string | null
  source: string
}

export const revalidate = 3600 // Cache for 1 hour

export default async function RestaurantesPage() {
  const supabase = getSupabaseServerClient()

  // Check if Supabase is configured
  if (!supabase) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950 p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Supabase não configurado</h1>
          <p className="text-zinc-600 mb-4">
            Crie um arquivo <code className="bg-zinc-200 px-2 py-1 rounded">.env.local</code> com:
          </p>
          <pre className="bg-zinc-200 p-4 rounded text-left text-sm">
{`SUPABASE_URL=https://ifocsakyvzkqdhrfmgbz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key`}
          </pre>
        </div>
      </div>
    )
  }

  const { data: restaurants, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("is_active", true)
    .order("ranking", { ascending: true, nullsFirst: false })

  if (error) {
    console.error("Error fetching restaurants:", error)
  }

  const restaurantsList = (restaurants as RestaurantRow[]) || []

  // Group by neighborhood
  const groupedByNeighborhood = restaurantsList.reduce((acc, restaurant) => {
    const neighborhood = restaurant.neighborhood || "Outros"
    if (!acc[neighborhood]) {
      acc[neighborhood] = []
    }
    acc[neighborhood].push(restaurant)
    return acc
  }, {} as Record<string, RestaurantRow[]>)

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-orange-600 to-red-600">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white hover:text-orange-100 transition-colors mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para Agenda
          </Link>
          <h1 className="text-3xl font-bold text-white">Restaurantes em Salvador</h1>
          <p className="text-orange-100 mt-2">
            Descubra os melhores restaurantes da capital baiana, curados por especialistas
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-zinc-600">
            {restaurantsList.length} restaurantes encontrados
          </p>
          <div className="flex gap-2 text-sm text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-purple-600"></span>
              Exame Casual 2025
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              CNN Brasil V&G
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-600"></span>
              Portal IN
            </span>
          </div>
        </div>

        {Object.entries(groupedByNeighborhood).map(([neighborhood, restaurants]) => (
          <div key={neighborhood} className="mb-12">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {neighborhood}
              <span className="text-sm font-normal text-zinc-500">
                ({restaurants.length})
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-zinc-900">{restaurant.name}</h3>
                      {restaurant.ranking && (
                        <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                          #{restaurant.ranking}
                        </span>
                      )}
                    </div>

                    {restaurant.cuisine_type && (
                      <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700 mb-3">
                        {restaurant.cuisine_type}
                      </span>
                    )}

                    {restaurant.description && (
                      <p className="text-sm text-zinc-600 mb-4 line-clamp-3">
                        {restaurant.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-zinc-500">
                      {restaurant.address && (
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="line-clamp-2">{restaurant.address}</span>
                        </div>
                      )}

                      {restaurant.hours && (
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="line-clamp-2">{restaurant.hours}</span>
                        </div>
                      )}

                      {restaurant.average_price && (
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Média: R$ {restaurant.average_price}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                      <span className="text-xs text-zinc-400">
                        {restaurant.source === 'exame_casual_2025' ? 'Exame Casual 2025' :
                         restaurant.source === 'cnn_brasil_vg' ? 'CNN Brasil V&G' :
                         'Portal IN'}
                      </span>
                      {restaurant.instagram_url && (
                        <a
                          href={restaurant.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}
