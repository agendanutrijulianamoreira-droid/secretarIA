import { Star, Zap, CheckCircle2, Activity } from "lucide-react";
import { PLAN_META } from "../../design-system/tokens";
import { PageTitle, Btn } from "../../components/shared/ClientUI";

const PLANS = [
  { p: "Starter",    price: "197",   impl: "900",   wpp: 1, f: ["IA de Texto", "1 Número WhatsApp", "CRM de Leads", "Suporte 24h"] },
  { p: "Pro",        price: "497",   impl: "1.200", wpp: 3, f: ["IA Multimodal", "3 Números WhatsApp", "CRM Completo", "Campanhas Automáticas", "Google Agenda"] },
  { p: "Enterprise", price: "997",   impl: "2.500", wpp: 5, f: ["Tudo do Pro", "Ilimitados Números", "Workflows Custom", "Onboarding VIP"] },
];

export default function PlanoView({ client, invoices }) {
  return (
    <div className="space-y-12 animate-fade-in">
      <PageTitle icon={Star} title="Gestão de Assinatura" subtitle="Veja seus recursos ativos e histórico de faturamento." />

      <div className="bento-card bg-surface-up/20 border-primary/20 flex flex-col md:flex-row items-center justify-between p-12 gap-8">
        <div className="flex-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">Sua Licença Ativa</span>
          <h2 className="text-6xl font-black text-main tracking-tighter mt-6">{client.plan}</h2>
          <p className="text-secondary font-medium mt-4 text-lg">Seu ecossistema está operando em alta performance.</p>
        </div>
        <div className="h-40 w-40 rounded-[40px] bg-primary/5 flex items-center justify-center border border-primary/10 shadow-2xl shadow-primary/10">
          <Zap size={80} className="text-primary animate-pulse" strokeWidth={1} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map(({ p, price, f }) => {
          const isCurrent = client.plan === p;
          return (
            <div key={p} className={`bento-card group flex flex-col h-full ${isCurrent ? 'border-primary/50 shadow-primary/10' : 'opacity-80'}`}>
              <div className="premium-glow" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-xl font-black text-main tracking-tight uppercase">{p}</h4>
                  {isCurrent && <div className="h-2 w-2 rounded-full bg-primary animate-ping" />}
                </div>
                <div className="flex items-baseline gap-1 mb-10">
                  <span className="text-sm font-bold text-tertiary">R$</span>
                  <span className="text-5xl font-black text-main tracking-tighter">{price}</span>
                  <span className="text-tertiary font-bold text-[10px] uppercase tracking-widest">/mês</span>
                </div>
                <div className="space-y-4 mb-12 flex-1">
                  {f.map(x => (
                    <div key={x} className="flex items-start gap-3 text-xs font-medium text-secondary">
                      <CheckCircle2 size={16} className="text-primary mt-0.5" strokeWidth={3} />
                      <span>{x}</span>
                    </div>
                  ))}
                </div>
                {!isCurrent
                  ? <Btn variant="ghost" className="w-full">Migrar para {p}</Btn>
                  : <div className="w-full py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 rounded-2xl border border-primary/20">Plano Atual</div>
                }
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
          <Activity size={20} className="text-primary" /> Histórico de Faturamento
        </h3>
        <div className="bento-card p-0 overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-20 text-center text-tertiary font-medium italic">Nenhuma cobrança registrada.</div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {invoices.map(inv => (
                <div key={inv.id} className="p-8 flex items-center gap-8 group hover:bg-surface-up/30 transition-all cursor-pointer">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${inv.status === 'pago' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {inv.status === "pago" ? <CheckCircle2 size={24} /> : <Activity size={24} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-main">{inv.descricao}</p>
                    <p className="text-[10px] text-tertiary font-black uppercase tracking-widest mt-1.5">{inv.due_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-main tracking-tight">R$ {Number(inv.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest mt-1 inline-block ${inv.status === 'pago' ? 'text-emerald-500' : 'text-amber-500'}`}>{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
