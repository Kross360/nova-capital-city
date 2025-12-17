
import { supabase } from './supabase';
import { ShopItem, Rule, NewsPost, PlayerStats, PaymentRequest, ServerConfig, ChatMessage } from '../types';

const STORAGE_KEYS = {
  MY_ORDERS: 'capital_my_orders',
};

export const StorageService = {
  // --- NOTIFICAÇÕES EXTERNAS ---
  sendDiscordNotification: async (webhookUrl: string, payment: any) => {
    if (!webhookUrl) return;

    const embed = {
      title: "🚀 NOVO PEDIDO RECEBIDO!",
      description: `Um novo pedido foi realizado no site e aguarda aprovação.`,
      color: 5814783, // Azul Capital
      fields: [
        { name: "👤 Jogador", value: `**${payment.playerNick}** (ID: ${payment.playerId})`, inline: true },
        { name: "📦 Item", value: payment.itemName, inline: true },
        { name: "💰 Valor", value: `R$ ${payment.itemPrice.toFixed(2)}`, inline: true },
        { name: "💬 Discord", value: payment.discordContact, inline: false },
        { name: "🔗 Rastreamento", value: `[Clique aqui para ver o painel](https://${window.location.host}/#/admin)`, inline: false }
      ],
      footer: { text: "Capital City RP - Sistema de Vendas" },
      timestamp: new Date().toISOString()
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });
    } catch (e) {
      console.error("Erro ao enviar webhook:", e);
    }
  },

  // --- SHOP ---
  getShopItems: async (): Promise<ShopItem[]> => {
    const { data, error } = await supabase.from('shop_items').select('*').order('created_at', { ascending: false });
    if (error) console.error("Erro ao buscar itens da loja:", error);
    return (data || []).map((i: any) => ({
      ...i,
      imageUrl: i.image_url
    }));
  },

  getShopItemById: async (id: string): Promise<ShopItem | undefined> => {
    const { data, error } = await supabase.from('shop_items').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return {
      ...data,
      imageUrl: data.image_url
    };
  },

  addShopItem: async (item: Omit<ShopItem, 'id'>) => {
    const { data, error } = await supabase.from('shop_items').insert([{
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.imageUrl
    }]).select().single();
    if(error) throw error;
    return data;
  },
  
  updateShopItem: async (id: string, item: Partial<ShopItem>) => {
    const { error } = await supabase.from('shop_items').update({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.imageUrl
    }).eq('id', id);
    if(error) throw error;
  },

  deleteShopItem: async (id: string) => {
    console.log("Iniciando exclusão do item:", id);
    const { error } = await supabase.from('shop_items').delete().eq('id', id);
    if (error) {
      console.error("Falha ao deletar item da loja no Supabase:", error);
      throw new Error(error.message);
    }
  },

  // --- RULES ---
  getRules: async (): Promise<Rule[]> => {
    const { data, error } = await supabase.from('rules').select('*').order('created_at', { ascending: true });
    if (error) console.error("Erro ao buscar regras:", error);
    return data || [];
  },
  addRule: async (rule: Omit<Rule, 'id'>) => {
    const { error } = await supabase.from('rules').insert([rule]);
    if(error) throw error;
  },
  updateRule: async (id: string, rule: Partial<Rule>) => {
    const { error } = await supabase.from('rules').update(rule).eq('id', id);
    if(error) throw error;
  },
  deleteRule: async (id: string) => {
    const { error } = await supabase.from('rules').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- NEWS ---
  getNews: async (): Promise<NewsPost[]> => {
    const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (error) console.error("Erro ao buscar notícias:", error);
    return (data || []).map((n: any) => ({
      ...n,
      imageUrl: n.image_url
    }));
  },
  addNews: async (news: Omit<NewsPost, 'id'>) => {
    const { error } = await supabase.from('news').insert([{
      title: news.title,
      summary: news.summary,
      content: news.content,
      author: news.author,
      date: news.date,
      image_url: news.imageUrl
    }]);
    if(error) throw error;
  },
  updateNews: async (id: string, news: Partial<NewsPost>) => {
    const { error } = await supabase.from('news').update({
      title: news.title,
      summary: news.summary,
      content: news.content,
      image_url: news.imageUrl
    }).eq('id', id);
    if(error) throw error;
  },
  deleteNews: async (id: string) => {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // --- PAYMENTS ---
  getPayments: async (): Promise<PaymentRequest[]> => {
    const { data: payments, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) console.error("Erro ao buscar pagamentos:", error);
    if (!payments) return [];

    return payments.map((p: any) => ({
      id: p.id,
      itemId: p.item_id,
      itemName: p.item_name,
      itemPrice: p.item_price,
      playerNick: p.player_nick,
      playerId: p.player_id,
      discordContact: p.discord_contact,
      proofImageUrl: p.proof_image_url,
      status: p.status,
      adminNote: p.admin_note,
      createdAt: new Date(p.created_at).toLocaleString('pt-BR'),
      messages: [] 
    }));
  },

  getPaymentById: async (id: string): Promise<PaymentRequest | undefined> => {
    const { data: p } = await supabase.from('payments').select('*').eq('id', id).single();
    if (!p) return undefined;

    const { data: msgs } = await supabase.from('payment_messages').select('*').eq('payment_id', id).order('created_at', { ascending: true });

    return {
      id: p.id,
      itemId: p.item_id,
      itemName: p.item_name,
      itemPrice: p.item_price,
      playerNick: p.player_nick,
      playerId: p.player_id,
      discordContact: p.discord_contact,
      proofImageUrl: p.proof_image_url,
      status: p.status,
      adminNote: p.admin_note,
      createdAt: new Date(p.created_at).toLocaleString('pt-BR'),
      messages: (msgs || []).map((m: any) => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        timestamp: m.timestamp
      }))
    };
  },

  addPayment: async (payment: Omit<PaymentRequest, 'id' | 'createdAt' | 'messages'>) => {
    const { data, error } = await supabase.from('payments').insert([{
      item_id: payment.itemId,
      item_name: payment.itemName,
      item_price: payment.itemPrice,
      player_nick: payment.playerNick,
      player_id: payment.playerId,
      discord_contact: payment.discord_contact,
      proof_image_url: payment.proofImageUrl,
      status: 'PENDING'
    }]).select().single();
    
    if (error) throw error;
    return data;
  },

  updatePaymentStatus: async (id: string, status: string, note?: string) => {
    const { error } = await supabase.from('payments').update({ status, admin_note: note }).eq('id', id);
    if(error) throw error;
  },

  // --- MY ORDERS ---
  saveMyOrderId: (id: string) => {
    const stored = localStorage.getItem(STORAGE_KEYS.MY_ORDERS);
    let orders: string[] = stored ? JSON.parse(stored) : [];
    if (!orders.includes(id)) {
      orders = [id, ...orders];
      localStorage.setItem(STORAGE_KEYS.MY_ORDERS, JSON.stringify(orders));
    }
  },

  getMyOrders: async (): Promise<PaymentRequest[]> => {
    const stored = localStorage.getItem(STORAGE_KEYS.MY_ORDERS);
    const ids: string[] = stored ? JSON.parse(stored) : [];
    if (ids.length === 0) return [];

    const { data, error } = await supabase.from('payments').select('*').in('id', ids).order('created_at', { ascending: false });
    if (error) console.error("Erro ao buscar meus pedidos:", error);
    
    return (data || []).map((p: any) => ({
      id: p.id,
      itemId: p.item_id,
      itemName: p.item_name,
      itemPrice: p.item_price,
      playerNick: p.player_nick,
      playerId: p.player_id,
      discordContact: p.discord_contact,
      proofImageUrl: p.proof_image_url,
      status: p.status,
      adminNote: p.admin_note,
      createdAt: new Date(p.created_at).toLocaleString('pt-BR'),
      messages: []
    }));
  },

  addOrderMessage: async (paymentId: string, sender: 'ADMIN' | 'PLAYER', content: string) => {
    const { error } = await supabase.from('payment_messages').insert([{
      payment_id: paymentId,
      sender,
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }]);
    if(error) throw error;
  },

  // --- CONFIG ---
  getConfig: async (): Promise<ServerConfig> => {
    try {
      const { data, error } = await supabase.from('server_config').select('*').limit(1).single();
      if (error || !data) throw new Error("No config found");
      
      return {
        pcDownloadUrl: data.pc_download_url || '',
        mobileDownloadUrl: data.mobile_download_url || '',
        discordUrl: data.discord_url || '',
        pixKey: data.pix_key || '',
        pixQrCodeUrl: data.pix_qr_code_url || '',
        homeBackgroundUrl: data.home_background_url || '',
        aboutImageUrl: data.about_image_url || '',
        newsDefaultImageUrl: data.news_default_image_url || '',
        capiCoinPrice: data.capi_coin_price || 1.0,
        discordWebhookUrl: data.discord_webhook_url || ''
      };
    } catch (e) {
      return {
        pcDownloadUrl: '', mobileDownloadUrl: '', discordUrl: '', pixKey: '', pixQrCodeUrl: '',
        homeBackgroundUrl: '', aboutImageUrl: '', newsDefaultImageUrl: '',
        capiCoinPrice: 1.0, discordWebhookUrl: ''
      };
    }
  },
  
  saveConfig: async (config: ServerConfig) => {
    const { data: existingData } = await supabase.from('server_config').select('id').limit(1);
    
    const payload: any = {
      pc_download_url: config.pcDownloadUrl || '',
      mobile_download_url: config.mobileDownloadUrl || '',
      discord_url: config.discordUrl || '',
      pix_key: config.pixKey || '',
      pix_qr_code_url: config.pixQrCodeUrl || '',
      home_background_url: config.homeBackgroundUrl || '',
      about_image_url: config.aboutImageUrl || '',
      // FIX: access property name with camelCase as defined in ServerConfig interface
      news_default_image_url: config.newsDefaultImageUrl || '',
      capi_coin_price: Number(config.capiCoinPrice) || 1.0,
      discord_webhook_url: config.discordWebhookUrl || ''
    };

    if (existingData && existingData.length > 0) {
      const { error } = await supabase.from('server_config').update(payload).eq('id', existingData[0].id);
      if(error) throw error;
    } else {
      const { error } = await supabase.from('server_config').insert([payload]);
      if(error) throw error;
    }
  },

  // --- RANKINGS ---
  getRankings: async (): Promise<PlayerStats[]> => {
     const { data, error } = await supabase.from('rankings').select('*').order('score', { ascending: false }).limit(10);
     if (error) console.error("Erro ao buscar rankings:", error);
     return data || [];
  }
};
