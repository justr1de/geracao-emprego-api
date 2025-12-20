import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) { return; }

  const user = await getUser(req);
  if (!user) {
    return errorResponse(res, 401, 'Não autorizado');
  }

  switch (req.method) {
    case 'GET':
      return getExperiencias(req, res, user);
    case 'POST':
      return addExperiencia(req, res, user);
    case 'PUT':
    case 'PATCH':
      return updateExperiencia(req, res, user);
    case 'DELETE':
      return deleteExperiencia(req, res, user);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

async function getExperiencias(req, res, user) {
  try {
    const { data, error } = await supabase
      .from('experiencias')
      .select('*')
      .eq('candidato_id', user.id)
      .order('data_inicio', { ascending: false });

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar experiências', error.message);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Erro ao buscar experiências:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

async function addExperiencia(req, res, user) {
  try {
    const { empresa, cargo, data_inicio, data_fim, atual, descricao } = req.body;

    if (!empresa || !cargo) {
      return errorResponse(res, 400, 'Empresa e cargo são obrigatórios');
    }

    const { data, error } = await supabase
      .from('experiencias')
      .insert([{
        candidato_id: user.id,
        empresa,
        cargo,
        data_inicio,
        data_fim: atual ? null : data_fim,
        atual,
        descricao,
      }])
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao adicionar experiência', error.message);
    }

    return successResponse(res, data, 'Experiência adicionada com sucesso');

  } catch (error) {
    console.error('Erro ao adicionar experiência:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

async function updateExperiencia(req, res, user) {
  try {
    const { id, ...updates } = req.body;

    if (!id) {
      return errorResponse(res, 400, 'ID da experiência é obrigatório');
    }

    const { data, error } = await supabase
      .from('experiencias')
      .update(updates)
      .eq('id', id)
      .eq('candidato_id', user.id)
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao atualizar experiência', error.message);
    }

    return successResponse(res, data, 'Experiência atualizada com sucesso');

  } catch (error) {
    console.error('Erro ao atualizar experiência:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

async function deleteExperiencia(req, res, user) {
  try {
    const { id } = req.body;

    if (!id) {
      return errorResponse(res, 400, 'ID da experiência é obrigatório');
    }

    const { error } = await supabase
      .from('experiencias')
      .delete()
      .eq('id', id)
      .eq('candidato_id', user.id);

    if (error) {
      return errorResponse(res, 400, 'Erro ao remover experiência', error.message);
    }

    return successResponse(res, null, 'Experiência removida com sucesso');

  } catch (error) {
    console.error('Erro ao remover experiência:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
