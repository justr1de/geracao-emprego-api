import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  // Verificar autenticação
  const user = await getUser(req);
  if (!user) {
    return errorResponse(res, 401, 'Não autorizado');
  }

  if (req.method === 'GET') {
    return getProfile(req, res, user);
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    return updateProfile(req, res, user);
  } else {
    return errorResponse(res, 405, 'Método não permitido');
  }
}

async function getProfile(req, res, user) {
  try {
    // Buscar perfil do candidato
    let { data: perfil, error } = await supabase
      .from('candidatos')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !perfil) {
      // Tentar buscar como empresa
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (empresaError || !empresa) {
        return errorResponse(res, 404, 'Perfil não encontrado');
      }

      perfil = { ...empresa, tipo: 'empresa' };
    } else {
      perfil = { ...perfil, tipo: 'candidato' };
    }

    return successResponse(res, {
      user: user,
      perfil: perfil
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

async function updateProfile(req, res, user) {
  try {
    const updates = req.body;
    const tipo = updates.tipo || 'candidato';
    delete updates.tipo;
    delete updates.user_id; // Não permitir alteração do user_id

    const tabela = tipo === 'empresa' ? 'empresas' : 'candidatos';

    const { data, error } = await supabase
      .from(tabela)
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao atualizar perfil', error.message);
    }

    return successResponse(res, data, 'Perfil atualizado com sucesso');

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
