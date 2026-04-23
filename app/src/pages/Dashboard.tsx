import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  Repeat, 
  Settings, 
  Search, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Bot, 
  CalendarCheck,
  UserCheck,
  Zap
} from 'lucide-react';

// --- COMPONENTES MENORES (Partes do Dashboard) ---

const SidebarItem = ({ icon: Icon, label, active }: any) => (
  <button className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${active ? 'bg-[#EAF0EC] text-[#7A8B82] font-medium' : 'text-gray-500 hover:bg-gray-50'}`}>
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass, bgClass }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <h3 className="text-3xl font-semibold text-gray-800">{value}</h3>
      <p className={`text-xs mt-2 font-medium ${colorClass}`}>{subtitle}</p>
    </div>
    <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

const AttentionCard = ({ patient, issue, time, type }: any) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between hover:border-[#B67A62] transition-colors cursor-pointer mb-3">
    <div className="flex items-start space-x-3">
      <div className={`mt-1 p-2 rounded-full ${type === 'urgent' ? 'bg-[#F5EBE6] text-[#B67A62]' : 'bg-gray-100 text-gray-600'}`}>
        <AlertCircle size={16} />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-800">{patient}</h4>
        <p className="text-xs text-gray-500 mt-1">{issue}</p>
      </div>
    </div>
    <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
  </div>
);

const AILogItem = ({ action, time, isSuccess }: any) => (
  <div className="flex items-start space-x-3 mb-4">
    <div className="mt-1">
      {isSuccess ? (
        <CheckCircle2 size={16} className="text-[#7A8B82]" />
      ) : (
        <Bot size={16} className="text-gray-400" />
      )}
    </div>
    <div>
      <p className="text-sm text-gray-700">{action}</p>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL (O Layout Final) ---

export function Dashboard() {
  return (
    <div className="min-h-screen bg-[#FAFAF7] flex font-sans w-full">
      
      {/* LADO ESQUERDO: Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 shrink-0 hidden lg:flex">
        <div className="flex items-center space-x-2 mb-10">
          <div className="bg-[#7A8B82] p-2 rounded-lg">
            <Zap size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800 tracking-tight">Secretar<span className="text-[#7A8B82]">IA</span></h1>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Visão Geral" active />
          <SidebarItem icon={MessageSquare} label="Live Chat (Humano)" />
          <SidebarItem icon={Users} label="Pacientes (CRM)" />
          <SidebarItem icon={Repeat} label="Follow-ups & NPS" />
          <SidebarItem icon={Settings} label="Diretrizes da IA" />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#F5EBE6] flex items-center justify-center text-[#B67A62] font-semibold">
              JM
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">Dra. Juliana</p>
              <p className="text-xs text-gray-500">Administradora</p>
            </div>
          </div>
        </div>
      </aside>

      {/* LADO DIREITO: Conteúdo Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center space-x-6">
            <h2 className="text-lg font-medium text-gray-800">Bom dia, Juliana! 🌿</h2>
            <div className="hidden md:flex items-center space-x-4 text-xs font-medium bg-[#FAFAF7] px-4 py-2 rounded-full">
              <div className="flex items-center text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                WhatsApp API: Online
              </div>
              <div className="w-px h-3 bg-gray-300"></div>
              <div className="flex items-center text-emerald-600">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                n8n: Operacional
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar paciente..." 
                className="pl-10 pr-4 py-2 bg-[#FAFAF7] border-none rounded-full text-sm focus:ring-2 focus:ring-[#7A8B82] outline-none w-64"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-[#B67A62] transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#B67A62] rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Área de Scroll do Dashboard */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* Métricas Vitais */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <MetricCard 
              title="Leads na Triagem" 
              value="12" 
              subtitle="Conversando com a IA agora" 
              icon={Bot} 
              colorClass="text-blue-600" 
              bgClass="bg-blue-50" 
            />
            <MetricCard 
              title="Aguardando Humano" 
              value="3" 
              subtitle="Solicitaram preço / Urgente" 
              icon={AlertCircle} 
              colorClass="text-[#B67A62]" 
              bgClass="bg-[#F5EBE6]" 
            />
            <MetricCard 
              title="Follow-ups Executados" 
              value="28" 
              subtitle="NPS e Resgates de inativos" 
              icon={UserCheck} 
              colorClass="text-purple-600" 
              bgClass="bg-purple-50" 
            />
            <MetricCard 
              title="Agendamentos Hoje" 
              value="5" 
              subtitle="Marcados com sucesso" 
              icon={CalendarCheck} 
              colorClass="text-[#7A8B82]" 
              bgClass="bg-[#EAF0EC]" 
            />
          </div>

          {/* Split View: Fila de Atenção vs Log da IA */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* Lado Esquerdo: Fila de Atenção */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Fila de Atenção</h3>
                <span className="bg-[#F5EBE6] text-[#B67A62] text-xs font-bold px-3 py-1 rounded-full">3 Pendentes</span>
              </div>
              <div className="space-y-1">
                <AttentionCard 
                  patient="Ana Paula Ferreira" 
                  issue="Solicitou valor do Protocolo 3m (Escalado para Humano)" 
                  time="Há 5 min" 
                  type="urgent" 
                />
                <AttentionCard 
                  patient="Camila Rodrigues" 
                  issue="Retorno de NPS Baixo (Relatou falta de energia)" 
                  time="Há 12 min" 
                  type="urgent" 
                />
                <AttentionCard 
                  patient="Beatriz Souza" 
                  issue="Dúvida complexa sobre o Método REINO" 
                  time="Há 28 min" 
                  type="normal" 
                />
              </div>
              <button className="w-full mt-4 py-2 text-sm text-[#7A8B82] font-medium hover:bg-[#EAF0EC] rounded-xl transition-colors">
                Ver todos os chats escalados
              </button>
            </div>

            {/* Lado Direito: Feed de Atividade */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Feed de Atividade da IA</h3>
              <div className="relative pl-2">
                {/* Linha vertical do tempo */}
                <div className="absolute left-4 top-2 bottom-0 w-px bg-gray-100"></div>
                
                <AILogItem 
                  action="Lívia processou 3 áudios de Júlia via Whisper e extraiu sintomas de SOP." 
                  time="Agora" 
                  isSuccess={false} 
                />
                <AILogItem 
                  action="Agendamento de Consulta Avaliativa confirmado para Mariana (14:00)." 
                  time="Há 10 min" 
                  isSuccess={true} 
                />
                <AILogItem 
                  action="Disparo de mensagem de aniversário enviado para paciente inativa (Carla)." 
                  time="Há 45 min" 
                  isSuccess={true} 
                />
                <AILogItem 
                  action="Triagem iniciada via Meta Ads (Lead: Fernanda). Aplicando Método REINO." 
                  time="Há 1 hora" 
                  isSuccess={false} 
                />
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
