
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastSystem';
import { User, Lock, Mail, Disc, LogIn, UserPlus, Loader2, Hash } from 'lucide-react';
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
  const [gameId, setGameId] = useState('');
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
      addToast('Bem-vindo de volta à Capital!', 'success');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !rpNick || !discord || !gameId) {
      addToast('Preencha todos os campos obrigatórios!', 'error');
      return;
    }
    setLoading(true);

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
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([
          { 
            id: authData.user.id,
            rp_nick: rpNick,
            discord: discord,
            game_id: parseInt(gameId)
          }
        ]);

      if (profileError) {
        addToast('Perfil não pôde ser criado. Entre em contato com o suporte.', 'error');
      } else {
        addToast('Cidadania registrada! Agora faça o login.', 'success');
        setIsLogin(true);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden selection:bg-brand-500 selection:text-white">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2000')] bg-cover bg-center opacity-10"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-dark-900 via-dark-900/95 to-brand-900/20"></div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-600 rounded-[2rem] text-white font-black text-4xl shadow-[0_0_40px_rgba(37,99,235,0.4)] mb-6 animate-bounce-slow">
                C
           </div>
           <h1 className="text-5xl font-black text-white tracking-tighter">
             CAPITAL <span className="text-brand-500">CITY</span>
           </h1>
           <p className="text-gray-400 mt-3 font-medium">A metrópole do SA-MP brasileiro espera por você.</p>
        </div>

        <div className="bg-dark-800/40 backdrop-blur-2xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl animate-fade-in-up">
          
          <div className="flex bg-dark-900/50 p-1.5 rounded-2xl mb-8 border border-white/5">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${isLogin ? 'bg-brand-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
            >
              LOGIN
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${!isLogin ? 'bg-brand-600 text-white shadow-xl' : 'text-gray-500 hover:text-white'}`}
            >
              CADASTRAR
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">E-mail de Acesso</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-500 transition-colors" size={20} />
                  <input 
                    name="email"
                    type="email" 
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-dark-900/80 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Senha Mestra</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-500 transition-colors" size={20} />
                  <input 
                    name="password"
                    type="password" 
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-dark-900/80 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-white focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-5 rounded-2xl shadow-2xl shadow-brand-600/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <LogIn size={24} />}
                ENTRAR NA CIDADE
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Nick RP</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input 
                      name="username"
                      type="text" 
                      autoComplete="username"
                      value={rpNick}
                      onChange={e => setRpNick(e.target.value)}
                      className="w-full bg-dark-900/80 border border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white focus:border-brand-500 focus:outline-none transition-all text-sm"
                      placeholder="Nome_Sobrenome"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">ID Único</label>
                  <div className="relative group">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-500 transition-colors" size={18} />
                    <input 
                      name="game_id"
                      type="number" 
                      value={gameId}
                      onChange={e => setGameId(e.target.value)}
                      className="w-full bg-dark-900/80 border border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white focus:border-brand-500 focus:outline-none transition-all text-sm"
                      placeholder="Ex: 12"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Discord Tag</label>
                <div className="relative group">
                  <Disc className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input 
                    name="discord"
                    type="text" 
                    value={discord}
                    onChange={e => setDiscord(e.target.value)}
                    className="w-full bg-dark-900/80 border border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white focus:border-brand-500 focus:outline-none transition-all text-sm"
                    placeholder="usuario#0000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">E-mail Oficial</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input 
                    name="email"
                    type="email" 
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-dark-900/80 border border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white focus:border-brand-500 focus:outline-none transition-all text-sm"
                    placeholder="cidade@exemplo.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 ml-1">Crie sua Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-brand-500 transition-colors" size={18} />
                  <input 
                    name="new-password"
                    type="password" 
                    autoComplete="new-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-dark-900/80 border border-white/5 rounded-2xl py-4 pl-11 pr-4 text-white focus:border-brand-500 focus:outline-none transition-all text-sm"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-900/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg"
              >
                 {loading ? <Loader2 className="animate-spin" size={24} /> : <UserPlus size={24} />}
                CRIAR PASSAPORTE
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            Capital City RP &copy; 2025
          </div>
        </div>
      </div>
    </div>
  );
};
