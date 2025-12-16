import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { NewsPost } from '../types';
import { Calendar, User } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsPost[]>([]);

  useEffect(() => {
    StorageService.getNews().then(setNews);
  }, []);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Notícias & Atualizações</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Acompanhe o desenvolvimento do servidor, notas de atualização, eventos especiais e anúncios da comunidade.
          </p>
        </div>

        <div className="space-y-12">
          {news.length > 0 ? (
            news.map((post) => (
              <article key={post.id} className="bg-dark-800 rounded-2xl overflow-hidden border border-white/5 shadow-2xl flex flex-col md:flex-row group">
                {/* Imagem */}
                <div className="md:w-2/5 relative overflow-hidden h-64 md:h-auto">
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-60 z-10 md:hidden"></div>
                  <img 
                    src={post.imageUrl || `https://picsum.photos/800/600?random=${post.id}`} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                </div>

                {/* Conteúdo */}
                <div className="p-8 md:w-3/5 flex flex-col">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1 bg-dark-900 px-3 py-1 rounded-full border border-white/5">
                      <Calendar size={14} className="text-brand-400" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} className="text-brand-400" />
                      <span>{post.author}</span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-brand-400 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {post.summary}
                  </p>

                  <div className="bg-dark-900/50 p-4 rounded-lg border border-white/5 text-gray-400 text-sm italic">
                     {/* Simulating Full Content Preview */}
                     "{post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content}"
                  </div>

                  <div className="mt-auto pt-6 flex justify-end">
                    <button className="text-brand-400 font-bold hover:text-white transition-colors">
                      Continuar Lendo &rarr;
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : (
             <div className="text-center py-20 bg-dark-800 rounded-xl border border-white/5">
               <p className="text-gray-500 text-xl">Nenhuma notícia publicada ainda.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};