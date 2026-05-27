import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const workflows = ['scrape-sympla.yml', 'scrape-elcabong.yml', 'scrape-salvadordabahia.yml', 'scrape-instagram.yml'];

  if (!token || !owner || !repo) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN, GITHUB_REPO_OWNER ou GITHUB_REPO_NAME não configurados" },
      { status: 500 }
    );
  }

  const results = await Promise.all(
    workflows.map(async (workflow) => {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ref: "main" }),
        }
      );
      return { workflow, status: res.status };
    })
  );

  const failed = results.filter(r => r.status !== 204);
  
  if (failed.length === 0) {
    return NextResponse.json({ ok: true, message: "Todos os scrapers iniciados com sucesso!" });
  }

  return NextResponse.json(
    { error: `${failed.length} scrapers falharam`, details: failed },
    { status: 207 }
  );
}
