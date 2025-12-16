import { supabase } from './supabase';
import { ShopItem, Rule, NewsPost, PlayerStats, PaymentRequest, ServerConfig, ChatMessage } from '../types';

// Chaves locais apenas para IDs salvos pelo usuário
const STORAGE_KEYS = {
  MY_ORDERS: 'capital_my_orders',
};

export const StorageService = {
  // --- UPLOAD ---
  uploadImage: async (file: File, folder: 'shop' | 'news' | 'proofs'): Promise<string> => {
    // Remove caracteres especiais do nome do arquivo
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${folder}/${Date.now()}_${sanitizedName}`;
    
    try {
      // Upload para o bucket 'images'
      const { error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.warn("Supabase Storage Upload Error:", error.message);
        // Se o erro for que o bucket não existe ou erro de permissão, usamos fallback
        // Em produção, você deve criar o bucket 'images' no painel do Supabase e definir as políticas como 'Public'
        if (folder === 'shop') return `https://picsum.photos/400/300?random=${Date.now()}`;
        if (folder === 'news') return `https://picsum.photos/800/400?random=${Date.now()}`;
        return `https://picsum.photos/500/500?random=${Date.now()}`;
      }

      // Gerar URL Pública
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      return data.publicUrl;

    } catch (err) {
      console.error("Upload Exception:", err);
      // Fallback em caso de erro crítico de rede
      return `https://picsum.photos/400/300?random=${Date.now()}`;
    }
  },

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
    if(error) throw error; // Throw error to be caught by UI
    return data;
  },
  deleteShopItem: async (id: string) => {
    const { error } = await supabase.from('shop_items').delete().eq('id', id);
    if(error) throw error;
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
    const { error } = await supabase.from('rules').insert([rule]);
    if(error) throw error;
  },
  deleteRule: async (id: string) => {
    const { error } = await supabase.from('rules').delete().eq('id', id);
    if(error) throw error;
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
  deleteNews: async (id: string) => {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if(error) throw error;
  },

  // --- PAYMENTS ---
  getPayments: async (): Promise<PaymentRequest[]> => {
    const { data: payments } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (!payments) return [];

    return payments.map((p: any) => ({
      id: p.id,
      itemId: p.item_id,
      itemName: p.item_name,
      itemPrice: p.item_price,
      playerNick: p.player_nick,
      playerId: p.player_id, // Map database column
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
      player_id: payment.playerId, // Save ID to DB
      discord_contact: payment.discordContact,
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
    const { data } = await supabase.from('server_config').select('*').limit(1).single();
    if (!data) return {
       pcDownloadUrl: '', mobileDownloadUrl: '', discordUrl: '', pixKey: '', pixQrCodeUrl: '',
       homeBackgroundUrl: '', aboutImageUrl: '', newsDefaultImageUrl: '',
       capiCoinPrice: 1.0 // Default price
    };
    return {
      pcDownloadUrl: data.pc_download_url,
      mobileDownloadUrl: data.mobile_download_url,
      discordUrl: data.discord_url,
      pixKey: data.pix_key,
      pixQrCodeUrl: data.pix_qr_code_url,
      homeBackgroundUrl: data.home_background_url,
      aboutImageUrl: data.about_image_url,
      newsDefaultImageUrl: data.news_default_image_url,
      capiCoinPrice: data.capi_coin_price || 1.0
    };
  },
  saveConfig: async (config: ServerConfig) => {
    // Check if exists
    const { data } = await supabase.from('server_config').select('id').limit(1);
    if (data && data.length > 0) {
      const { error } = await supabase.from('server_config').update({
         pc_download_url: config.pcDownloadUrl,
         mobile_download_url: config.mobileDownloadUrl,
         discord_url: config.discordUrl,
         pix_key: config.pixKey,
         pix_qr_code_url: config.pixQrCodeUrl,
         home_background_url: config.homeBackgroundUrl,
         about_image_url: config.aboutImageUrl,
         news_default_image_url: config.newsDefaultImageUrl,
         capi_coin_price: config.capiCoinPrice
      }).eq('id', data[0].id);
      if(error) throw error;
    } else {
      const { error } = await supabase.from('server_config').insert([{
         pc_download_url: config.pcDownloadUrl,
         mobile_download_url: config.mobileDownloadUrl,
         discord_url: config.discordUrl,
         pix_key: config.pixKey,
         pix_qr_code_url: config.pixQrCodeUrl,
         home_background_url: config.homeBackgroundUrl,
         about_image_url: config.aboutImageUrl,
         news_default_image_url: config.newsDefaultImageUrl,
         capi_coin_price: config.capiCoinPrice
      }]);
      if(error) throw error;
    }
  },

  // --- RANKINGS ---
  getRankings: async (): Promise<PlayerStats[]> => {
     const { data } = await supabase.from('rankings').select('*').order('score', { ascending: false }).limit(10);
     return data || [];
  }
};