import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Priorizar SUPABASE_SERVICE_ROLE_KEY que é a que está configurada no Vercel
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { storyTypes } = await request.json();
    
    if (!storyTypes || !Array.isArray(storyTypes)) {
      return NextResponse.json(
        { error: 'storyTypes deve ser um array' },
        { status: 400 }
      );
    }

    // Trigger GitHub Actions workflow
    const githubToken = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPOSITORY || 'pedroitan/agenda-cultural-web';
    
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub token não configurado' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.github.com/repos/${repo}/actions/workflows/generate-stories.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            story_types: storyTypes.join(','),
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub API error:', error);
      return NextResponse.json(
        { error: 'Erro ao disparar workflow do GitHub' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Geração de Stories iniciada',
      types: storyTypes,
    });

  } catch (error) {
    console.error('Error generating stories:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar stories' },
      { status: 500 }
    );
  }
}

// GET para listar Stories gerados
export async function GET() {
  try {
    // Debug: verificar variáveis de ambiente
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_KEY;
    const hasServiceRoleKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Environment check:', {
      hasServiceKey,
      hasServiceRoleKey,
      hasAnonKey,
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    });

    if (!supabaseUrl || !supabaseKey) {
      console.log('Missing Supabase credentials');
      return NextResponse.json({ 
        stories: [],
        debug: { hasServiceKey, hasServiceRoleKey, hasAnonKey }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .storage
      .from('instagram-stories')
      .list('', {
        limit: 20,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return NextResponse.json({ 
        stories: [],
        error: error.message,
        debug: { hasServiceKey, hasServiceRoleKey, hasAnonKey }
      });
    }

    if (!data || data.length === 0) {
      console.log('No stories found in bucket');
      return NextResponse.json({ 
        stories: [],
        debug: { hasServiceKey, hasServiceRoleKey, hasAnonKey, dataLength: data?.length || 0 }
      });
    }

    console.log(`Found ${data.length} stories in bucket`);

    const stories = data
      .filter(file => file.name.endsWith('.png')) // Apenas PNGs
      .map(file => ({
        name: file.name,
        url: `${supabaseUrl}/storage/v1/object/public/instagram-stories/${file.name}`,
        createdAt: file.created_at,
        size: file.metadata?.size,
      }));

    console.log(`Returning ${stories.length} stories`);
    return NextResponse.json({ stories });

  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ 
      stories: [],
      error: String(error)
    });
  }
}
