import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) { return; }

  const user = await getUser(req);
  if (!user) {
    return errorResponse(res, 401, 'Não autorizado');
  }

  switch (req.method) {
    case 'POST':
      return candidatar(req, res, user);
    case 'GET':
      return minhasCandidaturas(req, res, user);
    case 'DELETE':
      return cancelarCandidatura(req, res, user);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

// Candidatar-se a uma vaga
async function candidatar(req, res, user) {
  try {
    const { vaga_id, mensagem } = req.body;

    if (!vaga_id) {
      return errorResponse(res, 400, 'ID da vaga é obrigatório');
    }

    // Verificar se a vaga existe e está aberta
    const { data: vaga, error: vagaError } = await supabase
      .from('vagas')
      .select('id, titulo, status')
      .eq('id', vaga_id)
      .single();

    if (vagaError || !vaga) {
      return errorResponse(res, 404, 'Vaga não encontrada');
    }

    if (vaga.status !== 'aberta') {
      return errorResponse(res, 400, 'Esta vaga não está mais disponível');
    }

    // Verificar se já se candidatou
    const { data: existente } = await supabase
      .from('candidaturas')
      .select('id')
      .eq('vaga_id', vaga_id)
      .eq('candidato_id', user.id)
      .single();

    if (existente) {
      return errorResponse(res, 400, 'Você já se candidatou a esta vaga');
    }

    // Criar candidatura
    const { data, error } = await supabase
      .from('candidaturas')
      .insert([{
        vaga_id,
        candidato_id: user.id,
        mensagem,
        status: 'pendente',
      }])
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao registrar candidatura', error.message);
    }

    // Incrementar contador de inscritos na vaga
    await supabase
      .from('vagas')
      .update({ inscritos: (vaga.inscritos || 0) + 1 })
      .eq('id', vaga_id);

    return successResponse(res, data, 'Candidatura registrada com sucesso');

  } catch (error) {
    console.error('Erro ao candidatar:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Listar minhas candidaturas
async function minhasCandidaturas(req, res, user) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('candidaturas')
      .select('*, vagas(titulo, cidade, salario, empresa_id, empresas(nome, logo_url))', { count: 'exact' })
      .eq('candidato_id', user.id);

    if (status) { query = query.eq('status', status); }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar candidaturas', error.message);
    }

    return successResponse(res, {
      candidaturas: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
    });

  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Cancelar candidatura
async function cancelarCandidatura(req, res, user) {
  try {
    const { candidatura_id } = req.body;

    if (!candidatura_id) {
      return errorResponse(res, 400, 'ID da candidatura é obrigatório');
    }

    const { data, error } = await supabase
      .from('candidaturas')
      .delete()
      .eq('id', candidatura_id)
      .eq('candidato_id', user.id)
      .select()
      .single();

    if (error || !data) {
      return errorResponse(res, 404, 'Candidatura não encontrada');
    }

    return successResponse(res, null, 'Candidatura cancelada com sucesso');

  } catch (error) {
    console.error('Erro ao cancelar candidatura:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
