import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Trophy, Medal } from 'lucide-react';
import { PlayerStats } from '../types';

export const Rankings: React.FC = () => {
  const [players, setPlayers] = useState<PlayerStats[]>([]);

  useEffect(() => {
    StorageService.getRankings().then(setPlayers);
  }, []);

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Top Jogadores</h1>
        <p className="text-gray-400">Os lendários de Capital City.</p>
      </div>

      <div className="bg-dark-800 rounded-xl overflow-hidden border border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-900 border-b border-white/10">
                <th className="px-6 py-4 text-gray-400 font-medium uppercase text-sm">Posição</th>
                <th className="px-6 py-4 text-gray-400 font-medium uppercase text-sm">Jogador</th>
                <th className="px-6 py-4 text-gray-400 font-medium uppercase text-sm">Cargo/Org</th>
                <th className="px-6 py-4 text-gray-400 font-medium uppercase text-sm text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {players.length > 0 ? (
                players.map((player, index) => (
                  <tr key={player.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy size={20} className="text-yellow-400" />}
                        {index === 1 && <Medal size={20} className="text-gray-400" />}
                        {index === 2 && <Medal size={20} className="text-amber-700" />}
                        <span className={`font-bold ${index < 3 ? 'text-white' : 'text-gray-500'}`}>#{index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">{player.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-brand-900/50 text-brand-300 text-xs font-semibold border border-brand-500/20">
                        {player.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-gray-300 font-mono">{player.score}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={4} className="text-center py-8 text-gray-500">Nenhum ranking disponível ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};