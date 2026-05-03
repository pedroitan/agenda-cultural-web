"use client";

import { useState } from "react";
import { LayoutDashboard, Calendar, BarChart3, Database, Home, Menu, X } from "lucide-react";
import RunScraperButton from "./RunScraperButton";
import ResetClicksButton from "./ResetClicksButton";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md border border-gray-200"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
          <p className="text-sm text-gray-500">Agenda Cultural Salvador</p>
        </div>
        
        <nav className="mt-4">
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Principal</p>
            <a href="/" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Home size={20} />
              <span>Voltar ao Site</span>
            </a>
          </div>

          <div className="px-4 py-2 mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Eventos</p>
            <a href="#eventos-aprovados" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <LayoutDashboard size={20} />
              <span>Eventos Aprovados</span>
            </a>
            <a href="#eventos-pendentes" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Calendar size={20} />
              <span>Eventos Pendentes</span>
            </a>
          </div>

          <div className="px-4 py-2 mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Scrapes</p>
            <a href="#scrapes-fonte" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Database size={20} />
              <span>Scrapes por Fonte</span>
            </a>
            <a href="#historico-scrapes" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <BarChart3 size={20} />
              <span>Histórico de Scrapes</span>
            </a>
          </div>

          <div className="px-4 py-2 mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ações</p>
            <div className="px-3 py-2">
              <RunScraperButton />
            </div>
            <a
              href="/admin/instagram"
              className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>+ Instagram (Texto)</span>
            </a>
            <a
              href="/admin/instagram-vision"
              className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>🤖 Instagram Vision</span>
            </a>
          </div>

          <div className="px-4 py-2 mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Analytics</p>
            <div className="px-3 py-2">
              <ResetClicksButton />
            </div>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
