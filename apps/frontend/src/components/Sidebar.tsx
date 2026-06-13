import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  BrainCircuit,
  FolderKanban,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/meetings", label: "Meetings", icon: CalendarDays, end: false },
  {
    to: "/attribution",
    label: "AI Attribution",
    icon: BrainCircuit,
    end: false,
  },
  { to: "/projects", label: "Projects", icon: FolderKanban, end: false },
  { to: "/anomalies", label: "Anomalies", icon: AlertTriangle, end: false },
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-slate-900 text-white border-r border-slate-800 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-lg">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight">
            CostLens AI
          </span>
          <p className="text-xs text-slate-400 leading-none mt-0.5">
            HR Cost Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          Powered by Gemini 2.5 Flash
        </p>
      </div>
    </aside>
  );
}
