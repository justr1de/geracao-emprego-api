import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  const user = await getUser(req);
  if (!user) {
    return errorResponse(res, 401, 'Não autorizado');
  }

  switch (req.method) {
    case 'GET':
      return getHabilidades(req, res, user);
    case 'POST':
      return addHabilidade(req, res, user);
    case 'DELETE':
      return deleteHabilidade(req, res, user);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

async function getHabilidades(req, res, user) {
  try {
    const { data, error } = await supabase
      .from('habilidades')
      .select('*')
      .eq('candidato_id', user.id)
      .order('categoria', { ascending: true });

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar habilidades', error.message);
    }

    return successResponse(res, data);

  } catch (error) {
    console.error('Erro ao buscar habilidades:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

async function addHabilidade(req, res, user) {
  try {
    const { categoria, nome, nivel } = req.body;

    if (!nome) {
      return errorResponse(res, 400, 'Nome da habilidade é obrigatório');
    }

    const { data, error } = await supabase
      .from('habilidades')
      .insert([{
        candidato_id: user.id,
        categoria,
        nome,
        nivel
      }])
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao adicionar habilidade', error.message);
    }

    return successResponse(res, data, 'Habilidade adicionada com sucesso');

  } catch (error) {
    console.error('Erro ao adicionar habilidade:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

async function deleteHabilidade(req, res, user) {
  try {
    const { id } = req.body;

    if (!id) {
      return errorResponse(res, 400, 'ID da habilidade é obrigatório');
    }

    const { error } = await supabase
      .from('habilidades')
      .delete()
      .eq('id', id)
      .eq('candidato_id', user.id);

    if (error) {
      return errorResponse(res, 400, 'Erro ao remover habilidade', error.message);
    }

    return successResponse(res, null, 'Habilidade removida com sucesso');

  } catch (error) {
    console.error('Erro ao remover habilidade:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
