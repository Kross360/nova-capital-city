
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { ShopItem, ServerConfig } from '../types';
import { QrCode, Upload, CheckCircle, ArrowLeft, CreditCard, Copy, MessageSquare, Coins, Minus, Plus, Loader2 } from 'lucide-react';
import { useToast } from '../components/ToastSystem';
import { useAuth } from '../contexts/AuthContext';

export const Checkout: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { profile } = useAuth();
  
  const [item, setItem] = useState<ShopItem | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [playerNick, setPlayerNick] = useState('');
  const [gameId, setGameId] = useState('');
  const [discordContact, setDiscordContact] = useState('');
  const [proofImage, setProofImage] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [config, setConfig] = useState<ServerConfig>({} as ServerConfig);

  const isCoinPurchase = itemId === 'capicoins';
  const [coinQuantity, setCoinQuantity] = useState(100);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const cfg = await StorageService.getConfig();
        setConfig(cfg);

        if (profile) {
          setPlayerNick(profile.rp_nick);
          setDiscordContact(profile.discord);
          if (profile.game_id) setGameId(profile.game_id.toString());
        }

        if (itemId && itemId !== 'capicoins') {
          const foundItem = await StorageService.getShopItemById(itemId);
          if (foundItem) {
            setItem(foundItem);
          } else {
            navigate('/shop');
            addToast('Item não localizado no estoque.', 'error');
          }
        }
      } catch (e) {
        addToast('Erro ao carregar checkout.', 'error');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [itemId, profile]);

  const currentTotal = isCoinPurchase 
    ? coinQuantity * (config.capiCoinPrice || 1) 
    : (item?.price || 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        addToast("Arquivo muito grande. Limite: 2MB.", 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
        addToast("Comprovante anexado.", 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCoinPurchase && !item) return;
    if (!playerNick || !gameId || !proofImage || !discordContact) {
      addToast("Preencha todos os dados e anexe o comprovante PIX.", 'error');
      return;
    }

    const finalItemName = isCoinPurchase ? `${coinQuantity}x CapiCoins` : item!.name;
    const finalItemId = isCoinPurchase ? `coins_${coinQuantity}_${Date.now()}` : item!.id;

    try {
      const orderPayload = {
        itemId: finalItemId,
        itemName: finalItemName,
        itemPrice: currentTotal,
        playerNick,
        playerId: parseInt(gameId),
        discordContact,
        proofImageUrl: proofImage,
        status: 'PENDING' as any
      };

      const data = await StorageService.addPayment(orderPayload);
      
      StorageService.saveMyOrderId(data.id);
      setCreatedOrderId(data.id);
      setSubmitted(true);
      window.scrollTo(0, 0);

      if (config.discordWebhookUrl) {
         await StorageService.sendDiscordNotification(config.discordWebhookUrl, orderPayload);
      }
    } catch (error) {
      addToast('Erro ao processar envio.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-500" size={32} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="max-w-md w-full bg-dark-800 border border-brand-500/20 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Pedido Enviado</h2>
          <p className="text-gray-500 mb-6 text-sm">Seu comprovante está em análise.</p>
          <div className="bg-dark-900 rounded-2xl p-4 mb-6 border border-white/5 flex items-center justify-between">
             <p className="text-sm font-mono text-white font-bold tracking-widest">{createdOrderId.slice(0, 8).toUpperCase()}</p>
             <button onClick={() => { navigator.clipboard.writeText(createdOrderId); addToast('ID Copiado!', 'success'); }} className="text-brand-400 hover:text-white"><Copy size={18} /></button>
          </div>
          <div className="space-y-3">
             <Link to={`/track/${createdOrderId}`} className="block w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand-600/10"><MessageSquare size={18} /> RASTREAR</Link>
             <Link to="/shop" className="block w-full bg-white/5 text-gray-400 font-bold py-3 rounded-xl hover:bg-white/10 text-sm">Voltar para Loja</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-6xl mx-auto">
      <Link to="/shop" className="text-gray-500 hover:text-white inline-flex items-center gap-2 mb-6 transition-colors font-bold text-xs uppercase tracking-widest">
        <ArrowLeft size={18} /> Cancelar Checkout
      </Link>
      
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Resumo do Pedido (Compacto) */}
        <div className="lg:col-span-4">
          <div className="bg-dark-800 rounded-2xl p-6 border border-white/5 sticky top-24 shadow-xl">
            <h3 className="text-sm font-black text-gray-400 mb-4 uppercase tracking-widest border-b border-white/5 pb-3">Resumo</h3>
            <div className="mb-4 rounded-xl overflow-hidden h-32 bg-dark-900 flex items-center justify-center border border-white/5">
              {isCoinPurchase ? (
                <Coins size={64} className="text-yellow-400" />
              ) : (
                item && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              )}
            </div>
            <h4 className="font-bold text-white text-lg mb-1 tracking-tight">{isCoinPurchase ? 'Pacote CapiCoins' : (item?.name || 'Carregando...')}</h4>
            
            {isCoinPurchase && (
               <div className="my-4 bg-dark-950 p-4 rounded-xl border border-yellow-500/10">
                  <div className="flex items-center justify-between gap-3">
                     <button onClick={() => setCoinQuantity(Math.max(1, coinQuantity - 10))} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-lg"><Minus size={16}/></button>
                     <input type="number" min="1" value={coinQuantity} onChange={e => setCoinQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-transparent text-center text-white font-black text-xl focus:outline-none" />
                     <button onClick={() => setCoinQuantity(coinQuantity + 10)} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-lg"><Plus size={16}/></button>
                  </div>
               </div>
            )}

            <div className="flex justify-between items-center text-gray-400 mt-4 pt-4 border-t border-white/5">
              <span className="font-bold text-[10px] uppercase tracking-widest">Total</span>
              <span className="text-white font-black text-2xl">R$ {currentTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Pagamento e Dados (Compacto) */}
        <div className="lg:col-span-8">
          <div className="bg-dark-800 rounded-2xl p-8 border border-white/5 shadow-xl">
            <h1 className="text-2xl font-black text-white mb-8 flex items-center gap-3 tracking-tight uppercase"><CreditCard className="text-brand-500" size={24} /> Pagamento PIX</h1>
            
            <div className="bg-dark-900/50 p-6 rounded-2xl border border-brand-500/10 mb-8 flex flex-col sm:flex-row items-center gap-6">
               <div className="bg-white p-2 rounded-xl shrink-0">
                 {config.pixQrCodeUrl ? <img src={config.pixQrCodeUrl} alt="QR Code" className="w-24 h-24" /> : <QrCode size={96} className="text-black" />}
               </div>
               <div className="flex-grow w-full text-center sm:text-left">
                 <h3 className="text-white font-bold text-sm uppercase tracking-tight mb-1">Copia e Cola</h3>
                 <p className="text-gray-500 text-xs mb-4">Pague rapidamente via chave PIX.</p>
                 <div className="relative">
                   <input readOnly value={config.pixKey} className="w-full bg-dark-950 border border-white/5 rounded-xl p-3 text-brand-400 font-mono text-sm pr-12" />
                   <button onClick={() => { navigator.clipboard.writeText(config.pixKey); addToast("Copiada!", "info"); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-400 hover:text-white p-1.5"><Copy size={18} /></button>
                 </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Nick RP</label>
                  <input type="text" required value={playerNick} onChange={(e) => setPlayerNick(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-brand-500 outline-none" placeholder="Nome_Sobrenome" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">ID da Conta</label>
                  <input type="number" required value={gameId} onChange={(e) => setGameId(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-brand-500 outline-none" placeholder="Ex: 123" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Discord Tag</label>
                  <input type="text" required placeholder="usuario#0000" className="w-full bg-dark-900/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-brand-500 outline-none" value={discordContact} onChange={(e) => setDiscordContact(e.target.value)} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Comprovante</label>
                <div className="border-2 border-dashed border-white/10 hover:border-brand-500/50 rounded-xl p-6 text-center bg-dark-900/50 transition-all group">
                   <input type="file" id="proof" accept="image/*" onChange={handleImageUpload} className="hidden" />
                   <label htmlFor="proof" className="cursor-pointer flex flex-col items-center justify-center">
                      {proofImage ? (
                        <div className="relative">
                          <img src={proofImage} alt="Preview" className="h-32 rounded-lg object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-all text-[10px] text-white font-bold">TROCAR</div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload size={24} className="text-gray-600 mb-2 group-hover:text-brand-500 transition-all" />
                          <span className="text-gray-500 font-bold text-xs">Anexar Imagem</span>
                        </div>
                      )}
                   </label>
                </div>
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                <CheckCircle size={20} /> FINALIZAR PEDIDO
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
