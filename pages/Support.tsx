import React, { useEffect, useState } from 'react';
import { MessageCircle, HelpCircle, AlertOctagon } from 'lucide-react';
import { StorageService } from '../services/storage';
import { ServerConfig } from '../types';

export const Support: React.FC = () => {
  const [config, setConfig] = useState<ServerConfig>({} as ServerConfig);

  useEffect(() => {
    StorageService.getConfig().then(setConfig);
  }, []);

  const openDiscord = () => {
    if (config.discordUrl) {
      window.open(config.discordUrl, '_blank');
    } else {
      alert('Link do Discord não configurado.');
    }
  };

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Central de Suporte</h1>
        <p className="text-gray-400">Precisando de ajuda? Nossa equipe está pronta para te atender.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div 
          onClick={openDiscord}
          className="bg-[#5865F2] p-8 rounded-xl text-white flex flex-col items-center text-center hover:bg-[#4752c4] transition-colors cursor-pointer group"
        >
          <MessageCircle size={48} className="mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-2xl font-bold mb-2">Discord Oficial</h2>
          <p className="mb-6 opacity-90">Abra tickets, denuncie jogadores e tire dúvidas em tempo real com nossa staff.</p>
          <button className="bg-white text-[#5865F2] px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform shadow-lg">
            Entrar no Discord
          </button>
        </div>

        <div className="bg-dark-800 p-8 rounded-xl border border-white/5 flex flex-col items-center text-center">
          <AlertOctagon size={48} className="mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-white mb-2">Denúncias Fórum</h2>
          <p className="mb-6 text-gray-400">Para denúncias complexas que exigem provas em vídeo, utilize nosso fórum.</p>
          <button className="bg-dark-700 text-white px-6 py-2 rounded-full font-bold hover:bg-dark-600 transition-colors cursor-not-allowed opacity-50">
            Acessar Fórum (Em Breve)
          </button>
        </div>
      </div>

      <div className="bg-dark-800 rounded-xl p-8 border border-white/5">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <HelpCircle size={24} className="text-brand-400" />
          Perguntas Frequentes (FAQ)
        </h3>
        
        <div className="space-y-4">
          <details className="group bg-dark-900 rounded-lg p-4 cursor-pointer">
            <summary className="font-medium text-white flex justify-between items-center">
              Como recupero minha senha?
              <span className="text-brand-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              Você pode recuperar sua senha através do nosso Discord abrindo um ticket na área de "Recuperação de Contas". Será necessário provar que a conta é sua.
            </p>
          </details>

          <details className="group bg-dark-900 rounded-lg p-4 cursor-pointer">
            <summary className="font-medium text-white flex justify-between items-center">
              Como viro VIP?
              <span className="text-brand-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              Acesse a página "Loja VIP" neste site, escolha o pacote desejado e siga as instruções de pagamento. A ativação é automática após a compensação.
            </p>
          </details>

          <details className="group bg-dark-900 rounded-lg p-4 cursor-pointer">
            <summary className="font-medium text-white flex justify-between items-center">
              Onde baixo o jogo?
              <span className="text-brand-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-gray-400 mt-2 text-sm leading-relaxed">
              Na página "Começar Agora" disponibilizamos links seguros e verificados para o GTA San Andreas e o cliente SA-MP.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
};