import { Bell } from "lucide-react";

export function ClientHeader({ viewLabel, numbers }) {
  return (
    <header className="h-24 bg-background/50 backdrop-blur-3xl border-b border-border-subtle sticky top-0 z-[90] px-12 flex items-center justify-between">
      <h2 className="text-sm font-black text-main uppercase tracking-[0.3em] opacity-80">{viewLabel}</h2>
      <div className="flex items-center gap-8">
        {numbers.some(n => n.status === "ativo") && (
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-500">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sistemas Operantes</span>
          </div>
        )}
        <div className="h-12 w-12 rounded-2xl bg-surface-up/50 border border-border-subtle flex items-center justify-center text-secondary hover:text-primary transition-all cursor-pointer relative group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <div className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary border-4 border-background" />
        </div>
      </div>
    </header>
  );
}
