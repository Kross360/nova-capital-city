import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastSystem';
import { User, Lock, Mail, Disc, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rpNick, setRpNick] = useState('');
  const [discord, setDiscord] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Login realizado com sucesso!', 'success');
      // Redirecionamento é automático pelo App.tsx ouvindo o AuthContext
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !rpNick || !discord) {
      addToast('Preencha todos os campos!', 'error');
      return;
    }
    setLoading(true);

    // 1. Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      addToast(authError.message, 'error');
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Salvar dados extras na tabela 'profiles'
      // Usamos UPSERT para garantir que se o perfil já existir (trigger), apenas atualizamos
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          { 
            id: authData.user.id,
            rp_nick: rpNick,
            discord: discord
          }
        ]);

      if (profileError) {
        console.error("Erro ao salvar perfil:", profileError);
        addToast('Conta criada, mas houve um erro ao salvar o perfil. Contate o suporte.', 'info');
      } else {
        addToast('Conta criada com sucesso! Faça login.', 'success');
        setIsLogin(true); // Switch to login view
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover bg-center opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/90 to-dark-900/50"></div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl text-white font-bold text-3xl shadow-[0_0_20px_rgba(37,99,235,0.6)] mb-4">
                C
           </div>
           <h1 className="text-4xl font-extrabold text-white tracking-tight">
             CAPITAL <span className="text-brand-500">CITY</span>
           </h1>
           <p className="text-gray-400 mt-2">Identifique-se para entrar na cidade.</p>
        </div>

        <div className="bg-dark-800/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl animate-fade-in-up">
          
          <div className="flex bg-dark-900/50 p-1 rounded-lg mb-6 border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${isLogin ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              ENTRAR
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${!isLogin ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              CADASTRAR
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-brand-900/20 transition-all transform hover:-translate-y-1 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                ACESSAR PAINEL
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
               <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Nick RP (Nome_Sobrenome)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    value={rpNick}
                    onChange={e => setRpNick(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="Ex: John_Doe"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Discord (Usuario)</label>
                <div className="relative">
                  <Disc className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    value={discord}
                    onChange={e => setDiscord(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="Ex: usuario#1234"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg py-3 pl-10 pr-4 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-brand-900/20 transition-all transform hover:-translate-y-1 mt-2 flex items-center justify-center gap-2"
              >
                 {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                CRIAR CONTA
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-white/5 text-center text-xs text-gray-500">
            &copy; 2025 Capital City Roleplay. Protegido por Supabase.
          </div>
        </div>
      </div>
    </div>
  );
};