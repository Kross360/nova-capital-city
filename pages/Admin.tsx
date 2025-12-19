
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';
import { ShopItem, Rule, NewsPost, PaymentRequest, ServerConfig, Category } from '../types';
import { 
  Trash2, Plus, LayoutGrid, ScrollText, Newspaper, 
  CreditCard, CheckCircle, XCircle, Eye, RefreshCw, Settings, Save, 
  MessageCircle, Shield, Loader2, Pencil, Globe, ImageIcon, FileText, Palette, Image as ImageIconLucide, User, Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastSystem';

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('capital_admin_auth') === 'true');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'PAYMENTS' | 'SHOP' | 'RULES' | 'NEWS' | 'CONFIG' | 'DESIGN'>('PAYMENTS');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [config, setConfig] = useState<ServerConfig>({} as ServerConfig);

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ShopItem> | null>(null);
  
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<Rule> | null>(null);

  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState<Partial<NewsPost> | null>(null);

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
    } catch (err) {
      addToast('Erro na sincronização.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) refreshData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'CAPITAL2025') {
      setIsAuthenticated(true);
      sessionStorage.setItem('capital_admin_auth', 'true');
      addToast('Admin logado!', 'success');
    } else {
      addToast('Senha inválida.', 'error');
    }
  };

  const handleUpdateStatus = async (payment: PaymentRequest, status: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Deseja marcar este pedido como ${status === 'APPROVED' ? 'APROVADO' : 'RECUSADO'}?`)) return;
    try {
      await StorageService.updatePaymentStatus(payment.id, status);
      await StorageService.addOrderMessage(payment.id, 'ADMIN', `Seu pedido foi ${status === 'APPROVED' ? 'APROVADO' : 'RECUSADO'}.`);
      if (config.discordWebhookUrl) await StorageService.sendDiscordStatusUpdate(config.discordWebhookUrl, payment, status);
      addToast('Status atualizado!', 'success');
      refreshData();
    } catch (e) {
      addToast('Erro ao atualizar.', 'error');
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await StorageService.saveConfig(config);
      addToast('Sistema atualizado!', 'success');
      refreshData();
    } catch (e: any) { 
      console.error("Erro ao salvar config:", e);
      addToast(`Erro ao salvar: ${e.message || 'Verifique o banco'}`, 'error'); 
    }
    finally { setSaving(false); }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      if (editingItem.id) await StorageService.updateShopItemFixed(editingItem.id, editingItem);
      else await StorageService.addShopItem(editingItem as any);
      setShowItemModal(false);
      addToast('Loja atualizada!', 'success');
      refreshData();
    } catch (e) { addToast('Erro ao salvar item.', 'error'); }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Deseja excluir este item?')) return;
    try {
      await StorageService.deleteShopItem(id);
      addToast('Item removido.', 'success');
      refreshData();
    } catch (e) { addToast('Erro ao deletar.', 'error'); }
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;
    try {
      if (editingRule.id) await StorageService.updateRule(editingRule.id, editingRule);
      else await StorageService.addRule(editingRule as any);
      setShowRuleModal(false);
      addToast('Regras atualizadas!', 'success');
      refreshData();
    } catch (e) { addToast('Erro ao salvar regra.', 'error'); }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Excluir esta regra?')) return;
    try {
      await StorageService.deleteRule(id);
      addToast('Regra excluída.', 'success');
      refreshData();
    } catch (e) { addToast('Erro ao deletar.', 'error'); }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNews) return;
    try {
      if (editingNews.id) await StorageService.updateNews(editingNews.id, editingNews);
      else await StorageService.addNews({ ...editingNews, author: 'Staff', date: new Date().toLocaleDateString('pt-BR') } as any);
      setShowNewsModal(false);
      addToast('Notícia publicada!', 'success');
      refreshData();
    } catch (e) { addToast('Erro ao publicar notícia.', 'error'); }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('Excluir esta notícia?')) return;
    try {
      await StorageService.deleteNews(id);
      addToast('Notícia deletada.', 'success');
      refreshData();
    } catch (e) { addToast('Erro ao deletar.', 'error'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 p-6">
        <div className="w-full max-w-sm bg-dark-800 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl text-center">
          <Shield size={64} className="text-brand-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Login Staff</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-dark-900 border border-white/5 rounded-2xl p-4 text-white text-center font-mono tracking-widest focus:border-brand-500 outline-none" placeholder="••••••••" />
            <button className="w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-4 rounded-2xl uppercase text-sm shadow-xl shadow-brand-600/20 transition-all">Entrar no Painel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <Shield className="text-brand-500" /> Admin <span className="text-brand-500">Center</span>
        </h1>
        <button onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem('capital_admin_auth'); navigate('/'); }} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">Sair</button>
      </header>

      <div className="grid lg:grid-cols-4 gap-6">
        <nav className="space-y-2">
          {[
            { id: 'PAYMENTS', label: 'Vendas', icon: <CreditCard size={18}/> },
            { id: 'SHOP', label: 'Estoque', icon: <LayoutGrid size={18}/> },
            { id: 'RULES', label: 'Regras', icon: <ScrollText size={18}/> },
            { id: 'NEWS', label: 'Notícias', icon: <Newspaper size={18}/> },
            { id: 'DESIGN', label: 'Design & Conteúdo', icon: <Palette size={18}/> },
            { id: 'CONFIG', label: 'Sistema', icon: <Settings size={18}/> },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-gray-500 hover:bg-dark-800'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <main className="lg:col-span-3 bg-dark-800 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl min-h-[600px]">
           {activeTab === 'PAYMENTS' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Fila de Ativação</h2>
                  <button onClick={refreshData} className="p-3 bg-dark-900 rounded-xl text-gray-500 hover:text-white transition-all"><RefreshCw size={20} className={loading ? 'animate-spin' : ''}/></button>
                </div>
                <div className="space-y-4">
                  {payments.map(p => (
                    <div key={p.id} className="bg-dark-900/40 p-5 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between group hover:border-brand-500/30 transition-all gap-4">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${p.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' : p.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{p.status}</span>
                           <span className="text-[8px] text-gray-600 font-mono">ID: {p.id.slice(0,8).toUpperCase()}</span>
                         </div>
                         <h3 className="text-white font-bold text-sm">{p.itemName} - <span className="text-brand-500">{p.playerNick}</span></h3>
                         <p className="text-gray-500 text-[10px] uppercase font-black">{p.createdAt}</p>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          <button onClick={() => navigate(`/track/${p.id}`)} className="p-3 bg-brand-600/10 text-brand-500 rounded-xl hover:bg-brand-600 hover:text-white transition-all" title="Ver Chat"><MessageCircle size={18}/></button>
                          <button onClick={() => window.open(p.proofImageUrl, '_blank')} className="p-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all" title="Ver Comprovante"><Eye size={18}/></button>
                          {p.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleUpdateStatus(p, 'APPROVED')} className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all" title="Aprovar"><CheckCircle size={18}/></button>
                              <button onClick={() => handleUpdateStatus(p, 'REJECTED')} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="Recusar"><XCircle size={18}/></button>
                            </>
                          )}
                       </div>
                    </div>
                  ))}
                  {payments.length === 0 && <div className="text-center py-20 text-gray-600 font-black uppercase text-xs">Nenhum pedido na fila</div>}
                </div>
             </div>
           )}

           {activeTab === 'SHOP' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Estoque da Loja</h2>
                  <button onClick={() => { setEditingItem({ category: 'VIP', price: 0, name: '', description: '', imageUrl: '' }); setShowItemModal(true); }} className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all"><Plus size={18}/> NOVO ITEM</button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                   {shopItems.map(item => (
                     <div key={item.id} className="bg-dark-900/40 p-4 rounded-2xl border border-white/5 flex items-center gap-4 group">
                        <img src={item.imageUrl} className="w-14 h-14 rounded-xl object-cover border border-white/5" />
                        <div className="flex-grow">
                           <h4 className="font-bold text-white text-xs line-clamp-1">{item.name}</h4>
                           <p className="text-brand-500 font-black text-sm">R$ {item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => { setEditingItem(item); setShowItemModal(true); }} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-lg"><Pencil size={14}/></button>
                           <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-gray-500 hover:text-red-500 bg-white/5 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'RULES' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Constituição</h2>
                  <button onClick={() => { setEditingRule({ category: 'GENERAL', title: '', content: '' }); setShowRuleModal(true); }} className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all"><Plus size={18}/> NOVA REGRA</button>
                </div>
                <div className="space-y-3">
                   {rules.map(rule => (
                     <div key={rule.id} className="bg-dark-900/40 p-5 rounded-2xl border border-white/5 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-brand-500"><FileText size={20}/></div>
                           <div>
                              <h4 className="font-bold text-white text-sm uppercase">{rule.title}</h4>
                              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{rule.category}</p>
                           </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => { setEditingRule(rule); setShowRuleModal(true); }} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-lg"><Pencil size={14}/></button>
                           <button onClick={() => handleDeleteRule(rule.id)} className="p-2 text-gray-500 hover:text-red-500 bg-white/5 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'NEWS' && (
             <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Portal de Notícias</h2>
                  <button onClick={() => { setEditingNews({ title: '', summary: '', content: '', imageUrl: '' }); setShowNewsModal(true); }} className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all"><Plus size={18}/> PUBLICAR NOTÍCIA</button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {news.map(n => (
                     <div key={n.id} className="bg-dark-900/40 p-4 rounded-2xl border border-white/5 flex items-center gap-6 group">
                        <img src={n.imageUrl} className="w-24 h-16 rounded-xl object-cover border border-white/5" />
                        <div className="flex-grow">
                           <h4 className="font-bold text-white text-sm line-clamp-1 uppercase">{n.title}</h4>
                           <p className="text-gray-500 text-[10px] font-medium line-clamp-1">{n.summary}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => { setEditingNews(n); setShowNewsModal(true); }} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-lg"><Pencil size={14}/></button>
                           <button onClick={() => handleDeleteNews(n.id)} className="p-2 text-gray-500 hover:text-red-500 bg-white/5 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'DESIGN' && (
             <div className="space-y-10 animate-fade-in">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Identidade Visual</h2>
                  <button onClick={handleSaveConfig} disabled={saving} className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-xl shadow-brand-600/20 transition-all">
                    {saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} SALVAR VISUAL
                  </button>
                </div>
                <div className="space-y-8">
                   <div className="bg-dark-900/40 p-6 rounded-3xl border border-white/5">
                      <h3 className="text-white font-black text-sm uppercase mb-4 flex items-center gap-2"><ImageIconLucide size={18} className="text-brand-500" /> Papel de Parede (Home)</h3>
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                         <div className="w-full md:w-48 aspect-video bg-dark-800 rounded-xl overflow-hidden border border-white/10 shrink-0">
                            <img src={config.homeBackgroundUrl || ''} className="w-full h-full object-cover" alt="Preview Background" />
                         </div>
                         <div className="flex-grow w-full space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">URL da Imagem</label>
                            <input value={config.homeBackgroundUrl || ''} onChange={e => setConfig({...config, homeBackgroundUrl: e.target.value})} className="w-full bg-dark-800 border border-white/5 rounded-xl p-4 text-white text-[10px] font-mono" placeholder="https://..." />
                         </div>
                      </div>
                   </div>
                   <div className="bg-dark-900/40 p-6 rounded-3xl border border-white/5">
                      <h3 className="text-white font-black text-sm uppercase mb-4 flex items-center gap-2"><User size={18} className="text-brand-500" /> Página "Quem Somos"</h3>
                      <div className="space-y-6">
                         <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-32 bg-dark-800 rounded-xl overflow-hidden border border-white/10 shrink-0">
                               <img src={config.aboutImageUrl || ''} className="w-full h-full object-cover" alt="Preview About" />
                            </div>
                            <div className="flex-grow space-y-4">
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Imagem de Destaque (URL)</label>
                                  <input value={config.aboutImageUrl || ''} onChange={e => setConfig({...config, aboutImageUrl: e.target.value})} className="w-full bg-dark-800 border border-white/5 rounded-xl p-3 text-white text-[10px] font-mono" />
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Título da Seção</label>
                                  <input value={config.aboutTitle || ''} onChange={e => setConfig({...config, aboutTitle: e.target.value})} className="w-full bg-dark-800 border border-white/5 rounded-xl p-3 text-white text-sm font-bold" />
                               </div>
                            </div>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Descrição do Servidor</label>
                            <textarea rows={4} value={config.aboutDescription || ''} onChange={e => setConfig({...config, aboutDescription: e.target.value})} className="w-full bg-dark-800 border border-white/5 rounded-xl p-4 text-white text-xs leading-relaxed resize-none" placeholder="Conte a história do servidor..." />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'CONFIG' && (
             <div className="space-y-10 animate-fade-in">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Sistema Global</h2>
                  <button onClick={handleSaveConfig} disabled={saving} className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-xl shadow-brand-600/20 transition-all">{saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} SALVAR ALTERAÇÕES</button>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">IP do Servidor</label>
                        <div className="relative">
                          <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input value={config.serverIp || ''} onChange={e => setConfig({...config, serverIp: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-4 pl-12 text-white font-mono text-sm" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Link Discord</label>
                        <input value={config.discordUrl || ''} onChange={e => setConfig({...config, discordUrl: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-4 text-white text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest flex items-center gap-1"><Bell size={10} className="text-brand-500"/> Discord Webhook</label>
                        <input value={config.discordWebhookUrl || ''} onChange={e => setConfig({...config, discordWebhookUrl: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-4 text-white text-[10px] font-mono" placeholder="https://..." />
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Preço CapiCoin</label>
                           <input type="number" step="0.1" value={config.capiCoinPrice || 1.0} onChange={e => setConfig({...config, capiCoinPrice: parseFloat(e.target.value)})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-4 text-white" />
                         </div>
                         <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-gray-500 uppercase ml-1">Chave PIX</label>
                           <input value={config.pixKey || ''} onChange={e => setConfig({...config, pixKey: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-4 text-white text-xs" />
                         </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Launcher PC</label>
                        <input value={config.pcDownloadUrl || ''} onChange={e => setConfig({...config, pcDownloadUrl: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-4 text-white text-[10px] font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">APK Mobile</label>
                        <input value={config.mobileDownloadUrl || ''} onChange={e => setConfig({...config, mobileDownloadUrl: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-4 text-white text-[10px] font-mono" />
                      </div>
                   </div>
                </div>
             </div>
           )}
        </main>
      </div>

      {/* MODALS */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
           <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" onClick={() => setShowItemModal(false)}></div>
           <form onSubmit={handleSaveItem} className="relative w-full max-w-xl bg-dark-800 rounded-[2.5rem] border border-white/10 shadow-2xl p-8 animate-scale-in space-y-5">
              <h3 className="text-xl font-black text-white uppercase flex items-center gap-2"><LayoutGrid className="text-brand-500"/> Item de Loja</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Nome</label>
                    <input type="text" required value={editingItem.name || ''} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-3 text-sm text-white" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Preço (R$)</label>
                    <input type="number" step="0.01" required value={editingItem.price || 0} onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-3 text-sm text-white" />
                 </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Categoria</label>
                <select value={editingItem.category || 'VIP'} onChange={e => setEditingItem({...editingItem, category: e.target.value as Category})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-3 text-sm text-white">
                   <option value="VIP">VIP</option>
                   <option value="VEHICLE">VEÍCULO</option>
                   <option value="MANSION">MANSÃO</option>
                   <option value="ORG">ORGANIZAÇÃO</option>
                   <option value="SPECIAL">ESPECIAL</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1">URL Imagem</label>
                <input type="text" required value={editingItem.imageUrl || ''} onChange={e => setEditingItem({...editingItem, imageUrl: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-3 text-sm text-white font-mono" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase ml-1">Benefícios</label>
                <textarea rows={3} required value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-3 text-sm text-white resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                 <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-black py-3 rounded-xl text-[10px] uppercase">Cancelar</button>
                 <button type="submit" className="flex-2 bg-brand-600 hover:bg-brand-500 text-white font-black py-3 rounded-xl text-[10px] uppercase">Salvar</button>
              </div>
           </form>
        </div>
      )}

      {showRuleModal && editingRule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
           <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" onClick={() => setShowRuleModal(false)}></div>
           <form onSubmit={handleSaveRule} className="relative w-full max-w-xl bg-dark-800 rounded-[2.5rem] border border-white/10 shadow-2xl p-8 animate-scale-in space-y-5">
              <h3 className="text-xl font-black text-white uppercase flex items-center gap-2"><ScrollText className="text-brand-500"/> Regra</h3>
              <input type="text" required value={editingRule.title || ''} onChange={e => setEditingRule({...editingRule, title: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="Título" />
              <select value={editingRule.category || 'GENERAL'} onChange={e => setEditingRule({...editingRule, category: e.target.value as any})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-3 text-sm text-white">
                 <option value="GENERAL">CÓDIGO CIVIL</option>
                 <option value="COMBAT">COMBATE</option>
                 <option value="ILLEGAL">ILÍCITOS</option>
                 <option value="SAFEZONE">SAFEZONES</option>
              </select>
              <textarea rows={6} required value={editingRule.content || ''} onChange={e => setEditingRule({...editingRule, content: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-4 text-sm text-white resize-none" placeholder="Descrição da regra..." />
              <div className="flex gap-3 pt-4">
                 <button type="button" onClick={() => setShowRuleModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-black py-3 rounded-xl text-[10px] uppercase">Cancelar</button>
                 <button type="submit" className="flex-2 bg-brand-600 hover:bg-brand-500 text-white font-black py-3 rounded-xl text-[10px] uppercase">Salvar</button>
              </div>
           </form>
        </div>
      )}

      {showNewsModal && editingNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fade-in">
           <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" onClick={() => setShowNewsModal(false)}></div>
           <form onSubmit={handleSaveNews} className="relative w-full max-w-2xl bg-dark-800 rounded-[2.5rem] border border-white/10 shadow-2xl p-8 animate-scale-in space-y-5">
              <h3 className="text-xl font-black text-white uppercase flex items-center gap-2"><Newspaper className="text-brand-500"/> Notícia</h3>
              <input type="text" required value={editingNews.title || ''} onChange={e => setEditingNews({...editingNews, title: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="Título" />
              <input type="text" required value={editingNews.summary || ''} onChange={e => setEditingNews({...editingNews, summary: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="Resumo" />
              <input type="text" required value={editingNews.imageUrl || ''} onChange={e => setEditingNews({...editingNews, imageUrl: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-3 text-sm text-white font-mono" placeholder="URL Imagem" />
              <textarea rows={8} required value={editingNews.content || ''} onChange={e => setEditingNews({...editingNews, content: e.target.value})} className="w-full bg-dark-900 border border-white/5 rounded-xl p-4 text-sm text-white resize-none" />
              <div className="flex gap-3 pt-4">
                 <button type="button" onClick={() => setShowNewsModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-black py-3 rounded-xl text-[10px] uppercase">Cancelar</button>
                 <button type="submit" className="flex-2 bg-brand-600 hover:bg-brand-500 text-white font-black py-3 rounded-xl text-[10px] uppercase">Publicar</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};
