import { useState } from "react";
import { Toaster } from "sonner";
import { AddPhrasePage } from "./components/AddPhrasePage";
import { ViewPhrasesPage } from "./components/ViewPhrasesPage";
import { DashboardPage } from "./components/DashboardPage";
import { SettingsModal } from "./components/SettingsModal";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "./components/ui/button";
import { Settings, Plus, LayoutGrid, BarChart2 } from "lucide-react";

type Page = "add" | "view" | "dashboard";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [showSettings, setShowSettings] = useState(false);

  const userSettings = useQuery(api.phrases.getSettingsForUser);
  const weeklyCount = useQuery(api.phrases.getWeeklyCount);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Phrasebook
            </h1>

            <nav className="flex items-center gap-1">
              <Button
                variant={currentPage === "dashboard" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("dashboard")}
                className="text-sm"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={currentPage === "view" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("view")}
                className="text-sm"
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Collection
              </Button>
              <Button
                variant={currentPage === "add" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("add")}
                className="text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Phrase
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground hidden sm:block">
              {weeklyCount !== undefined && `${weeklyCount} phrases this week`}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="text-muted-foreground hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === "dashboard" && <DashboardPage />}
        {currentPage === "add" && <AddPhrasePage onPhraseAdded={() => setCurrentPage("view")} />}
        {currentPage === "view" && <ViewPhrasesPage />}
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userSettings={userSettings}
      />
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}
