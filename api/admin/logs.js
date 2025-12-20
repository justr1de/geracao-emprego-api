import { supabaseAdmin, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) { return; }

  const user = await getUser(req);
  if (!user) {
    return errorResponse(res, 401, 'Não autorizado');
  }

  // TODO: Verificar se o usuário é admin
  // Por enquanto, qualquer usuário autenticado pode ver logs

  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Método não permitido');
  }

  try {
    const {
      tipo,
      user_id,
      data_inicio,
      data_fim,
      page = 1,
      limit = 50,
    } = req.query;

    let query = supabaseAdmin
      .from('logs')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (tipo) { query = query.eq('tipo', tipo); }
    if (user_id) { query = query.eq('user_id', user_id); }
    if (data_inicio) { query = query.gte('created_at', data_inicio); }
    if (data_fim) { query = query.lte('created_at', data_fim); }

    // Paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    // Ordenação
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar logs', error.message);
    }

    return successResponse(res, {
      logs: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    });

  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Helper para registrar log (exportado para uso em outros endpoints)
export async function registrarLog(tipo, descricao, user_id, dados_adicionais = {}) {
  try {
    await supabaseAdmin
      .from('logs')
      .insert([{
        tipo,
        descricao,
        user_id,
        dados: dados_adicionais,
        ip: dados_adicionais.ip || null,
        user_agent: dados_adicionais.user_agent || null,
      }]);
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
}
