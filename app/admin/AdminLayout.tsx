"use client";

import { useState } from "react";
import { LayoutDashboard, Calendar, Database, Home, Menu, X, Map, Megaphone, BarChart3 } from "lucide-react";
import RunScraperButton from "./RunScraperButton";
import ResetClicksButton from "./ResetClicksButton";

type Tab = "home" | "eventos" | "roteiros" | "anuncios" | "scrapes";

type AdminLayoutProps = {
  homeContent: React.ReactNode;
  eventosContent: React.ReactNode;
  roteirosContent: React.ReactNode;
  anunciosContent: React.ReactNode;
  scrapesContent: React.ReactNode;
  cityName?: string;
};

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "eventos", label: "Eventos", icon: Calendar },
  { id: "roteiros", label: "Roteiros", icon: Map },
  { id: "anuncios", label: "Anúncios", icon: Megaphone },
  { id: "scrapes", label: "Scrapes", icon: Database },
];

export default function AdminLayout({
  homeContent,
  eventosContent,
  roteirosContent,
  anunciosContent,
  scrapesContent,
  cityName = "Salvador",
}: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const contentMap: Record<Tab, React.ReactNode> = {
    home: homeContent,
    eventos: eventosContent,
    roteiros: roteirosContent,
    anuncios: anunciosContent,
    scrapes: scrapesContent,
  };

  const tabLabels: Record<Tab, string> = {
    home: "Dashboard",
    eventos: "Eventos",
    roteiros: "Roteiros",
    anuncios: "Anúncios",
    scrapes: "Scrapes",
  };

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
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-base font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-xs text-gray-400 mt-0.5">Agenda Cultural {cityName}</p>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                  isActive
                    ? "bg-purple-50 text-purple-700 border-r-2 border-purple-600"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={18} className={isActive ? "text-purple-600" : "text-gray-400"} />
                {tab.label}
              </button>
            );
          })}

          <div className="mt-4 mx-3 border-t border-gray-100 pt-4 space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">Ações Rápidas</p>
            <div className="px-1">
              <RunScraperButton />
            </div>
            <a
              href="/admin/instagram"
              className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LayoutDashboard size={16} className="text-gray-400" />
              Instagram (Texto)
            </a>
            <a
              href="/admin/instagram-vision"
              className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <BarChart3 size={16} className="text-gray-400" />
              Instagram Vision
            </a>
            <a
              href="/"
              className="flex items-center gap-2 px-2 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <Home size={16} className="text-gray-400" />
              Voltar ao Site
            </a>
          </div>

          <div className="mx-3 mt-3 px-1">
            <ResetClicksButton />
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
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-6xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6">{tabLabels[activeTab]}</h2>
          {contentMap[activeTab]}
        </div>
      </main>
    </div>
  );
}
