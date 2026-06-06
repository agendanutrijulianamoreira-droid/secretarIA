import { Power, Settings, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Logo } from "./Logo";
import { NAV, NavItem, Btn } from "./ClientUI";

export function ClientSidebar({ client, view, setView, numPendentes, onBack }) {
  const initials = client.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <aside className="w-[240px] bg-surface border-r border-border flex flex-col fixed h-screen z-[100]">
      {/* Logo */}
      <div className="h-16 px-6 flex items-center border-b border-border">
        <Logo size={26} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        {NAV.map(item => (
          <div key={item.id} className="relative">
            <NavItem item={item} active={view === item.id} onClick={() => setView(item.id)} />
            {item.id === "ia" && numPendentes > 0 && (
              <span className="absolute top-2.5 right-3 h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center shadow-sm">
                {numPendentes}
              </span>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-3 space-y-1">
        {onBack && (
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-secondary hover:bg-surface-up hover:text-main transition-all text-[11px] font-semibold cursor-pointer"
          >
            <Settings size={14} />
            Admin Portal
          </button>
        )}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-up transition-all cursor-pointer group">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs border border-primary/20 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-main truncate leading-tight">{client.name}</p>
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{client.plan}</span>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400 hover:text-red-500 transition-all cursor-pointer"
            title="Sair"
          >
            <Power size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
