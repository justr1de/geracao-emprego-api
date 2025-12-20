import { successResponse, handleCors } from '../lib/supabase.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (handleCors(req, res)) { return; }

  return successResponse(res, {
    name: 'Geração Emprego API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET|PUT /api/auth/profile',
      },
      vagas: {
        list: 'GET /api/vagas',
        create: 'POST /api/vagas',
        get: 'GET /api/vagas/:id',
        update: 'PUT /api/vagas/:id',
        delete: 'DELETE /api/vagas/:id',
      },
      empresas: {
        list: 'GET /api/empresas',
        create: 'POST /api/empresas',
        get: 'GET /api/empresas/:id',
        update: 'PUT /api/empresas/:id',
      },
      curriculos: {
        list: 'GET /api/curriculos',
        create: 'POST /api/curriculos',
      },
      cursos: {
        list: 'GET /api/cursos',
        create: 'POST /api/cursos',
        get: 'GET /api/cursos/:id',
      },
      editais: {
        list: 'GET /api/editais',
        create: 'POST /api/editais',
      },
      metadata: {
        get: 'GET /api/metadata',
      },
      sobre: {
        get: 'GET /api/sobre?tipo=faq|termos|politicas',
      },
    },
  }, 'API Geração Emprego - Governo de Rondônia');
}
