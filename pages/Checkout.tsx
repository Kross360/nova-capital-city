
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
            addToast('Item não localizado.', 'error');
          }
        }
      } catch (e) {
        addToast('Erro ao carregar.', 'error');
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
        addToast("Limite: 2MB.", 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProofImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCoinPurchase && !item) return;
    if (!playerNick || !gameId || !proofImage || !discordContact) {
      addToast("Preencha todos os campos!", 'error');
      return;
    }

    try {
      const orderPayload = {
        itemId: isCoinPurchase ? `coins_${coinQuantity}` : item!.id,
        itemName: isCoinPurchase ? `${coinQuantity} CapiCoins` : item!.name,
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
      if (config.discordWebhookUrl) {
         await StorageService.sendDiscordNotification(config.discordWebhookUrl, orderPayload);
      }
    } catch (error) {
      addToast('Erro ao enviar.', 'error');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-500" /></div>;

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-xs w-full bg-dark-800 rounded-3xl p-8 text-center border border-white/5 shadow-2xl">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500"><CheckCircle size={28} /></div>
          <h2 className="text-xl font-black text-white mb-2 uppercase">Pedido Enviado</h2>
          <p className="text-gray-500 mb-6 text-xs">ID: {createdOrderId.slice(0,8).toUpperCase()}</p>
          <Link to={`/track/${createdOrderId}`} className="block w-full bg-brand-600 text-white font-black py-3 rounded-xl mb-2 text-xs">RASTREAR</Link>
          <Link to="/shop" className="block text-gray-500 text-[10px] uppercase font-black">Voltar à Loja</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 max-w-4xl mx-auto">
      <Link to="/shop" className="text-gray-600 hover:text-white inline-flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest transition-colors">
        <ArrowLeft size={14} /> Voltar
      </Link>
      
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        {/* Lado Esquerdo - Info & PIX */}
        <div className="space-y-6">
           <div className="bg-dark-800 rounded-2xl p-6 border border-white/5 shadow-xl">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-dark-900 rounded-xl flex items-center justify-center">
                  {isCoinPurchase ? <Coins className="text-yellow-500" /> : <img src={item?.imageUrl} className="w-full h-full object-cover rounded-xl" />}
                </div>
                <div>
                   <h3 className="text-white font-black text-lg uppercase tracking-tight">{isCoinPurchase ? 'Pacote Coins' : item?.name}</h3>
                   <p className="text-brand-500 font-black text-xl">R$ {currentTotal.toFixed(2)}</p>
                </div>
             </div>

             {isCoinPurchase && (
               <div className="bg-dark-900/50 p-3 rounded-xl mb-6 flex items-center justify-between">
                  <button onClick={() => setCoinQuantity(Math.max(1, coinQuantity - 10))} className="p-2 text-gray-500 hover:text-white"><Minus size={14}/></button>
                  <span className="text-white font-black">{coinQuantity}x</span>
                  <button onClick={() => setCoinQuantity(coinQuantity + 10)} className="p-2 text-gray-500 hover:text-white"><Plus size={14}/></button>
               </div>
             )}

             <div className="bg-white p-4 rounded-2xl mb-4 flex flex-col items-center gap-3">
                {config.pixQrCodeUrl ? <img src={config.pixQrCodeUrl} className="w-32 h-32" /> : <QrCode size={120} className="text-black" />}
                <div className="w-full">
                   <p className="text-black/40 text-[8px] font-black uppercase text-center mb-1">Chave PIX Copia/Cola</p>
                   <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-between group">
                      <span className="text-[10px] text-black font-mono truncate mr-2">{config.pixKey}</span>
                      <button onClick={() => {navigator.clipboard.writeText(config.pixKey); addToast('Copiado!', 'info');}} className="text-brand-600"><Copy size={14}/></button>
                   </div>
                </div>
             </div>
           </div>
        </div>

        {/* Lado Direito - Formulário */}
        <form onSubmit={handleSubmit} className="bg-dark-800 rounded-2xl p-6 border border-white/5 shadow-xl space-y-4">
           <h4 className="text-white font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
             <CreditCard size={16} className="text-brand-500" /> Dados do Cidadão
           </h4>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[9px] text-gray-500 font-black uppercase ml-1">Nick Roleplay</label>
                 <input type="text" required value={playerNick} onChange={e => setPlayerNick(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-brand-500 outline-none" placeholder="Ex: Jo_Silva" />
              </div>
              <div className="space-y-1">
                 <label className="text-[9px] text-gray-500 font-black uppercase ml-1">ID Único</label>
                 <input type="number" required value={gameId} onChange={e => setGameId(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-brand-500 outline-none" placeholder="ID" />
              </div>
           </div>

           <div className="space-y-1">
              <label className="text-[9px] text-gray-500 font-black uppercase ml-1">Discord Tag</label>
              <input type="text" required value={discordContact} onChange={e => setDiscordContact(e.target.value)} className="w-full bg-dark-900/50 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-brand-500 outline-none" placeholder="usuario#0000" />
           </div>

           <div className="space-y-1">
              <label className="text-[9px] text-gray-500 font-black uppercase ml-1">Anexar Comprovante</label>
              <label className="block border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-brand-500/50 transition-all bg-dark-900/30">
                 <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                 {proofImage ? <img src={proofImage} className="h-16 mx-auto rounded" /> : <div className="flex flex-col items-center text-gray-500"><Upload size={20} className="mb-2" /><span className="text-[10px] font-black uppercase">Selecionar Imagem</span></div>}
              </label>
           </div>

           <button type="submit" className="w-full bg-brand-600 hover:bg-brand-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-brand-600/20 active:scale-95 transition-all">
             Finalizar Pagamento
           </button>
        </form>
      </div>
    </div>
  );
};
