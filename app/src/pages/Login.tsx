import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Bot, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn, signUp, resetPassword } from '../lib/supabase'

type Modo = 'login' | 'cadastro' | 'esqueci'

export function Login() {
  const navigate = useNavigate()
  const [modo, setModo] = useState<Modo>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)

  const resetState = () => {
    setErro(null)
    setSucesso(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    resetState()

    try {
      if (modo === 'login') {
        const { error } = await signIn(email, senha)
        if (error) throw error
        navigate('/dashboard')
      } else if (modo === 'cadastro') {
        if (!nome.trim()) throw new Error('Informe seu nome profissional')
        const { error } = await signUp(email, senha, nome)
        if (error) throw error
        setSucesso('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
        setModo('login')
      } else {
        const { error } = await resetPassword(email)
        if (error) throw error
        setSucesso('Enviamos um link de recuperação para ' + email)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido'
      if (msg.includes('Invalid login')) setErro('E-mail ou senha incorretos')
      else if (msg.includes('already registered')) setErro('Este e-mail já está cadastrado')
      else setErro(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1e] via-[#1a1033] to-[#0f0a1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6] flex items-center justify-center mb-3 shadow-lg shadow-purple-500/30">
            <Bot size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SecretarIA Nutri</h1>
          <p className="text-gray-400 text-sm mt-1">Sua assistente virtual inteligente</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {/* Tabs */}
          {modo !== 'esqueci' && (
            <div className="flex rounded-xl bg-white/5 p-1 mb-6">
              {(['login', 'cadastro'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setModo(m); resetState() }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    modo === m
                      ? 'bg-[#8B5CF6] text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>
          )}

          {modo === 'esqueci' && (
            <div className="mb-6">
              <h2 className="text-white font-semibold text-lg">Recuperar senha</h2>
              <p className="text-gray-400 text-sm mt-1">Enviaremos um link para seu e-mail</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === 'cadastro' && (
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Nome profissional</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Dra. Ana Paula Santos"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
              />
            </div>

            {modo !== 'esqueci' && (
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder={modo === 'cadastro' ? 'Mínimo 6 caracteres' : '••••••••'}
                    required
                    minLength={6}
                    autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            {modo === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setModo('esqueci'); resetState() }}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {erro && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">
                {sucesso}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {modo === 'login' && 'Entrar'}
              {modo === 'cadastro' && 'Criar conta gratuita'}
              {modo === 'esqueci' && 'Enviar link de recuperação'}
            </button>
          </form>

          {modo === 'esqueci' && (
            <button
              onClick={() => { setModo('login'); resetState() }}
              className="w-full mt-3 text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Voltar para login
            </button>
          )}

          {modo === 'cadastro' && (
            <p className="text-xs text-gray-500 text-center mt-4">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link to="/termos" className="text-purple-400 hover:underline">Termos de Uso</Link>
              {' '}e{' '}
              <Link to="/privacidade" className="text-purple-400 hover:underline">Política de Privacidade</Link>
            </p>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © {new Date().getFullYear()} SecretarIA Nutri · Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
