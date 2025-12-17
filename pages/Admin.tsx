
import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';
import { ShopItem, Rule, NewsPost, Category, PaymentRequest, ServerConfig } from '../types';
// Fix: Added LogIn icon to the imports list
import { Trash2, Plus, LogOut, LogIn, LayoutGrid, ScrollText, Newspaper, CreditCard, CheckCircle, XCircle, Eye, RefreshCw, Settings, Save, Smartphone, Monitor, MessageCircle, ImageIcon, Send, Shield, User, Loader2, Coins, Pencil, X, BellRing, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastSystem';

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('capital_admin_auth') === 'true';
  });
  
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'SHOP' | 'RULES' | 'NEWS' | 'PAYMENTS' | 'CONFIG' | 'IMAGES'>('SHOP');
  const [uploading, setUploading] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [news, setNews] = useState<NewsPost[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [config, setConfig] = useState<ServerConfig>({
    pcDownloadUrl: '',
    mobileDownloadUrl: '',
    discordUrl: '',
    pixKey: '',
    pixQrCodeUrl: '',
    homeBackgroundUrl: '',
    aboutImageUrl: '',
    newsDefaultImageUrl: '',
    capiCoinPrice: 1.0,
    discordWebhookUrl: ''
  });

  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCat, setNewItemCat] = useState<Category>('VIP');
  const [newItemImageUrl, setNewItemImageUrl] = useState('');

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleContent, setNewRuleContent] = useState('');
  const [newRuleCat, setNewRuleCat] = useState('GENERAL');

  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsSummary, setNewNewsSummary] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsImageUrl, setNewNewsImageUrl] = useState('');

  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [chatOrder, setChatOrder] = useState<PaymentRequest | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const refreshAll = async () => {
    try {
      const sItems = await StorageService.getShopItems();
      setShopItems(sItems);
      const sRules = await StorageService.getRules();
      setRules(sRules);
      const sNews = await StorageService.getNews();
      setNews(sNews);
      const sPayments = await StorageService.getPayments();
      setPayments(sPayments);
      const sConfig = await StorageService.getConfig();
      setConfig(sConfig);
    } catch (err) {
      console.error("Erro ao atualizar dados:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    let interval: number;
    if (isAuthenticated) {
      interval = window.setInterval(async () => {
        if (activeTab === 'PAYMENTS') {
          const freshPayments = await StorageService.getPayments();
          setPayments(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(freshPayments)) return freshPayments;
            return prev;
          });
          if (chatOrder) {
            const updatedOrder = await StorageService.getPaymentById(chatOrder.id);
            if (updatedOrder) {
               setChatOrder(prev => {
                  if (JSON.stringify(prev) !== JSON.stringify(updatedOrder)) return updatedOrder;
                  return prev;
               });
            }
          }
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab, chatOrder?.id]);

  useEffect(() => {
    if (chatOrder?.messages?.length) {
       chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatOrder?.messages?.length]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'CAPITAL2025') {
      setIsAuthenticated(true);
      sessionStorage.setItem('capital_admin_auth', 'true');
      addToast('Acesso autorizado. Bem-vindo, Administrador.', 'success');
    } else {
      addToast('Senha mestra inválida.', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('capital_admin_auth');
    navigate('/');
    addToast('Sessão encerrada.', 'info');
  };

  const handleTestWebhook = async () => {
    if (!config.discordWebhookUrl) {
      return addToast("Configure o Webhook primeiro.", "error");
    }
    setTestingWebhook(true);
    try {
      await StorageService.sendDiscordNotification(config.discordWebhookUrl, {
        playerNick: "Teste_Admin",
        playerId: 0,
        itemName: "Teste de Notificação",
        itemPrice: 0,
        discordContact: "Admin#0000"
      });
      addToast("Teste enviado com sucesso!", "success");
    } catch (e) {
      addToast("Erro no teste de Webhook.", "error");
    } finally {
      setTestingWebhook(false);
    }
  };

  // --- EXCLUSÃO COM FEEDBACK AGRESSIVO ---
  const handleDeleteShopItem = async (id: string) => {
    if (!id) return;
    if (!window.confirm("ATENÇÃO: Deseja realmente excluir este item? Isso removerá o item da loja para todos os jogadores.")) return;
    
    setDeletingId(id);
    try {
      await StorageService.deleteShopItem(id);
      // Remove localmente imediatamente
      setShopItems(prev => prev.filter(item => item.id !== id));
      addToast("Item removido com sucesso!", "success");
    } catch (err: any) {
      console.error("Erro na exclusão:", err);
      addToast("Erro crítico: Verifique se rodou o SQL no Supabase.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!id) return;
    if (!window.confirm("Excluir regra?")) return;
    setDeletingId(id);
    try {
      await StorageService.deleteRule(id);
      setRules(prev => prev.filter(r => r.id !== id));
      addToast("Regra removida.", "success");
    } catch (err: any) {
      addToast("Erro ao excluir regra.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!id) return;
    if (!window.confirm("Excluir notícia?")) return;
    setDeletingId(id);
    try {
      await StorageService.deleteNews(id);
      setNews(prev => prev.filter(n => n.id !== id));
      addToast("Notícia removida.", "success");
    } catch (err: any) {
      addToast("Erro ao excluir notícia.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveShopItem = async () => {
    if (!newItemName || !newItemPrice) return addToast("Preencha nome e preço.", 'error');
    setUploading(true);
    const finalImageUrl = newItemImageUrl || `https://picsum.photos/400/300?random=${Date.now()}`;
    try {
      const itemData = {
        name: newItemName,
        description: newItemDesc,
        price: parseFloat(newItemPrice),
        category: newItemCat,
        imageUrl: finalImageUrl
      };
      if (editingShopId) {
        await StorageService.updateShopItem(editingShopId, itemData);
        addToast('Alterações salvas!', 'success');
      } else {
        await StorageService.addShopItem(itemData);
        addToast('Novo item adicionado!', 'success');
      }
      resetShopForm();
      await refreshAll();
    } catch (e: any) {
      addToast('Erro ao salvar item.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const startEditShop = (item: ShopItem) => {
    setNewItemName(item.name);
    setNewItemDesc(item.description);
    setNewItemPrice(item.price.toString());
    setNewItemCat(item.category);
    setNewItemImageUrl(item.imageUrl);
    setEditingShopId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetShopForm = () => {
    setNewItemName(''); setNewItemDesc(''); setNewItemPrice(''); setNewItemImageUrl('');
    setNewItemCat('VIP');
    setEditingShopId(null);
  };

  const handleSaveRule = async () => {
    if(!newRuleTitle) return addToast("Defina um título para a regra.", 'error');
    const ruleData = {
      title: newRuleTitle,
      content: newRuleContent,
      category: newRuleCat as any
    };
    try {
      if (editingRuleId) {
        await StorageService.updateRule(editingRuleId, ruleData);
        addToast('Regra atualizada!', 'success');
      } else {
        await StorageService.addRule(ruleData);
        addToast('Regra publicada!', 'success');
      }
      resetRuleForm();
      await refreshAll();
    } catch (err: any) {
      addToast("Erro ao salvar regra.", "error");
    }
  };

  const startEditRule = (rule: Rule) => {
    setNewRuleTitle(rule.title);
    setNewRuleContent(rule.content);
    setNewRuleCat(rule.category);
    setEditingRuleId(rule.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetRuleForm = () => {
    setNewRuleTitle(''); setNewRuleContent(''); setNewRuleCat('GENERAL');
    setEditingRuleId(null);
  };

  const handleSaveNews = async () => {
    if(!newNewsTitle || !newNewsSummary) return addToast("Preencha título e resumo.", 'error');
    setUploading(true);
    const finalImageUrl = newNewsImageUrl || `https://picsum.photos/800/400?random=${Date.now()}`;
    try {
      const newsData = {
        title: newNewsTitle,
        summary: newNewsSummary,
        content: newNewsContent,
        author: 'Admin',
        date: new Date().toLocaleDateString('pt-BR'),
        imageUrl: finalImageUrl
      };
      if (editingNewsId) {
        await StorageService.updateNews(editingNewsId, newsData);
        addToast('Notícia editada!', 'success');
      } else {
        await StorageService.addNews(newsData);
        addToast('Notícia publicada!', 'success');
      }
      resetNewsForm();
      await refreshAll();
    } catch (e: any) {
       addToast('Erro ao publicar notícia.', 'error');
    } finally {
       setUploading(false);
    }
  };

  const startEditNews = (post: NewsPost) => {
    setNewNewsTitle(post.title);
    setNewNewsSummary(post.summary);
    setNewNewsContent(post.content);
    setNewNewsImageUrl(post.imageUrl || '');
    setEditingNewsId(post.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetNewsForm = () => {
    setNewNewsTitle(''); setNewNewsSummary(''); setNewNewsContent(''); setNewNewsImageUrl('');
    setEditingNewsId(null);
  };

  const updatePaymentStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const note = prompt(status === 'APPROVED' ? "Mensagem de aprovação (opcional):" : "Motivo da recusa:");
    try {
      await StorageService.updatePaymentStatus(id, status, note || undefined);
      addToast(`Status atualizado para ${status}`, 'success');
      await refreshAll();
    } catch (err: any) {
      addToast("Erro ao atualizar pagamento.", "error");
    }
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim() || !chatOrder) return;
    try {
      await StorageService.addOrderMessage(chatOrder.id, 'ADMIN', chatMessageInput);
      const updated = await StorageService.getPaymentById(chatOrder.id);
      setChatOrder(updated || null);
      setChatMessageInput('');
    } catch (err: any) {
      addToast("Erro ao enviar mensagem.", "error");
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await StorageService.saveConfig(config);
      addToast('Configurações salvas!', 'success');
      await refreshAll();
    } catch (err: any) {
      addToast('Falha ao salvar configurações.', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  // --- NOVA TELA DE LOGIN MELHORADA ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Background com Blur Profundo */}
        <div className="absolute inset-0 bg-dark-900 overflow-hidden">
           <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/1920/1080?grayscale')] bg-cover bg-center blur-sm"></div>
           <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-dark-900/90 to-black"></div>
        </div>

        <div className="relative w-full max-w-md animate-fade-in-up">
           <div className="bg-dark-800/80 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
             <div className="flex flex-col items-center mb-10">
                <div className="w-20 h-20 bg-brand-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-brand-600/40 transform -rotate-3">
                   <Shield size={40} />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight text-center">
                  ADMIN <span className="text-brand-500">PANEL</span>
                </h2>
                <p className="text-gray-400 text-sm mt-2 font-medium">Autenticação Capital City RP</p>
             </div>

             <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 ml-1">Senha de Acesso</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-400 transition-colors" size={20} />
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full bg-dark-900/50 border border-white/10 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all text-lg font-mono tracking-widest" 
                      placeholder="••••••••" 
                      autoFocus
                    />
                  </div>
                </div>
                
                <button className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-brand-600/20 active:scale-95 flex items-center justify-center gap-3 text-lg">
                  <LogIn size={22} />
                  ENTRAR NO SISTEMA
                </button>
             </form>
             
             <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-gray-600 text-xs font-medium">Acesso restrito a desenvolvedores e administradores.</p>
             </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
           <h1 className="text-4xl font-black text-white flex items-center gap-3">
             <Shield className="text-brand-500" size={32} />
             Painel Administrativo
           </h1>
           <p className="text-gray-500 mt-1">Gerencie a economia e as regras de Capital City.</p>
        </div>
        <button onClick={handleLogout} className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-6 py-2 rounded-xl flex items-center gap-2 font-bold transition-all border border-red-500/20">
          <LogOut size={18} /> Sair
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-dark-800 rounded-2xl p-4 h-fit border border-white/5 shadow-xl">
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('PAYMENTS')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all ${activeTab === 'PAYMENTS' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}>
              <CreditCard size={18} /> Pedidos Pendentes
              {payments.filter(p => p.status === 'PENDING').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-pulse">{payments.filter(p => p.status === 'PENDING').length}</span>
              )}
            </button>
            <button onClick={() => setActiveTab('SHOP')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all ${activeTab === 'SHOP' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}>
              <LayoutGrid size={18} /> Itens da Loja
            </button>
            <button onClick={() => setActiveTab('RULES')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all ${activeTab === 'RULES' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}>
              <ScrollText size={18} /> Gerenciar Regras
            </button>
            <button onClick={() => setActiveTab('NEWS')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all ${activeTab === 'NEWS' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}>
              <Newspaper size={18} /> Central News
            </button>
            <div className="h-px bg-white/5 my-4"></div>
            <button onClick={() => setActiveTab('CONFIG')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all ${activeTab === 'CONFIG' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}>
              <Settings size={18} /> Config. Sistema
            </button>
            <button onClick={() => setActiveTab('IMAGES')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all ${activeTab === 'IMAGES' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'text-gray-400 hover:bg-dark-700 hover:text-white'}`}>
              <ImageIcon size={18} /> Identidade Visual
            </button>
          </nav>
        </div>

        <div className="lg:col-span-3 bg-dark-800 rounded-2xl p-8 border border-white/5 min-h-[600px] shadow-xl">
          
          {activeTab === 'IMAGES' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <h2 className="text-2xl font-black text-white">Identidade Visual</h2>
                <button 
                  onClick={handleSaveConfig} 
                  disabled={savingConfig}
                  className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 shadow-xl shadow-brand-600/20 transition-all"
                >
                  {savingConfig ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                  SALVAR TUDO
                </button>
              </div>
              <div className="grid gap-8">
                <div className="bg-dark-900/50 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4">Hero Background (Home)</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-gray-500 uppercase mb-2">URL Direta da Imagem</label>
                      <input type="text" value={config.homeBackgroundUrl} onChange={(e) => setConfig({...config, homeBackgroundUrl: e.target.value})} className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:outline-none" placeholder="https://..." />
                    </div>
                    <div className="h-32 rounded-2xl overflow-hidden border-2 border-brand-500/20 bg-dark-950 flex items-center justify-center relative">
                        {config.homeBackgroundUrl ? <img src={config.homeBackgroundUrl} className="w-full h-full object-cover" alt="Preview"/> : <span className="text-gray-700 text-xs">Preview</span>}
                    </div>
                  </div>
                </div>
                <div className="bg-dark-900/50 p-6 rounded-2xl border border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">Banner: Quem Somos</h3>
                   <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                       <label className="block text-xs font-black text-gray-500 uppercase mb-2">URL Direta da Imagem</label>
                       <input type="text" value={config.aboutImageUrl} onChange={(e) => setConfig({...config, aboutImageUrl: e.target.value})} className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-brand-500 focus:outline-none" placeholder="https://..." />
                    </div>
                    <div className="h-32 rounded-2xl overflow-hidden border-2 border-brand-500/20 bg-dark-950 flex items-center justify-center">
                        {config.aboutImageUrl ? <img src={config.aboutImageUrl} className="w-full h-full object-cover" alt="Preview"/> : <span className="text-gray-700 text-xs">Preview</span>}
                    </div>
                   </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'CONFIG' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <h2 className="text-2xl font-black text-white">Configurações Base</h2>
                <button onClick={handleSaveConfig} disabled={savingConfig} className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 shadow-xl shadow-brand-600/20">
                  {savingConfig ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                  ATUALIZAR
                </button>
              </div>

              <div className="grid gap-6">
                <div className="bg-brand-600/10 p-6 rounded-2xl border border-brand-500/30">
                   <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <BellRing className="text-brand-500" size={20}/> Alertas Discord (Pedidos)
                   </h3>
                   <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="Discord Webhook URL" 
                        value={config.discordWebhookUrl} 
                        onChange={e => setConfig({...config, discordWebhookUrl: e.target.value})} 
                        className="flex-grow bg-dark-900/50 border border-white/10 p-4 rounded-xl text-white focus:border-brand-500 focus:outline-none"
                      />
                      <button onClick={handleTestWebhook} disabled={testingWebhook} className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2">
                        {testingWebhook ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                      </button>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="bg-dark-900/50 p-6 rounded-2xl border border-white/5">
                      <h3 className="text-lg font-bold text-white mb-4">Cotação CapiCoin</h3>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R$</span>
                        <input type="number" step="0.01" value={config.capiCoinPrice} onChange={e => setConfig({...config, capiCoinPrice: parseFloat(e.target.value) || 0})} className="w-full bg-dark-800 border border-white/10 p-4 pl-12 rounded-xl text-white font-bold" />
                      </div>
                   </div>
                   <div className="bg-dark-900/50 p-6 rounded-2xl border border-white/5">
                      <h3 className="text-lg font-bold text-white mb-4">Social & Links</h3>
                      <input placeholder="Invite do Discord" value={config.discordUrl} onChange={e => setConfig({...config, discordUrl: e.target.value})} className="w-full bg-dark-800 border border-white/10 p-4 rounded-xl text-white mb-4"/>
                      <input placeholder="Chave PIX Oficial" value={config.pixKey} onChange={e => setConfig({...config, pixKey: e.target.value})} className="w-full bg-dark-800 border border-white/10 p-4 rounded-xl text-white"/>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SHOP' && (
            <div>
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-black text-white">Gerenciar Estoque</h2>
                 {editingShopId && (
                   <button onClick={resetShopForm} className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all">Cancelar Edição</button>
                 )}
               </div>
               <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 bg-dark-900/50 p-8 rounded-3xl border ${editingShopId ? 'border-brand-500 shadow-2xl shadow-brand-600/10' : 'border-white/5'}`}>
                 <div className="space-y-4">
                    <label className="block text-xs font-black text-gray-500 uppercase ml-1">Nome do Produto</label>
                    <input placeholder="Ex: Pacote VIP Platinum" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-2xl text-white"/>
                 </div>
                 <div className="space-y-4">
                    <label className="block text-xs font-black text-gray-500 uppercase ml-1">Preço (BRL)</label>
                    <input placeholder="0.00" type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-2xl text-white font-mono"/>
                 </div>
                 <div className="space-y-4">
                    <label className="block text-xs font-black text-gray-500 uppercase ml-1">Categoria</label>
                    <select value={newItemCat} onChange={e => setNewItemCat(e.target.value as Category)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-2xl text-white appearance-none">
                        <option value="VIP">VIP</option>
                        <option value="COINS">CapiCoins</option>
                        <option value="VEHICLE">Veículo Especial</option>
                        <option value="MANSION">Mansão de Luxo</option>
                        <option value="ORG">Base Organização</option>
                        <option value="SPECIAL">Serviço Especial</option>
                    </select>
                 </div>
                 <div className="space-y-4">
                    <label className="block text-xs font-black text-gray-500 uppercase ml-1">Descrição Curta</label>
                    <input placeholder="Breve resumo dos benefícios..." value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-2xl text-white"/>
                 </div>
                 <div className="col-span-1 md:col-span-2 space-y-4">
                    <label className="block text-xs font-black text-gray-500 uppercase ml-1">URL Direta da Imagem</label>
                    <input placeholder="https://i.imgur.com/..." value={newItemImageUrl} onChange={e => setNewItemImageUrl(e.target.value)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-2xl text-white" />
                 </div>
                 <button onClick={handleSaveShopItem} disabled={uploading} className={`col-span-1 md:col-span-2 py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all text-lg shadow-xl ${editingShopId ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/20' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-600/20'}`}>
                    {uploading ? <Loader2 className="animate-spin"/> : editingShopId ? <Save size={22}/> : <Plus size={22}/>}
                    {uploading ? 'PROCESSANDO...' : editingShopId ? 'ATUALIZAR ITEM' : 'PUBLICAR NA LOJA'}
                 </button>
               </div>
               
               <div className="space-y-3">
                 <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest ml-1 mb-4">Lista de Itens Ativos</h3>
                 {shopItems.length === 0 ? (
                    <div className="text-center py-20 bg-dark-900/30 rounded-3xl border border-dashed border-white/10">
                       <p className="text-gray-600 font-bold">Nenhum item cadastrado.</p>
                    </div>
                 ) : shopItems.map(i => (
                   <div key={i.id} className={`bg-dark-900/40 p-5 flex justify-between items-center text-white rounded-2xl border transition-all ${editingShopId === i.id ? 'border-brand-500 bg-brand-600/5' : 'border-white/5 hover:border-white/10'}`}>
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-dark-950 border border-white/10">
                           <img src={i.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="font-black text-lg">{i.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-[10px] bg-brand-600/20 text-brand-400 font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">{i.category}</span>
                               <span className="text-sm text-gray-500 font-bold">R$ {i.price.toFixed(2)}</span>
                            </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => startEditShop(i)} className="bg-white/5 hover:bg-brand-500/20 text-brand-400 p-3 rounded-xl transition-all"><Pencil size={20}/></button>
                        <button 
                          onClick={() => handleDeleteShopItem(i.id)} 
                          disabled={deletingId === i.id}
                          className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-xl transition-all disabled:opacity-50"
                        >
                          {deletingId === i.id ? <Loader2 className="animate-spin" size={20}/> : <Trash2 size={20}/>}
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'RULES' && (
             <div className="animate-fade-in">
                <h2 className="text-2xl font-black text-white mb-8">Gerenciar Constituição</h2>
                <div className={`space-y-6 mb-12 bg-dark-900/50 p-8 rounded-3xl border ${editingRuleId ? 'border-brand-500' : 'border-white/5'}`}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-600 ml-1">Categoria da Regra</label>
                           <select value={newRuleCat} onChange={e => setNewRuleCat(e.target.value)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-xl text-white">
                              <option value="GENERAL">Geral</option>
                              <option value="COMBAT">Combate / PVP</option>
                              <option value="ILLEGAL">Ilegal / Facções</option>
                              <option value="SAFEZONE">Zonas Seguras</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-600 ml-1">Título do Artigo</label>
                           <input placeholder="Ex: Anti-RP e VDM" value={newRuleTitle} onChange={e => setNewRuleTitle(e.target.value)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-xl text-white"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-600 ml-1">Texto Detalhado</label>
                       <textarea placeholder="Explique a regra com clareza..." value={newRuleContent} onChange={e => setNewRuleContent(e.target.value)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-xl text-white h-32"/>
                    </div>
                    <button onClick={handleSaveRule} className={`text-white py-4 rounded-xl font-black w-full shadow-xl transition-all ${editingRuleId ? 'bg-brand-600 hover:bg-brand-500' : 'bg-green-600 hover:bg-green-500'}`}>
                      {editingRuleId ? 'ATUALIZAR ARTIGO' : 'PUBLICAR REGRA'}
                    </button>
                </div>
                <div className="space-y-3">
                 {rules.map(r => (
                   <div key={r.id} className="bg-dark-900/40 p-5 flex justify-between items-center text-white rounded-2xl border border-white/5">
                     <div>
                        <span className="text-[10px] text-brand-400 font-black uppercase tracking-widest">{r.category}</span>
                        <p className="font-black text-lg">{r.title}</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => startEditRule(r)} className="bg-white/5 text-brand-400 p-3 rounded-xl"><Pencil size={18}/></button>
                        <button onClick={() => handleDeleteRule(r.id)} className="bg-white/5 text-red-500 p-3 rounded-xl"><Trash2 size={18}/></button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'NEWS' && (
             <div className="animate-fade-in">
                <h2 className="text-2xl font-black text-white mb-8">Notícias & Patch Notes</h2>
                <div className={`space-y-6 mb-12 bg-dark-900/50 p-8 rounded-3xl border ${editingNewsId ? 'border-brand-500' : 'border-white/5'}`}>
                    <input placeholder="Título da Notícia" value={newNewsTitle} onChange={e => setNewNewsTitle(e.target.value)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-xl text-white font-black text-lg"/>
                    <input placeholder="Resumo Chamativo (Aparece no card)" value={newNewsSummary} onChange={e => setNewNewsSummary(e.target.value)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-xl text-white"/>
                    <textarea placeholder="Conteúdo completo da postagem..." value={newNewsContent} onChange={e => setNewNewsContent(e.target.value)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-xl text-white h-48"/>
                    <input placeholder="URL da Capa da Notícia" value={newNewsImageUrl} onChange={e => setNewNewsImageUrl(e.target.value)} className="w-full bg-dark-800 border border-white/10 p-4 rounded-xl text-white" />
                    <button onClick={handleSaveNews} disabled={uploading} className={`text-white py-4 rounded-xl font-black w-full shadow-xl transition-all ${editingNewsId ? 'bg-brand-600 hover:bg-brand-500' : 'bg-green-600 hover:bg-green-500'}`}>
                       {uploading ? <Loader2 className="animate-spin mx-auto"/> : editingNewsId ? 'SALVAR EDIÇÃO' : 'PUBLICAR AGORA'}
                    </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                 {news.map(n => (
                   <div key={n.id} className="bg-dark-900/40 p-5 flex justify-between items-center text-white rounded-2xl border border-white/5">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black shrink-0">
                           <img src={n.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <p className="font-bold truncate max-w-[150px]">{n.title}</p>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => startEditNews(n)} className="bg-white/5 text-brand-400 p-3 rounded-xl"><Pencil size={18}/></button>
                        <button onClick={() => handleDeleteNews(n.id)} className="bg-white/5 text-red-500 p-3 rounded-xl"><Trash2 size={18}/></button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'PAYMENTS' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white">Fila de Pagamentos</h2>
                <button onClick={refreshAll} className="bg-brand-600/10 text-brand-400 p-3 rounded-xl hover:bg-brand-600 hover:text-white transition-all"><RefreshCw size={20}/></button>
              </div>
              
              {payments.length === 0 ? (
                 <div className="text-center py-32 text-gray-700">
                    <CreditCard size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="font-bold">Nenhum pedido registrado no sistema.</p>
                 </div>
              ) : (
                <div className="grid gap-6">
                  {payments.map(payment => (
                    <div key={payment.id} className={`bg-dark-900/60 rounded-3xl border p-6 transition-all ${payment.status === 'PENDING' ? 'border-brand-500 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'border-white/5 opacity-80'}`}>
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-grow">
                           <div className="flex items-center gap-3 mb-4">
                             <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${payment.status === 'PENDING' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : payment.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{payment.status === 'PENDING' ? 'Novo Pedido' : payment.status}</span>
                             <span className="text-[10px] text-gray-500 font-bold uppercase">{payment.createdAt}</span>
                           </div>
                           <h3 className="font-black text-white text-2xl mb-1">{payment.itemName}</h3>
                           <p className="text-brand-400 font-black mb-4 tracking-tight">R$ {payment.itemPrice.toFixed(2)}</p>
                           
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-dark-950/50 p-4 rounded-2xl border border-white/5">
                             <div><p className="text-[10px] text-gray-600 font-black uppercase mb-1 tracking-tighter">Jogador</p><p className="text-sm text-white font-bold">{payment.playerNick}</p></div>
                             <div><p className="text-[10px] text-gray-600 font-black uppercase mb-1 tracking-tighter">Game ID</p><p className="text-sm text-white font-mono">#{payment.playerId}</p></div>
                             <div><p className="text-[10px] text-gray-600 font-black uppercase mb-1 tracking-tighter">Discord</p><p className="text-sm text-white font-bold truncate">{payment.discordContact}</p></div>
                           </div>
                        </div>
                        <div className="flex lg:flex-col gap-2 shrink-0 justify-end lg:justify-start">
                           <button onClick={() => setChatOrder(payment)} className="flex-1 lg:flex-none bg-brand-600 hover:bg-brand-500 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-xl shadow-brand-600/10"><MessageCircle size={18} /> Chat</button>
                           <button onClick={() => setViewingProof(payment.proofImageUrl)} className="flex-1 lg:flex-none bg-white/5 hover:bg-white/10 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"><Eye size={18} /> Ver Print</button>
                           {payment.status === 'PENDING' && (
                            <div className="flex lg:flex-col gap-2">
                              <button onClick={() => updatePaymentStatus(payment.id, 'APPROVED')} className="bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-xl font-black flex items-center justify-center gap-2 text-sm shadow-xl shadow-green-600/10"><CheckCircle size={18} /> APROVAR</button>
                              <button onClick={() => updatePaymentStatus(payment.id, 'REJECTED')} className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-black flex items-center justify-center gap-2 text-sm shadow-xl shadow-red-600/10"><XCircle size={18} /> RECUSAR</button>
                            </div>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modais com design consistente */}
      {viewingProof && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingProof(null)}>
          <div className="bg-dark-900 p-2 rounded-3xl max-w-3xl max-h-[90vh] overflow-auto relative border border-white/10 shadow-2xl">
            <button className="absolute top-6 right-6 text-white bg-black/50 p-3 rounded-full hover:bg-red-500 transition-all z-20" onClick={() => setViewingProof(null)}><X size={24} /></button>
            <img src={viewingProof} alt="Comprovante Bancário" className="max-w-full rounded-2xl" />
          </div>
        </div>
      )}

      {chatOrder && (
         <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-dark-800 w-full max-w-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[650px]">
             <div className="bg-dark-900 p-6 border-b border-white/5 flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-600/20 rounded-xl flex items-center justify-center text-brand-400 font-bold border border-brand-500/20">
                    {chatOrder.playerNick.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg leading-tight">{chatOrder.playerNick}</h3>
                    <p className="text-xs text-gray-500 font-bold">{chatOrder.itemName}</p>
                  </div>
               </div>
               <button onClick={() => setChatOrder(null)} className="text-gray-500 hover:text-white p-2 transition-all"><XCircle size={32} /></button>
             </div>
             
             <div className="flex-grow bg-dark-900/30 p-6 overflow-y-auto space-y-6">
                {chatOrder.messages?.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-3xl px-5 py-4 ${msg.sender === 'ADMIN' ? 'bg-brand-600 text-white rounded-tr-none shadow-lg shadow-brand-600/10' : 'bg-dark-700 text-gray-200 rounded-tl-none border border-white/10'}`}>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] font-black uppercase opacity-60 flex items-center gap-1">
                            {msg.sender === 'ADMIN' ? <Shield size={10}/> : <User size={10}/>}
                            {msg.sender === 'ADMIN' ? 'SISTEMA' : 'PLAYER'}
                         </span>
                         <span className="text-[10px] opacity-40 font-bold">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
             </div>
             
             <form onSubmit={handleSendAdminMessage} className="p-6 bg-dark-800 border-t border-white/5 flex gap-3">
                <input className="flex-grow bg-dark-900 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all" placeholder="Escreva uma mensagem para o jogador..." value={chatMessageInput} onChange={(e) => setChatMessageInput(e.target.value)} />
                <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/20 active:scale-95 transition-all"><Send size={24} /></button>
             </form>
           </div>
         </div>
      )}
    </div>
  );
};
