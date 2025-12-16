import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { ShopItem, ServerConfig } from '../types';
import { QrCode, Upload, CheckCircle, ArrowLeft, CreditCard, Copy, MessageSquare, Coins, Calculator, Minus, Plus } from 'lucide-react';
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

  // Dynamic Coins Logic
  const isCoinPurchase = itemId === 'capicoins';
  const [coinQuantity, setCoinQuantity] = useState(100);

  useEffect(() => {
    StorageService.getConfig().then(setConfig);
    
    // Autofill from Profile
    if (profile) {
      setPlayerNick(profile.rp_nick);
      setDiscordContact(profile.discord);
      if (profile.game_id) setGameId(profile.game_id.toString());
    }

    if (itemId) {
      if (itemId === 'capicoins') {
         // Create a virtual item for Coins
         // We will update price dynamically
      } else {
        StorageService.getShopItemById(itemId).then((foundItem) => {
           if (foundItem) {
              setItem(foundItem);
           } else {
              navigate('/shop');
              addToast('Item não encontrado.', 'error');
           }
        });
      }
    }
  }, [itemId, navigate, addToast, profile]);

  // Calculate dynamic price
  const currentTotal = isCoinPurchase 
    ? coinQuantity * (config.capiCoinPrice || 1) 
    : (item?.price || 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit
        addToast("A imagem é muito grande! Máximo 1MB.", 'error');
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

  const handleCopyPix = () => {
    if (config.pixKey) {
      navigator.clipboard.writeText(config.pixKey);
      addToast("Chave Pix copiada!", 'success');
    } else {
      addToast("Chave Pix não configurada.", 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check item data
    if (!isCoinPurchase && !item) return;
    
    if (!playerNick || !gameId || !proofImage || !discordContact) {
      addToast("Por favor, preencha todos os campos e envie o comprovante.", 'error');
      return;
    }

    const finalItemName = isCoinPurchase ? `${coinQuantity}x CapiCoins` : item!.name;
    const finalItemId = isCoinPurchase ? `coins_${coinQuantity}_${Date.now()}` : item!.id;
    const finalPrice = currentTotal;

    try {
      const data = await StorageService.addPayment({
        itemId: finalItemId,
        itemName: finalItemName,
        itemPrice: finalPrice,
        playerNick,
        playerId: parseInt(gameId),
        discordContact,
        proofImageUrl: proofImage,
        status: 'PENDING'
      });
      
      const newId = data.id;
      StorageService.saveMyOrderId(newId); // Salva no histórico local do usuário
      setCreatedOrderId(newId);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error(error);
      addToast('Erro ao processar pedido. Tente novamente.', 'error');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-in">
        <div className="max-w-md w-full bg-dark-800 border border-brand-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-brand-600"></div>
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Pagamento Enviado!</h2>
          <p className="text-gray-300 mb-6">
            Recebemos seu comprovante. Seu pedido foi salvo no histórico deste dispositivo.
          </p>
          
          <div className="bg-dark-900 rounded-lg p-4 mb-6 border border-white/5 relative group">
             <p className="text-xs text-gray-500 uppercase mb-1">ID do Pedido</p>
             <p className="text-xl font-mono text-white font-bold tracking-wider">{createdOrderId}</p>
             <button 
                onClick={() => { navigator.clipboard.writeText(createdOrderId); addToast('ID Copiado!', 'success'); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-white"
             >
               <Copy size={20} />
             </button>
          </div>

          <div className="space-y-3">
             <Link 
              to={`/track/${createdOrderId}`}
              className="block w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
             >
               <MessageSquare size={18} />
               Chat com Admin / Rastrear
             </Link>

             <Link to="/shop" className="block w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-colors">
               Voltar para Loja
             </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state if not coins and no item yet
  if (!isCoinPurchase && !item) return <div className="p-20 text-center text-white">Carregando item...</div>;

  return (
    <div className="py-12 px-4 max-w-4xl mx-auto">
      <Link to="/shop" className="text-gray-400 hover:text-white flex items-center gap-2 mb-8 transition-colors">
        <ArrowLeft size={20} /> Voltar para Loja
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Coluna da Esquerda: Resumo do Item */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-dark-800 rounded-xl p-6 border border-white/5 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Resumo do Pedido</h3>
            
            {/* ITEM IMAGE / ICON */}
            <div className="mb-4 rounded-lg overflow-hidden h-32 bg-dark-900 flex items-center justify-center border border-white/5 relative">
              {isCoinPurchase ? (
                 <>
                   <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div>
                   <Coins size={64} className="text-yellow-400 drop-shadow-lg" />
                 </>
              ) : (
                <img src={item!.imageUrl} alt={item!.name} className="w-full h-full object-cover" />
              )}
            </div>

            <h4 className="font-bold text-white text-xl mb-1">{isCoinPurchase ? 'Pacote CapiCoins' : item!.name}</h4>
            
            <span className={`inline-block text-xs px-2 py-1 rounded border mb-4 ${
              isCoinPurchase 
                ? 'bg-yellow-900/50 text-yellow-300 border-yellow-500/20' 
                : 'bg-brand-900/50 text-brand-300 border-brand-500/20'
            }`}>
              {isCoinPurchase ? 'MOEDA PREMIUM' : item!.category}
            </span>

            {/* DYNAMIC CALCULATOR FOR COINS */}
            {isCoinPurchase && (
               <div className="mb-6 bg-dark-900 p-3 rounded-lg border border-yellow-500/20">
                  <label className="block text-gray-400 text-xs mb-2 text-center">Quantidade de Coins</label>
                  <div className="flex items-center justify-between gap-2">
                     <button onClick={() => setCoinQuantity(Math.max(1, coinQuantity - 10))} className="p-1 text-gray-400 hover:text-white bg-white/5 rounded"><Minus size={16}/></button>
                     <input 
                      type="number" 
                      min="1"
                      value={coinQuantity} 
                      onChange={e => setCoinQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 bg-transparent text-center text-white font-bold focus:outline-none"
                     />
                     <button onClick={() => setCoinQuantity(coinQuantity + 10)} className="p-1 text-gray-400 hover:text-white bg-white/5 rounded"><Plus size={16}/></button>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-2">
                     1 Coin = R$ {config.capiCoinPrice?.toFixed(2)}
                  </div>
               </div>
            )}

            <div className="flex justify-between items-center text-gray-300 mb-2 pt-2 border-t border-white/5">
              <span>Total a Pagar:</span>
              <span className="text-white font-bold text-2xl">R$ {currentTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Pagamento e Formulário */}
        <div className="md:col-span-2">
          <div className="bg-dark-800 rounded-xl p-8 border border-white/5">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CreditCard className="text-brand-500" />
              Finalizar Pagamento
            </h1>

            {/* Área do PIX */}
            <div className="bg-gradient-to-br from-dark-900 to-dark-800 p-6 rounded-xl border border-brand-500/30 mb-8 flex flex-col sm:flex-row items-center gap-6">
               <div className="bg-white p-2 rounded-lg shrink-0">
                 {config.pixQrCodeUrl ? (
                   <img src={config.pixQrCodeUrl} alt="QR Code Pix" className="w-24 h-24 object-contain" />
                 ) : (
                   <QrCode size={100} className="text-black" />
                 )}
               </div>
               <div className="flex-grow w-full overflow-hidden">
                 <h3 className="text-white font-bold mb-1">Pagamento via PIX</h3>
                 <p className="text-gray-400 text-sm mb-4">Escaneie o QR Code ou use o Copia e Cola.</p>
                 
                 <div className="relative">
                   <input 
                    type="text" 
                    readOnly 
                    value={config.pixKey}
                    className="w-full bg-dark-950 border border-dark-700 rounded p-3 text-gray-500 font-mono text-sm pr-12 text-ellipsis"
                   />
                   <button 
                    onClick={handleCopyPix}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-400 hover:text-white p-1"
                    title="Copiar Chave"
                   >
                     <Copy size={18} />
                   </button>
                 </div>
               </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Seu Nick no Jogo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Player_Name"
                    value={playerNick}
                    onChange={(e) => setPlayerNick(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">ID no Jogo *</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 123"
                    value={gameId}
                    onChange={(e) => setGameId(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm font-medium mb-2">Discord para Contato *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: usuario#1234"
                    value={discordContact}
                    onChange={(e) => setDiscordContact(e.target.value)}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg p-3 text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Comprovante de Pagamento *</label>
                <div className="border-2 border-dashed border-dark-600 hover:border-brand-500 rounded-xl p-8 transition-colors text-center bg-dark-900/50">
                   <input 
                    type="file" 
                    id="proof" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                   />
                   <label htmlFor="proof" className="cursor-pointer flex flex-col items-center justify-center">
                      {proofImage ? (
                        <div className="relative group">
                          <img src={proofImage} alt="Comprovante" className="h-48 rounded-lg object-contain shadow-lg" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                            <span className="text-white font-medium">Trocar Imagem</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload size={32} className="text-gray-500 mb-3" />
                          <span className="text-brand-400 font-medium">Clique para enviar a foto</span>
                          <span className="text-gray-600 text-sm mt-1">PNG, JPG ou JPEG (Max 1MB)</span>
                        </>
                      )}
                   </label>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-green-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={24} />
                  CONFIRMAR PAGAMENTO
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};