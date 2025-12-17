import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';
import { ShopItem, Rule, NewsPost, Category, PaymentRequest, ServerConfig } from '../types';
import { Trash2, Plus, LogOut, LayoutGrid, ScrollText, Newspaper, CreditCard, CheckCircle, XCircle, Eye, RefreshCw, Settings, Save, Smartphone, Monitor, MessageCircle, ImageIcon, Send, Shield, User, Loader2, Coins, Pencil, X, BellRing } from 'lucide-react';
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
      }, 3000);
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
      addToast('Bem-vindo ao painel administrativo!', 'success');
    } else {
      addToast('Senha incorreta!', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('capital_admin_auth');
    navigate('/');
    addToast('Logout realizado com sucesso.', 'info');
  };

  const handleTestWebhook = async () => {
    if (!config.discordWebhookUrl) {
      return addToast("Cole o link do Webhook primeiro.", "error");
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
      addToast("Notificação de teste enviada! Verifique seu Discord.", "success");
    } catch (e) {
      addToast("Erro ao enviar teste.", "error");
    } finally {
      setTestingWebhook(false);
    }
  };

  // --- HANDLERS DE EXCLUSÃO (CORRIGIDOS) ---
  const handleDeleteShopItem = async (id: string) => {
    if (!id) return;
    if (!window.confirm("Deseja realmente excluir este item da loja? Isso não pode ser desfeito.")) return;
    
    console.log("Excluindo item ID:", id);
    setDeletingId(id);
    
    try {
      await StorageService.deleteShopItem(id);
      addToast("Item removido com sucesso!", "success");
      // Remove da lista local IMEDIATAMENTE
      setShopItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      console.error("Erro fatal na exclusão:", err);
      addToast("Erro ao excluir: " + err.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!id) return;
    if (!window.confirm("Deseja excluir esta regra?")) return;
    setDeletingId(id);
    try {
      await StorageService.deleteRule(id);
      addToast("Regra excluída!", "success");
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      addToast("Erro ao excluir: " + err.message, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!id) return;
    if (!window.confirm("Deseja excluir esta notícia?")) return;
    setDeletingId(id);
    try {
      await StorageService.deleteNews(id);
      addToast("Notícia removida!", "success");
      setNews(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      addToast("Erro ao excluir: " + err.message, "error");
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
        addToast('Item atualizado com sucesso!', 'success');
      } else {
        await StorageService.addShopItem(itemData);
        addToast('Item adicionado à loja!', 'success');
      }
      resetShopForm();
      await refreshAll();
    } catch (e: any) {
      addToast('Erro ao salvar: ' + e.message, 'error');
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
    if(!newRuleTitle) return addToast("Preencha o título da regra.", 'error');
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
      addToast("Erro ao salvar regra: " + err.message, "error");
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
    if(!newNewsTitle || !newNewsSummary) return addToast("Preencha título e resumo da notícia.", 'error');
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
        addToast('Notícia atualizada!', 'success');
      } else {
        await StorageService.addNews(newsData);
        addToast('Notícia publicada!', 'success');
      }
      resetNewsForm();
      await refreshAll();
    } catch (e: any) {
       addToast('Erro ao salvar notícia: ' + e.message, 'error');
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
    const note = prompt(status === 'APPROVED' ? "Mensagem para o player (opcional):" : "Motivo da recusa:");
    try {
      await StorageService.updatePaymentStatus(id, status, note || undefined);
      addToast(`Pagamento ${status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'} com sucesso.`, status === 'APPROVED' ? 'success' : 'info');
      await refreshAll();
    } catch (err: any) {
      addToast("Erro ao atualizar status: " + err.message, "error");
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
      addToast("Erro ao enviar mensagem: " + err.message, "error");
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await StorageService.saveConfig(config);
      addToast('Configurações salvas com sucesso!', 'success');
      await refreshAll();
    } catch (err: any) {
      console.error("Erro ao salvar config:", err);
      addToast('Falha ao salvar configurações: ' + err.message, 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="bg-dark-800 p-8 rounded-xl border border-white/10 w-full max-md shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Acesso Restrito</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Senha Mestra</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-dark-900 border border-dark-700 text-white px-4 py-2 rounded focus:outline-none focus:border-brand-500" placeholder="••••••••" />
            </div>
            <button className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-2 rounded transition-colors">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Painel Administrativo</h1>
        <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-2">
          <LogOut size={18} /> Sair
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-dark-800 rounded-xl p-4 h-fit border border-white/5">
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('PAYMENTS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'PAYMENTS' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-dark-700'}`}>
              <CreditCard size={18} /> Pagamentos Pendentes
              {payments.filter(p => p.status === 'PENDING').length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{payments.filter(p => p.status === 'PENDING').length}</span>
              )}
            </button>
            <button onClick={() => setActiveTab('SHOP')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'SHOP' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-dark-700'}`}>
              <LayoutGrid size={18} /> Gerenciar Loja
            </button>
            <button onClick={() => setActiveTab('RULES')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'RULES' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-dark-700'}`}>
              <ScrollText size={18} /> Gerenciar Regras
            </button>
            <button onClick={() => setActiveTab('NEWS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'NEWS' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-dark-700'}`}>
              <Newspaper size={18} /> Gerenciar Notícias
            </button>
            <button onClick={() => setActiveTab('CONFIG')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'CONFIG' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-dark-700'}`}>
              <Settings size={18} /> Configurações Gerais
            </button>
            <button onClick={() => setActiveTab('IMAGES')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'IMAGES' ? 'bg-brand-600 text-white' : 'text-gray-400 hover:bg-dark-700'}`}>
              <ImageIcon size={18} /> Imagens & Visual
            </button>
          </nav>
        </div>

        <div className="lg:col-span-3 bg-dark-800 rounded-xl p-6 border border-white/5 min-h-[500px]">
          
          {activeTab === 'IMAGES' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">Customização Visual</h2>
                <button 
                  onClick={handleSaveConfig} 
                  disabled={savingConfig}
                  className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-brand-600/20"
                >
                  {savingConfig ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                  {savingConfig ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
              <div className="grid gap-8">
                <div className="bg-dark-900/50 p-6 rounded-xl border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4">Imagem de Fundo (Home Hero)</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">URL da Imagem</label>
                      <input type="text" value={config.homeBackgroundUrl} onChange={(e) => setConfig({...config, homeBackgroundUrl: e.target.value})} className="w-full bg-dark-800 border border-dark-600 rounded px-4 py-2 text-white focus:border-brand-500 focus:outline-none" placeholder="https://..." />
                    </div>
                    <div className="h-32 rounded-lg overflow-hidden border border-white/20 bg-dark-950 flex items-center justify-center relative group">
                        {config.homeBackgroundUrl ? <img src={config.homeBackgroundUrl} className="w-full h-full object-cover" alt="Preview"/> : <span className="text-gray-600 text-xs">Sem Imagem</span>}
                    </div>
                  </div>
                </div>
                <div className="bg-dark-900/50 p-6 rounded-xl border border-brand-500/30">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><ImageIcon className="text-brand-500" size={20}/> Imagem Principal: Sobre Nós</h3>
                   <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-400 mb-2">URL da Imagem</label>
                       <input type="text" value={config.aboutImageUrl} onChange={(e) => setConfig({...config, aboutImageUrl: e.target.value})} className="w-full bg-dark-800 border border-brand-500/50 rounded px-4 py-2 text-white focus:border-brand-500 focus:outline-none" placeholder="https://i.imgur.com/..." />
                    </div>
                    <div className="h-32 rounded-lg overflow-hidden border border-white/20 bg-dark-950 flex items-center justify-center relative">
                        {config.aboutImageUrl ? <img src={config.aboutImageUrl} className="w-full h-full object-cover" alt="Preview"/> : <span className="text-gray-600 text-xs">Sem Imagem</span>}
                    </div>
                   </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'CONFIG' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">Configurações Gerais</h2>
                <button 
                  onClick={handleSaveConfig} 
                  disabled={savingConfig}
                  className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                > 
                  {savingConfig ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />}
                  {savingConfig ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>

              <div className="grid gap-6">
                
                {/* NOTIFICATIONS */}
                <div className="bg-dark-900/50 p-6 rounded-xl border border-brand-500/20 shadow-lg shadow-brand-500/5">
                   <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BellRing className="text-brand-400" size={20}/> Notificações no Celular (Discord)
                   </h3>
                   <div className="space-y-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-1">Webhook URL do Discord</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="https://discord.com/api/webhooks/..." 
                              value={config.discordWebhookUrl} 
                              onChange={e => setConfig({...config, discordWebhookUrl: e.target.value})} 
                              className="flex-grow bg-dark-800 border border-dark-600 p-2 rounded text-white focus:border-brand-500 focus:outline-none"
                            />
                            <button 
                              onClick={handleTestWebhook}
                              disabled={testingWebhook || !config.discordWebhookUrl}
                              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white px-4 py-2 rounded font-bold flex items-center gap-2"
                            >
                              {testingWebhook ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                              Testar
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Crie um Webhook em um canal do seu Discord para receber alertas de novos pedidos instantaneamente.</p>
                        </div>
                   </div>
                </div>

                <div className="bg-dark-900/50 p-6 rounded-xl border border-brand-500/20">
                   <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Coins className="text-yellow-500" size={20}/> Economia (CapiCoins)
                   </h3>
                   <div>
                        <label className="block text-gray-400 text-sm mb-1">Preço unitário (R$)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            min="0.01" 
                            value={config.capiCoinPrice} 
                            onChange={e => setConfig({...config, capiCoinPrice: parseFloat(e.target.value) || 0})} 
                            className="w-full bg-dark-800 border border-dark-600 p-2 pl-10 rounded text-white focus:border-brand-500 focus:outline-none" 
                          />
                        </div>
                   </div>
                </div>

                <div className="bg-dark-900/50 p-6 rounded-xl border border-white/5">
                   <h3 className="text-lg font-semibold text-white mb-4">Downloads</h3>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Launcher PC</label>
                        <input placeholder="URL..." value={config.pcDownloadUrl} onChange={e => setConfig({...config, pcDownloadUrl: e.target.value})} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Launcher Mobile</label>
                        <input placeholder="URL..." value={config.mobileDownloadUrl} onChange={e => setConfig({...config, mobileDownloadUrl: e.target.value})} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                      </div>
                   </div>
                </div>

                <div className="bg-dark-900/50 p-6 rounded-xl border border-white/5">
                   <h3 className="text-lg font-semibold text-white mb-4">Social & PIX</h3>
                   <div className="space-y-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Discord Invite</label>
                        <input placeholder="URL..." value={config.discordUrl} onChange={e => setConfig({...config, discordUrl: e.target.value})} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">Chave Pix</label>
                        <input placeholder="Chave..." value={config.pixKey} onChange={e => setConfig({...config, pixKey: e.target.value})} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-1">QR Code URL</label>
                        <input placeholder="URL..." value={config.pixQrCodeUrl} onChange={e => setConfig({...config, pixQrCodeUrl: e.target.value})} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SHOP' && (
            <div>
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-white">Gerenciar Loja</h2>
                 {editingShopId && (
                   <button onClick={resetShopForm} className="text-sm bg-red-500/20 text-red-400 px-3 py-1 rounded flex items-center gap-1 hover:bg-red-500/30"><X size={14}/> Cancelar Edição</button>
                 )}
               </div>
               <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-dark-900/50 p-4 rounded-xl border ${editingShopId ? 'border-brand-500' : 'border-white/5'}`}>
                 <input placeholder="Nome" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                 <input placeholder="Preço" type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                 <select value={newItemCat} onChange={e => setNewItemCat(e.target.value as Category)} className="bg-dark-800 border border-dark-600 p-2 rounded text-white">
                    <option value="VIP">VIP</option>
                    <option value="COINS">Pacote CapiCoins</option>
                    <option value="VEHICLE">Veículo</option>
                    <option value="MANSION">Mansão</option>
                    <option value="ORG">Organização</option>
                    <option value="SPECIAL">Especial</option>
                 </select>
                 <input placeholder="Descrição" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} className="bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                 <div className="col-span-1 md:col-span-2">
                    <input placeholder="URL da Imagem" value={newItemImageUrl} onChange={e => setNewItemImageUrl(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white" />
                 </div>
                 <button onClick={handleSaveShopItem} disabled={uploading} className={`col-span-1 md:col-span-2 text-white px-4 py-2 rounded font-bold flex items-center justify-center gap-2 transition-colors ${editingShopId ? 'bg-brand-600' : 'bg-green-600'}`}>
                    {uploading ? <Loader2 className="animate-spin"/> : editingShopId ? <Save size={18}/> : <Plus size={18}/>}
                    {uploading ? 'Salvando...' : editingShopId ? 'Salvar Alterações' : 'Adicionar Item'}
                 </button>
               </div>
               <div className="space-y-2">
                 {shopItems.map(i => (
                   <div key={i.id} className={`bg-dark-900 p-4 flex justify-between items-center text-white rounded border ${editingShopId === i.id ? 'border-brand-500' : 'border-white/5'}`}>
                     <div className="flex items-center gap-3">
                        <img src={i.imageUrl} className="w-10 h-10 rounded object-cover" />
                        <div>
                            <p className="font-bold flex items-center gap-2">{i.name}</p>
                            <p className="text-xs text-gray-500">{i.category} - R$ {i.price}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => startEditShop(i)} className="text-brand-400 hover:bg-brand-500/20 p-2 rounded"><Pencil size={18}/></button>
                        <button 
                          onClick={() => handleDeleteShopItem(i.id)} 
                          disabled={deletingId === i.id}
                          className="text-red-500 hover:bg-red-500/20 p-2 rounded disabled:opacity-50 transition-all flex items-center justify-center w-10 h-10"
                        >
                          {deletingId === i.id ? <Loader2 className="animate-spin text-red-500" size={20}/> : <Trash2 size={20}/>}
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'RULES' && (
             <div>
                <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-white">Regras</h2>
                 {editingRuleId && (
                   <button onClick={resetRuleForm} className="text-sm bg-red-500/20 text-red-400 px-3 py-1 rounded flex items-center gap-1"><X size={14}/> Cancelar</button>
                 )}
               </div>
                <div className={`space-y-4 mb-8 bg-dark-900/50 p-4 rounded-xl border ${editingRuleId ? 'border-brand-500' : 'border-white/5'}`}>
                    <select value={newRuleCat} onChange={e => setNewRuleCat(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white">
                       <option value="GENERAL">Geral</option>
                       <option value="COMBAT">Combate (PVP)</option>
                       <option value="ILLEGAL">Ilegalidades</option>
                       <option value="SAFEZONE">Safe Zones</option>
                    </select>
                    <input placeholder="Título" value={newRuleTitle} onChange={e => setNewRuleTitle(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                    <textarea placeholder="Conteúdo" value={newRuleContent} onChange={e => setNewRuleContent(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white h-24"/>
                    <button onClick={handleSaveRule} className={`text-white px-4 py-2 rounded font-bold w-full flex justify-center items-center gap-2 ${editingRuleId ? 'bg-brand-600' : 'bg-green-600'}`}>
                      {editingRuleId ? <Save size={18}/> : <Plus size={18}/>}
                      {editingRuleId ? 'Atualizar Regra' : 'Adicionar Regra'}
                    </button>
                </div>
                <div className="space-y-2">
                 {rules.map(r => (
                   <div key={r.id} className={`bg-dark-900 p-4 flex justify-between text-white rounded border ${editingRuleId === r.id ? 'border-brand-500' : 'border-white/5'}`}>
                     <div><span className="text-xs text-brand-400 font-bold">{r.category}</span><p className="font-bold">{r.title}</p></div>
                     <div className="flex items-center gap-2">
                        <button onClick={() => startEditRule(r)} className="text-brand-400 p-2 rounded"><Pencil size={18}/></button>
                        <button 
                          onClick={() => handleDeleteRule(r.id)} 
                          disabled={deletingId === r.id}
                          className="text-red-500 p-2 rounded disabled:opacity-50"
                        >
                          {deletingId === r.id ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18}/>}
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'NEWS' && (
             <div>
                <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-white">Notícias</h2>
                 {editingNewsId && (
                   <button onClick={resetNewsForm} className="text-sm bg-red-500/20 text-red-400 px-3 py-1 rounded flex items-center gap-1"><X size={14}/> Cancelar</button>
                 )}
               </div>
                <div className={`space-y-4 mb-8 bg-dark-900/50 p-4 rounded-xl border ${editingNewsId ? 'border-brand-500' : 'border-white/5'}`}>
                    <input placeholder="Título" value={newNewsTitle} onChange={e => setNewNewsTitle(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                    <input placeholder="Resumo" value={newNewsSummary} onChange={e => setNewNewsSummary(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                    <textarea placeholder="Conteúdo" value={newNewsContent} onChange={e => setNewNewsContent(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white h-24"/>
                    <input placeholder="URL Imagem" value={newNewsImageUrl} onChange={e => setNewNewsImageUrl(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white" />
                    <button onClick={handleSaveNews} disabled={uploading} className={`text-white px-4 py-2 rounded font-bold flex items-center gap-2 justify-center w-full ${editingNewsId ? 'bg-brand-600' : 'bg-green-600'}`}>
                       {uploading ? <Loader2 className="animate-spin"/> : editingNewsId ? <Save size={18}/> : <Plus size={18}/>}
                       {uploading ? 'Salvando...' : editingNewsId ? 'Salvar Notícia' : 'Publicar Notícia'}
                    </button>
                </div>
                <div className="space-y-2">
                 {news.map(n => (
                   <div key={n.id} className={`bg-dark-900 p-4 flex justify-between text-white rounded border ${editingNewsId === n.id ? 'border-brand-500' : 'border-white/5'}`}>
                     <p className="font-bold">{n.title}</p>
                     <div className="flex items-center gap-2">
                        <button onClick={() => startEditNews(n)} className="text-brand-400 p-2 rounded"><Pencil size={18}/></button>
                        <button 
                          onClick={() => handleDeleteNews(n.id)} 
                          disabled={deletingId === n.id}
                          className="text-red-500 p-2 rounded disabled:opacity-50"
                        >
                          {deletingId === n.id ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18}/>}
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'PAYMENTS' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Solicitações de Pagamento</h2>
                <button onClick={() => { refreshAll(); addToast('Lista atualizada', 'info'); }} className="text-gray-400 hover:text-white"><RefreshCw size={18}/></button>
              </div>
              {payments.length === 0 ? <p className="text-gray-500 text-center py-10">Nenhum pagamento registrado.</p> : (
                <div className="space-y-4">
                  {payments.map(payment => (
                    <div key={payment.id} className={`bg-dark-900 rounded-lg border p-4 ${payment.status === 'PENDING' ? 'border-yellow-500/50' : 'border-white/5 opacity-75'}`}>
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-grow">
                           <div className="flex items-center gap-2 mb-2">
                             <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' : payment.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{payment.status}</span>
                             <span className="text-xs text-gray-500">{payment.createdAt}</span>
                           </div>
                           <h3 className="font-bold text-white text-lg">{payment.itemName} <span className="text-brand-400 text-sm font-normal">({payment.itemPrice.toFixed(2)} R$)</span></h3>
                           <div className="text-sm text-gray-400 mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                             <p>Nick: <span className="text-white">{payment.playerNick}</span></p>
                             <p>ID: <span className="text-white font-mono font-bold">{payment.playerId}</span></p>
                             <p>Discord: <span className="text-white">{payment.discordContact}</span></p>
                           </div>
                        </div>
                        <div className="flex flex-row md:flex-col gap-2 justify-center shrink-0">
                           <button onClick={() => setChatOrder(payment)} className="bg-brand-600/20 hover:bg-brand-600/40 text-brand-300 px-3 py-2 rounded flex items-center justify-center gap-2 text-sm transition-colors border border-brand-500/30"><MessageCircle size={16} /> Chat</button>
                           <button onClick={() => setViewingProof(payment.proofImageUrl)} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-3 py-2 rounded flex items-center justify-center gap-2 text-sm transition-colors"><Eye size={16} /> Ver</button>
                           {payment.status === 'PENDING' && (
                            <>
                              <button onClick={() => updatePaymentStatus(payment.id, 'APPROVED')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded flex items-center justify-center gap-2 text-sm transition-colors font-bold"><CheckCircle size={16} /> Aprovar</button>
                              <button onClick={() => updatePaymentStatus(payment.id, 'REJECTED')} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded flex items-center justify-center gap-2 text-sm transition-colors font-bold"><XCircle size={16} /> Recusar</button>
                            </>
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

      {viewingProof && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setViewingProof(null)}>
          <div className="bg-dark-900 p-2 rounded-xl max-w-2xl max-h-[90vh] overflow-auto relative">
            <button className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-red-500" onClick={() => setViewingProof(null)}><XCircle size={24} /></button>
            <img src={viewingProof} alt="Comprovante" className="max-w-full rounded-lg" />
          </div>
        </div>
      )}

      {chatOrder && (
         <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
           <div className="bg-dark-800 w-full max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[600px]">
             <div className="bg-dark-900 p-4 border-b border-white/5 flex justify-between items-center">
               <div><h3 className="font-bold text-white">Chat - {chatOrder.playerNick}</h3><p className="text-xs text-gray-500">{chatOrder.itemName}</p></div>
               <button onClick={() => setChatOrder(null)} className="text-gray-400 hover:text-white p-2"><XCircle size={24} /></button>
             </div>
             <div className="flex-grow bg-dark-900/50 p-4 overflow-y-auto space-y-4">
                {chatOrder.messages?.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 ${msg.sender === 'ADMIN' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-dark-700 text-gray-200 rounded-tl-none border border-white/10'}`}>
                      <div className="flex items-center gap-2 mb-1"><span className="text-[10px] font-bold opacity-75 flex items-center gap-1">{msg.sender === 'ADMIN' ? <Shield size={10}/> : <User size={10}/>}{msg.sender}</span><span className="text-[10px] opacity-50">{msg.timestamp}</span></div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
             </div>
             <form onSubmit={handleSendAdminMessage} className="p-4 bg-dark-800 border-t border-white/5 flex gap-2">
                <input className="flex-grow bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none" placeholder="Mensagem..." value={chatMessageInput} onChange={(e) => setChatMessageInput(e.target.value)} />
                <button type="submit" className="bg-brand-600 text-white p-2 rounded-lg"><Send size={20} /></button>
             </form>
           </div>
         </div>
      )}
    </div>
  );
};