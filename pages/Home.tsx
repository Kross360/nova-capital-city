
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Monitor, Smartphone, X, Star, ShieldCheck, Zap, MessageCircle, Loader2 } from 'lucide-react';
import { StorageService } from '../services/storage';
import { NewsPost, ServerConfig } from '../types';
import { useToast } from '../components/ToastSystem';

export const Home: React.FC = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
       const [allNews, cfg] = await Promise.all([
         StorageService.getNews(),
         StorageService.getConfig()
       ]);
       setNews(allNews.slice(0, 3));
       setConfig(cfg);
    };
    loadData();
  }, []);

  const openDiscord = () => {
    if (config?.discordUrl) {
      window.open(config.discordUrl, '_blank');
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in selection:bg-brand-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[900px] flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center scale-110 animate-pulse-slow"
          style={{ backgroundImage: `url("${config.homeBackgroundUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000'}")` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-dark-900/20 z-10"></div>
        <div className="absolute inset-0 bg-brand-600/5 mix-blend-overlay z-10"></div>

        <div className="relative z-20 text-center px-6 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-10 px-8 py-3 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[11px] font-black uppercase tracking-[0.3em] backdrop-blur-xl animate-fade-in-down shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_20px_rgba(59,130,246,1)] animate-ping"></span>
            Acesso via Launcher Oficial
          </div>
          
          <h1 className="text-8xl md:text-[11rem] font-black text-white mb-10 tracking-tighter leading-[0.8] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            CAPITAL <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-500 to-brand-700 animate-gradient-x">CITY</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-gray-300 mb-16 max-w-4xl mx-auto leading-tight font-medium opacity-80">
            A metrópole mais imersiva do SA-MP nacional. Sistemas exclusivos, economia viva e uma história esperando por você.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <button 
              onClick={() => setShowPlatformModal(true)}
              className="w-full sm:w-auto px-16 py-7 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-[2.5rem] transition-all transform hover:-translate-y-2 shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex items-center justify-center gap-4 text-2xl group active:scale-95"
            >
              <Download size={32} className="group-hover:animate-bounce" /> JOGAR AGORA
            </button>
            <button 
              onClick={openDiscord}
              className="w-full sm:w-auto px-12 py-7 bg-white/5 hover:bg-white/10 backdrop-blur-3xl text-white font-black rounded-[2.5rem] transition-all flex items-center justify-center gap-4 border border-white/10 group shadow-2xl active:scale-95"
            >
              <MessageCircle size={32} className="text-brand-400 group-hover:scale-110 transition-transform" />
              <span className="tracking-tight text-xl">ENTRAR NO DISCORD</span>
            </button>
          </div>

          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50">
             <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-white">50K+</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contas</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-white">99%</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Uptime</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-white">4.9</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avaliação</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-white">24/7</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Suporte</span>
             </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-48 bg-dark-900 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">A CIDADE QUE NUNCA DORME</h2>
             <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">Experiência refinada em cada pixel do servidor.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
             <div className="bg-dark-800/20 p-16 rounded-[4rem] border border-white/5 hover:border-brand-500/30 transition-all group hover:shadow-[0_0_80px_rgba(37,99,235,0.08)]">
                <div className="w-24 h-24 bg-brand-600/10 rounded-[2rem] flex items-center justify-center text-brand-500 mb-10 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-xl group-hover:rotate-6">
                  <Zap size={48} />
                </div>
                <h3 className="text-4xl font-black text-white mb-8 tracking-tighter">EXTREMA PERFORMANCE</h3>
                <p className="text-gray-400 text-xl leading-relaxed font-medium">Otimização nativa para PC e Mobile. Jogabilidade fluida sem quedas de FPS.</p>
             </div>
             <div className="bg-dark-800/20 p-16 rounded-[4rem] border border-white/5 hover:border-brand-500/30 transition-all group hover:shadow-[0_0_80_px_rgba(37,99,235,0.08)]">
                <div className="w-24 h-24 bg-brand-600/10 rounded-[2rem] flex items-center justify-center text-brand-500 mb-10 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-xl group-hover:rotate-6">
                  <ShieldCheck size={48} />
                </div>
                <h3 className="text-4xl font-black text-white mb-8 tracking-tighter">REGRAS SÉRIAS</h3>
                <p className="text-gray-400 text-xl leading-relaxed font-medium">Staff treinada para garantir um ambiente saudável. Roleplay levado a sério.</p>
             </div>
             <div className="bg-dark-800/20 p-16 rounded-[4rem] border border-white/5 hover:border-brand-500/30 transition-all group hover:shadow-[0_0_80px_rgba(37,99,235,0.08)]">
                <div className="w-24 h-24 bg-brand-600/10 rounded-[2rem] flex items-center justify-center text-brand-500 mb-10 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-xl group-hover:rotate-6">
                  <Star size={48} />
                </div>
                <h3 className="text-4xl font-black text-white mb-8 tracking-tighter">SISTEMAS ÚNICOS</h3>
                <p className="text-gray-400 text-xl leading-relaxed font-medium">Economia balanceada, empregos variados e sistemas que você só encontra aqui.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Modal Plataforma */}
      {showPlatformModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-fade-in">
          <div className="bg-dark-800 rounded-[4rem] border border-white/10 w-full max-w-5xl relative shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden">
             <button onClick={() => setShowPlatformModal(false)} className="absolute top-12 right-12 text-gray-500 hover:text-white transition-all bg-dark-900 rounded-full p-5 hover:rotate-90"><X size={36}/></button>
             <div className="p-24 text-center">
               <h2 className="text-7xl font-black text-white mb-8 tracking-tighter uppercase">Escolha sua Plataforma</h2>
               <p className="text-gray-400 mb-20 text-2xl font-medium opacity-60">Prepare seu passaporte para a melhor experiência da sua vida.</p>
               <div className="grid md:grid-cols-2 gap-16">
                  <button onClick={() => navigate('/start?platform=pc')} className="group bg-dark-900/50 p-20 rounded-[3.5rem] border border-white/5 hover:border-brand-500 transition-all flex flex-col items-center gap-12 hover:bg-brand-500/10">
                    <div className="w-32 h-32 bg-brand-600/10 rounded-[2rem] flex items-center justify-center text-brand-500 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-2xl group-hover:scale-110">
                      <Monitor size={72}/>
                    </div>
                    <div>
                      <h3 className="text-5xl font-black text-white mb-4 tracking-tighter">PC / DESKTOP</h3>
                      <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] font-black opacity-60">SAMP Client Otimizado</p>
                    </div>
                  </button>
                  <button onClick={() => navigate('/start?platform=mobile')} className="group bg-dark-900/50 p-20 rounded-[3.5rem] border border-white/5 hover:border-brand-500 transition-all flex flex-col items-center gap-12 hover:bg-brand-500/10">
                    <div className="w-32 h-32 bg-brand-600/10 rounded-[2rem] flex items-center justify-center text-brand-500 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-2xl group-hover:scale-110">
                      <Smartphone size={72}/>
                    </div>
                    <div>
                      <h3 className="text-5xl font-black text-white mb-4 tracking-tighter">MOBILE / APK</h3>
                      <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] font-black opacity-60">Launcher Android Exclusivo</p>
                    </div>
                  </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
