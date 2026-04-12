"use client";

import { useState } from "react";

export default function RunScraperButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleClick() {
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/run-scraper", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Scraper iniciado!");
      } else {
        setStatus("error");
        setMessage(data.error || "Erro desconhecido");
      }
    } catch {
      setStatus("error");
      setMessage("Falha na requisição");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClick}
        disabled={status === "loading"}
        className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors
          ${status === "loading"
            ? "cursor-not-allowed bg-gray-600"
            : status === "success"
            ? "bg-green-600 hover:bg-green-700"
            : status === "error"
            ? "bg-red-600 hover:bg-red-700"
            : "bg-indigo-600 hover:bg-indigo-700"
          }`}
      >
        {status === "loading" ? "⏳ Iniciando..." : "▶ Rodar Scraper"}
      </button>
      {message && (
        <span
          className={`text-sm ${status === "success" ? "text-green-400" : "text-red-400"}`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
