"use client";

import { useState } from "react";

export default function ResetClicksButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleClick() {
    if (!confirm("Zerar todos os cliques? Essa ação não pode ser desfeita.")) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/reset-clicks", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        alert("Erro: " + data.error);
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      title="Zerar todos os contadores de cliques"
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
        ${status === "loading"
          ? "cursor-not-allowed bg-gray-600 text-gray-400"
          : status === "success"
          ? "bg-green-700 text-white"
          : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
        }`}
    >
      {status === "loading" ? "⏳ Zerando..." : status === "success" ? "✓ Zerado!" : "🗑 Zerar Cliques"}
    </button>
  );
}
