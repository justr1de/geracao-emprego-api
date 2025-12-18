import { supabase, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Método não permitido');
  }

  try {
    const { email, senha } = req.body;

    // Validações básicas
    if (!email || !senha) {
      return errorResponse(res, 400, 'Email e senha são obrigatórios');
    }

    // Autenticar usuário
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: senha
    });

    if (error) {
      return errorResponse(res, 401, 'Credenciais inválidas', error.message);
    }

    // Buscar perfil do usuário
    let perfil = null;
    const userId = data.user.id;

    // Tentar buscar como candidato
    const { data: candidato } = await supabase
      .from('candidatos')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (candidato) {
      perfil = { ...candidato, tipo: 'candidato' };
    } else {
      // Tentar buscar como empresa
      const { data: empresa } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (empresa) {
        perfil = { ...empresa, tipo: 'empresa' };
      }
    }

    return successResponse(res, {
      user: data.user,
      session: data.session,
      perfil: perfil
    }, 'Login realizado com sucesso');

  } catch (error) {
    console.error('Erro no login:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
