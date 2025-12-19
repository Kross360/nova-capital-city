
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, MessageCircle, Loader2, Copy, Globe, ChevronRight, X, Monitor, Smartphone } from 'lucide-react';
import { StorageService } from '../services/storage';
import { NewsPost, ServerConfig } from '../types';
import { useToast } from '../components/ToastSystem';

export const Home: React.FC = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const loadData = async () => {
       try {
         const [allNews, cfg] = await Promise.all([
           StorageService.getNews(),
           StorageService.getConfig()
         ]);
         setNews(allNews.slice(0, 3));
         setConfig(cfg);
       } catch (e) {
         console.error("Erro ao carregar dados da Home:", e);
       } finally {
         setLoading(false);
       }
    };
    loadData();
  }, []);

  const copyIp = () => {
    if (config?.serverIp) {
      navigator.clipboard.writeText(config.serverIp);
      addToast('IP Copiado! Cole no seu SA-MP.', 'success');
    } else {
      addToast('IP não configurado ainda.', 'info');
    }
  };

  const handlePlatformClick = (platform: 'pc' | 'mobile') => {
    setShowPlatformModal(false);
    navigate(`/start?platform=${platform}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-500" size={48} />
        <p className="text-gray-500 font-black text-xs uppercase tracking-widest">Iniciando Sistemas...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-dark-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[650px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center scale-105 opacity-30 transition-opacity duration-1000"
          style={{ backgroundImage: `url("${config?.homeBackgroundUrl || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2000'}")` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent z-10"></div>
        
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-xl animate-fade-in-down shadow-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,1)] animate-pulse"></span>
            Servidor Online 24/7
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter leading-none uppercase drop-shadow-2xl">
            CAPITAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">CITY</span>
          </h1>

          {/* IP FIXO WIDGET */}
          <div className="flex flex-col items-center justify-center gap-3 mb-10 animate-fade-in-up delay-100">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative flex items-center bg-dark-950/90 border border-white/10 rounded-2xl p-2 pl-6 pr-2 gap-6 shadow-2xl backdrop-blur-3xl">
                <div className="flex flex-col items-start">
                  <span className="text-[8px] font-black text-brand-500 uppercase tracking-widest leading-none mb-1">IP do Servidor</span>
                  <span className="text-white font-mono text-sm font-black tracking-widest">
                    {config?.serverIp || 'JOGAR.CAPITALCITY.COM:7777'}
                  </span>
                </div>
                <button 
                  onClick={copyIp} 
                  className="bg-brand-600 hover:bg-brand-500 text-white p-3 rounded-xl transition-all shadow-lg flex items-center gap-2 active:scale-95"
                >
                  <Copy size={16} />
                  <span className="text-[10px] font-black uppercase px-1">Copiar</span>
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-base md:text-lg text-gray-400 mb-12 max-w-xl mx-auto leading-relaxed font-medium opacity-80">
            Junte-se a milhares de jogadores na metrópole mais avançada do SA-MP nacional. Economia balanceada, Roleplay imersivo e sistemas exclusivos.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setShowPlatformModal(true)}
              className="w-full sm:w-auto px-10 py-4 bg-brand-600 hover:bg-brand-500 text-white font-black rounded-2xl transition-all transform hover:-translate-y-1 shadow-2xl shadow-brand-600/30 flex items-center justify-center gap-3 text-base group"
            >
              <Download size={22} className="group-hover:animate-bounce" /> JOGAR AGORA
            </button>
            <button 
              onClick={() => { if(config?.discordUrl) window.open(config.discordUrl, '_blank') }}
              className="w-full sm:w-auto px-10 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-3xl text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 border border-white/10 shadow-xl text-base"
            >
              <MessageCircle size={22} className="text-brand-400" /> DISCORD
            </button>
          </div>
        </div>
      </section>

      {/* Notícias Rápidas */}
      <section className="py-20 bg-dark-900 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
           <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <div className="w-8 h-1 bg-brand-500 rounded-full"></div>
                Últimas Notícias
              </h2>
              <button onClick={() => navigate('/news')} className="text-brand-400 text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                Ver Tudo <ChevronRight size={14}/>
              </button>
           </div>
           <div className="grid md:grid-cols-3 gap-8">
              {news.map(post => (
                <div key={post.id} className="bg-dark-800/40 border border-white/5 rounded-3xl p-6 hover:border-brand-500/30 transition-all group cursor-pointer" onClick={() => navigate('/news')}>
                   <div className="h-40 rounded-2xl bg-dark-900 mb-5 overflow-hidden border border-white/5">
                      <img src={post.imageUrl || 'https://picsum.photos/400/200'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   </div>
                   <h3 className="text-white font-black text-base mb-2 line-clamp-1 uppercase tracking-tight">{post.title}</h3>
                   <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed font-medium">{post.summary}</p>
                </div>
              ))}
              {news.length === 0 && <div className="col-span-3 text-center py-20 text-gray-700 font-black uppercase tracking-widest text-xs">Nenhuma notícia disponível</div>}
           </div>
        </div>
      </section>

      {/* PLATFORM SELECTION MODAL */}
      {showPlatformModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" onClick={() => setShowPlatformModal(false)}></div>
          <div className="relative w-full max-w-lg bg-dark-800 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-scale-in">
             <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Como deseja jogar?</h3>
                <button onClick={() => setShowPlatformModal(false)} className="text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-xl"><X size={20}/></button>
             </div>
             <div className="p-8 grid sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => handlePlatformClick('pc')}
                  className="flex flex-col items-center gap-4 p-8 bg-dark-900/50 rounded-3xl border border-white/5 hover:border-brand-500 hover:bg-brand-600/10 transition-all group text-center"
                >
                  <Monitor size={48} className="text-brand-500 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="block text-white font-black text-lg uppercase">Computador</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Launcher Completo</span>
                  </div>
                </button>

                <button 
                  onClick={() => handlePlatformClick('mobile')}
                  className="flex flex-col items-center gap-4 p-8 bg-dark-900/50 rounded-3xl border border-white/5 hover:border-brand-500 hover:bg-brand-600/10 transition-all group text-center"
                >
                  <Smartphone size={48} className="text-brand-500 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="block text-white font-black text-lg uppercase">Celular</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">APK Otimizado</span>
                  </div>
                </button>
             </div>
             <div className="p-6 bg-dark-900/50 text-center">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Capital City Roleplay &copy; 2025</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
