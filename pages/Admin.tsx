
import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';
import { ShopItem, Rule, NewsPost, Category, PaymentRequest, ServerConfig, ChatMessage } from '../types';
import { 
  Trash2, Plus, LogOut, LogIn, LayoutGrid, ScrollText, Newspaper, 
  CreditCard, CheckCircle, XCircle, Eye, RefreshCw, Settings, Save, 
  Smartphone, Monitor, MessageCircle, ImageIcon, Send, Shield, 
  User, Loader2, Coins, Pencil, X, Bell, Lock, Download, 
  ExternalLink, DollarSign, Clock, Hash, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastSystem';

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('capital_admin_auth') === 'true';
  });
  
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'PAYMENTS' | 'SHOP' | 'RULES' | 'NEWS' | 'CONFIG'>('PAYMENTS');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Data States
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [config, setConfig] = useState<ServerConfig>({} as ServerConfig);

  // Modals & Chat
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ShopItem> | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<Rule> | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<Partial<NewsPost> | null>(null);
  
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [activeChatOrder, setActiveChatOrder] = useState<PaymentRequest | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const refreshData = async () => {
    setLoading(true);
    try {
      const [sItems, sRules, sNews, sPayments, sConfig] = await Promise.all([
        StorageService.getShopItems(),
        StorageService.getRules(),
        StorageService.getNews(),
        StorageService.getPayments(),
        StorageService.getConfig()
      ]);
      setShopItems(sItems);
      setRules(sRules);
      setNews(sNews);
      setPayments(sPayments);
      setConfig(sConfig);
      
      if (activeChatOrder) {
        const updatedChat = sPayments.find(p => p.id === activeChatOrder.id);
        if (updatedChat) {
          const detailed = await StorageService.getPaymentById(updatedChat.id);
          setActiveChatOrder(detailed);
        }
      }
    } catch (err) {
      addToast('Erro ao sincronizar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) refreshData();
    
    let interval: number;
    if (isAuthenticated && activeChatOrder) {
      interval = window.setInterval(refreshData, 5000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated, activeChatOrder?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatOrder?.messages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'CAPITAL2025') {
      setIsAuthenticated(true);
      sessionStorage.setItem('capital_admin_auth', 'true');
      addToast('Acesso autorizado.', 'success');
    } else {
      addToast('Senha incorreta.', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('capital_admin_auth');
    navigate('/');
  };

  // --- ACTIONS: SHOP ---
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      if (editingItem.id) {
        await StorageService.updateShopItem(editingItem.id, editingItem);
        addToast('Item atualizado com sucesso.', 'success');
      } else {
        await StorageService.addShopItem(editingItem as any);
        addToast('Item adicionado à loja.', 'success');
      }
      setShowItemModal(false);
      refreshData();
    } catch (e) { 
      console.error(e);
      addToast('Erro ao salvar item.', 'error'); 
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Excluir este item da loja permanentemente?')) return;
    try {
      await StorageService.deleteShopItem(id);
      addToast('Item removido.', 'success');
      refreshData();
    } catch (e) { addToast('Erro ao excluir.', 'error'); }
  };

  // --- ACTIONS: RULES ---
  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    try {
      if (editingRule.id) {
        await StorageService.updateRule(editingRule.id, editingRule);
        addToast('Artigo atualizado.', 'success');
      } else {
        await StorageService.addRule(editingRule as any);
        addToast('Regra adicionada à Constituição.', 'success');
      }
      setShowRuleModal(false);
      refreshData();
    } catch (e) { 
      console.error(e);
      addToast('Erro ao salvar regra.', 'error'); 
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Deseja excluir este artigo da Constituição?')) return;
    try {
      await StorageService.deleteRule(id);
      addToast('Regra removida.', 'success');
      refreshData();
    } catch (e) { addToast('Erro ao excluir regra.', 'error'); }
  };

  // --- ACTIONS: NEWS ---
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    try {
      if (editingNews.id) {
        await StorageService.updateNews(editingNews.id, editingNews);
        addToast('Notícia atualizada.', 'success');
      } else {
        const payload = {
          ...editingNews,
          author: 'Administração',
          date: new Date().toLocaleDateString('pt-BR')
        };
        await StorageService.addNews(payload as any);
        addToast('Notícia publicada com sucesso!', 'success');
      }
      setShowNewsModal(false);
      refreshData();
    } catch (e) { 
      console.error(e);
      addToast('Erro ao salvar notícia.', 'error'); 
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Deseja remover esta notícia do site?')) return;
    try {
      await StorageService.deleteNews(id);
      addToast('Notícia excluída.', 'success');
      refreshData();
    } catch (e) { addToast('Erro ao excluir notícia.', 'error'); }
  };

  // --- ACTIONS: CONFIG & PAYMENTS (MANTIDOS) ---
  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await StorageService.saveConfig(config);
      addToast('Configurações atualizadas!', 'success');
    } catch (e) { addToast('Erro ao salvar.', 'error'); }
    finally { setSaving(false); }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeChatOrder) return;
    try {
      await StorageService.addOrderMessage(activeChatOrder.id, 'ADMIN', chatMessage);
      setChatMessage('');
      refreshData();
    } catch (e) { addToast('Erro ao enviar mensagem.', 'error'); }
  };

  const updatePaymentStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const note = prompt(status === 'APPROVED' ? 'Instruções de ativação:' : 'Motivo da recusa:');
    try {
      await StorageService.updatePaymentStatus(id, status, note || '');
      addToast(`Pedido ${status === 'APPROVED' ? 'Aprovado' : 'Recusado'}`, 'success');
      refreshData();
    } catch (e) { addToast('Erro no processo.', 'error'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 p-6">
        <div className="w-full max-w-md bg-dark-800 p-12 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <Shield size={64} className="text-brand-500 mx-auto mb-6" />
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Área Governamental</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-dark-900 border border-white/10 rounded-2xl p-5 text-white font-mono text-center"
              placeholder="SENHA MESTRA"
            />
            <button className="w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-5 rounded-2xl transition-all">ENTRAR</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
          <Shield className="text-brand-500" /> Admin <span className="text-brand-500">Center</span>
        </h1>
        <button onClick={handleLogout} className="text-red-500 font-bold flex items-center gap-2 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all">
          <LogOut size={20} /> Sair
        </button>
      </header>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="space-y-2">
          {[
            { id: 'PAYMENTS', label: 'Vendas/Fila', icon: <CreditCard size={20}/> },
            { id: 'SHOP', label: 'Estoque Loja', icon: <LayoutGrid size={20}/> },
            { id: 'RULES', label: 'Constituição', icon: <ScrollText size={20}/> },
            { id: 'NEWS', label: 'Notícias', icon: <Newspaper size={20}/> },
            { id: 'CONFIG', label: 'Sistema Geral', icon: <Settings size={20}/> },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-gray-500 hover:bg-dark-800'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </aside>

        <main className="lg:col-span-3 bg-dark-800 rounded-[2.5rem] border border-white/5 p-10 shadow-2xl min-h-[700px]">
          
          {/* PAYMENTS TAB (SISTEMA DE VENDAS PRESERVADO) */}
          {activeTab === 'PAYMENTS' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase">Fila de Ativação</h2>
                <button onClick={refreshData} className="p-3 bg-dark-900 rounded-xl text-gray-500 hover:text-white transition-all"><RefreshCw size={24} className={loading ? 'animate-spin' : ''}/></button>
              </div>

              <div className="space-y-4">
                {payments.map(p => (
                  <div key={p.id} className="bg-dark-900/50 p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-brand-500/30 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${p.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>{p.status}</span>
                        <span className="text-[10px] text-gray-600 font-mono">{p.id.slice(0,8)}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">{p.itemName}</h3>
                      <p className="text-brand-500 font-black">R$ {p.itemPrice.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">{p.playerNick} (ID: {p.playerId})</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={async () => { const d = await StorageService.getPaymentById(p.id); setActiveChatOrder(d); }} className="bg-brand-600/10 text-brand-500 p-4 rounded-2xl hover:bg-brand-600 hover:text-white transition-all"><MessageCircle size={24}/></button>
                      <button onClick={() => setViewingProof(p.proofImageUrl)} className="bg-white/5 text-white p-4 rounded-2xl hover:bg-white/10 transition-all"><Eye size={24}/></button>
                      {p.status === 'PENDING' && (
                        <>
                          <button onClick={() => updatePaymentStatus(p.id, 'APPROVED')} className="bg-green-600 text-white p-4 rounded-2xl hover:bg-green-500 transition-all"><CheckCircle size={24}/></button>
                          <button onClick={() => updatePaymentStatus(p.id, 'REJECTED')} className="bg-red-600 text-white p-4 rounded-2xl hover:bg-red-500 transition-all"><XCircle size={24}/></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SHOP TAB (FIXED) */}
          {activeTab === 'SHOP' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase">Estoque da Loja</h2>
                <button 
                  onClick={() => { setEditingItem({ category: 'VIP', price: 0, name: '', description: '', imageUrl: '' }); setShowItemModal(true); }} 
                  className="bg-brand-600 px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2"
                >
                  <Plus size={20}/> NOVO PRODUTO
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {shopItems.map(item => (
                  <div key={item.id} className="bg-dark-900/50 p-4 rounded-2xl border border-white/5 flex items-center gap-4 group">
                    <img src={item.imageUrl} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                    <div className="flex-grow">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-brand-500 font-black">R$ {item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingItem(item); setShowItemModal(true); }} className="text-gray-400 hover:text-white p-2 bg-dark-800 rounded-lg"><Pencil size={18}/></button>
                      <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-500 p-2 bg-dark-800 rounded-lg"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RULES TAB (FIXED) */}
          {activeTab === 'RULES' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase">Constituição</h2>
                <button 
                  onClick={() => { setEditingRule({ category: 'GENERAL', title: '', content: '' }); setShowRuleModal(true); }} 
                  className="bg-brand-600 px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2"
                >
                  <Plus size={20}/> NOVO ARTIGO
                </button>
              </div>
              <div className="space-y-4">
                {rules.map(rule => (
                  <div key={rule.id} className="bg-dark-900/50 p-6 rounded-3xl border border-white/5 flex justify-between items-center group">
                    <div className="flex-grow pr-6">
                      <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">{rule.category}</span>
                      <h4 className="font-bold text-white text-lg">{rule.title}</h4>
                      <p className="text-gray-500 text-sm line-clamp-1 mt-1">{rule.content}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingRule(rule); setShowRuleModal(true); }} className="text-gray-400 hover:text-white p-3 bg-dark-800 rounded-xl"><Pencil size={20}/></button>
                      <button onClick={() => handleDeleteRule(rule.id)} className="text-gray-400 hover:text-red-500 p-3 bg-dark-800 rounded-xl"><Trash2 size={20}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NEWS TAB (FIXED) */}
          {activeTab === 'NEWS' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase">Comunicados</h2>
                <button 
                  onClick={() => { setEditingNews({ title: '', summary: '', content: '', imageUrl: '' }); setShowNewsModal(true); }} 
                  className="bg-brand-600 px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2"
                >
                  <Plus size={20}/> NOVA POSTAGEM
                </button>
              </div>
              <div className="space-y-4">
                {news.map(n => (
                  <div key={n.id} className="bg-dark-900/50 p-6 rounded-3xl border border-white/5 flex items-center gap-6 group">
                    <img src={n.imageUrl} className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
                    <div className="flex-grow">
                      <h4 className="font-bold text-white text-lg">{n.title}</h4>
                      <p className="text-gray-500 text-sm line-clamp-1">{n.summary}</p>
                      <p className="text-[10px] text-gray-600 mt-2 uppercase font-black">{n.date}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => { setEditingNews(n); setShowNewsModal(true); }} className="text-gray-400 hover:text-white p-3 bg-dark-800 rounded-xl"><Pencil size={20}/></button>
                      <button onClick={() => handleDeleteNews(n.id)} className="text-gray-400 hover:text-red-500 p-3 bg-dark-800 rounded-xl"><Trash2 size={20}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONFIG TAB (PRESERVADA) */}
          {activeTab === 'CONFIG' && (
            <div className="space-y-10">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Sistema Geral</h2>
                <button onClick={handleSaveConfig} disabled={saving} className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 transition-all">
                  {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>} SALVAR
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <section className="space-y-6">
                  <h3 className="text-lg font-black text-brand-400 flex items-center gap-2 border-l-4 border-brand-500 pl-4">Interface</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase block mb-2">Wallpaper Home</label>
                      <input value={config.homeBackgroundUrl} onChange={e => setConfig({...config, homeBackgroundUrl: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white text-sm" placeholder="https://..." />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase block mb-2">Imagem Quem Somos</label>
                      <input value={config.aboutImageUrl} onChange={e => setConfig({...config, aboutImageUrl: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white text-sm" placeholder="https://..." />
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-lg font-black text-brand-400 flex items-center gap-2 border-l-4 border-brand-500 pl-4">Links</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase block mb-2">Discord Oficial</label>
                      <input value={config.discordUrl} onChange={e => setConfig({...config, discordUrl: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white text-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase block mb-2">Discord Webhook</label>
                      <input value={config.discordWebhookUrl} onChange={e => setConfig({...config, discordWebhookUrl: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white text-xs" />
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-lg font-black text-brand-400 flex items-center gap-2 border-l-4 border-brand-500 pl-4">Downloads</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input value={config.pcDownloadUrl} onChange={e => setConfig({...config, pcDownloadUrl: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white text-xs" placeholder="URL PC" />
                    <input value={config.mobileDownloadUrl} onChange={e => setConfig({...config, mobileDownloadUrl: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white text-xs" placeholder="URL Mobile" />
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-lg font-black text-brand-400 flex items-center gap-2 border-l-4 border-brand-500 pl-4">Financeiro</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" step="0.1" value={config.capiCoinPrice} onChange={e => setConfig({...config, capiCoinPrice: parseFloat(e.target.value)})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white" />
                    <input value={config.pixKey} onChange={e => setConfig({...config, pixKey: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white text-xs" placeholder="Chave PIX" />
                  </div>
                </section>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS --- */}

      {/* SHOP ITEM MODAL */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-dark-800 border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white">{editingItem.id ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}</h3>
              <button onClick={() => setShowItemModal(false)} className="text-gray-500 hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveItem} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Nome do Item" value={editingItem.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="col-span-2 bg-dark-900 border border-white/10 rounded-xl p-4 text-white" />
                <input required type="number" step="0.01" placeholder="Preço (R$)" value={editingItem.price || ''} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} className="bg-dark-900 border border-white/10 rounded-xl p-4 text-white" />
                <select value={editingItem.category || 'VIP'} onChange={e => setEditingItem({...editingItem, category: e.target.value as any})} className="bg-dark-900 border border-white/10 rounded-xl p-4 text-white">
                  <option value="VIP">VIP</option>
                  <option value="VEHICLE">Veículo</option>
                  <option value="MANSION">Mansão</option>
                  <option value="ORG">Organização</option>
                  <option value="SPECIAL">Especial</option>
                  <option value="COINS">CapiCoins</option>
                </select>
                <input required placeholder="Link da Imagem" value={editingItem.imageUrl || ''} onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})} className="col-span-2 bg-dark-900 border border-white/10 rounded-xl p-4 text-white" />
                <textarea required placeholder="Benefícios (separados por vírgula)" value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="col-span-2 bg-dark-900 border border-white/10 rounded-xl p-4 text-white h-24" />
              </div>
              <button className="w-full bg-brand-600 text-white font-black py-5 rounded-2xl shadow-xl">SALVAR NO ESTOQUE</button>
            </form>
          </div>
        </div>
      )}

      {/* RULE MODAL */}
      {showRuleModal && editingRule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-dark-800 border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white">{editingRule.id ? 'EDITAR ARTIGO' : 'NOVO ARTIGO'}</h3>
              <button onClick={() => setShowRuleModal(false)} className="text-gray-500 hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveRule} className="p-8 space-y-4">
              <input required placeholder="Título da Regra" value={editingRule.title || ''} onChange={e => setEditingRule({...editingRule, title: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white font-bold" />
              <select value={editingRule.category || 'GENERAL'} onChange={e => setEditingRule({...editingRule, category: e.target.value as any})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white">
                <option value="GENERAL">Código Civil</option>
                <option value="COMBAT">Diretrizes de Combate</option>
                <option value="ILLEGAL">Atividades Ilícitas</option>
                <option value="SAFEZONE">Zonas de Segurança</option>
              </select>
              <textarea required placeholder="Conteúdo do Artigo..." value={editingRule.content || ''} onChange={e => setEditingRule({...editingRule, content: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white h-64 resize-none" />
              <button className="w-full bg-brand-600 text-white font-black py-5 rounded-2xl shadow-xl">SALVAR CONSTITUIÇÃO</button>
            </form>
          </div>
        </div>
      )}

      {/* NEWS MODAL */}
      {showNewsModal && editingNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="bg-dark-800 border border-white/10 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-2xl font-black text-white">{editingNews.id ? 'EDITAR NOTÍCIA' : 'NOVA NOTÍCIA'}</h3>
              <button onClick={() => setShowNewsModal(false)} className="text-gray-500 hover:text-white"><X size={24}/></button>
            </div>
            <form onSubmit={handleSaveNews} className="p-8 space-y-4">
              <input required placeholder="Título Principal" value={editingNews.title || ''} onChange={e => setEditingNews({...editingNews, title: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white font-black" />
              <input required placeholder="Breve Resumo" value={editingNews.summary || ''} onChange={e => setEditingNews({...editingNews, summary: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white text-sm" />
              <input required placeholder="URL da Imagem de Capa" value={editingNews.imageUrl || ''} onChange={e => setEditingNews({...editingNews, imageUrl: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white text-xs" />
              <textarea required placeholder="Conteúdo Completo..." value={editingNews.content || ''} onChange={e => setEditingNews({...editingNews, content: e.target.value})} className="w-full bg-dark-900 border border-white/10 rounded-xl p-4 text-white h-48 resize-none" />
              <button className="w-full bg-brand-600 text-white font-black py-5 rounded-2xl shadow-xl">PUBLICAR AGORA</button>
            </form>
          </div>
        </div>
      )}

      {/* CHAT & PROOF MODALS (MANTIDOS) */}
      {activeChatOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-800 w-full max-w-2xl h-[80vh] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl border border-white/10">
            <header className="p-6 bg-dark-900 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white"><User size={24}/></div>
                <div>
                  <h3 className="text-white font-bold">{activeChatOrder.playerNick}</h3>
                  <p className="text-xs text-gray-500 uppercase">Pedido #{activeChatOrder.id.slice(0,8)}</p>
                </div>
              </div>
              <button onClick={() => setActiveChatOrder(null)} className="p-2 text-gray-500 hover:text-white bg-dark-800 rounded-xl"><X size={24}/></button>
            </header>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-dark-900/50">
              {activeChatOrder.messages?.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'ADMIN' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-dark-700 text-gray-200 rounded-tl-none'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-[10px] opacity-50 block mt-1">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendChatMessage} className="p-6 bg-dark-800 border-t border-white/5 flex gap-4">
              <input value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Escreva para o cidadão..." className="flex-1 bg-dark-900 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none" />
              <button className="bg-brand-600 hover:bg-brand-500 text-white p-4 rounded-2xl transition-all"><Send size={24}/></button>
            </form>
          </div>
        </div>
      )}

      {viewingProof && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95" onClick={() => setViewingProof(null)}>
          <img src={viewingProof} className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" alt="Comprovante" />
        </div>
      )}
    </div>
  );
};
