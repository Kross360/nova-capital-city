import { createClient } from '@supabase/supabase-js';

// Tenta pegar das variáveis de ambiente (Produção), se não tiver, usa as hardcoded (Dev)
// Garantimos que env existe antes de acessar as propriedades para evitar erro "Cannot read properties of undefined"
const env = (import.meta as any).env || {};

const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://ehpcqujckvzebqcjgzrt.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVocGNxdWpja3Z6ZWJxY2pnenJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDEyMzYsImV4cCI6MjA4MTQxNzIzNn0.7I7hs7pca5F87cODWF8V5MNL7cn1fz5LTCUItjYV2Us';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);