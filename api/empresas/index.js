import { supabase, getUser, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) { return; }

  switch (req.method) {
    case 'GET':
      return getEmpresas(req, res);
    case 'POST':
      return createEmpresa(req, res);
    default:
      return errorResponse(res, 405, 'Método não permitido');
  }
}

// Listar empresas com filtros
async function getEmpresas(req, res) {
  try {
    const {
      cidade,
      setor,
      busca,
      page = 1,
      limit = 20,
    } = req.query;

    let query = supabase
      .from('empresas')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (cidade) { query = query.eq('cidade', cidade); }
    if (setor) { query = query.eq('setor', setor); }
    if (busca) { query = query.ilike('nome', `%${busca}%`); }

    // Paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    // Ordenação
    query = query.order('nome', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(res, 400, 'Erro ao buscar empresas', error.message);
    }

    return successResponse(res, {
      empresas: data,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    });

  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}

// Criar nova empresa
async function createEmpresa(req, res) {
  try {
    const user = await getUser(req);
    if (!user) {
      return errorResponse(res, 401, 'Não autorizado');
    }

    const {
      nome,
      cnpj,
      email,
      telefone,
      cidade,
      setor,
      sobre,
      logo_url,
      banner_url,
    } = req.body;

    // Validações
    if (!nome || !cnpj || !email) {
      return errorResponse(res, 400, 'Nome, CNPJ e email são obrigatórios');
    }

    const { data, error } = await supabase
      .from('empresas')
      .insert([{
        user_id: user.id,
        nome,
        cnpj,
        email,
        telefone,
        cidade,
        setor,
        sobre,
        logo_url,
        banner_url,
      }])
      .select()
      .single();

    if (error) {
      return errorResponse(res, 400, 'Erro ao criar empresa', error.message);
    }

    return successResponse(res, data, 'Empresa cadastrada com sucesso');

  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
