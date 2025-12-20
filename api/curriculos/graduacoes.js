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
      return getGraduacoes(req, res, user);
    case 'POST':
      return addGraduacao(req, res, user);
    case 'PUT':
    case 'PATCH':
      return updateGraduacao(req, res, user);
    case 'DELETE':
      return deleteGraduacao(req, res, user);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

async function getGraduacoes(req, res, user) {
  try {
    const { data, error } = await supabase
      .from('graduacoes')
      .select('*')
      .eq('candidato_id', user.id)
      .order('data_inicio', { ascending: false });

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar graduações', error.message);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Erro ao buscar graduações:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

async function addGraduacao(req, res, user) {
  try {
    const { instituicao, curso, nivel, data_inicio, data_fim, cursando } = req.body;

    if (!instituicao || !curso) {
      return errorResponse(res, 400, 'Instituição e curso são obrigatórios');
    }

    const { data, error } = await supabase
      .from('graduacoes')
      .insert([{
        candidato_id: user.id,
        instituicao,
        curso,
        nivel,
        data_inicio,
        data_fim: cursando ? null : data_fim,
        cursando,
      }])
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao adicionar graduação', error.message);
    }

    return successResponse(res, data, 'Graduação adicionada com sucesso');

  } catch (error) {
    console.error('Erro ao adicionar graduação:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

async function updateGraduacao(req, res, user) {
  try {
    const { id, ...updates } = req.body;

    if (!id) {
      return errorResponse(res, 400, 'ID da graduação é obrigatório');
    }

    const { data, error } = await supabase
      .from('graduacoes')
      .update(updates)
      .eq('id', id)
      .eq('candidato_id', user.id)
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao atualizar graduação', error.message);
    }

    return successResponse(res, data, 'Graduação atualizada com sucesso');

  } catch (error) {
    console.error('Erro ao atualizar graduação:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

async function deleteGraduacao(req, res, user) {
  try {
    const { id } = req.body;

    if (!id) {
      return errorResponse(res, 400, 'ID da graduação é obrigatório');
    }

    const { error } = await supabase
      .from('graduacoes')
      .delete()
      .eq('id', id)
      .eq('candidato_id', user.id);

    if (error) {
      return errorResponse(res, 400, 'Erro ao remover graduação', error.message);
    }

    return successResponse(res, null, 'Graduação removida com sucesso');

  } catch (error) {
    console.error('Erro ao remover graduação:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
