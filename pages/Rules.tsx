import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Rule } from '../types';
import { Shield, AlertTriangle, Book, Gavel } from 'lucide-react';

export const Rules: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    StorageService.getRules().then(setRules);
  }, []);

  const categories = [
    { id: 'GENERAL', label: 'Regras Gerais', icon: <Book size={20} className="text-blue-400"/> },
    { id: 'COMBAT', label: 'Combate (PVP)', icon: <Shield size={20} className="text-red-400"/> },
    { id: 'ILLEGAL', label: 'Ilegalidades', icon: <Gavel size={20} className="text-orange-400"/> },
    { id: 'SAFEZONE', label: 'Safe Zones', icon: <AlertTriangle size={20} className="text-green-400"/> },
  ];

  return (
    <div className="py-12 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">Regras do Servidor</h1>
        <p className="text-gray-400">O desconhecimento das regras não isenta o jogador da punição. Leia com atenção.</p>
      </div>

      <div className="grid gap-12">
        {categories.map((cat) => {
          const categoryRules = rules.filter(r => r.category === cat.id);
          if (categoryRules.length === 0) return null;

          return (
            <div key={cat.id} className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                {cat.icon}
                <h2 className="text-2xl font-bold text-white">{cat.label}</h2>
              </div>
              
              <div className="grid gap-4">
                {categoryRules.map((rule, index) => (
                  <div key={rule.id} className="bg-dark-800 p-6 rounded-lg border-l-4 border-brand-500 hover:bg-dark-700 transition-colors">
                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                      <span className="text-brand-500">#{index + 1}</span> {rule.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {rule.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};