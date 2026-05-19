"use client"

import { useState } from "react"
import Link from "next/link"

export default function InstagramVisionPage() {
  const [images, setImages] = useState<File[]>([])
  const [channelName, setChannelName] = useState("@agendaalternativasalvador")
  const [channelLogoUrl, setChannelLogoUrl] = useState("")
  const [channelLogo, setChannelLogo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; events?: any[] } | null>(null)

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Resize if too large
          const maxDimension = 1920
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension
              width = maxDimension
            } else {
              width = (width / height) * maxDimension
              height = maxDimension
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')!
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            'image/jpeg',
            0.85 // 85% quality
          )
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setLoading(true)
      
      // Compress images
      const compressedFiles = await Promise.all(
        files.map(file => compressImage(file))
      )
      
      setImages(compressedFiles)
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setChannelLogo(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      
      // Add images
      images.forEach((image) => {
        formData.append("images", image)
      })
      
      // Add channel info
      formData.append("channelName", channelName)
      
      // Add channel logo URL if provided (preferred over file upload)
      if (channelLogoUrl.trim()) {
        formData.append("channelLogoUrl", channelLogoUrl.trim())
      } else if (channelLogo) {
        formData.append("channelLogo", channelLogo)
      }

      const response = await fetch("/api/instagram/vision", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        let message = `✅ ${data.count} eventos extraídos e adicionados com sucesso!`
        
        // Add debug info if available
        if (data.debug) {
          message += `\n\n📊 Debug Info:`
          message += `\n- Imagens processadas: ${data.debug.imagesProcessed}`
          message += `\n- Gemini API configurada: ${data.debug.geminiApiConfigured ? 'Sim' : 'Não'}`
          message += `\n- Total de eventos salvos: ${data.debug.totalEventsExtracted}`
          
          if (data.debug.perImage && data.debug.perImage.length > 0) {
            message += `\n\n🖼️ Por imagem:`
            data.debug.perImage.forEach((img: any, idx: number) => {
              const status = img.error ? `❌ erro: ${img.error}` : `extraídos: ${img.extracted} | salvos: ${img.saved} | pulados: ${img.skipped}`
              message += `\n  ${idx + 1}. ${img.name} → ${status}`
            })
          }
          
          if (data.debug.errors && data.debug.errors.length > 0) {
            message += `\n\n❌ Erros encontrados:`
            data.debug.errors.forEach((err: string) => {
              message += `\n- ${err}`
            })
          }
        }
        
        setResult({
          success: true,
          message,
          events: data.events,
        })
        setImages([])
        setChannelLogo(null)
        // Reset file inputs
        const imageInput = document.getElementById("images") as HTMLInputElement
        const logoInput = document.getElementById("logo") as HTMLInputElement
        if (imageInput) imageInput.value = ""
        if (logoInput) logoInput.value = ""
        // Keep channelLogoUrl so user doesn't have to re-paste it
      } else {
        setResult({
          success: false,
          message: `❌ Erro: ${data.error}`,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "❌ Erro ao processar imagens",
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
            <h1 className="text-2xl font-bold text-zinc-900">Instagram Vision - Upload de Imagens</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Faça upload de prints de stories/posts do Instagram para extrair eventos automaticamente
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="channelName" className="block text-sm font-medium text-zinc-700">
                Nome do Canal do Instagram *
              </label>
              <input
                type="text"
                id="channelName"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                required
                placeholder="@agendaalternativasalvador"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-black placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Este será usado como fonte dos eventos no banco de dados
              </p>
            </div>

            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-zinc-700">
                URL da Foto de Perfil do Canal
              </label>
              <input
                type="url"
                id="logoUrl"
                value={channelLogoUrl}
                onChange={(e) => setChannelLogoUrl(e.target.value)}
                placeholder="https://instagram.com/... (cole a URL da foto de perfil)"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-black placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Clique direito na foto de perfil do canal no Instagram → "Copiar endereço da imagem"
              </p>
              {channelLogoUrl && (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={channelLogoUrl} alt="logo" className="w-10 h-10 rounded-full object-cover border border-zinc-200" />
                  <span className="text-sm text-green-600">✓ URL configurada</span>
                </div>
              )}
              {!channelLogoUrl && (
                <div className="mt-3">
                  <label htmlFor="logo" className="block text-xs text-zinc-500 mb-1">Ou faça upload do arquivo:</label>
                  <input
                    type="file"
                    id="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-black file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {channelLogo && (
                    <div className="mt-1 flex items-center gap-2 text-sm text-green-600">
                      <span>✓</span>
                      <span>{channelLogo.name}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="images" className="block text-sm font-medium text-zinc-700">
                Imagens de Stories/Posts *
              </label>
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-black file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Selecione uma ou mais imagens. Elas serão comprimidas automaticamente antes do upload.
              </p>
              {loading && images.length === 0 && (
                <div className="mt-2 text-sm text-blue-600">
                  ⏳ Comprimindo imagens...
                </div>
              )}
              {images.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium text-zinc-700">
                    {images.length} imagem(ns) selecionada(s) e comprimida(s):
                  </p>
                  <ul className="space-y-1 text-sm text-zinc-600">
                    {images.map((img, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{img.name} ({(img.size / 1024).toFixed(0)} KB)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || images.length === 0 || !channelName.trim()}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {loading ? "Processando com Gemini Vision..." : "Extrair Eventos das Imagens"}
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
                <ul className="mt-3 space-y-2 text-sm">
                  {result.events.map((event, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <div>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-green-700">
                          {new Date(event.start_datetime).toLocaleString("pt-BR")} • {event.venue_name}
                        </div>
                      </div>
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
              <span>Tire prints (screenshots) dos stories ou posts do Instagram com eventos</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-zinc-900">2.</span>
              <span>Nomeie os arquivos em ordem cronológica (ex: story1.png, story2.png, story3.png)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-zinc-900">3.</span>
              <span>Digite o nome do canal do Instagram (ex: @agendaalternativasalvador)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-zinc-900">4.</span>
              <span>Faça upload do logo do canal (opcional, mas recomendado)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-zinc-900">5.</span>
              <span>Selecione todas as imagens de uma vez (em ordem cronológica)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-zinc-900">6.</span>
              <span>Clique em "Extrair Eventos" e aguarde o processamento</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-zinc-900">7.</span>
              <span>Os eventos serão extraídos automaticamente usando IA (Gemini Vision)!</span>
            </li>
          </ol>
          
          <div className="mt-4 rounded-lg bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">💡 Dica:</p>
            <p className="mt-1 text-sm text-blue-800">
              As imagens são processadas em sequência, mantendo o contexto de data entre elas. 
              Certifique-se de que estão em ordem cronológica para melhor precisão na extração de datas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
