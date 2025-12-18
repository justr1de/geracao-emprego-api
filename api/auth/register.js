import { supabase, errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Método não permitido');
  }

  try {
    const { email, senha, nome, telefone, cpf, genero, tipo = 'candidato' } = req.body;

    // Validações básicas
    if (!email || !senha || !nome) {
      return errorResponse(res, 400, 'Email, senha e nome são obrigatórios');
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: senha,
      options: {
        data: {
          nome: nome,
          tipo: tipo
        }
      }
    });

    if (authError) {
      return errorResponse(res, 400, 'Erro ao criar usuário', authError.message);
    }

    if (!authData.user) {
      return errorResponse(res, 400, 'Erro ao criar usuário');
    }

    // Criar perfil na tabela correspondente
    let perfilData = null;
    let perfilError = null;

    if (tipo === 'candidato') {
      const { data, error } = await supabase
        .from('candidatos')
        .insert([{
          user_id: authData.user.id,
          nome_completo: nome,
          telefone: telefone,
          cpf: cpf,
          email: email,
          genero: genero
        }])
        .select()
        .single();
      
      perfilData = data;
      perfilError = error;
    } else if (tipo === 'empresa') {
      const { data, error } = await supabase
        .from('empresas')
        .insert([{
          user_id: authData.user.id,
          nome: nome,
          email: email,
          telefone: telefone
        }])
        .select()
        .single();
      
      perfilData = data;
      perfilError = error;
    }

    if (perfilError) {
      console.error('Erro ao criar perfil:', perfilError);
      // Não falha completamente, pois o usuário foi criado
    }

    return successResponse(res, {
      user: authData.user,
      perfil: perfilData,
      session: authData.session
    }, 'Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.');

  } catch (error) {
    console.error('Erro no registro:', error);
    return errorResponse(res, 500, 'Erro interno do servidor', error.message);
  }
}
