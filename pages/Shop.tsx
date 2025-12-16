import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { ShopItem, Category } from '../types';
import { ShoppingCart, Filter, Search, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Shop: React.FC = () => {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [filter, setFilter] = useState<Category | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    StorageService.getShopItems().then(setItems);
  }, []);

  const filteredItems = items.filter(item => {
    const matchesCategory = filter === 'ALL' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: { id: Category | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'VIP', label: 'VIPs' },
    { id: 'VEHICLE', label: 'Veículos' },
    { id: 'MANSION', label: 'Mansões' },
    { id: 'ORG', label: 'Organizações' },
    { id: 'SPECIAL', label: 'Especiais' },
  ];

  const handleBuy = (itemId: string) => {
    navigate(`/checkout/${itemId}`);
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Loja Oficial</h1>
        <p className="text-gray-400 max-w-2xl mx-auto">Adquira moedas, VIPs e itens exclusivos para melhorar sua jogabilidade e apoiar o servidor.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-dark-800 p-4 rounded-xl border border-white/5">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
          <Filter size={20} className="text-gray-500 mr-2 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === cat.id 
                  ? 'bg-brand-600 text-white' 
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
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
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-dark-800 rounded-xl overflow-hidden border border-white/5 hover:border-brand-500/50 transition-all group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className="absolute top-2 right-2 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">
                  {item.category}
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
          <div className="col-span-full text-center py-20 text-gray-500">
            Nenhum item encontrado nesta categoria.
          </div>
        )}
      </div>
    </div>
  );
};