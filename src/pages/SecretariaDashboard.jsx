import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Repeat, 
  Settings, 
  Search, 
  Bell, 
  AlertCircle, 
  Bot, 
  CalendarCheck,
  UserCheck,
  Zap,
  Power
} from 'lucide-react';

const T = {
  bg: "#0A0B10",
  surface: "#161B22",
  up: "#1F2630",
  border: "#30363D",
  borderSt: "#484F58",
  green: "#2EB67D",
  cyan: "#00D1FF",
  red: "#F85149",
  ink: "#F0F6FC",
  inkSec: "#8B949E",
  inkTert: "#484F58",
};

export default function SecretariaDashboard({ user, logout, setView, activeView, children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar Fixa */}
      <aside style={{ 
        width: '260px', 
        background: T.surface, 
        borderRight: `1px solid ${T.border}`, 
        display: 'flex', 
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100
      }}>
        <div style={{ padding: '30px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: T.cyan, padding: '8px', borderRadius: '10px', boxShadow: `0 0 20px ${T.cyan}44` }}>
            <Zap size={20} color="#000" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Secretar<span style={{ color: T.cyan }}>IA</span>
          </h1>
        </div>

        <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavItem icon={LayoutDashboard} label="Visão Geral" active={activeView === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={Users} label="Pacientes (CRM)" active={activeView === 'clients'} onClick={() => setView('clients')} />
          <NavItem icon={Bell} label="Alertas" active={activeView === 'alerts'} onClick={() => setView('alerts')} />
          <NavItem icon={Repeat} label="Estatísticas" active={activeView === 'stats'} onClick={() => setView('stats')} />
          <NavItem icon={Settings} label="Configurações" active={activeView === 'settings'} onClick={() => setView('settings')} />
        </nav>

        <div style={{ padding: '20px 16px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '0 8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: T.up, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: `1px solid ${T.border}` }}>
              {user?.email?.[0].toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Dra. Juliana</p>
              <p style={{ fontSize: '11px', color: T.inkSec }}>Administradora</p>
            </div>
          </div>
          <button onClick={logout} style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '10px', 
            background: 'transparent', 
            border: `1px solid ${T.red}44`, 
            color: T.red, 
            fontSize: '12px', 
            fontWeight: '600', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <Power size={14} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal com Scroll */}
      <main style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        
        {/* Header Superior */}
        <header style={{ 
          height: '70px', 
          background: `${T.bg}cc`, 
          backdropFilter: 'blur(10px)', 
          borderBottom: `1px solid ${T.border}`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Dashboard <span style={{ color: T.inkSec, fontWeight: '400', margin: '0 8px' }}>/</span> {activeView === 'dashboard' ? 'Visão Geral' : activeView}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: T.surface, padding: '6px 12px', borderRadius: '20px', fontSize: '11px', border: `1px solid ${T.border}` }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2EB67D', boxShadow: '0 0 10px #2EB67D' }}></div>
              WhatsApp Online
            </div>
            <Search size={18} color={T.inkSec} style={{ cursor: 'pointer' }} />
            <Bell size={18} color={T.inkSec} style={{ cursor: 'pointer' }} />
          </div>
        </header>

        {/* Área de Conteúdo */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {activeView === 'dashboard' && <DefaultDashboard />}
          {activeView === 'manifesto' && <ManifestoView />}
          {activeView !== 'dashboard' && activeView !== 'manifesto' && children}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      background: active ? `${T.cyan}11` : 'transparent',
      border: 'none',
      color: active ? T.cyan : T.inkSec,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'left'
    }}>
      <Icon size={18} color={active ? T.cyan : T.inkSec} />
      <span style={{ fontSize: '14px', fontWeight: active ? '600' : '500' }}>{label}</span>
    </button>
  );
}

function DefaultDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <MetricCard title="Triagens Ativas" value="14" trend="+2 hoje" icon={Bot} color={T.cyan} />
        <MetricCard title="Escalados Humano" value="03" trend="Urgente" icon={AlertCircle} color={T.red} />
        <MetricCard title="Consultas Marcadas" value="08" trend="Semana" icon={CalendarCheck} color={T.green} />
        <MetricCard title="Taxa de Conversão" value="92%" trend="+4%" icon={UserCheck} color={T.green} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div style={{ background: T.surface, borderRadius: '20px', border: `1px solid ${T.border}`, padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Atividade Recente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ActivityItem text="IA respondeu Beatriz sobre orçamento do protocolo REINO" time="2 min atrás" />
            <ActivityItem text="Novo agendamento confirmado: Camila (Sexta, 14h)" time="15 min atrás" />
            <ActivityItem text="Paciente escalado para humano: João (Dúvida clínica)" time="40 min atrás" />
          </div>
        </div>
        
        <div style={{ background: `${T.cyan}08`, borderRadius: '20px', border: `1px solid ${T.cyan}22`, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
          <Zap size={40} color={T.cyan} />
          <h4 style={{ fontSize: '15px', fontWeight: '700' }}>SecretarIA Pro</h4>
          <p style={{ fontSize: '12px', color: T.inkSec, lineHeight: '1.6' }}>Sua assistente está operando em 98% de eficiência hoje. Nenhuma intervenção crítica necessária.</p>
        </div>
      </div>
    </div>
  );
}

function ManifestoView() {
  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ marginBottom: '40px', borderBottom: `1px solid ${T.border}`, paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px', color: T.cyan }}>🌟 Manifesto SecretarIA</h1>
        <p style={{ fontSize: '16px', color: T.inkSec }}>A inteligência por trás do seu atendimento clínico.</p>
      </div>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: T.ink }}>1. O que é o SecretarIA e para que serve?</h2>
        <div style={{ background: T.surface, padding: '24px', borderRadius: '20px', border: `1px solid ${T.border}`, lineHeight: '1.8', color: T.inkSec }}>
          O <strong style={{ color: T.cyan }}>SecretarIA</strong> é uma plataforma avançada e automatizada de gestão de atendimento clínico via WhatsApp. Basicamente, ele é a <strong>Recepcionista e Assistente Virtual</strong> do seu consultório, operando 24/7.
          <ul style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>🚀 <strong>Automatizar o "trabalho chato":</strong> Recepção, apresentação do Método REINO e triagem inicial.</li>
            <li>🔄 <strong>Engajamento via Follow-ups:</strong> Resgate de inativos, lembretes de agenda e pesquisa NPS.</li>
            <li>📊 <strong>Supervisão sem Código:</strong> Painel intuitivo para gerenciar leads e assumir conversas ("escala para humano").</li>
          </ul>
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: T.ink }}>⚙️ 2. Como tudo isso funciona? (A Stack)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '16px', border: `1px solid ${T.border}` }}>
            <h4 style={{ color: T.cyan, marginBottom: '8px' }}>Maestro n8n</h4>
            <p style={{ fontSize: '13px', color: T.inkSec }}>Unifica a automação e decide o roteiro antes de bater na IA. Possui "Redis" para agrupar mensagens e evitar confusão.</p>
          </div>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '16px', border: `1px solid ${T.border}` }}>
            <h4 style={{ color: T.cyan, marginBottom: '8px' }}>IA Híbrida (GPT-4o)</h4>
            <p style={{ fontSize: '13px', color: T.inkSec }}>Usa GPT-4o para conversas complexas (IA Lívia) e o mini para roteamento econômico e segurança.</p>
          </div>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '16px', border: `1px solid ${T.border}` }}>
            <h4 style={{ color: T.cyan, marginBottom: '8px' }}>Whisper & Vision</h4>
            <p style={{ fontSize: '13px', color: T.inkSec }}>Processa áudios e lê exames perfeitamente, garantindo que nada se perca no atendimento.</p>
          </div>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '16px', border: `1px solid ${T.border}` }}>
            <h4 style={{ color: T.cyan, marginBottom: '8px' }}>CRM Supabase</h4>
            <p style={{ fontSize: '13px', color: T.inkSec }}>Prontuário em tempo real e mapa diário de vendas integrado ao PostgreSQL.</p>
          </div>
        </div>
      </section>

      <div style={{ background: `${T.red}11`, padding: '20px', borderRadius: '16px', border: `1px solid ${T.red}33`, marginTop: '20px' }}>
        <p style={{ fontSize: '13px', color: T.red }}>🛡️ <strong>Blindagem de Regras:</strong> A IA é proibida de falar preços ou prescrever medicação. Ela escala para a sua equipe no momento certo.</p>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon: Icon, color }) {
  return (
    <div style={{ background: T.surface, padding: '24px', borderRadius: '20px', border: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '12px', color: T.inkSec, marginBottom: '8px' }}>{title}</p>
        <h4 style={{ fontSize: '28px', fontWeight: '800' }}>{value}</h4>
        <p style={{ fontSize: '10px', color, marginTop: '4px', fontWeight: '700', textTransform: 'uppercase' }}>{trend}</p>
      </div>
      <div style={{ background: `${color}11`, padding: '10px', borderRadius: '12px' }}>
        <Icon size={20} color={color} />
      </div>
    </div>
  );
}

function ActivityItem({ text, time }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: T.bg, borderRadius: '12px', border: `1px solid ${T.border}` }}>
      <p style={{ fontSize: '13px', color: T.ink }}>{text}</p>
      <span style={{ fontSize: '10px', color: T.inkTert }}>{time}</span>
    </div>
  );
}
