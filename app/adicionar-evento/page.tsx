'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdicionarEventoPage() {
  const [formData, setFormData] = useState({
    title: '',
    start_datetime: '',
    category: '',
    venue_name: '',
    address: '',
    is_free: false,
    price: '',
    ticket_url: '',
    image_file: null as File | null,
    description: '',
    producer_name: '',
    contact_email: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [venues, setVenues] = useState<string[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    // Carregar categorias e venues do banco
    const loadOptions = async () => {
      try {
        const [categoriesRes, venuesRes] = await Promise.all([
          fetch('/api/events/categories'),
          fetch('/api/events/venues'),
        ]);

        const categoriesData = await categoriesRes.json();
        const venuesData = await venuesRes.json();

        setCategories(categoriesData.categories || []);
        setVenues(venuesData.venues || []);
      } catch (error) {
        console.error('Erro ao carregar opções:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB');
        return;
      }
      // Validar tipo
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Apenas JPG, PNG e WebP são permitidos');
        return;
      }
      setFormData({ ...formData, image_file: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setUploadProgress(0);

    try {
      let imageUrl = '';

      // Upload da imagem se houver
      if (formData.image_file) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', formData.image_file);

        const uploadResponse = await fetch('/api/upload/image', {
          method: 'POST',
          body: formDataUpload,
        });

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.message || 'Erro ao fazer upload da imagem');
        }

        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }

      // Enviar dados do evento
      const response = await fetch('/api/events/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl,
          image_file: undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar evento');
      }

      setSubmitSuccess(true);
      setFormData({
        title: '',
        start_datetime: '',
        category: '',
        venue_name: '',
        address: '',
        is_free: false,
        price: '',
        ticket_url: '',
        image_file: null,
        description: '',
        producer_name: '',
        contact_email: '',
      });
      setImagePreview('');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao enviar evento');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-3">
                Evento Enviado com Sucesso!
              </h1>
              <p className="text-zinc-600 mb-8 text-lg">
                Seu evento foi enviado para análise e será aprovado em até 24 horas.
                Você receberá um email de confirmação.
              </p>
              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl"
              >
                Voltar para a Agenda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-zinc-600 hover:text-zinc-900 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para a Agenda
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent mb-4">
            Adicione seu Evento
          </h1>
          <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
            Preencha os dados abaixo para adicionar seu evento à Agenda Cultural Salvador.
            Seu evento será analisado antes de ser publicado.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100">
          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-zinc-700 mb-2">
                Título do Evento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                placeholder="Ex: Show de Banda X"
              />
            </div>

            {/* Data e Horário */}
            <div>
              <label htmlFor="start_datetime" className="block text-sm font-semibold text-zinc-700 mb-2">
                Data e Horário <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="start_datetime"
                required
                value={formData.start_datetime}
                onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
              />
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-zinc-700 mb-2">
                Categoria
              </label>
              <input
                type="text"
                id="category"
                list="category-list"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                placeholder="Selecione ou digite uma categoria"
              />
              <datalist id="category-list">
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </datalist>
            </div>

            {/* Local */}
            <div>
              <label htmlFor="venue_name" className="block text-sm font-semibold text-zinc-700 mb-2">
                Local/Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="venue_name"
                list="venue-list"
                required
                value={formData.venue_name}
                onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                placeholder="Selecione ou digite um local"
              />
              <datalist id="venue-list">
                {venues.map((venue) => (
                  <option key={venue} value={venue}>
                    {venue}
                  </option>
                ))}
              </datalist>
            </div>

            {/* Endereço */}
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-zinc-700 mb-2">
                Endereço Completo
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                placeholder="Ex: Rua das Flores, 123, Centro"
              />
            </div>

            {/* Preço */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Preço
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-zinc-300 rounded-xl hover:border-violet-500 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="priceType"
                    checked={formData.is_free}
                    onChange={() => setFormData({ ...formData, is_free: true, price: '' })}
                    className="mr-3 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-zinc-700">Gratuito</span>
                </label>
                <label className="flex items-center p-3 border border-zinc-300 rounded-xl hover:border-violet-500 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="priceType"
                    checked={!formData.is_free}
                    onChange={() => setFormData({ ...formData, is_free: false })}
                    className="mr-3 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-zinc-700">Pago</span>
                </label>
                {!formData.is_free && (
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                    placeholder="Ex: R$ 50,00"
                  />
                )}
              </div>
            </div>

            {/* URL de Compra Ingresso */}
            <div>
              <label htmlFor="ticket_url" className="block text-sm font-semibold text-zinc-700 mb-2">
                URL de Compra Ingresso
              </label>
              <input
                type="url"
                id="ticket_url"
                value={formData.ticket_url}
                onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                placeholder="Ex: https://sympla.com.br/evento/..."
              />
            </div>

            {/* Upload de Imagem */}
            <div>
              <label htmlFor="image_file" className="block text-sm font-semibold text-zinc-700 mb-2">
                Imagem do Evento
              </label>
              <div className="border-2 border-dashed border-zinc-300 rounded-xl p-6 hover:border-violet-500 transition-all">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image_file: null });
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-zinc-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-zinc-600 mb-2">Arraste uma imagem ou clique para selecionar</p>
                    <p className="text-sm text-zinc-500">JPG, PNG ou WebP (máximo 5MB)</p>
                    <input
                      type="file"
                      id="image_file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('image_file')?.click()}
                      className="mt-3 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                    >
                      Selecionar Imagem
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-zinc-700 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all resize-none"
                placeholder="Descreva seu evento..."
              />
            </div>

            {/* Nome do Produtor */}
            <div>
              <label htmlFor="producer_name" className="block text-sm font-semibold text-zinc-700 mb-2">
                Nome do Produtor/Organizador
              </label>
              <input
                type="text"
                id="producer_name"
                value={formData.producer_name}
                onChange={(e) => setFormData({ ...formData, producer_name: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                placeholder="Ex: Produção Cultural XYZ"
              />
            </div>

            {/* Email de Contato */}
            <div>
              <label htmlFor="contact_email" className="block text-sm font-semibold text-zinc-700 mb-2">
                Email de Contato <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="contact_email"
                required
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all"
                placeholder="exemplo@email.com"
              />
            </div>

            {/* Botão de Enviar */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Evento'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
