import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ stories: [] });
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
      console.error('Supabase error:', error);
      return NextResponse.json({ stories: [] });
    }

    if (!data) {
      return NextResponse.json({ stories: [] });
    }

    const stories = data.map(file => ({
      name: file.name,
      url: `${supabaseUrl}/storage/v1/object/public/instagram-stories/${file.name}`,
      createdAt: file.created_at,
      size: file.metadata?.size,
    }));

    return NextResponse.json({ stories });

  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json({ stories: [] });
  }
}
