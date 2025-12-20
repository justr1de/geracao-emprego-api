import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) { return; }

  switch (req.method) {
    case 'GET':
      return getCursos(req, res);
    case 'POST':
      return createCurso(req, res);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

// Listar cursos com filtros
async function getCursos(req, res) {
  try {
    const {
      categoria,
      cidade,
      modalidade,
      gratuito,
      busca,
      page = 1,
      limit = 20,
    } = req.query;

    let query = supabase
      .from('cursos')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (categoria) { query = query.eq('categoria', categoria); }
    if (cidade) { query = query.eq('cidade', cidade); }
    if (modalidade) { query = query.eq('modalidade', modalidade); }
    if (gratuito === 'true') { query = query.eq('custo', 'Grátis'); }
    if (busca) { query = query.ilike('nome', `%${busca}%`); }

    // Paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    // Ordenação
    query = query.order('data_inicio', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar cursos', error.message);
    }

    return successResponse(res, {
      cursos: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    });

  } catch (error) {
    console.error('Erro ao buscar cursos:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Criar novo curso
async function createCurso(req, res) {
  try {
    const user = await getUser(req);
    if (!user) {
      return errorResponse(res, 401, 'Não autorizado');
    }

    const {
      nome,
      categoria,
      descricao,
      cidade,
      modalidade,
      carga_horaria,
      custo,
      vagas,
      data_inscricao,
      data_inicio,
      organizador,
      imagem_url,
      requisitos,
      publico_alvo,
    } = req.body;

    // Validações
    if (!nome || !categoria) {
      return errorResponse(res, 400, 'Nome e categoria são obrigatórios');
    }

    const { data, error } = await supabase
      .from('cursos')
      .insert([{
        nome,
        categoria,
        descricao,
        cidade,
        modalidade,
        carga_horaria,
        custo,
        vagas,
        data_inscricao,
        data_inicio,
        organizador,
        imagem_url,
        requisitos,
        publico_alvo,
        created_by: user.id,
      }])
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao criar curso', error.message);
    }

    return successResponse(res, data, 'Curso criado com sucesso');

  } catch (error) {
    console.error('Erro ao criar curso:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
