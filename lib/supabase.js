import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://gdzoifnsbbrjhgqyincn.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkem9pZm5zYmJyamhncXlpbmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTYyNTUsImV4cCI6MjA3MzY5MjI1NX0.C8H1HxOk-E_KYKD0XnBod0dS2_XVtyc1KN5o7XsAuvU';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Cliente público (para operações do lado do cliente)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin (para operações do lado do servidor que precisam de privilégios elevados)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabase;

// Helper para extrair token do header Authorization
export function getAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Helper para verificar usuário autenticado
export async function getUser(req) {
  const token = getAuthToken(req);
  if (!token) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  
  return user;
}

// Helper para resposta de erro
export function errorResponse(res, status, message, details = null) {
  return res.status(status).json({
    success: false,
    error: message,
    details: details
  });
}

// Helper para resposta de sucesso
export function successResponse(res, data, message = 'Operação realizada com sucesso') {
  return res.status(200).json({
    success: true,
    message: message,
    data: data
  });
}

// Helper para lidar com CORS preflight
export function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}
