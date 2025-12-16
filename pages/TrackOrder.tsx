import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { PaymentRequest } from '../types';
import { Search, Send, User, Shield, ArrowLeft, Clock, CheckCircle, XCircle, MessageSquare, ChevronRight } from 'lucide-react';
import { useToast } from '../components/ToastSystem';

export const TrackOrder: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchInput, setSearchInput] = useState('');
  const [order, setOrder] = useState<PaymentRequest | undefined>(undefined);
  const [myOrders, setMyOrders] = useState<PaymentRequest[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // Referência para o container de mensagens (não mais para um div dummy no final)
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    if (orderId) {
      setSearchInput(orderId);
      loadOrder(orderId);
    } else {
      // Load "My Orders" if on the index page
      StorageService.getMyOrders().then(setMyOrders);
    }
  }, [orderId]);

  // Polling for new messages/status
  useEffect(() => {
    let interval: number;
    if (order) {
      const currentId = order.id;
      interval = window.setInterval(async () => {
        const updated = await StorageService.getPaymentById(currentId);
        if (updated) {
          // Compare objects to avoid useless re-renders
          setOrder(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(updated)) {
              return updated;
            }
            return prev;
          });
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [order?.id]);

  // Função robusta de Scroll para o fundo
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      // Define o topo do scroll para a altura total menos a altura visível (fundo)
      const maxScrollTop = scrollHeight - clientHeight;
      
      if (maxScrollTop > 0) {
        messagesContainerRef.current.scrollTo({
          top: maxScrollTop,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    }
  };

  // Chat Scroll Logic - Aciona quando novas mensagens chegam
  useEffect(() => {
    if (order?.messages?.length) {
      // Pequeno timeout para garantir que o DOM atualizou com a nova mensagem
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [order?.messages?.length]);

  const loadOrder = async (id: string) => {
    const found = await StorageService.getPaymentById(id);
    if (found) {
      setOrder(found);
      // Força scroll imediato (sem animação) ao abrir o chat
      setTimeout(() => scrollToBottom(false), 100);
    } else {
      setOrder(undefined);
      if (id) addToast("Pedido não encontrado.", 'error');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/track/${searchInput}`);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !order) return;

    await StorageService.addOrderMessage(order.id, 'PLAYER', messageInput);
    // Force immediate update
    const updated = await StorageService.getPaymentById(order.id);
    setOrder(updated);
    setMessageInput('');
    // Força scroll ao enviar
    setTimeout(() => scrollToBottom(true), 50);
  };

  return (
    <div className="py-12 px-4 max-w-5xl mx-auto min-h-[80vh]">
      
      {!order ? (
        // VIEW: TRACKING HOME (Search + List)
        <div className="animate-fade-in">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Central de Pedidos</h1>
            <p className="text-gray-400">Acompanhe suas compras e fale com o suporte.</p>
          </div>

          <div className="max-w-xl mx-auto mb-16">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                placeholder="Pesquisar por ID do pedido..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-dark-800 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-brand-500 text-lg shadow-lg"
              />
              <button type="submit" className="absolute right-2 top-2 bottom-2 bg-brand-600 hover:bg-brand-500 text-white p-3 rounded-lg transition-colors">
                <Search size={24} />
              </button>
            </form>
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="text-brand-400" /> Meus Pedidos Recentes
            </h2>
            
            {myOrders.length === 0 ? (
              <div className="text-center py-10 bg-dark-800 rounded-xl border border-white/5 border-dashed">
                <p className="text-gray-500">Nenhum pedido encontrado neste dispositivo.</p>
                <Link to="/shop" className="text-brand-400 font-bold mt-2 inline-block hover:underline">Ir para a Loja</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map(myOrder => (
                  <Link 
                    key={myOrder.id} 
                    to={`/track/${myOrder.id}`}
                    className="block bg-dark-800 hover:bg-dark-700 border border-white/5 rounded-xl p-4 transition-all hover:translate-x-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                           myOrder.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                           myOrder.status === 'APPROVED' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                         }`}>
                            {myOrder.status === 'PENDING' ? <Clock size={20} /> : 
                             myOrder.status === 'APPROVED' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                         </div>
                         <div>
                           <h3 className="font-bold text-white group-hover:text-brand-400 transition-colors">{myOrder.itemName}</h3>
                           <p className="text-sm text-gray-500">{myOrder.createdAt} • ID: {myOrder.id.slice(0, 8)}...</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-white">R$ {myOrder.itemPrice.toFixed(2)}</span>
                        <ChevronRight className="text-gray-600 group-hover:text-white" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // VIEW: ORDER DETAIL & CHAT
        <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Left Column: Status & Info */}
          <div className="lg:col-span-1 space-y-6">
             <button onClick={() => { setOrder(undefined); navigate('/track'); }} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
               <ArrowLeft size={16} /> Voltar para lista
             </button>

             <div className="bg-dark-800 rounded-xl p-6 border border-white/5 shadow-xl">
               <h2 className="text-xl font-bold text-white mb-4">Status do Pedido</h2>
               
               <div className={`p-4 rounded-lg flex items-center gap-3 mb-6 ${
                 order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                 order.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                 'bg-red-500/10 text-red-500 border border-red-500/20'
               }`}>
                 {order.status === 'PENDING' && <Clock size={24} />}
                 {order.status === 'APPROVED' && <CheckCircle size={24} />}
                 {order.status === 'REJECTED' && <XCircle size={24} />}
                 <div>
                   <span className="block font-bold uppercase">{order.status === 'PENDING' ? 'Em Análise' : order.status === 'APPROVED' ? 'Aprovado' : 'Recusado'}</span>
                   <span className="text-xs opacity-75">Atualizado em tempo real</span>
                 </div>
               </div>

               <div className="space-y-3 text-sm text-gray-300">
                 <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-gray-500">Item:</span>
                   <span className="font-medium text-white">{order.itemName}</span>
                 </div>
                 <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-gray-500">Valor:</span>
                   <span className="font-medium text-white">R$ {order.itemPrice.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between border-b border-white/5 pb-2">
                   <span className="text-gray-500">Nick:</span>
                   <span className="font-medium text-white">{order.playerNick}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-500">Data:</span>
                   <span className="font-medium text-white">{order.createdAt}</span>
                 </div>
               </div>
             </div>
          </div>

          {/* Right Column: Chat */}
          <div className="lg:col-span-2 h-[600px]">
            <div className="bg-dark-800 rounded-xl border border-white/5 h-full flex flex-col overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/5 bg-dark-900/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-brand-400" />
                  <div>
                    <h3 className="font-bold text-white">Chat com Suporte</h3>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  ID: <span className="font-mono text-gray-300">{order.id}</span>
                </div>
              </div>

              {/* Messages Area - FIXED LAYOUT */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-4 bg-dark-900/30 min-h-0"
              >
                {(!order.messages || order.messages.length === 0) && (
                   <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                     <MessageSquare size={40} className="mb-2 opacity-20"/>
                     <p>Nenhuma mensagem ainda.</p>
                     <p className="text-sm">Envie uma mensagem abaixo para falar com um admin.</p>
                   </div>
                )}
                
                {order.messages?.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'PLAYER' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                      msg.sender === 'PLAYER' 
                        ? 'bg-brand-600 text-white rounded-tr-none' 
                        : 'bg-dark-700 text-gray-200 rounded-tl-none border border-white/10'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold opacity-75 flex items-center gap-1">
                          {msg.sender === 'PLAYER' ? <User size={10}/> : <Shield size={10}/>}
                          {msg.sender === 'PLAYER' ? 'Você' : 'Administração'}
                        </span>
                        <span className="text-[10px] opacity-50">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 bg-dark-800 border-t border-white/5 shrink-0">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Digite sua mensagem..." 
                    className="flex-grow bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-500 transition-colors"
                  />
                  <button 
                    type="submit" 
                    disabled={!messageInput.trim()}
                    className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors shadow-lg shadow-brand-600/20"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};