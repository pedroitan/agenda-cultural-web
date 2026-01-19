'use client';

import { useState, useEffect } from 'react';

interface Story {
  name: string;
  url: string;
  createdAt: string;
  size?: number;
}

export function StoriesManager() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['week', 'free', 'weekend', 'today']);

  useEffect(() => {
    fetchStories();
  }, []);

  async function fetchStories() {
    try {
      setLoading(true);
      console.log('Fetching stories from API...');
      const response = await fetch('/api/generate-stories-on-demand');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('API response:', data);
      console.log('Stories count:', data.stories?.length || 0);
      setStories(data.stories || []);
    } catch (error) {
      console.error('Erro ao buscar stories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generateStories() {
    if (selectedTypes.length === 0) {
      alert('Selecione pelo menos um tipo de story');
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch('/api/generate-stories-on-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyTypes: selectedTypes }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Geração de Stories iniciada! Os Stories estarão disponíveis em alguns minutos.');
        setTimeout(fetchStories, 60000); // Atualizar após 1 minuto
      } else {
        alert('❌ Erro ao gerar stories: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao gerar stories:', error);
      alert('❌ Erro ao gerar stories');
    } finally {
      setGenerating(false);
    }
  }

  function toggleType(type: string) {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatSize(bytes?: number) {
    if (!bytes) return 'N/A';
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  const storyTypeLabels: Record<string, { label: string; color: string }> = {
    week: { label: 'Agenda da Semana', color: 'bg-purple-100 text-purple-700' },
    free: { label: 'Eventos Gratuitos', color: 'bg-green-100 text-green-700' },
    weekend: { label: 'Fim de Semana', color: 'bg-pink-100 text-pink-700' },
    today: { label: 'Hoje em Salvador', color: 'bg-orange-100 text-orange-700' },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">🎨 Gestão de Stories</h2>
          <p className="text-gray-600 text-sm mt-1">Gere e gerencie Stories automaticamente</p>
        </div>
        <button
          onClick={fetchStories}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? '🔄 Carregando...' : '🔄 Atualizar'}
        </button>
      </div>

      {/* Seleção de Tipos */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-black mb-3">Selecione os tipos de Stories:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(storyTypeLabels).map(([type, { label, color }]) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedTypes.includes(type)
                  ? `${color} border-current font-semibold`
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Botão Gerar */}
      <button
        onClick={generateStories}
        disabled={generating || selectedTypes.length === 0}
        className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
      >
        {generating ? '⏳ Gerando Stories...' : '🚀 Gerar Stories Selecionados'}
      </button>

      {/* Histórico */}
      <div>
        <h3 className="font-semibold text-black mb-3">📂 Histórico de Stories Gerados</h3>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : stories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum story gerado ainda. Clique em "Gerar Stories" para começar.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stories.map((story, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="aspect-[9/16] bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img
                    src={story.url}
                    alt={story.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-black truncate">{story.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(story.createdAt)}</p>
                  <p className="text-xs text-gray-500">{formatSize(story.size)}</p>
                  <div className="flex gap-2">
                    <a
                      href={story.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Ver
                    </a>
                    <a
                      href={story.url}
                      download
                      className="flex-1 text-center px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informações */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Como funciona:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Geração Automática:</strong> Stories são gerados todo dia às 04:00 BRT via GitHub Actions</li>
          <li>• <strong>Geração Manual:</strong> Use o botão acima para gerar sob demanda (requer configuração)</li>
          <li>• <strong>Histórico:</strong> Últimos 20 Stories gerados aparecem abaixo</li>
          <li>• <strong>Tempo:</strong> Geração leva ~2-3 minutos via GitHub Actions</li>
        </ul>
      </div>

      {/* Configuração Necessária */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-900 mb-2">⚙️ Configuração Necessária:</h4>
        <p className="text-sm text-yellow-800 mb-2">
          Para usar a geração manual, configure no Vercel:
        </p>
        <ul className="text-sm text-yellow-800 space-y-1 ml-4">
          <li>• <code className="bg-yellow-100 px-1 py-0.5 rounded">GITHUB_TOKEN</code> - Token do GitHub com permissão de Actions</li>
          <li>• <code className="bg-yellow-100 px-1 py-0.5 rounded">SUPABASE_SERVICE_KEY</code> - Service key do Supabase</li>
        </ul>
        <p className="text-xs text-yellow-700 mt-2">
          💡 Enquanto isso, aguarde a geração automática diária ou use o GitHub Actions manualmente.
        </p>
      </div>
    </div>
  );
}
