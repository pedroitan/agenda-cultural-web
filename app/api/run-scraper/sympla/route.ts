import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_REPO_OWNER;
  const repo = process.env.GITHUB_REPO_NAME;
  const workflow = "scrape-sympla.yml";

  if (!token || !owner || !repo) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN, GITHUB_REPO_OWNER ou GITHUB_REPO_NAME não configurados" },
      { status: 500 }
    );
  }

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

  if (res.status === 204) {
    return NextResponse.json({ ok: true, message: "Scraper Sympla iniciado com sucesso!" });
  }

  const body = await res.text();
  return NextResponse.json(
    { error: `GitHub API retornou ${res.status}: ${body}` },
    { status: res.status }
  );
}
