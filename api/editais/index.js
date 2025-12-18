import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  switch (req.method) {
    case 'GET':
      return getEditais(req, res);
    case 'POST':
      return createEdital(req, res);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

// Listar editais com filtros
async function getEditais(req, res) {
  try {
    const { 
      status,
      orgao,
      municipio,
      busca,
      page = 1, 
      limit = 20 
    } = req.query;

    let query = supabase
      .from('editais')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (status) query = query.eq('status', status);
    if (orgao) query = query.eq('orgao', orgao);
    if (busca) query = query.ilike('titulo', `%${busca}%`);

    // Paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    // Ordenação
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar editais', error.message);
    }

    return successResponse(res, {
      editais: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    });

  } catch (error) {
    console.error('Erro ao buscar editais:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Criar novo edital
async function createEdital(req, res) {
  try {
    const user = await getUser(req);
    if (!user) {
      return errorResponse(res, 401, 'Não autorizado');
    }

    const {
      numero,
      titulo,
      orgao,
      descricao,
      status,
      modalidade,
      municipios,
      cursos,
      links,
      imagem_url
    } = req.body;

    // Validações
    if (!numero || !titulo || !orgao) {
      return errorResponse(res, 400, 'Número, título e órgão são obrigatórios');
    }

    const { data, error } = await supabase
      .from('editais')
      .insert([{
        numero,
        titulo,
        orgao,
        descricao,
        status: status || 'Aberto',
        modalidade,
        municipios,
        cursos,
        links,
        imagem_url,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao criar edital', error.message);
    }

    return successResponse(res, data, 'Edital criado com sucesso');

  } catch (error) {
    console.error('Erro ao criar edital:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
