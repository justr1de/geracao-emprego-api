import { supabase, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Método não permitido');
  }

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return errorResponse(res, 400, 'Erro ao fazer logout', error.message);
    }

    return successResponse(res, null, 'Logout realizado com sucesso');

  } catch (error) {
    console.error('Erro no logout:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
