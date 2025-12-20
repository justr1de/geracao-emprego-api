import { supabase, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) { return; }

  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, 'ID do curso é obrigatório');
  }

  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Método não permitido');
  }

  try {
    const { data, error } = await supabase
      .from('cursos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 404, 'Curso não encontrado');
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Erro ao buscar curso:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
