import { Bell, Search, ChevronRight } from "lucide-react";

function getFormattedDate() {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "numeric", month: "short" }).format(new Date());
}

export function ClientHeader({ viewLabel, numbers }) {
  const hasActive = numbers.some(n => n.status === "ativo");

  return (
    <header className="h-16 bg-surface border-b border-border sticky top-0 z-[90] px-6 flex items-center gap-4">
      {/* Search bar */}
      <div className="flex-1 max-w-sm relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" strokeWidth={2} />
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full pl-8 pr-4 py-2 rounded-lg bg-surface-up border border-border text-sm text-main placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
      </div>

      <div className="flex-1" />

      {/* Date */}
      <span className="text-xs text-tertiary font-medium hidden md:block capitalize">{getFormattedDate()}</span>

      {/* System status */}
      {hasActive && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:block">Online</span>
        </div>
      )}

      {/* Notifications */}
      <button className="relative h-9 w-9 rounded-lg bg-surface-up border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-primary/40 transition-all cursor-pointer">
        <Bell size={16} strokeWidth={2} />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary border-2 border-surface" />
      </button>
    </header>
  );
}
