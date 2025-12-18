import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  switch (req.method) {
    case 'GET':
      return getCurriculos(req, res);
    case 'POST':
      return createCurriculo(req, res);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

// Listar currículos com filtros (para empresas)
async function getCurriculos(req, res) {
  try {
    const user = await getUser(req);
    if (!user) {
      return errorResponse(res, 401, 'Não autorizado');
    }

    const { 
      cidade, 
      estado,
      habilidade,
      escolaridade,
      busca,
      page = 1, 
      limit = 20 
    } = req.query;

    let query = supabase
      .from('candidatos')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (cidade) query = query.eq('cidade', cidade);
    if (estado) query = query.eq('estado', estado);
    if (busca) query = query.or(`nome_completo.ilike.%${busca}%`);

    // Paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar currículos', error.message);
    }

    // Remover dados sensíveis
    const curriculos = data.map(c => ({
      ...c,
      cpf: c.cpf ? `***.***.${c.cpf.slice(-5, -2)}-**` : null
    }));

    return successResponse(res, {
      curriculos,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    });

  } catch (error) {
    console.error('Erro ao buscar currículos:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Criar/Atualizar currículo do usuário logado
async function createCurriculo(req, res) {
  try {
    const user = await getUser(req);
    if (!user) {
      return errorResponse(res, 401, 'Não autorizado');
    }

    const curriculoData = req.body;
    curriculoData.user_id = user.id;
    curriculoData.email = user.email;

    // Verificar se já existe currículo
    const { data: existente } = await supabase
      .from('candidatos')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existente) {
      // Atualizar
      delete curriculoData.user_id;
      const { data, error } = await supabase
        .from('candidatos')
        .update(curriculoData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Inserir
      const { data, error } = await supabase
        .from('candidatos')
        .insert([curriculoData])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return successResponse(res, result, 'Currículo salvo com sucesso');

  } catch (error) {
    console.error('Erro ao salvar currículo:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
