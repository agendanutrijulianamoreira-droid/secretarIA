import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Logo } from '../shared/Logo';
import { Btn, Inp } from '../../pages/ClientPortal';
import {
  Briefcase, User, Shield, AlertTriangle,
  ChevronRight, Sparkles,
} from 'lucide-react';

// Formulário de login e cadastro com suporte a Google OAuth
export default function LoginForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch {
      setError('E-mail ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalAdmin = () => {
    sessionStorage.setItem('__admin_bypass', '1');
    window.location.reload();
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch {
      setError('Falha na autenticação com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden font-sans">
      {/* Painel esquerdo — branding */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-20 overflow-hidden bg-background border-r border-border">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent)] animate-pulse" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>
        <div className="absolute top-16 left-16 z-20"><Logo size={48} /></div>
        <div className="relative z-20 space-y-8">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-main">
            Sua secretária<br />
            <span className="text-primary">virtual</span> para<br />
            clínicas e consultórios.
          </h1>
          <p className="text-lg text-secondary leading-relaxed max-w-lg font-medium">
            Atendimento automático pelo WhatsApp, agendamentos e CRM de pacientes.
          </p>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-12 sm:p-24 relative bg-background">
        <div className="absolute top-12 left-12 lg:hidden"><Logo size={36} /></div>

        <div className="w-full max-w-md space-y-10 animate-fade-in">
          <div className="space-y-3 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-main tracking-tight">
              {isRegister ? 'Criar conta' : 'Bem-vinda de volta'}
            </h2>
            <p className="text-secondary font-medium">
              {isRegister ? 'Preencha os dados abaixo para começar.' : 'Acesse sua conta para continuar.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegister && (
              <Inp label="Nome da clínica *" value={name} onChange={setName} placeholder="Ex: Clínica Juliana Moreira" icon={Briefcase} required />
            )}
            <Inp label="E-mail *" value={email} onChange={setEmail} placeholder="seu@email.com.br" icon={User} type="email" required />
            <Inp label="Senha *" value={password} onChange={setPassword} placeholder="••••••••" icon={Shield} type="password" required />

            {error && (
              <div className="bg-red-500/5 text-red-500 p-5 rounded-[24px] text-xs font-black uppercase tracking-widest border border-red-500/10 flex items-center gap-4">
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            <Btn type="submit" disabled={loading} className="w-full py-6" icon={isRegister ? Sparkles : ChevronRight}>
              {loading ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
            </Btn>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-tertiary font-medium">
              <span className="bg-background px-4">ou</span>
            </div>
          </div>

          <button
            type="button" onClick={handleGoogle} disabled={loading}
            className="w-full bg-surface/50 border border-border-subtle text-main py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:border-primary/40 hover:bg-surface transition-all flex items-center justify-center gap-4 cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>

          <button
            type="button" onClick={handleLocalAdmin}
            className="w-full border border-dashed border-amber-500/40 text-amber-500 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-500/5 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Shield size={14} /> Acesso Admin Local (sem autenticação)
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-secondary">
              {isRegister ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
              <button onClick={() => setIsRegister(!isRegister)} className="ml-2 text-primary font-medium hover:underline underline-offset-4 cursor-pointer">
                {isRegister ? 'Entrar' : 'Criar conta'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
