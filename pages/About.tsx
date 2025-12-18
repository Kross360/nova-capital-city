
import React, { useEffect, useState } from 'react';
import { MapPin, Users, Heart, ShieldCheck, Zap, Globe } from 'lucide-react';
import { StorageService } from '../services/storage';
import { ServerConfig } from '../types';

export const About: React.FC = () => {
  const [config, setConfig] = useState<ServerConfig>({} as ServerConfig);

  useEffect(() => {
    StorageService.getConfig().then(setConfig);
  }, []);

  return (
    <div className="relative py-16 px-6 overflow-hidden min-h-screen">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-900/95 to-dark-900"></div>
        {config.aboutImageUrl && (
          <img 
            src={config.aboutImageUrl} 
            className="w-full h-full object-cover opacity-10 blur-xl"
            alt=""
          />
        )}
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16 animate-fade-in-down">
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase leading-none">
            Quem Somos <br/> <span className="text-brand-500">Capital City</span>
          </h1>
          <p className="text-gray-500 text-xl font-medium max-w-2xl mx-auto">
            Nascemos de uma visão: criar o servidor de SA-MP mais estável, justo e imersivo do Brasil.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-8 animate-fade-in-left">
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">Nossa Jornada</h2>
              <p className="text-gray-400 text-lg leading-relaxed font-medium">
                Desde 2020, trabalhamos incansavelmente para refinar cada sistema de script. Nosso foco não é apenas o jogo, mas a comunidade que o habita.
              </p>
              <p className="text-gray-500 text-base leading-relaxed">
                Aqui, cada cidadão tem voz. Nossa economia foi desenhada para garantir que o esforço seja recompensado.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-dark-800/50 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                  <div className="p-2 bg-brand-600/10 text-brand-500 rounded-lg"><Globe size={20}/></div>
                  <div>
                    <p className="text-white font-black text-base">ONLINE</p>
                    <p className="text-[8px] text-gray-500 uppercase font-black">24 Horas</p>
                  </div>
               </div>
               <div className="bg-dark-800/50 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                  <div className="p-2 bg-brand-600/10 text-brand-500 rounded-lg"><Users size={20}/></div>
                  <div>
                    <p className="text-white font-black text-base">50K+</p>
                    <p className="text-[8px] text-gray-500 uppercase font-black">Cidadãos</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative animate-fade-in-right">
            <img 
              src={config.aboutImageUrl || "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800"} 
              alt="Metropole Capital" 
              className="relative rounded-3xl shadow-2xl border border-white/10 w-full object-cover aspect-video"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <div className="p-8 bg-dark-800/40 rounded-2xl border border-white/5 hover:border-brand-500/20 transition-all text-center">
             <div className="w-12 h-12 bg-brand-600/10 text-brand-500 rounded-xl flex items-center justify-center mx-auto mb-6"><Zap size={24}/></div>
             <h3 className="text-xl font-black text-white mb-2 uppercase">Inovação</h3>
             <p className="text-gray-500 text-sm font-medium">Sistemas únicos que você só encontra aqui.</p>
          </div>
          <div className="p-8 bg-dark-800/40 rounded-2xl border border-white/5 hover:border-brand-500/20 transition-all text-center">
             <div className="w-12 h-12 bg-brand-600/10 text-brand-500 rounded-xl flex items-center justify-center mx-auto mb-6"><Heart size={24}/></div>
             <h3 className="text-xl font-black text-white mb-2 uppercase">Paixão</h3>
             <p className="text-gray-500 text-sm font-medium">Construído por jogadores, para jogadores.</p>
          </div>
          <div className="p-8 bg-dark-800/40 rounded-2xl border border-white/5 hover:border-brand-500/20 transition-all text-center">
             <div className="w-12 h-12 bg-brand-600/10 text-brand-500 rounded-xl flex items-center justify-center mx-auto mb-6"><ShieldCheck size={24}/></div>
             <h3 className="text-xl font-black text-white mb-2 uppercase">Justiça</h3>
             <p className="text-gray-500 text-sm font-medium">Administração imparcial e regras claras.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
