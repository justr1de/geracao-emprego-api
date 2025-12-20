import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) { return; }

  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, 'ID da vaga é obrigatório');
  }

  switch (req.method) {
    case 'GET':
      return getVaga(req, res, id);
    case 'PUT':
    case 'PATCH':
      return updateVaga(req, res, id);
    case 'DELETE':
      return deleteVaga(req, res, id);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

// Buscar vaga específica
async function getVaga(req, res, id) {
  try {
    const { data, error } = await supabase
      .from('vagas')
      .select('*, empresas(nome, logo_url, cidade, setor)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return errorResponse(res, 404, 'Vaga não encontrada');
    }

    // Incrementar visualizações
    await supabase
      .from('vagas')
      .update({ visualizacoes: (data.visualizacoes || 0) + 1 })
      .eq('id', id);

    return successResponse(res, data);

  } catch (error) {
    console.error('Erro ao buscar vaga:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Atualizar vaga
async function updateVaga(req, res, id) {
  try {
    const user = await getUser(req);
    if (!user) {
      return errorResponse(res, 401, 'Não autorizado');
    }

    const updates = req.body;
    delete updates.id;
    delete updates.created_at;
    delete updates.created_by;

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('vagas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao atualizar vaga', error.message);
    }

    return successResponse(res, data, 'Vaga atualizada com sucesso');

  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Deletar/Encerrar vaga
async function deleteVaga(req, res, id) {
  try {
    const user = await getUser(req);
    if (!user) {
      return errorResponse(res, 401, 'Não autorizado');
    }

    // Soft delete - apenas muda o status para encerrada
    const { data, error } = await supabase
      .from('vagas')
      .update({ status: 'encerrada', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao encerrar vaga', error.message);
    }

    return successResponse(res, data, 'Vaga encerrada com sucesso');

  } catch (error) {
    console.error('Erro ao encerrar vaga:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
