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
      return getNotificacoes(req, res, user);
    case 'PUT':
    case 'PATCH':
      return marcarComoLida(req, res, user);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

// Listar notificações do usuário
async function getNotificacoes(req, res, user) {
  try {
    const { lida, page = 1, limit = 20 } = req.query;

    let query = supabase
      .from('notificacoes')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (lida !== undefined) {
      query = query.eq('lida', lida === 'true');
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar notificações', error.message);
    }

    // Contar não lidas
    const { count: naoLidas } = await supabase
      .from('notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('lida', false);

    return successResponse(res, {
      notificacoes: data,
      total: count,
      nao_lidas: naoLidas || 0,
      page: parseInt(page),
      limit: parseInt(limit),
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Marcar notificação como lida
async function marcarComoLida(req, res, user) {
  try {
    const { notificacao_id, todas } = req.body;

    if (todas) {
      // Marcar todas como lidas
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('user_id', user.id)
        .eq('lida', false);

      if (error) {
        return errorResponse(res, 400, 'Erro ao marcar notificações', error.message);
      }

      return successResponse(res, null, 'Todas as notificações marcadas como lidas');
    }

    if (!notificacao_id) {
      return errorResponse(res, 400, 'ID da notificação é obrigatório');
    }

    const { data, error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('id', notificacao_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao marcar notificação', error.message);
    }

    return successResponse(res, data, 'Notificação marcada como lida');

  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
