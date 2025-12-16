import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from '../services/storage';
import { ShopItem, Rule, NewsPost, Category, PaymentRequest, ServerConfig } from '../types';
import { Trash2, Plus, LogOut, LayoutGrid, ScrollText, Newspaper, CreditCard, CheckCircle, XCircle, Eye, RefreshCw, Link as LinkIcon, Settings, Save, Smartphone, Monitor, MessageCircle, QrCode, Image as ImageIcon, Send, Shield, User, Upload, Loader2, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastSystem';

export const Admin: React.FC = () => {
  // Inicializa o estado verificando se já existe uma sessão administrativa salva
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('capital_admin_auth') === 'true';
  });
  
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'SHOP' | 'RULES' | 'NEWS' | 'PAYMENTS' | 'CONFIG' | 'IMAGES'>('SHOP');
  const [uploading, setUploading] = useState(false);
  
  // Data State
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
    capiCoinPrice: 1.0
  });

  // Shop Form
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCat, setNewItemCat] = useState<Category>('VIP');
  const [newItemImageUrl, setNewItemImageUrl] = useState('');

  // Rule Form
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleContent, setNewRuleContent] = useState('');
  const [newRuleCat, setNewRuleCat] = useState('GENERAL');

  // News Form
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsSummary, setNewNewsSummary] = useState('');
  const [newNewsContent, setNewNewsContent] = useState('');
  const [newNewsImageUrl, setNewNewsImageUrl] = useState('');

  // Modals
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [chatOrder, setChatOrder] = useState<PaymentRequest | null>(null);
  const [chatMessageInput, setChatMessageInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const refreshAll = async () => {
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
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, activeTab]);

  // Polling for payments/chat updates when active
  useEffect(() => {
    let interval: number;
    if (isAuthenticated) {
      interval = window.setInterval(async () => {
        // Update payments list if tab is payments
        if (activeTab === 'PAYMENTS') {
          const freshPayments = await StorageService.getPayments();
          
          setPayments(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(freshPayments)) return freshPayments;
            return prev;
          });
          
          // If Chat is open, update current order chat
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

  // Scroll Chat to bottom ONLY if message count changes
  useEffect(() => {
    if (chatOrder?.messages?.length) {
       chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatOrder?.messages?.length]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'CAPITAL2025') {
      setIsAuthenticated(true);
      // Salva a autenticação na sessão
      sessionStorage.setItem('capital_admin_auth', 'true');
      addToast('Bem-vindo ao painel administrativo!', 'success');
    } else {
      addToast('Senha incorreta!', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Remove a autenticação da sessão ao sair manualmente
    sessionStorage.removeItem('capital_admin_auth');
    navigate('/');
    addToast('Logout realizado com sucesso.', 'info');
  };

  // --- ACTIONS ---

  // Shop
  const addShopItem = async () => {
    if (!newItemName || !newItemPrice) return addToast("Preencha nome e preço.", 'error');
    
    setUploading(true);
    // Use URL provided or fallback
    const finalImageUrl = newItemImageUrl || `https://picsum.photos/400/300?random=${Date.now()}`;
    
    try {
      await StorageService.addShopItem({
        name: newItemName,
        description: newItemDesc,
        price: parseFloat(newItemPrice),
        category: newItemCat,
        imageUrl: finalImageUrl
      });

      setNewItemName(''); setNewItemDesc(''); setNewItemPrice(''); setNewItemImageUrl('');
      addToast('Item adicionado à loja!', 'success');
      refreshAll();
    } catch (e: any) {
      addToast('Erro ao salvar: ' + e.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const deleteShopItem = async (id: string) => {
    await StorageService.deleteShopItem(id);
    addToast('Item removido da loja.', 'info');
    refreshAll();
  };

  // Rules
  const addRule = async () => {
    if(!newRuleTitle) return addToast("Preencha o título da regra.", 'error');
    await StorageService.addRule({
      title: newRuleTitle,
      content: newRuleContent,
      category: newRuleCat as any
    });
    setNewRuleTitle(''); setNewRuleContent('');
    addToast('Regra publicada com sucesso!', 'success');
    refreshAll();
  };

  const deleteRule = async (id: string) => {
    await StorageService.deleteRule(id);
    addToast('Regra removida.', 'info');
    refreshAll();
  };

  // News
  const addNews = async () => {
    if(!newNewsTitle || !newNewsSummary) return addToast("Preencha título e resumo da notícia.", 'error');
    
    setUploading(true);
    const finalImageUrl = newNewsImageUrl || `https://picsum.photos/800/400?random=${Date.now()}`;

    try {
      await StorageService.addNews({
        title: newNewsTitle,
        summary: newNewsSummary,
        content: newNewsContent,
        author: 'Admin',
        date: new Date().toLocaleDateString('pt-BR'),
        imageUrl: finalImageUrl
      });
      setNewNewsTitle(''); setNewNewsSummary(''); setNewNewsContent(''); setNewNewsImageUrl('');
      addToast('Notícia publicada!', 'success');
      refreshAll();
    } catch (e: any) {
       addToast('Erro ao salvar notícia: ' + e.message, 'error');
    } finally {
       setUploading(false);
    }
  };

  const deleteNews = async (id: string) => {
    await StorageService.deleteNews(id);
    addToast('Notícia removida.', 'info');
    refreshAll();
  };

  // Payments
  const updatePaymentStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const note = prompt(status === 'APPROVED' ? "Mensagem para o player (opcional):" : "Motivo da recusa:");
    await StorageService.updatePaymentStatus(id, status, note || undefined);
    addToast(`Pagamento ${status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'} com sucesso.`, status === 'APPROVED' ? 'success' : 'info');
    refreshAll();
  };

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim() || !chatOrder) return;
    
    await StorageService.addOrderMessage(chatOrder.id, 'ADMIN', chatMessageInput);
    
    const updated = await StorageService.getPaymentById(chatOrder.id);
    setChatOrder(updated || null);
    setChatMessageInput('');
  };

  // Config
  const handleSaveConfig = async () => {
    await StorageService.saveConfig(config);
    addToast('Configurações salvas com sucesso!', 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="bg-dark-800 p-8 rounded-xl border border-white/10 w-full max-w-md shadow-2xl">
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
        {/* Sidebar */}
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

        {/* Content */}
        <div className="lg:col-span-3 bg-dark-800 rounded-xl p-6 border border-white/5 min-h-[500px]">
          
          {/* TAB: IMAGES */}
          {activeTab === 'IMAGES' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">Customização Visual</h2>
                <button 
                  onClick={handleSaveConfig} 
                  className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-brand-600/20"
                >
                  <Save size={18} /> Salvar Alterações
                </button>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded text-sm text-blue-200 mb-4">
                 <p className="font-bold flex items-center gap-2"><ImageIcon size={16}/> Nota sobre Imagens</p>
                 <p className="mt-1">Todas as imagens do site (exceto comprovantes) agora utilizam URLs diretas. Você pode usar links do Imgur, Discord, etc.</p>
              </div>

              <div className="grid gap-8">
                {/* Home Background */}
                <div className="bg-dark-900/50 p-6 rounded-xl border border-white/5">
                  <h3 className="text-lg font-semibold text-white mb-4">Imagem de Fundo (Home Hero)</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-400 mb-2">URL da Imagem</label>
                      <input 
                        type="text" 
                        value={config.homeBackgroundUrl} 
                        onChange={(e) => setConfig({...config, homeBackgroundUrl: e.target.value})}
                        className="w-full bg-dark-800 border border-dark-600 rounded px-4 py-2 text-white focus:border-brand-500 focus:outline-none"
                        placeholder="https://..."
                      />
                      <p className="text-xs text-gray-500 mt-2">Recomendado: 1920x1080px (Alta Qualidade)</p>
                    </div>
                    <div className="h-32 rounded-lg overflow-hidden border border-white/20 bg-dark-950 flex items-center justify-center relative group">
                        {config.homeBackgroundUrl ? (
                          <img src={config.homeBackgroundUrl} className="w-full h-full object-cover" alt="Preview"/>
                        ) : <span className="text-gray-600 text-xs">Sem Imagem</span>}
                    </div>
                  </div>
                </div>
                
                 {/* About Image */}
                <div className="bg-dark-900/50 p-6 rounded-xl border border-brand-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ImageIcon className="text-brand-500" size={20}/>
                    Imagem Principal: Sobre Nós
                  </h3>
                   <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-400 mb-2">URL da Imagem</label>
                       <input 
                        type="text" 
                        value={config.aboutImageUrl} 
                        onChange={(e) => setConfig({...config, aboutImageUrl: e.target.value})} 
                        className="w-full bg-dark-800 border border-brand-500/50 rounded px-4 py-2 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        placeholder="https://i.imgur.com/..."
                       />
                    </div>
                    <div className="h-32 rounded-lg overflow-hidden border border-white/20 bg-dark-950 flex items-center justify-center relative">
                        {config.aboutImageUrl ? (
                          <img src={config.aboutImageUrl} className="w-full h-full object-cover" alt="Preview"/>
                        ) : <span className="text-gray-600 text-xs">Sem Imagem</span>}
                    </div>
                   </div>
                </div>
              </div>
            </div>
          )}
          
          {/* TAB: CONFIG */}
          {activeTab === 'CONFIG' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h2 className="text-xl font-bold text-white">Configurações Gerais</h2>
                <button onClick={handleSaveConfig} className="bg-brand-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"> <Save size={18} /> Salvar</button>
              </div>

              <div className="grid gap-6">
                
                {/* ECONOMY CONFIG */}
                <div className="bg-dark-900/50 p-6 rounded-xl border border-brand-500/20 shadow-lg shadow-brand-500/5">
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
                            onChange={e => setConfig({...config, capiCoinPrice: parseFloat(e.target.value)})} 
                            className="w-full bg-dark-800 border border-dark-600 p-2 pl-10 rounded text-white focus:border-brand-500 focus:outline-none"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Valor que será cobrado por cada 1 CapiCoin na loja.</p>
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
                   <h3 className="text-lg font-semibold text-white mb-4">Social</h3>
                   <div>
                        <label className="block text-gray-400 text-sm mb-1">Discord Invite</label>
                        <input placeholder="URL..." value={config.discordUrl} onChange={e => setConfig({...config, discordUrl: e.target.value})} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                   </div>
                </div>

                <div className="bg-dark-900/50 p-6 rounded-xl border border-white/5">
                   <h3 className="text-lg font-semibold text-white mb-4">Pagamento PIX</h3>
                   <div className="space-y-4">
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

          {/* TAB: SHOP */}
          {activeTab === 'SHOP' && (
            <div>
               <h2 className="text-xl font-bold text-white mb-6">Gerenciar Loja</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-dark-900/50 p-4 rounded-xl border border-white/5">
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
                 
                 {/* Image URL Input */}
                 <div className="col-span-1 md:col-span-2">
                    <input 
                      placeholder="URL da Imagem (Ex: https://i.imgur.com/...)" 
                      value={newItemImageUrl} 
                      onChange={e => setNewItemImageUrl(e.target.value)} 
                      className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"
                    />
                    {newItemImageUrl && (
                      <div className="mt-2 h-20 w-20 rounded overflow-hidden border border-white/10">
                         <img src={newItemImageUrl} className="w-full h-full object-cover" alt="Preview"/>
                      </div>
                    )}
                 </div>

                 <button onClick={addShopItem} disabled={uploading} className="col-span-1 md:col-span-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold flex items-center justify-center gap-2">
                    {uploading ? <Loader2 className="animate-spin"/> : <Plus size={18}/>}
                    {uploading ? 'Salvando...' : 'Adicionar Item'}
                 </button>
               </div>
               
               <div className="space-y-2">
                 {shopItems.map(i => (
                   <div key={i.id} className="bg-dark-900 p-4 flex justify-between items-center text-white rounded border border-white/5">
                     <div className="flex items-center gap-3">
                        <img src={i.imageUrl} className="w-10 h-10 rounded object-cover" />
                        <div>
                            <p className="font-bold flex items-center gap-2">
                              {i.name} 
                              {i.category === 'COINS' && <Coins size={14} className="text-yellow-500"/>}
                            </p>
                            <p className="text-xs text-gray-500">{i.category} - R$ {i.price}</p>
                        </div>
                     </div>
                     <button onClick={() => deleteShopItem(i.id)} className="text-red-500 hover:bg-red-500/20 p-2 rounded"><Trash2 size={18}/></button>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {/* ... resto do código (Tabs RULES, NEWS, PAYMENTS mantidos iguais) ... */}
          {/* TAB: RULES */}
          {activeTab === 'RULES' && (
             <div>
                <h2 className="text-xl font-bold text-white mb-6">Regras</h2>
                <div className="space-y-4 mb-8 bg-dark-900/50 p-4 rounded-xl border border-white/5">
                    <input placeholder="Título" value={newRuleTitle} onChange={e => setNewRuleTitle(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                    <textarea placeholder="Conteúdo" value={newRuleContent} onChange={e => setNewRuleContent(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                    <button onClick={addRule} className="bg-green-600 text-white px-4 py-2 rounded font-bold">Adicionar</button>
                </div>
                <div className="space-y-2">
                 {rules.map(r => (
                   <div key={r.id} className="bg-dark-900 p-4 flex justify-between text-white rounded border border-white/5">
                     <div>
                        <span className="text-xs text-brand-400 font-bold">{r.category}</span>
                        <p className="font-bold">{r.title}</p>
                     </div>
                     <button onClick={() => deleteRule(r.id)} className="text-red-500 hover:bg-red-500/20 p-2 rounded"><Trash2 size={18}/></button>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {/* TAB: NEWS */}
          {activeTab === 'NEWS' && (
             <div>
                <h2 className="text-xl font-bold text-white mb-6">Notícias</h2>
                <div className="space-y-4 mb-8 bg-dark-900/50 p-4 rounded-xl border border-white/5">
                    <input placeholder="Título" value={newNewsTitle} onChange={e => setNewNewsTitle(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                    <input placeholder="Resumo" value={newNewsSummary} onChange={e => setNewNewsSummary(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"/>
                    <textarea placeholder="Conteúdo" value={newNewsContent} onChange={e => setNewNewsContent(e.target.value)} className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white h-24"/>
                    
                    {/* Image URL Input for News */}
                    <div>
                      <input 
                        placeholder="URL da Imagem de Capa" 
                        value={newNewsImageUrl} 
                        onChange={e => setNewNewsImageUrl(e.target.value)} 
                        className="w-full bg-dark-800 border border-dark-600 p-2 rounded text-white"
                      />
                       {newNewsImageUrl && (
                        <div className="mt-2 h-32 w-full max-w-xs rounded overflow-hidden border border-white/10">
                           <img src={newNewsImageUrl} className="w-full h-full object-cover" alt="Preview"/>
                        </div>
                      )}
                    </div>

                    <button onClick={addNews} disabled={uploading} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold flex items-center gap-2 justify-center w-full">
                       {uploading ? <Loader2 className="animate-spin"/> : <Plus size={18}/>}
                       {uploading ? 'Publicando...' : 'Publicar Notícia'}
                    </button>
                </div>
                <div className="space-y-2">
                 {news.map(n => (
                   <div key={n.id} className="bg-dark-900 p-4 flex justify-between text-white rounded border border-white/5">
                     <p className="font-bold">{n.title}</p>
                     <button onClick={() => deleteNews(n.id)} className="text-red-500 hover:bg-red-500/20 p-2 rounded"><Trash2 size={18}/></button>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {/* TAB: PAYMENTS */}
          {activeTab === 'PAYMENTS' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Solicitações de Pagamento</h2>
                <button onClick={() => { refreshAll(); addToast('Lista atualizada', 'info'); }} className="text-gray-400 hover:text-white"><RefreshCw size={18}/></button>
              </div>
              
              {payments.length === 0 ? (
                <p className="text-gray-500 text-center py-10">Nenhum pagamento registrado.</p>
              ) : (
                <div className="space-y-4">
                  {payments.map(payment => (
                    <div key={payment.id} className={`bg-dark-900 rounded-lg border p-4 ${payment.status === 'PENDING' ? 'border-yellow-500/50' : 'border-white/5 opacity-75'}`}>
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-grow">
                           <div className="flex items-center gap-2 mb-2">
                             <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                               payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                               payment.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                             }`}>{payment.status === 'PENDING' ? 'Pendente' : payment.status === 'APPROVED' ? 'Aprovado' : 'Recusado'}</span>
                             <span className="text-xs text-gray-500">{payment.createdAt}</span>
                             {payment.messages && payment.messages.length > 0 && (
                                <span className="flex items-center gap-1 text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded border border-brand-500/20">
                                  <MessageCircle size={10} /> {payment.messages.length} msgs
                                </span>
                             )}
                           </div>
                           <h3 className="font-bold text-white text-lg">{payment.itemName} <span className="text-brand-400 text-sm font-normal">({payment.itemPrice.toFixed(2)} R$)</span></h3>
                           <div className="text-sm text-gray-400 mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                             <p>Nick: <span className="text-white">{payment.playerNick}</span></p>
                             <p>ID: <span className="text-white font-mono font-bold">{payment.playerId}</span></p>
                             <p>Discord: <span className="text-white">{payment.discordContact}</span></p>
                             <p className="col-span-full text-xs font-mono mt-1 text-gray-600">ID Pedido: {payment.id}</p>
                           </div>
                        </div>
                        
                        <div className="flex flex-row md:flex-col gap-2 justify-center shrink-0">
                           <button onClick={() => setChatOrder(payment)} className="bg-brand-600/20 hover:bg-brand-600/40 text-brand-300 px-3 py-2 rounded flex items-center justify-center gap-2 text-sm transition-colors border border-brand-500/30">
                            <MessageCircle size={16} /> Chat
                          </button>

                          <button onClick={() => setViewingProof(payment.proofImageUrl)} className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 px-3 py-2 rounded flex items-center justify-center gap-2 text-sm transition-colors">
                            <Eye size={16} /> Ver
                          </button>
                          
                          {payment.status === 'PENDING' && (
                            <>
                              <button onClick={() => updatePaymentStatus(payment.id, 'APPROVED')} className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded flex items-center justify-center gap-2 text-sm transition-colors font-bold">
                                <CheckCircle size={16} /> Aprovar
                              </button>
                              <button onClick={() => updatePaymentStatus(payment.id, 'REJECTED')} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded flex items-center justify-center gap-2 text-sm transition-colors font-bold">
                                <XCircle size={16} /> Recusar
                              </button>
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

      {/* Modal for Proof Image */}
      {viewingProof && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-fade-in" onClick={() => setViewingProof(null)}>
          <div className="bg-dark-900 p-2 rounded-xl max-w-2xl max-h-[90vh] overflow-auto relative">
            <button className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-red-500 transition-colors" onClick={() => setViewingProof(null)}>
              <XCircle size={24} />
            </button>
            <img src={viewingProof} alt="Comprovante Full" className="max-w-full rounded-lg" />
          </div>
        </div>
      )}

      {/* Modal for Chat */}
      {chatOrder && (
         <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-dark-800 w-full max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[600px]">
             {/* Header */}
             <div className="bg-dark-900 p-4 border-b border-white/5 flex justify-between items-center">
               <div>
                 <h3 className="font-bold text-white">Chat - {chatOrder.playerNick}</h3>
                 <p className="text-xs text-gray-500">{chatOrder.itemName}</p>
               </div>
               <button onClick={() => setChatOrder(null)} className="text-gray-400 hover:text-white p-2">
                 <XCircle size={24} />
               </button>
             </div>
             
             {/* Messages */}
             <div className="flex-grow bg-dark-900/50 p-4 overflow-y-auto space-y-4">
                {(!chatOrder.messages || chatOrder.messages.length === 0) && (
                   <p className="text-center text-gray-500 text-sm py-4">Inicie a conversa com o jogador.</p>
                )}
                {chatOrder.messages?.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 ${
                      msg.sender === 'ADMIN' 
                        ? 'bg-brand-600 text-white rounded-tr-none' 
                        : 'bg-dark-700 text-gray-200 rounded-tl-none border border-white/10'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold opacity-75 uppercase flex items-center gap-1">
                           {msg.sender === 'ADMIN' ? <Shield size={10}/> : <User size={10}/>}
                           {msg.sender}
                        </span>
                        <span className="text-[10px] opacity-50">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
             </div>

             {/* Input */}
             <form onSubmit={handleSendAdminMessage} className="p-4 bg-dark-800 border-t border-white/5 flex gap-2">
                <input 
                  className="flex-grow bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-500"
                  placeholder="Mensagem para o player..."
                  value={chatMessageInput}
                  onChange={(e) => setChatMessageInput(e.target.value)}
                />
                <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-lg">
                  <Send size={20} />
                </button>
             </form>
           </div>
         </div>
      )}
    </div>
  );
};