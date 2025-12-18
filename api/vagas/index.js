import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  switch (req.method) {
    case 'GET':
      return getVagas(req, res);
    case 'POST':
      return createVaga(req, res);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

// Listar vagas com filtros
async function getVagas(req, res) {
  try {
    const { 
      cidade, 
      tipo, 
      salario_min, 
      salario_max, 
      empresa_id,
      status = 'aberta',
      busca,
      page = 1, 
      limit = 20 
    } = req.query;

    let query = supabase
      .from('vagas')
      .select('*, empresas(nome, logo_url)', { count: 'exact' });

    // Aplicar filtros
    if (cidade) query = query.eq('cidade', cidade);
    if (tipo) query = query.eq('tipo', tipo);
    if (salario_min) query = query.gte('salario', parseFloat(salario_min));
    if (salario_max) query = query.lte('salario', parseFloat(salario_max));
    if (empresa_id) query = query.eq('empresa_id', empresa_id);
    if (status) query = query.eq('status', status);
    if (busca) query = query.ilike('titulo', `%${busca}%`);

    // Paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    // Ordenação
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar vagas', error.message);
    }

    return successResponse(res, {
      vagas: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    });

  } catch (error) {
    console.error('Erro ao buscar vagas:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Criar nova vaga
async function createVaga(req, res) {
  try {
    const user = await getUser(req);
    if (!user) {
      return errorResponse(res, 401, 'Não autorizado');
    }

    const {
      titulo,
      descricao,
      cidade,
      tipo,
      salario,
      num_vagas,
      requisitos,
      beneficios,
      empresa_id
    } = req.body;

    // Validações
    if (!titulo || !descricao || !cidade) {
      return errorResponse(res, 400, 'Título, descrição e cidade são obrigatórios');
    }

    const { data, error } = await supabase
      .from('vagas')
      .insert([{
        titulo,
        descricao,
        cidade,
        tipo,
        salario,
        num_vagas: num_vagas || 1,
        requisitos,
        beneficios,
        empresa_id,
        status: 'aberta',
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao criar vaga', error.message);
    }

    return successResponse(res, data, 'Vaga criada com sucesso');

  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
