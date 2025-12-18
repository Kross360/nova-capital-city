
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
    { id: 'GENERAL', label: 'Código Civil', icon: <Book size={32} className="text-brand-400"/> },
    { id: 'COMBAT', label: 'Diretrizes de Combate', icon: <Shield size={32} className="text-red-500"/> },
    { id: 'ILLEGAL', label: 'Atividades Ilícitas', icon: <Gavel size={32} className="text-orange-500"/> },
    { id: 'SAFEZONE', label: 'Zonas de Segurança', icon: <AlertTriangle size={32} className="text-green-500"/> },
  ];

  return (
    <div className="py-24 px-6 max-w-6xl mx-auto animate-fade-in">
      <div className="text-center mb-32">
        <div className="inline-block p-4 bg-brand-600/10 rounded-3xl border border-brand-500/20 text-brand-400 mb-8">
           <FileText size={48} />
        </div>
        <h1 className="text-7xl font-black text-white mb-8 tracking-tighter uppercase">Constituição de Capital</h1>
        <p className="text-gray-500 text-2xl max-w-3xl mx-auto font-medium leading-tight">
          O desconhecimento deste documento não isenta o cidadão de punições. A ordem é o pilar da nossa metrópole.
        </p>
      </div>

      <div className="space-y-32">
        {categories.map((cat) => {
          const categoryRules = rules.filter(r => r.category === cat.id);
          if (categoryRules.length === 0) return null;

          return (
            <section key={cat.id} className="animate-fade-in-up">
              <div className="flex items-center gap-6 mb-16 pb-8 border-b border-white/5 relative">
                <div className="absolute bottom-0 left-0 w-32 h-1 bg-brand-600"></div>
                {cat.icon}
                <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{cat.label}</h2>
              </div>
              
              <div className="grid gap-10">
                {categoryRules.map((rule, index) => (
                  <div key={rule.id} className="bg-dark-800/40 p-12 rounded-[3rem] border border-white/5 hover:border-brand-500/30 transition-all group relative overflow-hidden shadow-2xl">
                    <div className="absolute -right-8 -bottom-8 opacity-[0.02] group-hover:scale-110 transition-transform duration-700">
                       {cat.icon}
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <span className="bg-brand-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">ARTIGO {index + 1}</span>
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{rule.title}</h3>
                      </div>
                      <p className="text-gray-400 text-xl leading-relaxed font-medium">
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

      <div className="mt-40 p-20 bg-dark-800/20 rounded-[4rem] border border-white/5 text-center">
         <Shield size={64} className="mx-auto mb-8 text-brand-600" />
         <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">COMPROMISSO COM O FAIRPLAY</h3>
         <p className="text-gray-500 text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Nossa staff monitora as atividades 24/7 para garantir que a experiência de todos seja protegida contra abusos e comportamentos tóxicos.
         </p>
      </div>
    </div>
  );
};
