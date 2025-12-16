import { supabase } from './supabase';
import { ShopItem, Rule, NewsPost, PlayerStats, PaymentRequest, ServerConfig, ChatMessage } from '../types';

// Chaves locais apenas para IDs salvos pelo usuário
const STORAGE_KEYS = {
  MY_ORDERS: 'capital_my_orders',
};

export const StorageService = {
  // --- SHOP ---
  getShopItems: async (): Promise<ShopItem[]> => {
    const { data } = await supabase.from('shop_items').select('*').order('created_at', { ascending: false });
    return (data || []).map((i: any) => ({
      ...i,
      imageUrl: i.image_url // Map snake_case to camelCase
    }));
  },
  addShopItem: async (item: Omit<ShopItem, 'id'>) => {
    const { data, error } = await supabase.from('shop_items').insert([{
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.imageUrl
    }]).select().single();
    if(error) console.error(error);
    return data;
  },
  deleteShopItem: async (id: string) => {
    await supabase.from('shop_items').delete().eq('id', id);
  },
  getShopItemById: async (id: string): Promise<ShopItem | undefined> => {
    const { data } = await supabase.from('shop_items').select('*').eq('id', id).single();
    if (!data) return undefined;
    return { ...data, imageUrl: data.image_url };
  },

  // --- RULES ---
  getRules: async (): Promise<Rule[]> => {
    const { data } = await supabase.from('rules').select('*').order('created_at', { ascending: true });
    return data || [];
  },
  addRule: async (rule: Omit<Rule, 'id'>) => {
    await supabase.from('rules').insert([rule]);
  },
  deleteRule: async (id: string) => {
    await supabase.from('rules').delete().eq('id', id);
  },

  // --- NEWS ---
  getNews: async (): Promise<NewsPost[]> => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    return (data || []).map((n: any) => ({
      ...n,
      imageUrl: n.image_url
    }));
  },
  addNews: async (news: Omit<NewsPost, 'id'>) => {
    await supabase.from('news').insert([{
      title: news.title,
      summary: news.summary,
      content: news.content,
      author: news.author,
      date: news.date,
      image_url: news.imageUrl
    }]);
  },
  deleteNews: async (id: string) => {
    await supabase.from('news').delete().eq('id', id);
  },

  // --- PAYMENTS ---
  getPayments: async (): Promise<PaymentRequest[]> => {
    const { data: payments } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (!payments) return [];

    // Fetch messages for these payments (simplification: fetching all recent messages or on demand in detail view)
    // For the list view, we just map basic info. Detail view will fetch messages.
    return payments.map((p: any) => ({
      id: p.id,
      itemId: p.item_id,
      itemName: p.item_name,
      itemPrice: p.item_price,
      playerNick: p.player_nick,
      discordContact: p.discord_contact,
      proofImageUrl: p.proof_image_url,
      status: p.status,
      adminNote: p.admin_note,
      createdAt: new Date(p.created_at).toLocaleString('pt-BR'),
      messages: [] // Loaded separately usually
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
      discord_contact: payment.discordContact,
      proof_image_url: payment.proofImageUrl,
      status: 'PENDING'
    }]).select().single();
    
    if (error) throw error;
    return data;
  },

  updatePaymentStatus: async (id: string, status: string, note?: string) => {
    await supabase.from('payments').update({ status, admin_note: note }).eq('id', id);
  },

  // --- MY ORDERS (Local ID Storage + Remote Fetch) ---
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

    const { data } = await supabase.from('payments').select('*').in('id', ids).order('created_at', { ascending: false });
    
    return (data || []).map((p: any) => ({
      id: p.id,
      itemId: p.item_id,
      itemName: p.item_name,
      itemPrice: p.item_price,
      playerNick: p.player_nick,
      discordContact: p.discord_contact,
      proofImageUrl: p.proof_image_url,
      status: p.status,
      adminNote: p.admin_note,
      createdAt: new Date(p.created_at).toLocaleString('pt-BR'),
      messages: []
    }));
  },

  addOrderMessage: async (paymentId: string, sender: 'ADMIN' | 'PLAYER', content: string) => {
    await supabase.from('payment_messages').insert([{
      payment_id: paymentId,
      sender,
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }]);
  },

  // --- CONFIG ---
  getConfig: async (): Promise<ServerConfig> => {
    const { data } = await supabase.from('server_config').select('*').limit(1).single();
    if (!data) return {
       pcDownloadUrl: '', mobileDownloadUrl: '', discordUrl: '', pixKey: '', pixQrCodeUrl: '',
       homeBackgroundUrl: '', aboutImageUrl: '', newsDefaultImageUrl: ''
    };
    return {
      pcDownloadUrl: data.pc_download_url,
      mobileDownloadUrl: data.mobile_download_url,
      discordUrl: data.discord_url,
      pixKey: data.pix_key,
      pixQrCodeUrl: data.pix_qr_code_url,
      homeBackgroundUrl: data.home_background_url,
      aboutImageUrl: data.about_image_url,
      newsDefaultImageUrl: data.news_default_image_url
    };
  },
  saveConfig: async (config: ServerConfig) => {
    // Check if exists
    const { data } = await supabase.from('server_config').select('id').limit(1);
    if (data && data.length > 0) {
      await supabase.from('server_config').update({
         pc_download_url: config.pcDownloadUrl,
         mobile_download_url: config.mobileDownloadUrl,
         discord_url: config.discordUrl,
         pix_key: config.pixKey,
         pix_qr_code_url: config.pixQrCodeUrl,
         home_background_url: config.homeBackgroundUrl,
         about_image_url: config.aboutImageUrl,
         news_default_image_url: config.newsDefaultImageUrl
      }).eq('id', data[0].id);
    } else {
      await supabase.from('server_config').insert([{
         pc_download_url: config.pcDownloadUrl,
         mobile_download_url: config.mobileDownloadUrl,
         discord_url: config.discordUrl,
         pix_key: config.pixKey,
         pix_qr_code_url: config.pixQrCodeUrl,
         home_background_url: config.homeBackgroundUrl,
         about_image_url: config.aboutImageUrl,
         news_default_image_url: config.newsDefaultImageUrl
      }]);
    }
  },

  // --- RANKINGS ---
  getRankings: async (): Promise<PlayerStats[]> => {
     const { data } = await supabase.from('rankings').select('*').order('score', { ascending: false }).limit(10);
     return data || [];
  }
};