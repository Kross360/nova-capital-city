
import { supabase } from './supabase';
import { ShopItem, Rule, NewsPost, PlayerStats, PaymentRequest, ServerConfig, ChatMessage } from '../types';

export const StorageService = {
  // --- NOTIFICAÇÕES EXTERNAS ---
  sendDiscordNotification: async (webhookUrl: string, payment: any) => {
    if (!webhookUrl) return;

    const embed = {
      title: "🚀 NOVO PEDIDO RECEBIDO!",
      description: `Um novo pedido foi realizado no site e aguarda aprovação.`,
      color: 38511, // Azul Capital
      fields: [
        { name: "👤 Jogador", value: `**${payment.playerNick}** (ID: ${payment.playerId})`, inline: true },
        { name: "📦 Item", value: payment.itemName, inline: true },
        { name: "💰 Valor", value: `R$ ${payment.itemPrice.toFixed(2)}`, inline: true },
        { name: "💬 Discord", value: payment.discordContact, inline: false }
      ],
      footer: { text: "Capital City RP - Gestão de Vendas" },
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

  sendDiscordStatusUpdate: async (webhookUrl: string, payment: PaymentRequest, newStatus: string) => {
    if (!webhookUrl) return;

    const isApproved = newStatus === 'APPROVED';
    const embed = {
      title: isApproved ? "✅ PEDIDO APROVADO!" : "❌ PEDIDO RECUSADO",
      description: `O status do pedido **${payment.id.slice(0, 8).toUpperCase()}** foi atualizado.`,
      color: isApproved ? 3066993 : 15158332, // Verde ou Vermelho
      fields: [
        { name: "👤 Jogador", value: payment.playerNick, inline: true },
        { name: "📦 Item", value: payment.itemName, inline: true },
        { name: "📊 Novo Status", value: isApproved ? "ENTREGAR ITEM" : "REJEITADO", inline: false }
      ],
      footer: { text: "Capital City RP - Sistema de Auditoria" },
      timestamp: new Date().toISOString()
    };

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });
    } catch (e) {
      console.error("Erro ao enviar webhook de status:", e);
    }
  },

  // --- SHOP ---
  getShopItems: async (): Promise<ShopItem[]> => {
    const { data, error } = await supabase.from('shop_items').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map((i: any) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      price: i.price,
      category: i.category,
      imageUrl: i.image_url
    }));
  },

  getShopItemById: async (id: string): Promise<ShopItem | undefined> => {
    const { data, error } = await supabase.from('shop_items').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.image_url
    };
  },

  addShopItem: async (item: Omit<ShopItem, 'id'>) => {
    const { error } = await supabase.from('shop_items').insert([{
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.imageUrl
    }]);
    if(error) throw error;
  },
  
  updateShopItemFixed: async (id: string, item: Partial<ShopItem>) => {
    const payload: any = {};
    if (item.name !== undefined) payload.name = item.name;
    if (item.description !== undefined) payload.description = item.description;
    if (item.price !== undefined) payload.price = item.price;
    if (item.category !== undefined) payload.category = item.category;
    if (item.imageUrl !== undefined) payload.image_url = item.imageUrl;

    const { error } = await supabase.from('shop_items').update(payload).eq('id', id);
    if(error) throw error;
  },

  deleteShopItem: async (id: string) => {
    const { error } = await supabase.from('shop_items').delete().eq('id', id);
    if (error) throw error;
  },

  // --- RULES ---
  getRules: async (): Promise<Rule[]> => {
    const { data, error } = await supabase.from('rules').select('*').order('created_at', { ascending: true });
    return data || [];
  },
  addRule: async (rule: Omit<Rule, 'id'>) => {
    const { error } = await supabase.from('rules').insert([{
      title: rule.title,
      content: rule.content,
      category: rule.category
    }]);
    if(error) throw error;
  },
  updateRule: async (id: string, rule: Partial<Rule>) => {
    const payload: any = {};
    if (rule.title !== undefined) payload.title = rule.title;
    if (rule.content !== undefined) payload.content = rule.content;
    if (rule.category !== undefined) payload.category = rule.category;

    const { error } = await supabase.from('rules').update(payload).eq('id', id);
    if(error) throw error;
  },
  deleteRule: async (id: string) => {
    const { error } = await supabase.from('rules').delete().eq('id', id);
    if (error) throw error;
  },

  // --- NEWS ---
  getNews: async (): Promise<NewsPost[]> => {
    const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map((n: any) => ({
      id: n.id,
      title: n.title,
      summary: n.summary,
      content: n.content,
      author: n.author,
      date: n.date,
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
    const payload: any = {};
    if (news.title !== undefined) payload.title = news.title;
    if (news.summary !== undefined) payload.summary = news.summary;
    if (news.content !== undefined) payload.content = news.content;
    if (news.imageUrl !== undefined) payload.image_url = news.imageUrl;

    const { error } = await supabase.from('news').update(payload).eq('id', id);
    if(error) throw error;
  },
  deleteNews: async (id: string) => {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) throw error;
  },

  // --- PAYMENTS ---
  getPayments: async (): Promise<PaymentRequest[]> => {
    const { data: payments, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return (payments || []).map((p: any) => ({
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

  addOrderMessage: async (paymentId: string, sender: 'ADMIN' | 'PLAYER', content: string) => {
    const { error } = await supabase.from('payment_messages').insert([{
      payment_id: paymentId,
      sender,
      content,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }]);
    if(error) throw error;
  },

  saveMyOrderId: (id: string) => {
    const stored = localStorage.getItem('capital_my_orders');
    let orders: string[] = stored ? JSON.parse(stored) : [];
    if (!orders.includes(id)) {
      orders = [id, ...orders];
      localStorage.setItem('capital_my_orders', JSON.stringify(orders));
    }
  },

  getMyOrders: async (): Promise<PaymentRequest[]> => {
    const stored = localStorage.getItem('capital_my_orders');
    const ids: string[] = stored ? JSON.parse(stored) : [];
    if (ids.length === 0) return [];

    const { data, error } = await supabase.from('payments').select('*').in('id', ids).order('created_at', { ascending: false });
    if (error) return [];
    
    return (data || []).map((p: any) => ({
      id: p.id,
      itemId: p.item_id,
      itemName: p.item_name,
      itemPrice: p.item_price,
      playerNick: p.player_nick,
      playerId: p.player_id,
      discordContact: p.discord_contact,
      proof_image_url: p.proof_image_url,
      status: p.status,
      adminNote: p.admin_note,
      createdAt: new Date(p.created_at).toLocaleString('pt-BR'),
      messages: []
    }));
  },

  // --- CONFIG ---
  getConfig: async (): Promise<ServerConfig> => {
    try {
      const { data, error } = await supabase.from('server_config').select('*').limit(1).maybeSingle();
      if (error) throw error;
      if (!data) return {
        serverIp: '', pcDownloadUrl: '', mobileDownloadUrl: '', discordUrl: '', pixKey: '', pixQrCodeUrl: '',
        homeBackgroundUrl: '', aboutImageUrl: '', newsDefaultImageUrl: '',
        capiCoinPrice: 1.0, discordWebhookUrl: ''
      };
      
      return {
        id: data.id,
        serverIp: data.server_ip || '',
        pcDownloadUrl: data.pc_download_url || '',
        mobileDownloadUrl: data.mobile_download_url || '',
        discordUrl: data.discord_url || '',
        pixKey: data.pix_key || '',
        pixQrCodeUrl: data.pix_qr_code_url || '',
        homeBackgroundUrl: data.home_background_url || '',
        aboutImageUrl: data.about_image_url || '',
        aboutTitle: data.about_title || 'Quem Somos Capital City',
        aboutDescription: data.about_description || 'Nascemos de uma visão: criar o servidor de SA-MP mais estável, justo e imersivo do Brasil.',
        newsDefaultImageUrl: data.news_default_image_url || '',
        capiCoinPrice: data.capi_coin_price || 1.0,
        discordWebhookUrl: data.discord_webhook_url || ''
      };
    } catch (e) {
      console.error("Erro ao buscar config:", e);
      return {
        serverIp: '', pcDownloadUrl: '', mobileDownloadUrl: '', discordUrl: '', pixKey: '', pixQrCodeUrl: '',
        homeBackgroundUrl: '', aboutImageUrl: '', newsDefaultImageUrl: '',
        capiCoinPrice: 1.0, discordWebhookUrl: ''
      };
    }
  },
  
  saveConfig: async (config: ServerConfig) => {
    // Definimos os dados convertendo para snake_case (o que o Postgres espera)
    const payload: any = {
      server_ip: config.serverIp || '',
      pc_download_url: config.pcDownloadUrl || '',
      mobile_download_url: config.mobileDownloadUrl || '',
      discord_url: config.discordUrl || '',
      pix_key: config.pixKey || '',
      pix_qr_code_url: config.pixQrCodeUrl || '',
      home_background_url: config.homeBackgroundUrl || '',
      about_image_url: config.aboutImageUrl || '',
      about_title: config.aboutTitle || '',
      about_description: config.aboutDescription || '',
      news_default_image_url: config.newsDefaultImageUrl || '',
      capi_coin_price: Number(config.capiCoinPrice) || 1.0,
      discord_webhook_url: config.discordWebhookUrl || ''
    };

    // Tenta atualizar o ID 1 (que garantimos no SQL que existe)
    // Usamos UPSERT mas omitimos o ID se ele for causar erro, 
    // ou simplesmente usamos UPDATE fixo no ID 1 que é o mais seguro para Singleton.
    
    const { data: check } = await supabase.from('server_config').select('id').eq('id', 1).maybeSingle();
    
    if (check) {
      // Já existe o ID 1, faz apenas o update
      const { error } = await supabase.from('server_config').update(payload).eq('id', 1);
      if(error) throw error;
    } else {
      // Não existe nada, insere com ID 1 forçado
      const { error } = await supabase.from('server_config').insert([{ ...payload, id: 1 }]);
      if(error) throw error;
    }
  },

  getRankings: async (): Promise<PlayerStats[]> => {
     const { data, error } = await supabase.from('rankings').select('*').order('score', { ascending: false }).limit(10);
     return data || [];
  }
};
