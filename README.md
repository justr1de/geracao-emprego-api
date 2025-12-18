# Geração Emprego API

API Serverless do Portal Geração Emprego - Governo do Estado de Rondônia

## Tecnologias

- **Runtime:** Node.js 18+
- **Framework:** Vercel Serverless Functions
- **Banco de Dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth

## Estrutura do Projeto

```
geracao-emprego-api/
├── api/
│   ├── index.js              # Health check e documentação
│   ├── auth/
│   │   ├── register.js       # Cadastro de usuários
│   │   ├── login.js          # Login
│   │   ├── logout.js         # Logout
│   │   └── profile.js        # Perfil do usuário
│   ├── vagas/
│   │   ├── index.js          # CRUD de vagas
│   │   └── [id].js           # Vaga específica
│   ├── empresas/
│   │   ├── index.js          # CRUD de empresas
│   │   └── [id].js           # Empresa específica
│   ├── curriculos/
│   │   └── index.js          # CRUD de currículos
│   ├── cursos/
│   │   ├── index.js          # CRUD de cursos
│   │   └── [id].js           # Curso específico
│   ├── editais/
│   │   └── index.js          # CRUD de editais
│   ├── metadata/
│   │   └── index.js          # Estatísticas e filtros
│   └── sobre/
│       └── index.js          # FAQ, Termos, Políticas
├── lib/
│   └── supabase.js           # Cliente Supabase e helpers
├── package.json
├── vercel.json
└── README.md
```

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Configure as variáveis:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

### 2. Instalação

```bash
npm install
```

### 3. Desenvolvimento Local

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`

### 4. Deploy

```bash
npm run deploy
```

## Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Cadastro de usuário |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/profile` | Obter perfil |
| PUT | `/api/auth/profile` | Atualizar perfil |

### Vagas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/vagas` | Listar vagas |
| POST | `/api/vagas` | Criar vaga |
| GET | `/api/vagas/:id` | Obter vaga |
| PUT | `/api/vagas/:id` | Atualizar vaga |
| DELETE | `/api/vagas/:id` | Encerrar vaga |

**Parâmetros de Query (GET /api/vagas):**
- `cidade` - Filtrar por cidade
- `tipo` - Tipo de vaga (Tempo integral, Meio período, etc)
- `salario_min` - Salário mínimo
- `salario_max` - Salário máximo
- `empresa_id` - Filtrar por empresa
- `status` - Status da vaga (aberta, encerrada)
- `busca` - Busca por título
- `page` - Página (padrão: 1)
- `limit` - Itens por página (padrão: 20)

### Empresas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/empresas` | Listar empresas |
| POST | `/api/empresas` | Cadastrar empresa |
| GET | `/api/empresas/:id` | Obter empresa |
| PUT | `/api/empresas/:id` | Atualizar empresa |

### Currículos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/curriculos` | Listar currículos |
| POST | `/api/curriculos` | Criar/Atualizar currículo |

### Cursos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/cursos` | Listar cursos |
| POST | `/api/cursos` | Criar curso |
| GET | `/api/cursos/:id` | Obter curso |

### Editais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/editais` | Listar editais |
| POST | `/api/editais` | Criar edital |

### Metadata

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/metadata` | Estatísticas e filtros |

### Sobre

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/sobre` | Informações gerais |
| GET | `/api/sobre?tipo=faq` | Perguntas frequentes |
| GET | `/api/sobre?tipo=termos` | Termos de uso |
| GET | `/api/sobre?tipo=politicas` | Política de privacidade |

## Autenticação

A API usa Bearer Token para autenticação. Após o login, inclua o token no header:

```
Authorization: Bearer <seu_token>
```

## Respostas

### Sucesso

```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": { ... }
}
```

### Erro

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "details": "Detalhes adicionais"
}
```

## Licença

Governo do Estado de Rondônia - 2025
