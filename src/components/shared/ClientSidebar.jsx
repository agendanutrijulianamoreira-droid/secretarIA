import { Power, Settings } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Logo } from "./Logo";
import { NAV, NavItem, Btn } from "./ClientUI";

export function ClientSidebar({ client, view, setView, numPendentes, onBack }) {
  const initials = client.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <aside className="w-[300px] glass-card border-r-0 border-l-0 rounded-none flex flex-col fixed h-screen z-[100]">
      <div className="p-10 flex items-center justify-between">
        <Logo size={32} />
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" />
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center gap-4 p-5 rounded-3xl bg-surface-up/30 border border-border-subtle group hover:border-primary/20 transition-all cursor-pointer">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-main truncate leading-none uppercase tracking-tight">{client.name}</h4>
            <div className="mt-2">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">{client.plan}</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {NAV.map(item => (
          <div key={item.id} className="relative">
            <NavItem item={item} active={view === item.id} onClick={() => setView(item.id)} />
            {item.id === "ia" && numPendentes > 0 && (
              <span className="absolute top-3.5 right-5 h-5 w-5 rounded-full bg-cta text-white text-[10px] font-black flex items-center justify-center shadow-lg shadow-cta/20 ring-4 ring-surface">
                {numPendentes}
              </span>
            )}
          </div>
        ))}
      </nav>

      <div className="p-8 space-y-4">
        {onBack && (
          <Btn variant="ghost" className="w-full" onClick={onBack} icon={Settings}>Admin Portal</Btn>
        )}
        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all cursor-pointer"
        >
          <Power size={14} strokeWidth={3} /> Logout
        </button>
      </div>
    </aside>
  );
}
