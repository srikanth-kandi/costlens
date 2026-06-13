import { useLocation } from "react-router-dom";
import { Bell, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "Executive HR cost overview" },
  "/meetings": {
    title: "Meeting Explorer",
    subtitle: "Explore and manage all calendar meetings",
  },
  "/attribution": {
    title: "AI Attribution Playground",
    subtitle: "Test AI-powered project attribution",
  },
  "/projects": {
    title: "Project Cost Analytics",
    subtitle: "Deep-dive into project-level HR expenditure",
  },
  "/anomalies": {
    title: "Anomaly Detection Center",
    subtitle: "Monitor cost anomalies and budget alerts",
  },
};

export default function Header() {
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const page = pageTitles[pathname] ?? { title: "CostLens AI", subtitle: "" };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shrink-0">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{page.title}</h1>
        {page.subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{page.subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => queryClient.invalidateQueries()}
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
        </Button>
        <Button variant="ghost" size="icon" title="Notifications">
          <Bell className="w-4 h-4 text-slate-500" />
        </Button>
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full text-white text-xs font-bold ml-1">
          CL
        </div>
      </div>
    </header>
  );
}
