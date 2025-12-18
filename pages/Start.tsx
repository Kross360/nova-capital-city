
import React, { useEffect, useState } from 'react';
import { Download, PlayCircle, Monitor, Smartphone, Zap, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { ServerConfig } from '../types';
import { useToast } from '../components/ToastSystem';

export const Start: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'pc' | 'mobile'>('pc');
  const [config, setConfig] = useState<ServerConfig | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    StorageService.getConfig().then(setConfig);
    const platform = searchParams.get('platform');
    if (platform === 'mobile') setActiveTab('mobile');
  }, [searchParams]);

  const handleDownload = (type: 'pc' | 'mobile') => {
    const url = type === 'pc' ? config?.pcDownloadUrl : config?.mobileDownloadUrl;
    if (url && url.trim() !== '') {
      window.open(url, '_blank');
      addToast('Download iniciado!', 'success');
    } else {
      addToast('Link ainda não configurado pela administração.', 'error');
    }
  };

  if (!config) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  return (
    <div className="py-12 px-6 max-w-5xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Instalação Facilitada</h1>
        <p className="text-gray-500 text-lg font-medium max-w-xl mx-auto">Tudo o que você precisa para entrar na metrópole hoje mesmo.</p>
      </div>

      {/* Platform Selector */}
      <div className="flex justify-center mb-12">
        <div className="bg-dark-800 p-1 rounded-xl inline-flex border border-white/10 shadow-lg">
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black transition-all text-sm ${
              activeTab === 'pc' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Monitor size={18} /> PC / DESKTOP
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-black transition-all text-sm ${
              activeTab === 'mobile' ? 'bg-brand-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Smartphone size={18} /> MOBILE
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 group hover:border-brand-500/30 transition-all shadow-xl">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black text-lg mb-6">1</div>
          <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">O Launcher</h3>
          <p className="text-gray-400 text-sm font-medium mb-6 leading-relaxed">
            {activeTab === 'pc' 
              ? 'Baixe nosso launcher exclusivo que já inclui o jogo completo pré-configurado.' 
              : 'Baixe o APK oficial otimizado para celulares Android com FPS desbloqueado.'}
          </p>
          <button 
            onClick={() => handleDownload(activeTab)}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
          >
            <Download size={18} /> DOWNLOAD
          </button>
        </div>

        {/* Step 2 */}
        <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 group hover:border-brand-500/30 transition-all shadow-xl">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black text-lg mb-6">2</div>
          <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Identidade</h3>
          <p className="text-gray-400 text-sm font-medium mb-6 leading-relaxed">
            Após abrir o launcher, insira seu Nick no formato <span className="text-brand-400 font-bold">Nome_Sobrenome</span>.
          </p>
          <div className="bg-dark-900/50 p-3 rounded-lg border border-white/5 text-[10px] font-mono text-gray-500">
            Exemplo: Bruno_Capitane
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 group hover:border-brand-500/30 transition-all shadow-xl">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black text-lg mb-6">3</div>
          <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Conecte-se</h3>
          <p className="text-gray-400 text-sm font-medium mb-6 leading-relaxed">
            Clique no botão "Entrar na Cidade" e prepare-se para escrever sua história.
          </p>
          <div className="flex items-center gap-2 text-green-500 font-black text-xs uppercase">
             <ShieldCheck size={16}/> Conexão Segura
          </div>
        </div>
      </div>
    </div>
  );
};
