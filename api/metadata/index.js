import { supabase, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Método não permitido');
  }

  try {
    // Buscar estatísticas de todas as tabelas
    const [
      { count: totalCurriculos },
      { count: totalEmpresas },
      { count: totalVagas },
      { count: totalVagasAbertas },
      { count: totalCursos }
    ] = await Promise.all([
      supabase.from('candidatos').select('*', { count: 'exact', head: true }),
      supabase.from('empresas').select('*', { count: 'exact', head: true }),
      supabase.from('vagas').select('*', { count: 'exact', head: true }),
      supabase.from('vagas').select('*', { count: 'exact', head: true }).eq('status', 'aberta'),
      supabase.from('cursos').select('*', { count: 'exact', head: true })
    ]);

    // Buscar cidades únicas para filtros
    const { data: cidadesVagas } = await supabase
      .from('vagas')
      .select('cidade')
      .not('cidade', 'is', null);

    const { data: setoresEmpresas } = await supabase
      .from('empresas')
      .select('setor')
      .not('setor', 'is', null);

    const { data: categoriasCursos } = await supabase
      .from('cursos')
      .select('categoria')
      .not('categoria', 'is', null);

    // Remover duplicatas
    const cidades = [...new Set((cidadesVagas || []).map(v => v.cidade))].filter(Boolean);
    const setores = [...new Set((setoresEmpresas || []).map(e => e.setor))].filter(Boolean);
    const categorias = [...new Set((categoriasCursos || []).map(c => c.categoria))].filter(Boolean);

    return successResponse(res, {
      estatisticas: {
        curriculos: totalCurriculos || 0,
        empresas: totalEmpresas || 0,
        vagas_total: totalVagas || 0,
        vagas_abertas: totalVagasAbertas || 0,
        cursos: totalCursos || 0
      },
      filtros: {
        cidades,
        setores,
        categorias_cursos: categorias,
        tipos_vaga: ['Tempo integral', 'Meio período', 'Estágio', 'Temporário', 'Freelancer'],
        modalidades_curso: ['Presencial', 'Online', 'Híbrido']
      }
    });

  } catch (error) {
    console.error('Erro ao buscar metadata:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
