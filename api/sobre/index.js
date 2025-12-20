import { errorResponse, successResponse, handleCors } from '../../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) { return; }

  if (req.method !== 'GET') {
    return errorResponse(res, 405, 'Método não permitido');
  }

  const { tipo } = req.query;

  switch (tipo) {
    case 'faq':
      return getFaq(res);
    case 'termos':
      return getTermos(res);
    case 'politicas':
      return getPoliticas(res);
    default:
      return getSobre(res);
  }
}

function getSobre(res) {
  return successResponse(res, {
    titulo: 'Geração Emprego',
    descricao: 'O Geração Emprego é uma plataforma do Governo do Estado de Rondônia para conectar trabalhadores e empregadores, oferecendo funcionalidades como cadastro de currículos, divulgação de vagas, busca de cursos, editais e muito mais.',
    contato: {
      email: 'geracaoemprego@sedi.ro.gov.br',
      telefone: '(69) 3212-9400',
      endereco: 'Palácio Rio Madeira, Porto Velho - RO',
    },
    redes_sociais: {
      instagram: 'https://instagram.com/geracaoempregoro',
      facebook: 'https://facebook.com/geracaoempregoro',
    },
  });
}

function getFaq(res) {
  return successResponse(res, {
    perguntas: [
      {
        id: 1,
        pergunta: 'Como faço para me cadastrar?',
        resposta: 'Clique no botão "Cadastrar" no topo da página e preencha seus dados. Você receberá um email de confirmação.',
      },
      {
        id: 2,
        pergunta: 'Como posso atualizar meu currículo?',
        resposta: 'Após fazer login, acesse "Meu Currículo" no menu e clique em "Editar" para atualizar suas informações.',
      },
      {
        id: 3,
        pergunta: 'Como uma empresa pode publicar vagas?',
        resposta: 'Empresas devem se cadastrar como pessoa jurídica. Após aprovação, terão acesso ao painel para publicar vagas.',
      },
      {
        id: 4,
        pergunta: 'Os cursos são gratuitos?',
        resposta: 'A maioria dos cursos oferecidos através da plataforma são gratuitos, oferecidos pelo Governo do Estado e parceiros.',
      },
      {
        id: 5,
        pergunta: 'Como sei se fui selecionado para uma vaga?',
        resposta: 'Você receberá notificações por email e também pode acompanhar o status das suas candidaturas no painel do trabalhador.',
      },
    ],
  });
}

function getTermos(res) {
  return successResponse(res, {
    titulo: 'Termos de Uso',
    versao: '1.0',
    data_atualizacao: '2025-01-01',
    conteudo: `
      1. ACEITAÇÃO DOS TERMOS
      Ao acessar e usar a plataforma Geração Emprego, você concorda com estes termos de uso.

      2. USO DA PLATAFORMA
      A plataforma destina-se exclusivamente à intermediação de mão de obra no Estado de Rondônia.

      3. CADASTRO
      O usuário é responsável pela veracidade das informações fornecidas no cadastro.

      4. PRIVACIDADE
      Seus dados são protegidos conforme nossa Política de Privacidade e a LGPD.

      5. RESPONSABILIDADES
      O Governo do Estado não se responsabiliza por contratações realizadas entre usuários.
    `,
  });
}

function getPoliticas(res) {
  return successResponse(res, {
    titulo: 'Política de Privacidade',
    versao: '1.0',
    data_atualizacao: '2025-01-01',
    conteudo: `
      1. COLETA DE DADOS
      Coletamos dados pessoais necessários para o funcionamento da plataforma.

      2. USO DOS DADOS
      Seus dados são utilizados para intermediação de emprego e comunicação sobre oportunidades.

      3. COMPARTILHAMENTO
      Dados de currículos são compartilhados com empresas cadastradas que buscam candidatos.

      4. SEGURANÇA
      Implementamos medidas de segurança para proteger seus dados pessoais.

      5. SEUS DIREITOS
      Você pode solicitar acesso, correção ou exclusão de seus dados a qualquer momento.

      6. CONTATO
      Para dúvidas sobre privacidade: geracaoemprego@sedi.ro.gov.br
    `,
  });
}
