import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, 'ID da empresa é obrigatório');
  }

  switch (req.method) {
    case 'GET':
      return getEmpresa(req, res, id);
    case 'PUT':
    case 'PATCH':
      return updateEmpresa(req, res, id);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

// Buscar empresa específica com suas vagas
async function getEmpresa(req, res, id) {
  try {
    const { data: empresa, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !empresa) {
      return errorResponse(res, 404, 'Empresa não encontrada');
    }

    // Buscar vagas da empresa
    const { data: vagas } = await supabase
      .from('vagas')
      .select('*')
      .eq('empresa_id', id)
      .eq('status', 'aberta')
      .order('created_at', { ascending: false });

    return successResponse(res, {
      ...empresa,
      vagas: vagas || []
    });

  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Atualizar empresa
async function updateEmpresa(req, res, id) {
  try {
    const user = await getUser(req);
    if (!user) {
      return errorResponse(res, 401, 'Não autorizado');
    }

    const updates = req.body;
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('empresas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao atualizar empresa', error.message);
    }

    return successResponse(res, data, 'Empresa atualizada com sucesso');

  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
