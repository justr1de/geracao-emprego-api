import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) { return; }

  const user = await getUser(req);
  if (!user) {
    return errorResponse(res, 401, 'Não autorizado');
  }

  const { id: vaga_id } = req.query;

  if (!vaga_id) {
    return errorResponse(res, 400, 'ID da vaga é obrigatório');
  }

  switch (req.method) {
    case 'GET':
      return getCandidatos(req, res, vaga_id);
    case 'PUT':
    case 'PATCH':
      return atualizarStatusCandidato(req, res, vaga_id);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

// Listar candidatos de uma vaga
async function getCandidatos(req, res, vaga_id) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('candidaturas')
      .select('*, candidatos:candidato_id(nome_completo, email, telefone, cidade, estado)', { count: 'exact' })
      .eq('vaga_id', vaga_id);

    if (status) { query = query.eq('status', status); }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar candidatos', error.message);
    }

    return successResponse(res, {
      candidatos: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
    });

  } catch (error) {
    console.error('Erro ao buscar candidatos:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Atualizar status de um candidato (aprovar, reprovar, etc)
async function atualizarStatusCandidato(req, res, vaga_id) {
  try {
    const { candidatura_id, status, feedback } = req.body;

    if (!candidatura_id || !status) {
      return errorResponse(res, 400, 'ID da candidatura e status são obrigatórios');
    }

    const statusValidos = ['pendente', 'em_analise', 'aprovado', 'reprovado', 'contratado'];
    if (!statusValidos.includes(status)) {
      return errorResponse(res, 400, `Status inválido. Use: ${statusValidos.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('candidaturas')
      .update({
        status,
        feedback,
        updated_at: new Date().toISOString(),
      })
      .eq('id', candidatura_id)
      .eq('vaga_id', vaga_id)
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao atualizar candidatura', error.message);
    }

    return successResponse(res, data, 'Status do candidato atualizado com sucesso');

  } catch (error) {
    console.error('Erro ao atualizar candidato:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
