import React from 'react';
import { Users, Zap, MessageSquare, DollarSign, Bell, ArrowRight } from 'lucide-react';
import { Card, Badge, Button } from '../../components/UI';

export default function DashboardView({ clients, alerts, onPortal }) {
  const activeN = clients.filter(c => c.status === "active").length;
  const n8nN    = clients.filter(c => c.n8n_status === "online").length;
  const totalMsgs = clients.reduce((a, c) => a + (c.msgs_today || 0), 0);
  const unreadAlerts = alerts.filter(a => !a.read);
  
  const PLAN_PRICES = { Starter: 197, Pro: 397, Enterprise: 897 };
  const mrr = clients.filter(c => c.status === "active").reduce((a, c) => a + (PLAN_PRICES[c.plan] || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header da Visão */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 900, letterSpacing: "-1px", margin: 0 }} className="text-gradient">
            Dashboard
          </h1>
          <p style={{ color: "var(--color-text-sec)", fontSize: "14px", marginTop: "4px" }}>
            Bem-vinda de volta, Dra. Juliana. Aqui está o pulso do seu consultório hoje.
          </p>
        </div>
        <Button variant="primary" icon={Zap}>
          Novo Disparo em Massa
        </Button>
      </div>

      {/* Bento Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(12, 1fr)", 
        gridAutoRows: "minmax(160px, auto)", 
        gap: "20px" 
      }}>
        
        {/* Card MRR - Large (6 cols) */}
        <Card style={{ gridColumn: "span 6", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-up) 100%)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ background: "rgba(122, 139, 130, 0.1)", padding: "12px", borderRadius: "16px" }}>
              <DollarSign size={24} color="var(--color-cta)" />
            </div>
            <Badge color="green">Crescimento Constante</Badge>
          </div>
          <div>
            <p style={{ fontSize: "14px", color: "var(--color-text-sec)", fontWeight: 600, margin: 0 }}>Receita Mensal (MRR)</p>
            <h3 style={{ fontSize: "42px", fontWeight: 900, margin: "8px 0 0" }}>
              R$ {mrr.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </Card>

        {/* Clientes Ativos - Medium (3 cols) */}
        <Card style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ background: "rgba(122, 139, 130, 0.1)", padding: "10px", borderRadius: "12px", width: "fit-content" }}>
            <Users size={20} color="var(--color-cta)" />
          </div>
          <div>
            <h4 style={{ fontSize: "28px", fontWeight: 900, margin: 0 }}>{activeN}</h4>
            <p style={{ fontSize: "12px", color: "var(--color-text-sec)", fontWeight: 600, margin: "4px 0 0", textTransform: "uppercase" }}>Clientes Ativos</p>
          </div>
        </Card>

        {/* Mensagens Hoje - Medium (3 cols) */}
        <Card style={{ gridColumn: "span 3", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ background: "rgba(182, 122, 98, 0.1)", padding: "10px", borderRadius: "12px", width: "fit-content" }}>
            <MessageSquare size={20} color="#B67A62" />
          </div>
          <div>
            <h4 style={{ fontSize: "28px", fontWeight: 900, margin: 0 }}>{totalMsgs}</h4>
            <p style={{ fontSize: "12px", color: "var(--color-text-sec)", fontWeight: 600, margin: "4px 0 0", textTransform: "uppercase" }}>Interações Hoje</p>
          </div>
        </Card>

        {/* Alertas Recentes - Long (8 cols) */}
        <Card style={{ gridColumn: "span 8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>Alertas & Vendas</h4>
            <Button variant="ghost" size="sm">Ver todos</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {unreadAlerts.length === 0 ? (
              <p style={{ color: "var(--color-text-sec)", fontSize: "13px", textAlign: "center", padding: "20px" }}>Sem novos alertas.</p>
            ) : (
              unreadAlerts.slice(0, 3).map(alert => (
                <div key={alert.id} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "16px", 
                  padding: "12px", 
                  background: "var(--color-surface-soft)", 
                  borderRadius: "16px",
                  border: "1px solid var(--color-border)"
                }}>
                  <div style={{ fontSize: "24px" }}>{alert.type === "SALE" ? "🎉" : "🔔"}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>{alert.title}</p>
                    <p style={{ fontSize: "12px", color: "var(--color-text-sec)", margin: 0 }}>{alert.message.slice(0, 60)}...</p>
                  </div>
                  <Badge color="blue">Novo</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Status Sistema - Square (4 cols) */}
        <Card style={{ gridColumn: "span 4", background: "linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-up) 100%)" }}>
          <h4 style={{ fontSize: "16px", fontWeight: 800, margin: "0 0 16px" }}>Status Operacional</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--color-text-sec)" }}>n8n Workflows</span>
              <Badge color={n8nN > 0 ? "green" : "red"}>{n8nN} Online</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--color-text-sec)" }}>WhatsApp API</span>
              <Badge color="green">Estável</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--color-text-sec)" }}>Banco de Dados</span>
              <Badge color="green">Conectado</Badge>
            </div>
          </div>
          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--color-border)" }}>
             <p style={{ fontSize: "11px", color: "var(--color-text-sec)", margin: 0, textAlign: "center" }}>
               Última sincronização: há 2 minutos
             </p>
          </div>
        </Card>

        {/* Clientes Recentes - Full (12 cols) */}
        <Card style={{ gridColumn: "span 12" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: 800, margin: 0 }}>Clientes Recentes</h4>
            <Button variant="ghost">Gerenciar Clientes <ArrowRight size={14} /></Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {clients.slice(0, 4).map(client => (
              <div key={client.id} style={{ 
                padding: "16px", 
                background: "var(--color-surface-soft)", 
                borderRadius: "20px", 
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <div style={{ 
                  width: "44px", 
                  height: "44px", 
                  borderRadius: "12px", 
                  background: client.color + "22", 
                  color: client.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "14px",
                  border: `1px solid ${client.color}44`
                }}>
                  {client.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{client.name}</p>
                  <p style={{ fontSize: "11px", color: "var(--color-text-sec)", margin: 0 }}>{client.plan}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onPortal(client)}>Abrir</Button>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}
