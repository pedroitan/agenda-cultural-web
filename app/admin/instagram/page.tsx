"use client"

import { useState } from "react"
import Link from "next/link"

export default function InstagramAdminPage() {
  const [postText, setPostText] = useState("")
  const [postUrl, setPostUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; events?: any[] } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/instagram/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postText, postUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: `✅ ${data.count} eventos adicionados com sucesso!`,
          events: data.events,
        })
        setPostText("")
        setPostUrl("")
      } else {
        const errorMsg = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error
        setResult({
          success: false,
          message: `❌ Erro: ${errorMsg}`,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "❌ Erro ao processar post",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Instagram - Adicionar Eventos</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Cole o texto de um post do Instagram para extrair eventos automaticamente
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-lg bg-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-300"
          >
            ← Voltar
          </Link>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="postUrl" className="block text-sm font-medium text-zinc-700">
                URL do Post (opcional)
              </label>
              <input
                type="url"
                id="postUrl"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://www.instagram.com/p/..."
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-black placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="postText" className="block text-sm font-medium text-zinc-700">
                Texto do Post *
              </label>
              <textarea
                id="postText"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                required
                rows={15}
                placeholder="Cole aqui o texto completo do post do Instagram...

Exemplo:
♫ Agenda de #Sexta, 16 de Janeiro ♫

Projeto: Baile da Massa Real
Local: 2º andar do Bombar, Rio Vermelho
Horário: 21h
_____________________________
Atrações: Magary e Convidados
Local: Mariposa Vilas
Quanto: R$40
Horário: 20h"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-mono text-black placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Cole o texto exatamente como aparece no Instagram, incluindo emojis e separadores
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !postText.trim()}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {loading ? "Processando..." : "Extrair e Adicionar Eventos"}
            </button>
          </form>

          {result && (
            <div
              className={`mt-6 rounded-lg border p-4 ${
                result.success
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <p className="font-medium">{result.message}</p>
              {result.events && result.events.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm">
                  {result.events.map((event, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>
                        {event.title} - {new Date(event.start_datetime).toLocaleString("pt-BR")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Como usar</h2>
          <ol className="mt-4 space-y-2 text-sm text-zinc-600">
            <li className="flex gap-2">
              <span className="font-semibold text-zinc-900">1.</span>
              <span>Abra o Instagram no celular ou navegador</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-zinc-900">2.</span>
              <span>Vá até o post de @agendaalternativasalvador com os eventos</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-zinc-900">3.</span>
              <span>Copie todo o texto do post (incluindo título e separadores)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-zinc-900">4.</span>
              <span>Cole no campo acima e clique em "Extrair e Adicionar Eventos"</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-zinc-900">5.</span>
              <span>Os eventos serão processados e adicionados automaticamente ao site!</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
