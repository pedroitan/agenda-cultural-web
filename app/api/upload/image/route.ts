import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'A imagem deve ter no máximo 5MB' },
        { status: 400 }
      );
    }

    // Validar tipo
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json(
        { message: 'Apenas JPG, PNG e WebP são permitidos' },
        { status: 400 }
      );
    }

    // Converter File para Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Gerar nome único do arquivo
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = file.type.split('/')[1];
    const fileName = `events/${timestamp}-${random}.${extension}`;

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('event-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      return NextResponse.json(
        { message: 'Erro ao fazer upload da imagem' },
        { status: 500 }
      );
    }

    // Obter URL pública da imagem
    const { data: { publicUrl } } = supabase
      .storage
      .from('event-images')
      .getPublicUrl(fileName);

    return NextResponse.json(
      { url: publicUrl, path: uploadData.path },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro no servidor:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
