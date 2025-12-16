import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Star, ShieldCheck, Zap, Gamepad2, Monitor, Smartphone, X } from 'lucide-react';
import { StorageService } from '../services/storage';
import { NewsPost, ServerConfig } from '../types';

export const Home: React.FC = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [config, setConfig] = useState<ServerConfig>({} as ServerConfig);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
       const allNews = await StorageService.getNews();
       setNews(allNews.slice(0, 3));
       const cfg = await StorageService.getConfig();
       setConfig(cfg);
    };
    loadData();
  }, []);

  const handlePlatformSelect = (platform: 'pc' | 'mobile') => {
    setShowPlatformModal(false);
    navigate(`/start?platform=${platform}`);
  };

  return (
    <div className="animate-fade-in relative">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
          style={{ 
            backgroundImage: `url("${config.homeBackgroundUrl || 'https://picsum.photos/1920/1080?grayscale&blur=2'}")`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-brand-900/30 mix-blend-overlay z-10"></div>

        {/* Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-16">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-brand-500/20 border border-brand-500/50 text-brand-300 text-sm font-semibold tracking-wide uppercase animate-bounce-slow">
            Bem-vindo ao futuro do RP
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl">
            CAPITAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">CITY</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Sua nova vida começa aqui. Uma cidade viva, economia balanceada e infinitas possibilidades.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setShowPlatformModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-600/40 flex items-center justify-center gap-2"
            >
              <Download size={20} />
              JOGAR AGORA
            </button>
          </div>

          {/* Server Info Widget */}
          <div className="mt-12 inline-flex flex-wrap justify-center items-center gap-4 sm:gap-8 bg-dark-800/80 backdrop-blur-sm border border-white/10 px-8 py-4 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-green-400 font-bold uppercase text-sm tracking-wider">Servidor Online</span>
            </div>

            <div className="hidden sm:block w-px h-6 bg-white/10"></div>

            <div className="flex items-center gap-2 text-gray-300">
              <Gamepad2 size={18} className="text-brand-400" />
              <span className="text-sm font-medium">Versão 0.3.7 (PC/Mobile)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Por que escolher a <span className="text-brand-500">Capital City</span>?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Desenvolvemos sistemas exclusivos para proporcionar a melhor imersão possível.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 hover:border-brand-500/50 transition-all group">
              <div className="w-14 h-14 bg-brand-900/50 rounded-xl flex items-center justify-center text-brand-400 mb-6 group-hover:scale-110 transition-transform">
                <Star size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sistemas Exclusivos</h3>
              <p className="text-gray-400">Roubos complexos, sistema de empresas, casas mobiliáveis e muito mais desenvolvido do zero.</p>
            </div>
            <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 hover:border-brand-500/50 transition-all group">
              <div className="w-14 h-14 bg-brand-900/50 rounded-xl flex items-center justify-center text-brand-400 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Roleplay Sério</h3>
              <p className="text-gray-400">Administração ativa e regras rígidas para garantir um ambiente saudável e divertido para todos.</p>
            </div>
            <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 hover:border-brand-500/50 transition-all group">
              <div className="w-14 h-14 bg-brand-900/50 rounded-xl flex items-center justify-center text-brand-400 mb-6 group-hover:scale-110 transition-transform">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Host BR Otimizado</h3>
              <p className="text-gray-400">Latência baixíssima, proteção DDoS avançada e uptime de 99.9% para você jogar sem preocupações.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20 bg-dark-800 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Últimas Notícias</h2>
              <p className="text-gray-400">Fique por dentro das atualizações.</p>
            </div>
            <Link to="/news" className="text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Ver todas as postagens &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((post) => (
              <article key={post.id} className="bg-dark-900 rounded-xl overflow-hidden border border-white/5 hover:shadow-xl hover:shadow-brand-900/20 transition-all group h-full flex flex-col">
                <div className="h-48 overflow-hidden relative">
                   <div className="absolute inset-0 bg-brand-500/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                   <img 
                    src={post.imageUrl || config.newsDefaultImageUrl || 'https://picsum.photos/800/400'} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="bg-dark-800 px-2 py-1 rounded border border-white/5">{post.date}</span>
                    <span>por <span className="text-brand-400">{post.author}</span></span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">{post.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4 flex-grow">{post.summary}</p>
                  <Link to="/news" className="text-brand-400 text-sm font-semibold hover:text-brand-300 mt-auto">Ler na íntegra</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Selection Modal */}
      {showPlatformModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-800 rounded-2xl border border-white/10 w-full max-w-2xl relative shadow-2xl overflow-hidden">
            <button 
              onClick={() => setShowPlatformModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 bg-dark-900/50 rounded-full p-1"
            >
              <X size={24} />
            </button>
            
            <div className="p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Escolha sua Plataforma</h2>
              <p className="text-gray-400 mb-8">Como você deseja jogar em Capital City?</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* PC Option */}
                <button 
                  onClick={() => handlePlatformSelect('pc')}
                  className="group relative bg-dark-900 p-6 rounded-xl border border-white/5 hover:border-brand-500 hover:bg-dark-900/80 transition-all text-left flex flex-col items-center justify-center gap-4 py-12"
                >
                  <div className="w-20 h-20 bg-brand-600/10 rounded-full flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all text-brand-500">
                    <Monitor size={40} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-1">Computador</h3>
                    <p className="text-sm text-gray-500 group-hover:text-gray-300">Cliente SA-MP PC</p>
                  </div>
                </button>

                {/* Mobile Option */}
                <button 
                  onClick={() => handlePlatformSelect('mobile')}
                  className="group relative bg-dark-900 p-6 rounded-xl border border-white/5 hover:border-brand-500 hover:bg-dark-900/80 transition-all text-left flex flex-col items-center justify-center gap-4 py-12"
                >
                  <div className="w-20 h-20 bg-brand-600/10 rounded-full flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all text-brand-500">
                    <Smartphone size={40} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-1">Android</h3>
                    <p className="text-sm text-gray-500 group-hover:text-gray-300">APK Mobile / Launcher</p>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="bg-dark-900 p-4 text-center text-sm text-gray-500 border-t border-white/5">
              Ambas as plataformas jogam juntas no mesmo servidor!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};