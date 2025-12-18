
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
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Cinematic Background */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url("${config.homeBackgroundUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000'}")` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-dark-900/40 z-10"></div>
        
        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl animate-fade-in-down shadow-xl">
            <span className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-ping"></span>
            Acesso via Launcher Oficial
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-tight drop-shadow-2xl">
            CAPITAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-600">CITY</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-medium opacity-90">
            A metrópole mais imersiva do SA-MP nacional. Sistemas exclusivos, economia viva e uma história esperando por você.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setShowPlatformModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-2xl transition-all transform hover:-translate-y-1 shadow-lg shadow-brand-600/20 flex items-center justify-center gap-3 text-lg group active:scale-95"
            >
              <Download size={24} className="group-hover:animate-bounce" /> JOGAR AGORA
            </button>
            <button 
              onClick={openDiscord}
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-3xl text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 border border-white/10 group shadow-xl active:scale-95"
            >
              <MessageCircle size={24} className="text-brand-400" />
              <span className="text-lg">DISCORD</span>
            </button>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-40">
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white">50K+</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Contas</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white">99%</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Uptime</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white">4.9</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Avaliação</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-2xl font-black text-white">24/7</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Suporte</span>
             </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-dark-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">A Cidade que Nunca Dorme</h2>
             <p className="text-gray-500 text-lg font-medium max-w-xl mx-auto">Experiência refinada em cada pixel do servidor.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
             <div className="bg-dark-800/20 p-8 rounded-3xl border border-white/5 hover:border-brand-500/30 transition-all group">
                <div className="w-16 h-16 bg-brand-600/10 rounded-2xl flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-xl">
                  <Zap size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">Performance</h3>
                <p className="text-gray-400 text-base leading-relaxed">Otimização nativa para PC e Mobile. Jogabilidade fluida sem quedas de FPS.</p>
             </div>
             <div className="bg-dark-800/20 p-8 rounded-3xl border border-white/5 hover:border-brand-500/30 transition-all group">
                <div className="w-16 h-16 bg-brand-600/10 rounded-2xl flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-xl">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">Regras</h3>
                <p className="text-gray-400 text-base leading-relaxed">Staff treinada para garantir um ambiente saudável. Roleplay levado a sério.</p>
             </div>
             <div className="bg-dark-800/20 p-8 rounded-3xl border border-white/5 hover:border-brand-500/30 transition-all group">
                <div className="w-16 h-16 bg-brand-600/10 rounded-2xl flex items-center justify-center text-brand-500 mb-6 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-xl">
                  <Star size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase">Sistemas</h3>
                <p className="text-gray-400 text-base leading-relaxed">Economia balanceada, empregos variados e sistemas que você só encontra aqui.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Modal Plataforma */}
      {showPlatformModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 rounded-3xl border border-white/10 w-full max-w-3xl relative shadow-2xl overflow-hidden">
             <button onClick={() => setShowPlatformModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all bg-dark-900 rounded-full p-2"><X size={24}/></button>
             <div className="p-12 text-center">
               <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Escolha sua Plataforma</h2>
               <p className="text-gray-400 mb-10 text-lg">Selecione onde você deseja iniciar sua jornada.</p>
               <div className="grid md:grid-cols-2 gap-6">
                  <button onClick={() => navigate('/start?platform=pc')} className="group bg-dark-900/50 p-10 rounded-2xl border border-white/5 hover:border-brand-500 transition-all flex flex-col items-center gap-6 hover:bg-brand-500/10">
                    <div className="w-20 h-20 bg-brand-600/10 rounded-2xl flex items-center justify-center text-brand-500 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-xl">
                      <Monitor size={48}/>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">PC / Desktop</h3>
                      <p className="text-[8px] text-gray-600 uppercase tracking-widest font-black opacity-60">SAMP Client Otimizado</p>
                    </div>
                  </button>
                  <button onClick={() => navigate('/start?platform=mobile')} className="group bg-dark-900/50 p-10 rounded-2xl border border-white/5 hover:border-brand-500 transition-all flex flex-col items-center gap-6 hover:bg-brand-500/10">
                    <div className="w-20 h-20 bg-brand-600/10 rounded-2xl flex items-center justify-center text-brand-500 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-xl">
                      <Smartphone size={48}/>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Mobile / APK</h3>
                      <p className="text-[8px] text-gray-600 uppercase tracking-widest font-black opacity-60">Launcher Android Exclusivo</p>
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
