
import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Rule } from '../types';
import { Shield, AlertTriangle, Book, Gavel, FileText } from 'lucide-react';

export const Rules: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    StorageService.getRules().then(setRules);
  }, []);

  const categories = [
    { id: 'GENERAL', label: 'Código Civil', icon: <Book size={24} className="text-brand-400"/> },
    { id: 'COMBAT', label: 'Diretrizes de Combate', icon: <Shield size={24} className="text-red-500"/> },
    { id: 'ILLEGAL', label: 'Atividades Ilícitas', icon: <Gavel size={24} className="text-orange-500"/> },
    { id: 'SAFEZONE', label: 'Zonas de Segurança', icon: <AlertTriangle size={24} className="text-green-500"/> },
  ];

  return (
    <div className="py-16 px-6 max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-16">
        <div className="inline-block p-4 bg-brand-600/10 rounded-2xl border border-brand-500/20 text-brand-400 mb-6">
           <FileText size={32} />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Constituição de Capital</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
          O desconhecimento deste documento não isenta o cidadão de punições. A ordem é o pilar da nossa metrópole.
        </p>
      </div>

      <div className="space-y-16">
        {categories.map((cat) => {
          const categoryRules = rules.filter(r => r.category === cat.id);
          if (categoryRules.length === 0) return null;

          return (
            <section key={cat.id} className="animate-fade-in-up">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/5 relative">
                <div className="absolute bottom-0 left-0 w-20 h-1 bg-brand-600"></div>
                {cat.icon}
                <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{cat.label}</h2>
              </div>
              
              <div className="grid gap-6">
                {categoryRules.map((rule, index) => (
                  <div key={rule.id} className="bg-dark-800/40 p-8 rounded-2xl border border-white/5 hover:border-brand-500/30 transition-all group relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-brand-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">ARTIGO {index + 1}</span>
                        <h3 className="text-xl font-black text-white tracking-tighter uppercase">{rule.title}</h3>
                      </div>
                      <p className="text-gray-400 text-base leading-relaxed font-medium">
                        {rule.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-24 p-12 bg-dark-800/20 rounded-3xl border border-white/5 text-center">
         <Shield size={48} className="mx-auto mb-6 text-brand-600" />
         <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Compromisso com o Fairplay</h3>
         <p className="text-gray-500 text-base max-w-xl mx-auto font-medium">
            Nossa staff monitora as atividades 24/7 para garantir que a experiência de todos seja protegida contra abusos.
         </p>
      </div>
    </div>
  );
};
