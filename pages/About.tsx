import React, { useEffect, useState } from 'react';
import { MapPin, Users, Heart } from 'lucide-react';
import { StorageService } from '../services/storage';
import { ServerConfig } from '../types';

export const About: React.FC = () => {
  const [config, setConfig] = useState<ServerConfig>({} as ServerConfig);

  useEffect(() => {
    StorageService.getConfig().then(setConfig);
  }, []);

  return (
    <div className="relative py-12 px-4 overflow-hidden">
      {/* Dynamic Background Effect */}
      {config.aboutImageUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden opacity-10 pointer-events-none">
           <img 
            src={config.aboutImageUrl} 
            className="w-full h-full object-cover blur-3xl scale-125"
            alt=""
           />
           <div className="absolute inset-0 bg-dark-900/50"></div>
        </div>
      )}

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">A História de <br/><span className="text-brand-500">Capital City</span></h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Fundada em 2020, Capital City nasceu do desejo de criar um ambiente de Roleplay que unisse a liberdade do mundo aberto com a seriedade de uma simulação de vida real.
            </p>
            <p className="text-gray-400 mb-6">
              Nossa cidade virtual foi construída tijolo por tijolo (ou linha de código por linha de código) para oferecer a economia mais balanceada e os sistemas mais justos do cenário SA-MP brasileiro.
            </p>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-brand-400 bg-brand-900/20 px-4 py-2 rounded-full border border-brand-500/10">
                 <MapPin size={16} /> Los Santos Base
               </div>
               <div className="flex items-center gap-2 text-brand-400 bg-brand-900/20 px-4 py-2 rounded-full border border-brand-500/10">
                 <Users size={16} /> +50k Contas
               </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-brand-500 rounded-2xl transform rotate-3 opacity-20 group-hover:rotate-6 transition-transform"></div>
            <img 
              src={config.aboutImageUrl || "https://picsum.photos/600/400?grayscale"} 
              alt="City landscape" 
              className="relative rounded-2xl shadow-2xl border border-white/10 w-full object-cover aspect-video"
            />
          </div>
        </div>

        <div className="bg-dark-800/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5">
             <Heart size={200} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 relative z-10">Nosso Conceito de RP</h2>
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-brand-400 mb-2">Imersão</h3>
              <p className="text-gray-400 text-sm">Focamos na interpretação do personagem. Aqui, suas ações têm consequências reais dentro do jogo.</p>
            </div>
             <div>
              <h3 className="text-xl font-bold text-brand-400 mb-2">Comunidade</h3>
              <p className="text-gray-400 text-sm">Construímos uma comunidade acolhedora, onde novatos são bem-vindos e veteranos são respeitados.</p>
            </div>
             <div>
              <h3 className="text-xl font-bold text-brand-400 mb-2">Inovação</h3>
              <p className="text-gray-400 text-sm">Atualizações constantes trazendo o que há de mais moderno em sistemas de script para SA-MP.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};