
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
    <div className="relative py-24 px-6 overflow-hidden min-h-screen">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-900/90 to-dark-900"></div>
        {config.aboutImageUrl && (
          <img 
            src={config.aboutImageUrl} 
            className="w-full h-full object-cover opacity-20 blur-xl scale-110"
            alt=""
          />
        )}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-24 animate-fade-in-down">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter uppercase leading-none">
            Quem Somos <br/> <span className="text-brand-500">Capital City</span>
          </h1>
          <p className="text-gray-500 text-2xl font-medium max-w-3xl mx-auto leading-tight">
            Nascemos de uma visão: criar o servidor de SA-MP mais estável, justo e imersivo do Brasil.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-center mb-40">
          <div className="space-y-10 animate-fade-in-left">
            <div className="space-y-6">
              <h2 className="text-4xl font-black text-white tracking-tight uppercase">Nossa Jornada</h2>
              <p className="text-gray-400 text-xl leading-relaxed font-medium">
                Desde 2020, trabalhamos incansavelmente para refinar cada sistema de script. Nosso foco não é apenas o jogo, mas a comunidade que o habita.
              </p>
              <p className="text-gray-500 text-lg leading-relaxed">
                Aqui, cada cidadão tem voz. Nossa economia foi desenhada por especialistas para garantir que o esforço seja recompensado e a diversão seja constante.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
               <div className="bg-dark-800/50 p-6 rounded-3xl border border-white/5 flex items-center gap-4">
                  <div className="p-3 bg-brand-600/10 text-brand-500 rounded-xl"><Globe size={24}/></div>
                  <div>
                    <p className="text-white font-black text-lg">ONLINE</p>
                    <p className="text-[10px] text-gray-500 uppercase font-black">24 Horas</p>
                  </div>
               </div>
               <div className="bg-dark-800/50 p-6 rounded-3xl border border-white/5 flex items-center gap-4">
                  <div className="p-3 bg-brand-600/10 text-brand-500 rounded-xl"><Users size={24}/></div>
                  <div>
                    <p className="text-white font-black text-lg">50K+</p>
                    <p className="text-[10px] text-gray-500 uppercase font-black">Cidadãos</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative animate-fade-in-right">
            <div className="absolute -inset-4 bg-brand-600 rounded-[3rem] opacity-20 blur-2xl"></div>
            <img 
              src={config.aboutImageUrl || "https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=800"} 
              alt="Metropole Capital" 
              className="relative rounded-[2.5rem] shadow-2xl border border-white/10 w-full object-cover aspect-video hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute -bottom-10 -right-10 bg-brand-600 p-8 rounded-[2rem] shadow-2xl animate-bounce-slow">
               <ShieldCheck size={48} className="text-white" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="p-12 bg-dark-800/40 rounded-[3rem] border border-white/5 hover:border-brand-500/20 transition-all text-center">
             <div className="w-16 h-16 bg-brand-600/10 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-8"><Zap size={32}/></div>
             <h3 className="text-2xl font-black text-white mb-4 uppercase">Inovação</h3>
             <p className="text-gray-500 font-medium">Sistemas únicos que você só encontra na nossa metrópole.</p>
          </div>
          <div className="p-12 bg-dark-800/40 rounded-[3rem] border border-white/5 hover:border-brand-500/20 transition-all text-center">
             <div className="w-16 h-16 bg-brand-600/10 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-8"><Heart size={32}/></div>
             <h3 className="text-2xl font-black text-white mb-4 uppercase">Paixão</h3>
             <p className="text-gray-500 font-medium">Construído por jogadores, para jogadores.</p>
          </div>
          <div className="p-12 bg-dark-800/40 rounded-[3rem] border border-white/5 hover:border-brand-500/20 transition-all text-center">
             <div className="w-16 h-16 bg-brand-600/10 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-8"><ShieldCheck size={32}/></div>
             <h3 className="text-2xl font-black text-white mb-4 uppercase">Justiça</h3>
             <p className="text-gray-500 font-medium">Administração imparcial e regras claras para todos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
