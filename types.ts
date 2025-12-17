export type Category = 'VIP' | 'VEHICLE' | 'MANSION' | 'ORG' | 'SPECIAL' | 'COINS';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
}

export interface Rule {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'COMBAT' | 'ILLEGAL' | 'SAFEZONE';
}

export interface NewsPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;
  imageUrl?: string;
}

export interface PlayerStats {
  id: number;
  name: string;
  score: number;
  role: string;
}

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ChatMessage {
  id: string;
  sender: 'ADMIN' | 'PLAYER';
  content: string;
  timestamp: string;
}

export interface PaymentRequest {
  id: string;
  itemId: string;
  itemName: string;
  itemPrice: number;
  playerNick: string;
  playerId: number;
  discordContact: string;
  proofImageUrl: string;
  status: PaymentStatus;
  adminNote?: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface ServerConfig {
  pcDownloadUrl: string;
  mobileDownloadUrl: string;
  discordUrl: string;
  pixKey: string;
  pixQrCodeUrl: string;
  homeBackgroundUrl: string;
  aboutImageUrl: string;
  newsDefaultImageUrl: string;
  capiCoinPrice: number;
  discordWebhookUrl?: string; // Novo campo para notificações
}