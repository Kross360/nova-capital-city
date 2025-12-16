import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { ShopItem, Category, ServerConfig } from '../types';
import { ShoppingCart, Filter, Search, Check, Coins, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Shop: React.FC = () => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [config, setConfig] = useState<ServerConfig>({} as ServerConfig);
  const navigate = useNavigate();

  useEffect(() => {
    StorageService.getShopItems().then(setItems);
    StorageService.getConfig().then(setConfig);
  }, []);

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'ALL' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: { id: Category | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'COINS', label: 'CapiCoins' },
    { id: 'VIP', label: 'VIPs' },
    { id: 'VEHICLE', label: 'Veículos' },
    { id: 'MANSION', label: 'Mansões' },
    { id: 'ORG', label: 'Organizações' },
    { id: 'SPECIAL', label: 'Especiais' },
  ];

  const handleBuy = (itemId: string) => {
    navigate(`/checkout/${itemId}`);
  };

  const handleBuyCoins = () => {
    navigate('/checkout/capicoins');
  }

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Loja Oficial</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Adquira CapiCoins, VIPs e itens exclusivos para melhorar sua jogabilidade e apoiar o servidor.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-dark-800 p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter size={20} className="text-gray-500 mr-2 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                filter === cat.id 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              {cat.id === 'COINS' && <Coins size={14} className={filter === 'COINS' ? 'text-yellow-300' : 'text-yellow-500'} />}
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-dark-900 border border-dark-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* SPECIAL CAPICOIN CARD - Always shows if Filter is ALL or COINS */}
        {(filter === 'ALL' || filter === 'COINS') && (
           <div className="bg-gradient-to-br from-yellow-900/50 to-dark-800 rounded-xl overflow-hidden border border-yellow-500/30 hover:border-yellow-400 transition-all group flex flex-col shadow-lg shadow-yellow-900/10">
              <div className="relative h-48 overflow-hidden bg-dark-900 flex items-center justify-center">
                 <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/coins/400/300')] opacity-20 blur-sm"></div>
                 <div className="z-10 text-center">
                    <Coins size={64} className="text-yellow-400 mx-auto mb-2 drop-shadow-lg" />
                    <p className="text-yellow-200 font-bold uppercase tracking-widest text-sm">Moeda Premium</p>
                 </div>
                 <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded uppercase bg-yellow-500 text-black">
                    Recomendado
                 </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-white mb-1">Comprar CapiCoins</h3>
                <p className="text-xs text-yellow-500 font-medium mb-3">Valor atual: R$ {config.capiCoinPrice?.toFixed(2)} / unidade</p>
                
                <div className="text-gray-400 text-sm mb-6 flex-grow space-y-2">
                   <p>A moeda oficial do servidor. Use para comprar carros de luxo, mansões e itens exclusivos dentro do jogo.</p>
                   <p className="text-xs text-gray-500 italic mt-2">* Escolha a quantidade desejada no próximo passo.</p>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5">
                  <button 
                    onClick={handleBuyCoins}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center gap-2 font-bold shadow-lg shadow-yellow-600/20"
                  >
                    <PlusCircle size={20} />
                    <span>CALCULAR & COMPRAR</span>
                  </button>
                </div>
              </div>
           </div>
        )}

        {/* REGULAR ITEMS */}
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-dark-800 rounded-xl overflow-hidden border border-white/5 hover:border-brand-500/50 transition-all group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded uppercase ${item.category === 'COINS' ? 'bg-yellow-500 text-black' : 'bg-brand-600 text-white'}`}>
                  {item.category === 'COINS' ? 'PACOTE' : item.category}
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-white mb-3">{item.name}</h3>
                
                {/* Lista de Benefícios */}
                <div className="text-gray-400 text-sm mb-6 flex-grow space-y-2">
                  {item.description.includes(',') ? (
                    item.description.split(',').map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                        <span className="leading-tight">{benefit.trim()}</span>
                      </div>
                    ))
                  ) : (
                    <p>{item.description}</p>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">R$ {item.price.toFixed(2)}</span>
                  <button 
                    onClick={() => handleBuy(item.id)}
                    className="bg-white/10 hover:bg-brand-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:bg-brand-600"
                  >
                    <span className="text-sm font-bold">COMPRAR</span>
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
           // Se não houver itens e não for categoria COINS (pois COINS sempre mostra o card especial), mostra msg vazio
           (filter !== 'ALL' && filter !== 'COINS') && (
            <div className="col-span-full text-center py-20 text-gray-500 bg-dark-800/50 rounded-xl border border-dashed border-white/5">
               <Coins size={48} className="mx-auto mb-4 text-gray-600" />
               <p>Nenhum item encontrado nesta categoria.</p>
            </div>
           )
        )}
      </div>
    </div>
  );
};