import React, { useState, useEffect } from "react";
import {
  Settings, Smartphone, MessageCircle, AlertTriangle, ShieldCheck, Key, Save,
  ChevronDown, ChevronUp, CheckCircle2, QrCode, Send, Camera, Edit2,
  Briefcase, Brain, Clock, Globe, AtSign, Zap, Lock,
} from "lucide-react";
import { PageTitle, Card, Btn, Inp, Pulse } from "../../pages/ClientPortal";
import { Tokens, Clientes } from "../../lib/db";
import { supabase } from "../../lib/supabase";

function QRBlock({ label, value, placeholder, urlPrefix, icon: Icon, color = "text-primary" }) {
  const [val, setVal] = useState(value || "");
  const [saved, setSaved] = useState(!!value);

  const url = val.trim() ? `${urlPrefix}${encodeURIComponent(val.trim())}` : null;
  const qrSrc = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
    : null;

  return (
    <div className="p-6 rounded-2xl bg-surface-up/20 border border-border-subtle space-y-4">
      <div className="flex items-center gap-3">
        <Icon size={16} className={color} />
        <span className="text-xs font-black text-main uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <Inp
            value={val}
            onChange={v => { setVal(v); setSaved(false); }}
            placeholder={placeholder}
          />
        </div>
        <button
          onClick={() => setSaved(true)}
          disabled={!val.trim()}
          className="px-5 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider disabled:opacity-40 hover:bg-primary/20 transition-all"
        >
          <Save size={14} />
        </button>
      </div>
      {qrSrc && saved && (
        <div className="flex flex-col items-center gap-3 pt-2">
          <img
            src={qrSrc}
            alt={`QR ${label}`}
            className="w-40 h-40 rounded-2xl border border-border-subtle bg-white p-2"
          />
          <p className="text-[10px] text-tertiary font-black uppercase tracking-widest">Escaneie para iniciar conversa</p>
          <a
            href={qrSrc}
            download={`qrcode-${label.toLowerCase().replace(/\s/g, "-")}.png`}
            className="text-[10px] text-primary font-black uppercase tracking-wider hover:underline"
          >
            Baixar QR Code
          </a>
        </div>
      )}
    </div>
  );
}

export default function SettingsView({ client }) {
  const [loading, setLoading] = useState(false);
  const [showConcierge, setShowConcierge] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [credentials, setCredentials] = useState({ accessToken: "", phoneNumberId: "", wabaId: "" });
  const [isConnected, setIsConnected] = useState(false);
  const [briefing, setBriefing] = useState(client?.briefing || {});
  const [savingBriefing, setSavingBriefing] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (!client?.id) return;
    Tokens.get(client.id).then(t => {
      if (t) {
        setCredentials({
          accessToken: t.waba_token || "",
          phoneNumberId: t.phone_number_id || "",
          wabaId: t.waba_id || ""
        });
        if (t.waba_token && t.phone_number_id && t.waba_id) setIsConnected(true);
      }
    });
  }, [client?.id]);

  useEffect(() => {
    setBriefing(client?.briefing || {});
  }, [client?.briefing]);

  const handleSaveCredentials = async () => {
    setLoading(true);
    try {
      await Tokens.update(client.id, {
        waba_token: credentials.accessToken,
        phone_number_id: credentials.phoneNumberId,
        waba_id: credentials.wabaId
      });
      setIsConnected(true);
      alert("Credenciais salvas com sucesso!");
    } catch (e) {
      alert("Falha ao salvar credenciais. Tente novamente.");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleSaveBriefing = async () => {
    setSavingBriefing(true);
    try {
      await Clientes.update(client.id, { briefing });
      alert("Configurações salvas com sucesso!");
    } catch (e) {
      alert("Erro ao salvar configurações.");
    } finally {
      setSavingBriefing(false);
    }
  };

  const upBriefing = k => v => setBriefing(p => ({ ...p, [k]: v }));

  const handleChangePassword = async () => {
    if (newPwd.length < 6) { alert('A senha precisa ter pelo menos 6 caracteres.'); return; }
    if (newPwd !== pwdConfirm) { alert('As senhas não coincidem.'); return; }
    setPwdLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) throw error;
      setNewPwd(''); setPwdConfirm('');
      alert('Senha alterada com sucesso!');
    } catch (e) { alert('Erro ao alterar senha: ' + e.message); }
    finally { setPwdLoading(false); }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageTitle
        icon={Settings}
        title="Configurações & Integrações"
        subtitle="Gerencie as configurações da IA, canais de atendimento e integrações técnicas."
      />

      {/* ── Seção: Configurações da IA (Briefing) ── */}
      <div className="rounded-[32px] border border-border-subtle overflow-hidden">
        <button
          onClick={() => setShowBriefing(!showBriefing)}
          className="w-full flex items-center justify-between p-6 bg-surface-up/20 hover:bg-surface-up/40 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <Brain size={18} className="text-primary" />
            <div>
              <h3 className="text-sm font-black text-main">Configurações da IA & Negócio</h3>
              <p className="text-[10px] text-tertiary mt-0.5">Segmento, persona, horários e serviços configurados</p>
            </div>
          </div>
          {showBriefing ? <ChevronUp size={16} className="text-tertiary" /> : <ChevronDown size={16} className="text-tertiary" />}
        </button>

        {showBriefing && (
          <div className="p-6 border-t border-border-subtle space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Inp
                label="Segmento"
                value={briefing.segment || ""}
                onChange={upBriefing("segment")}
                placeholder="Ex: Nutricionista"
                icon={Briefcase}
              />
              <Inp
                label="Nome da IA"
                value={briefing.ai_name || ""}
                onChange={upBriefing("ai_name")}
                placeholder="Ex: Ana, Sofia..."
                icon={Brain}
              />
            </div>
            <Inp
              label="Descrição / Proposta de Valor"
              value={briefing.description || ""}
              onChange={upBriefing("description")}
              placeholder="O que o seu negócio faz, diferencial, público-alvo..."
              rows={3}
              icon={Briefcase}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Inp
                label="Tom / Arquétipo de Voz"
                value={briefing.ai_tone || ""}
                onChange={upBriefing("ai_tone")}
                placeholder="Ex: Acolhedora e profissional"
                icon={Brain}
              />
              <Inp
                label="Objetivo Estratégico"
                value={briefing.ai_goal || ""}
                onChange={upBriefing("ai_goal")}
                placeholder="Ex: Agendamentos, Vendas..."
                icon={Zap}
              />
            </div>
            <Inp
              label="Horário de Atendimento"
              value={briefing.business_hours || ""}
              onChange={upBriefing("business_hours")}
              placeholder="Ex: Seg–Sex 8h–18h | Sáb 8h–13h"
              icon={Clock}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Inp label="Site" value={briefing.site || ""} onChange={upBriefing("site")} placeholder="meunegocio.com.br" icon={Globe} />
              <Inp label="Instagram" value={briefing.instagram || ""} onChange={upBriefing("instagram")} placeholder="@usuario" icon={AtSign} />
            </div>
            <Inp
              label="Restrições (o que a IA nunca deve responder)"
              value={briefing.restrictions || ""}
              onChange={upBriefing("restrictions")}
              placeholder="Ex: nunca confirmar diagnósticos médicos..."
              rows={2}
              icon={ShieldCheck}
            />
            <Inp
              label="Promoções / Comunicados Temporários"
              value={briefing.promotions || ""}
              onChange={upBriefing("promotions")}
              placeholder="Ex: 20% off em consultas de Julho..."
              rows={2}
              icon={Zap}
            />

            {briefing.services?.length > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-tertiary uppercase tracking-[0.3em] ml-1">Serviços Cadastrados</label>
                <div className="space-y-2">
                  {briefing.services.map((s, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-surface-up/20 border border-border-subtle text-sm">
                      <span className="flex-1 font-semibold text-main">{s.name}</span>
                      <span className="text-primary font-black text-xs">{s.price || "SOB CONSULTA"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Btn
              variant="primary"
              onClick={handleSaveBriefing}
              disabled={savingBriefing}
              className="w-full"
              icon={Save}
            >
              {savingBriefing ? "Salvando..." : "Salvar Configurações"}
            </Btn>
          </div>
        )}
      </div>

      {/* ── Seção: QR Codes de Contato ── */}
      <div className="rounded-[32px] border border-border-subtle overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-surface-up/20">
          <QrCode size={18} className="text-primary" />
          <div>
            <h3 className="text-sm font-black text-main">QR Codes de Atendimento</h3>
            <p className="text-[10px] text-tertiary mt-0.5">Gere QR codes para WhatsApp, Telegram e Instagram Direct</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QRBlock
            label="WhatsApp"
            value={client?.phone?.replace(/\D/g, "")}
            placeholder="+55 11 99999-9999"
            urlPrefix="https://wa.me/"
            icon={MessageCircle}
            color="text-emerald-500"
          />
          <QRBlock
            label="Telegram"
            value=""
            placeholder="@seucanal ou +55..."
            urlPrefix="https://t.me/"
            icon={Send}
            color="text-blue-500"
          />
          <QRBlock
            label="Instagram Direct"
            value={briefing?.instagram?.replace("@", "") || ""}
            placeholder="@seuinstagram"
            urlPrefix="https://ig.me/m/"
            icon={Camera}
            color="text-pink-500"
          />
        </div>
      </div>

      {/* ── Seção: Alterar senha ── */}
      <div className="rounded-[32px] border border-border-subtle overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex items-center gap-3 bg-surface-up/20">
          <Lock size={18} className="text-primary" />
          <div>
            <h3 className="text-sm font-black text-main">Alterar Senha de Acesso</h3>
            <p className="text-[10px] text-tertiary mt-0.5">Redefina a sua senha de entrada no portal</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <Inp label="Nova senha" value={newPwd} onChange={setNewPwd} placeholder="Mínimo 6 caracteres" icon={Key} type="password" />
          <Inp label="Confirmar nova senha" value={pwdConfirm} onChange={setPwdConfirm} placeholder="Repita a nova senha" icon={ShieldCheck} type="password" />
          <Btn
            onClick={handleChangePassword}
            disabled={pwdLoading || newPwd.length < 6 || newPwd !== pwdConfirm}
            className="w-full"
            icon={Save}
          >
            {pwdLoading ? 'Salvando...' : 'Salvar Nova Senha'}
          </Btn>
        </div>
      </div>

      {/* ── Seção: Conexão Oficial WhatsApp Cloud API ── */}
      <div className="rounded-[32px] border border-border-subtle overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-surface-up/20">
          <div className="flex items-center gap-3">
            <MessageCircle size={18} className="text-primary" />
            <div>
              <h3 className="text-sm font-black text-main">Conexão Oficial WhatsApp Cloud API</h3>
              <p className="text-[10px] text-tertiary mt-0.5">Integração direta com a Meta para automação oficial</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isConnected ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
            <Pulse status={isConnected ? "online" : "offline"} />
            <span className="text-[10px] font-black uppercase tracking-wider">
              {isConnected ? "Conectado" : "Desconectado"}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xs text-secondary leading-relaxed">
            Utilize a <b>Cloud API Oficial da Meta</b> para estabilidade e segurança sem depender de QR Codes no celular.
          </p>

          <div className="p-5 rounded-2xl bg-surface-up/30 border border-border-subtle">
            <div className="flex items-center justify-center gap-3 py-2 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/20 text-[#1877F2] font-semibold text-xs opacity-60 cursor-not-allowed">
              <MessageCircle size={16} />
              Conectar com Meta (Em breve)
            </div>
          </div>

          <button
            onClick={() => setShowConcierge(!showConcierge)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-surface-up/20 border border-border-subtle hover:border-primary/20 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-amber-500" />
              <div>
                <h4 className="text-xs font-bold text-main">Área Técnica / Concierge</h4>
                <p className="text-[10px] text-tertiary mt-0.5">Inserção manual de tokens</p>
              </div>
            </div>
            {showConcierge ? <ChevronUp size={16} className="text-tertiary" /> : <ChevronDown size={16} className="text-tertiary" />}
          </button>

          {showConcierge && (
            <div className="p-5 rounded-2xl bg-surface-up/10 border border-amber-500/20 space-y-4 animate-fade-in">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500/90 text-[10px] font-medium">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <p>Modificar estas chaves pode desconectar a IA e interromper os fluxos.</p>
              </div>
              <Inp
                label="Token de Acesso (Access Token)"
                placeholder="EAAI... ou EAAG..."
                value={credentials.accessToken}
                onChange={val => setCredentials({ ...credentials, accessToken: val })}
                icon={Key}
              />
              <div className="grid grid-cols-2 gap-4">
                <Inp
                  label="Phone Number ID"
                  placeholder="Ex: 10492839485..."
                  value={credentials.phoneNumberId}
                  onChange={val => setCredentials({ ...credentials, phoneNumberId: val })}
                  icon={Smartphone}
                />
                <Inp
                  label="WABA ID"
                  placeholder="Ex: 10293847566..."
                  value={credentials.wabaId}
                  onChange={val => setCredentials({ ...credentials, wabaId: val })}
                  icon={Smartphone}
                />
              </div>
              <Btn
                variant="primary"
                onClick={handleSaveCredentials}
                disabled={loading || !credentials.accessToken || !credentials.phoneNumberId || !credentials.wabaId}
                className="w-full mt-2"
                icon={Save}
              >
                {loading ? "Salvando..." : "Salvar Credenciais da Meta"}
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
