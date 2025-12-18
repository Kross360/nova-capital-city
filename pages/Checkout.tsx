
import React, { useEffect, useState } from 'react';
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
        <Loader2 className="animate-spin text-brand-500" size={48} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 animate-fade-in">
        <div className="max-w-xl w-full bg-dark-800 border border-brand-500/30 rounded-[3rem] p-12 text-center shadow-2xl relative">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 shadow-inner">
            <CheckCircle size={56} />
          </div>
          <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">Pedido Enviado!</h2>
          <p className="text-gray-400 mb-10 text-lg">Seu comprovante está em análise. Acompanhe pelo ID abaixo:</p>
          <div className="bg-dark-900 rounded-[2rem] p-8 mb-10 border border-white/5 relative shadow-inner">
             <p className="text-2xl font-mono text-white font-black tracking-widest">{createdOrderId.slice(0, 8).toUpperCase()}</p>
             <button onClick={() => { navigator.clipboard.writeText(createdOrderId); addToast('ID Copiado!', 'success'); }} className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-400 hover:text-white transition-colors"><Copy size={24} /></button>
          </div>
          <div className="grid gap-4">
             <Link to={`/track/${createdOrderId}`} className="block w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-4 text-lg shadow-xl shadow-brand-600/20"><MessageSquare size={24} /> ACOMPANHAR STATUS</Link>
             <Link to="/shop" className="block w-full bg-white/5 text-white font-black py-5 rounded-2xl hover:bg-white/10">VOLTAR PARA LOJA</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-6 max-w-7xl mx-auto">
      <Link to="/shop" className="text-gray-500 hover:text-white flex items-center gap-3 mb-12 transition-colors font-black text-sm uppercase tracking-widest"><ArrowLeft size={24} /> Cancelar Checkout</Link>
      
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <div className="bg-dark-800 rounded-[2.5rem] p-10 border border-white/5 sticky top-28 shadow-2xl">
            <h3 className="text-xl font-black text-white mb-8 border-b border-white/5 pb-6 uppercase tracking-tighter">Seu Pedido</h3>
            <div className="mb-8 rounded-3xl overflow-hidden h-48 bg-dark-900 flex items-center justify-center border border-white/5 relative group">
              {isCoinPurchase ? (
                <Coins size={100} className="text-yellow-400 drop-shadow-2xl group-hover:scale-110 transition-transform" />
              ) : (
                item && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              )}
            </div>
            <h4 className="font-black text-white text-3xl mb-2 tracking-tighter">{isCoinPurchase ? 'Pacote CapiCoins' : (item?.name || 'Carregando...')}</h4>
            
            {isCoinPurchase && (
               <div className="mb-10 bg-dark-950 p-6 rounded-2xl border border-yellow-500/20 shadow-inner">
                  <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4 text-center">Definir Quantidade</label>
                  <div className="flex items-center justify-between gap-4">
                     <button onClick={() => setCoinQuantity(Math.max(1, coinQuantity - 10))} className="p-3 text-gray-400 hover:text-white bg-white/5 rounded-xl transition-all"><Minus size={20}/></button>
                     <input type="number" min="1" value={coinQuantity} onChange={e => setCoinQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-transparent text-center text-white font-black text-3xl focus:outline-none" />
                     <button onClick={() => setCoinQuantity(coinQuantity + 10)} className="p-3 text-gray-400 hover:text-white bg-white/5 rounded-xl transition-all"><Plus size={20}/></button>
                  </div>
               </div>
            )}

            <div className="flex justify-between items-center text-gray-400 mb-4 pt-6 border-t border-white/5">
              <span className="font-bold text-sm uppercase tracking-widest">Total Final</span>
              <span className="text-white font-black text-4xl tracking-tighter">R$ {currentTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-dark-800 rounded-[3.5rem] p-12 border border-white/5 shadow-2xl">
            <h1 className="text-4xl font-black text-white mb-10 flex items-center gap-5 tracking-tighter uppercase"><CreditCard className="text-brand-500" size={40} /> Pagamento PIX</h1>
            
            <div className="bg-gradient-to-br from-dark-900 to-dark-800 p-8 rounded-[2.5rem] border border-brand-500/20 mb-12 flex flex-col md:flex-row items-center gap-10 shadow-inner">
               <div className="bg-white p-3 rounded-3xl shrink-0 shadow-2xl">
                 {config.pixQrCodeUrl ? <img src={config.pixQrCodeUrl} alt="QR Code" className="w-32 h-32 object-contain" /> : <QrCode size={120} className="text-black" />}
               </div>
               <div className="flex-grow w-full">
                 <h3 className="text-white font-black text-xl mb-2 uppercase">Chave PIX Oficial</h3>
                 <p className="text-gray-500 text-sm mb-6 font-medium">Copie a chave e pague pelo app do seu banco.</p>
                 <div className="relative">
                   <input readOnly value={config.pixKey} className="w-full bg-dark-950 border border-white/5 rounded-2xl p-5 text-brand-400 font-mono text-lg pr-16 shadow-inner" />
                   <button onClick={() => { navigator.clipboard.writeText(config.pixKey); addToast("Chave PIX Copiada!", "success"); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-white transition-colors bg-brand-900/50 p-2 rounded-xl"><Copy size={24} /></button>
                 </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nick no Servidor</label>
                  <input type="text" required value={playerNick} onChange={(e) => setPlayerNick(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-2xl p-5 text-white focus:border-brand-500 outline-none" placeholder="Nome_Sobrenome" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">ID da Conta</label>
                  <input type="number" required value={gameId} onChange={(e) => setGameId(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-2xl p-5 text-white focus:border-brand-500 outline-none" placeholder="Ex: 123" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Discord para Contato</label>
                  <input type="text" required placeholder="usuario#0000" className="w-full bg-dark-900/50 border border-white/10 rounded-2xl p-5 text-white focus:border-brand-500 outline-none" value={discordContact} onChange={(e) => setDiscordContact(e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Comprovante Bancário</label>
                <div className="border-4 border-dashed border-white/5 hover:border-brand-500/50 rounded-[2rem] p-12 text-center bg-dark-900/50 transition-all group">
                   <input type="file" id="proof" accept="image/*" onChange={handleImageUpload} className="hidden" />
                   <label htmlFor="proof" className="cursor-pointer flex flex-col items-center justify-center">
                      {proofImage ? (
                        <div className="relative">
                          <img src={proofImage} alt="Preview" className="h-64 rounded-2xl shadow-2xl object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-all">
                            <span className="text-white font-black">TROCAR IMAGEM</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-dark-800 rounded-3xl flex items-center justify-center text-gray-600 mb-6 group-hover:text-brand-500 group-hover:scale-110 transition-all shadow-xl">
                            <Upload size={36} />
                          </div>
                          <span className="text-gray-400 font-bold text-lg mb-2">Clique para anexar comprovante</span>
                          <span className="text-xs text-gray-600 font-black uppercase tracking-widest">PNG, JPG (Máx 2MB)</span>
                        </div>
                      )}
                   </label>
                </div>
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-6 rounded-[2rem] text-xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-green-600/20 active:scale-95">
                <CheckCircle size={32} /> ENVIAR PARA APROVAÇÃO
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
