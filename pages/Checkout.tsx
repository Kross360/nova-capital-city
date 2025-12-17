import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { ShopItem, ServerConfig } from '../types';
import { QrCode, Upload, CheckCircle, ArrowLeft, CreditCard, Copy, MessageSquare, Coins, Minus, Plus } from 'lucide-react';
import { useToast } from '../components/ToastSystem';
import { useAuth } from '../contexts/AuthContext';

export const Checkout: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { profile } = useAuth();
  
  const [item, setItem] = useState<ShopItem | undefined>(undefined);
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
    StorageService.getConfig().then(setConfig);
    if (profile) {
      setPlayerNick(profile.rp_nick);
      setDiscordContact(profile.discord);
      if (profile.game_id) setGameId(profile.game_id.toString());
    }
    if (itemId && itemId !== 'capicoins') {
      StorageService.getShopItemById(itemId).then((foundItem) => {
         if (foundItem) setItem(foundItem);
         else { navigate('/shop'); addToast('Item não encontrado.', 'error'); }
      });
    }
  }, [itemId, navigate, addToast, profile]);

  const currentTotal = isCoinPurchase 
    ? coinQuantity * (config.capiCoinPrice || 1) 
    : (item?.price || 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        addToast("A imagem é muito grande! Máximo 2MB.", 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
        addToast("Imagem carregada com sucesso.", 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCoinPurchase && !item) return;
    if (!playerNick || !gameId || !proofImage || !discordContact) {
      addToast("Por favor, preencha todos os campos e envie o comprovante.", 'error');
      return;
    }

    const finalItemName = isCoinPurchase ? `${coinQuantity}x CapiCoins` : item!.name;
    const finalItemId = isCoinPurchase ? `coins_${coinQuantity}_${Date.now()}` : item!.id;
    const finalPrice = currentTotal;

    try {
      const orderPayload = {
        itemId: finalItemId,
        itemName: finalItemName,
        itemPrice: finalPrice,
        playerNick,
        playerId: parseInt(gameId),
        discordContact,
        proofImageUrl: proofImage,
        status: 'PENDING' as any
      };

      const data = await StorageService.addPayment(orderPayload);
      
      const newId = data.id;
      StorageService.saveMyOrderId(newId);
      setCreatedOrderId(newId);
      setSubmitted(true);
      window.scrollTo(0, 0);

      // DISPARAR NOTIFICAÇÃO NO CELULAR DO ADMIN VIA WEBHOOK
      if (config.discordWebhookUrl) {
         await StorageService.sendDiscordNotification(config.discordWebhookUrl, orderPayload);
      }

    } catch (error) {
      console.error(error);
      addToast('Erro ao processar pedido. Tente novamente.', 'error');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="max-w-md w-full bg-dark-800 border border-brand-500/30 rounded-2xl p-8 text-center shadow-2xl relative">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Pagamento Enviado!</h2>
          <p className="text-gray-300 mb-6">Recebemos seu comprovante. Um administrador foi notificado.</p>
          <div className="bg-dark-900 rounded-lg p-4 mb-6 border border-white/5 relative">
             <p className="text-xs text-gray-500 uppercase mb-1">ID do Pedido</p>
             <p className="text-xl font-mono text-white font-bold tracking-wider">{createdOrderId}</p>
             <button onClick={() => { navigator.clipboard.writeText(createdOrderId); addToast('ID Copiado!', 'success'); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400"><Copy size={20} /></button>
          </div>
          <div className="space-y-3">
             <Link to={`/track/${createdOrderId}`} className="block w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"><MessageSquare size={18} /> Chat com Admin</Link>
             <Link to="/shop" className="block w-full bg-white/10 text-white font-bold py-3 rounded-lg">Voltar para Loja</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isCoinPurchase && !item) return <div className="p-20 text-center text-white">Carregando...</div>;

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto">
      <Link to="/shop" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors"><ArrowLeft size={20} /> Voltar</Link>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-dark-800 rounded-xl p-6 border border-white/5 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Resumo</h3>
            <div className="mb-4 rounded-lg overflow-hidden h-32 bg-dark-900 flex items-center justify-center border border-white/5 relative">
              {isCoinPurchase ? <Coins size={64} className="text-yellow-400" /> : <img src={item!.imageUrl} alt={item!.name} className="w-full h-full object-cover" />}
            </div>
            <h4 className="font-bold text-white text-xl mb-1">{isCoinPurchase ? 'Pacote CapiCoins' : item!.name}</h4>
            {isCoinPurchase && (
               <div className="mb-6 bg-dark-900 p-3 rounded-lg border border-yellow-500/20">
                  <label className="block text-gray-400 text-xs mb-2 text-center">Quantidade</label>
                  <div className="flex items-center justify-between gap-2">
                     <button onClick={() => setCoinQuantity(Math.max(1, coinQuantity - 10))} className="p-1 text-gray-400 hover:text-white bg-white/5 rounded"><Minus size={16}/></button>
                     <input type="number" min="1" value={coinQuantity} onChange={e => setCoinQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 bg-transparent text-center text-white font-bold focus:outline-none" />
                     <button onClick={() => setCoinQuantity(coinQuantity + 10)} className="p-1 text-gray-400 hover:text-white bg-white/5 rounded"><Plus size={16}/></button>
                  </div>
               </div>
            )}
            <div className="flex justify-between items-center text-gray-300 mb-2 pt-2 border-t border-white/5">
              <span>Total:</span>
              <span className="text-white font-bold text-2xl">R$ {currentTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-dark-800 rounded-xl p-8 border border-white/5">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3"><CreditCard className="text-brand-500" /> Checkout</h1>
            <div className="bg-gradient-to-br from-dark-900 to-dark-800 p-6 rounded-xl border border-brand-500/30 mb-8 flex flex-col sm:flex-row items-center gap-6">
               <div className="bg-white p-2 rounded-lg shrink-0">
                 {config.pixQrCodeUrl ? <img src={config.pixQrCodeUrl} alt="QR Code" className="w-24 h-24 object-contain" /> : <QrCode size={100} className="text-black" />}
               </div>
               <div className="flex-grow w-full overflow-hidden">
                 <h3 className="text-white font-bold mb-1">Pagamento via PIX</h3>
                 <div className="relative mt-4">
                   <input type="text" readOnly value={config.pixKey} className="w-full bg-dark-950 border border-dark-700 rounded p-3 text-gray-500 font-mono text-sm pr-12 text-ellipsis" />
                   <button onClick={() => { navigator.clipboard.writeText(config.pixKey); addToast("Chave copiada!", "success"); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-400"><Copy size={18} /></button>
                 </div>
               </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" required placeholder="Nick no Jogo" value={playerNick} onChange={(e) => setPlayerNick(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none" />
                <input type="number" required placeholder="ID no Jogo" value={gameId} onChange={(e) => setGameId(e.target.value)} className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none" />
                <input type="text" required placeholder="Discord (Ex: user#1234)" className="md:col-span-2 w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none" value={discordContact} onChange={(e) => setDiscordContact(e.target.value)} />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Comprovante</label>
                <div className="border-2 border-dashed border-dark-600 hover:border-brand-500 rounded-xl p-8 text-center bg-dark-900/50">
                   <input type="file" id="proof" accept="image/*" onChange={handleImageUpload} className="hidden" />
                   <label htmlFor="proof" className="cursor-pointer flex flex-col items-center justify-center">
                      {proofImage ? <img src={proofImage} alt="Preview" className="h-48 rounded-lg object-contain" /> : (
                        <><Upload size={32} className="text-gray-500 mb-3" /><span className="text-brand-400 font-medium">Clique para enviar a foto</span></>
                      )}
                   </label>
                </div>
              </div>
              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-1">
                <CheckCircle size={24} /> CONFIRMAR PAGAMENTO
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};