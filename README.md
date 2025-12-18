# Geração Emprego API

<p align="center">
  <img src="https://geracaoemprego.ro.gov.br/logo.png" alt="Geração Emprego" width="200"/>
</p>

<p align="center">
  <strong>API Serverless do Portal Geração Emprego - Governo do Estado de Rondônia</strong>
</p>

<p align="center">
  <a href="#visão-geral">Visão Geral</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#instalação">Instalação</a> •
  <a href="#configuração">Configuração</a> •
  <a href="#endpoints">Endpoints</a> •
  <a href="#exemplos">Exemplos</a>
</p>

---

## Visão Geral

O **Portal Geração Emprego** é uma iniciativa do Governo do Estado de Rondônia para conectar trabalhadores a oportunidades de emprego, cursos de qualificação profissional e editais de concursos públicos.

### Estatísticas

| Métrica | Quantidade |
|---------|------------|
| Currículos cadastrados | 163.552+ |
| Empresas parceiras | 6.774+ |
| Vagas disponibilizadas | 68.614+ |

### Funcionalidades

- **Vagas de Emprego**: Cadastro e busca de oportunidades de trabalho
- **Currículos**: Gestão completa de currículos com experiências, graduações e habilidades
- **Empresas**: Cadastro de empresas e publicação de vagas
- **Cursos**: Cursos de qualificação profissional
- **Editais**: Concursos e processos seletivos públicos
- **Candidaturas**: Sistema de candidatura a vagas com notificações

---

## Tecnologias

| Tecnologia | Descrição |
|------------|-----------|
| **Node.js 18.x** | Runtime JavaScript |
| **Vercel Functions** | Serverless Functions |
| **Supabase** | Backend-as-a-Service (PostgreSQL + Auth) |
| **ES Modules** | Módulos JavaScript modernos |

---

## Estrutura do Projeto

```
geracao-emprego-api/
├── api/                          # Endpoints da API
│   ├── index.js                  # Health check e documentação
│   ├── auth/                     # Autenticação
│   │   ├── login.js              # POST /api/auth/login
│   │   ├── register.js           # POST /api/auth/register
│   │   ├── logout.js             # POST /api/auth/logout
│   │   └── profile.js            # GET|PUT /api/auth/profile
│   ├── vagas/                    # Gestão de vagas
│   │   ├── index.js              # GET|POST /api/vagas
│   │   ├── [id].js               # GET|PUT|DELETE /api/vagas/:id
│   │   ├── candidatar.js         # POST /api/vagas/candidatar
│   │   └── [id]/
│   │       └── candidatos.js     # GET /api/vagas/:id/candidatos
│   ├── empresas/                 # Gestão de empresas
│   │   ├── index.js              # GET|POST /api/empresas
│   │   └── [id].js               # GET|PUT|DELETE /api/empresas/:id
│   ├── curriculos/               # Gestão de currículos
│   │   ├── index.js              # GET|POST /api/curriculos
│   │   ├── experiencias.js       # POST|DELETE experiências
│   │   ├── graduacoes.js         # POST|DELETE graduações
│   │   └── habilidades.js        # POST|DELETE habilidades
│   ├── cursos/                   # Gestão de cursos
│   │   ├── index.js              # GET|POST /api/cursos
│   │   └── [id].js               # GET|PUT|DELETE /api/cursos/:id
│   ├── editais/                  # Gestão de editais
│   │   └── index.js              # GET|POST /api/editais
│   ├── metadata/                 # Estatísticas
│   │   └── index.js              # GET /api/metadata
│   ├── sobre/                    # Informações institucionais
│   │   └── index.js              # GET /api/sobre
│   ├── notificacoes/             # Sistema de notificações
│   │   └── index.js              # GET|POST|PUT /api/notificacoes
│   └── admin/                    # Administração
│       └── logs.js               # GET /api/admin/logs
├── lib/
│   └── supabase.js               # Cliente Supabase e helpers
├── database/
│   └── schema.sql                # Schema do banco de dados
├── .env.example                  # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
├── vercel.json                   # Configuração do Vercel
└── README.md
```

---

## Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) 18.x ou superior
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- [Vercel CLI](https://vercel.com/cli) (opcional, para deploy)
- Conta no [Supabase](https://supabase.com)

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/justr1de/geracao-emprego-api.git
cd geracao-emprego-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

---

## Configuração

### Variáveis de Ambiente

Edite o arquivo `.env` com suas credenciais:

```env
# Supabase - Obrigatório
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret - Opcional
JWT_SECRET=sua-chave-secreta-jwt
```

### Obtendo as credenciais do Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione ou crie um projeto
3. Navegue até **Settings > API**
4. Copie as seguintes informações:

| Campo no Supabase | Variável de Ambiente |
|-------------------|---------------------|
| Project URL | `SUPABASE_URL` |
| anon public | `SUPABASE_ANON_KEY` |
| service_role | `SUPABASE_SERVICE_ROLE_KEY` |

### Configuração do Banco de Dados

Execute o script SQL para criar as tabelas necessárias:

1. Acesse o **SQL Editor** no Supabase Dashboard
2. Cole o conteúdo do arquivo `database/schema.sql`
3. Execute o script

---

## Execução

### Desenvolvimento Local

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000`

### Verificar se está funcionando

```bash
curl http://localhost:3000/api
```

Resposta esperada:

```json
{
  "success": true,
  "message": "API Geração Emprego - Governo de Rondônia",
  "data": {
    "name": "Geração Emprego API",
    "version": "1.0.0",
    "status": "online"
  }
}
```

---

## Deploy

### Deploy Automático (Recomendado)

O deploy é feito automaticamente a cada push na branch `main` através da integração com o Vercel.

### Deploy Manual

```bash
# Instale o Vercel CLI globalmente
npm install -g vercel

# Faça login na sua conta Vercel
vercel login

# Deploy para ambiente de preview
vercel

# Deploy para produção
vercel --prod
```

### Configurar Variáveis no Vercel

1. Acesse o [Dashboard do Vercel](https://vercel.com)
2. Selecione o projeto
3. Vá em **Settings > Environment Variables**
4. Adicione as variáveis de ambiente

---

## Endpoints

### Health Check

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api` | Status da API e documentação |

### Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/api/auth/register` | Registrar novo usuário | Não |
| POST | `/api/auth/login` | Fazer login | Não |
| POST | `/api/auth/logout` | Fazer logout | Sim |
| GET | `/api/auth/profile` | Obter perfil | Sim |
| PUT | `/api/auth/profile` | Atualizar perfil | Sim |

### Vagas (`/api/vagas`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/vagas` | Listar vagas | Não |
| POST | `/api/vagas` | Criar vaga | Sim (Empresa) |
| GET | `/api/vagas/:id` | Obter vaga | Não |
| PUT | `/api/vagas/:id` | Atualizar vaga | Sim (Empresa) |
| DELETE | `/api/vagas/:id` | Encerrar vaga | Sim (Empresa) |
| POST | `/api/vagas/candidatar` | Candidatar-se | Sim (Candidato) |
| GET | `/api/vagas/:id/candidatos` | Listar candidatos | Sim (Empresa) |

**Parâmetros de Query (GET /api/vagas):**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `cidade` | string | Filtrar por cidade |
| `tipo` | string | Tipo de contrato |
| `salario_min` | number | Salário mínimo |
| `salario_max` | number | Salário máximo |
| `empresa_id` | uuid | Filtrar por empresa |
| `status` | string | Status (aberta/encerrada) |
| `busca` | string | Busca por título |
| `page` | number | Página (padrão: 1) |
| `limit` | number | Itens por página (padrão: 20) |

### Empresas (`/api/empresas`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/empresas` | Listar empresas | Não |
| POST | `/api/empresas` | Cadastrar empresa | Sim |
| GET | `/api/empresas/:id` | Obter empresa | Não |
| PUT | `/api/empresas/:id` | Atualizar empresa | Sim (Proprietário) |

### Currículos (`/api/curriculos`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/curriculos` | Listar currículos | Sim |
| POST | `/api/curriculos` | Criar/Atualizar currículo | Sim |
| POST | `/api/curriculos/experiencias` | Adicionar experiência | Sim |
| DELETE | `/api/curriculos/experiencias` | Remover experiência | Sim |
| POST | `/api/curriculos/graduacoes` | Adicionar graduação | Sim |
| DELETE | `/api/curriculos/graduacoes` | Remover graduação | Sim |
| POST | `/api/curriculos/habilidades` | Adicionar habilidade | Sim |
| DELETE | `/api/curriculos/habilidades` | Remover habilidade | Sim |

### Cursos (`/api/cursos`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/cursos` | Listar cursos | Não |
| POST | `/api/cursos` | Criar curso | Sim (Admin) |
| GET | `/api/cursos/:id` | Obter curso | Não |
| PUT | `/api/cursos/:id` | Atualizar curso | Sim (Admin) |
| DELETE | `/api/cursos/:id` | Excluir curso | Sim (Admin) |

### Editais (`/api/editais`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/editais` | Listar editais | Não |
| POST | `/api/editais` | Criar edital | Sim (Admin) |

### Metadata (`/api/metadata`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/metadata` | Estatísticas e dados para filtros |

### Sobre (`/api/sobre`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/sobre` | Informações gerais |
| GET | `/api/sobre?tipo=faq` | Perguntas frequentes |
| GET | `/api/sobre?tipo=termos` | Termos de uso |
| GET | `/api/sobre?tipo=politicas` | Política de privacidade |

### Notificações (`/api/notificacoes`)

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/api/notificacoes` | Listar notificações | Sim |
| POST | `/api/notificacoes` | Criar notificação | Sim (Admin) |
| PUT | `/api/notificacoes` | Marcar como lida | Sim |

---

## Exemplos

### Autenticação

#### Registrar usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "senha123",
    "nome": "João Silva",
    "tipo": "candidato"
  }'
```

#### Fazer login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@exemplo.com",
    "password": "senha123"
  }'
```

**Resposta:**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "uuid",
      "email": "joao@exemplo.com"
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "..."
    }
  }
}
```

### Vagas

#### Listar vagas

```bash
# Todas as vagas
curl http://localhost:3000/api/vagas

# Vagas em Porto Velho
curl "http://localhost:3000/api/vagas?cidade=Porto%20Velho"

# Vagas com salário mínimo de R$ 3.000
curl "http://localhost:3000/api/vagas?salario_min=3000"

# Busca por título
curl "http://localhost:3000/api/vagas?busca=desenvolvedor"
```

#### Criar vaga (autenticado como empresa)

```bash
curl -X POST http://localhost:3000/api/vagas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "titulo": "Desenvolvedor Full Stack",
    "descricao": "Buscamos desenvolvedor com experiência em Node.js e React",
    "requisitos": "Node.js, React, PostgreSQL, Git",
    "salario": 5000,
    "cidade": "Porto Velho",
    "tipo_contrato": "CLT",
    "beneficios": "VR, VT, Plano de Saúde"
  }'
```

#### Candidatar-se a uma vaga

```bash
curl -X POST http://localhost:3000/api/vagas/candidatar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "vaga_id": "uuid-da-vaga"
  }'
```

### Currículos

#### Criar currículo

```bash
curl -X POST http://localhost:3000/api/curriculos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome_completo": "João Silva",
    "cpf": "123.456.789-00",
    "telefone": "(69) 99999-9999",
    "cidade": "Porto Velho",
    "objetivo": "Desenvolvedor de Software"
  }'
```

#### Adicionar experiência

```bash
curl -X POST http://localhost:3000/api/curriculos/experiencias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "empresa": "Tech Company",
    "cargo": "Desenvolvedor Junior",
    "data_inicio": "2022-01-01",
    "data_fim": "2023-12-31",
    "descricao": "Desenvolvimento de aplicações web"
  }'
```

---

## Formato de Respostas

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
  "details": "Detalhes adicionais (opcional)"
}
```

### Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Não encontrado |
| 500 | Erro interno do servidor |

---

## Banco de Dados

### Diagrama de Tabelas

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  candidatos │     │   empresas  │     │    vagas    │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ user_id     │     │ user_id     │     │ empresa_id  │──┐
│ nome        │     │ razao_social│     │ titulo      │  │
│ cpf         │     │ cnpj        │     │ descricao   │  │
│ telefone    │     │ email       │     │ salario     │  │
│ cidade      │     │ telefone    │     │ cidade      │  │
│ ...         │     │ ...         │     │ ...         │  │
└─────────────┘     └─────────────┘     └─────────────┘  │
       │                   ▲                             │
       │                   └─────────────────────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│candidaturas │     │experiencias │     │ graduacoes  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ candidato_id│     │ candidato_id│     │ candidato_id│
│ vaga_id     │     │ empresa     │     │ instituicao │
│ status      │     │ cargo       │     │ curso       │
│ created_at  │     │ data_inicio │     │ data_inicio │
└─────────────┘     │ data_fim    │     │ data_fim    │
                    └─────────────┘     └─────────────┘
```

---

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de Código

- Use ES Modules (`import`/`export`)
- Siga o padrão de nomenclatura camelCase
- Documente funções complexas
- Adicione tratamento de erros adequado

---

## Suporte

Para dúvidas ou problemas:

- Abra uma [issue](https://github.com/justr1de/geracao-emprego-api/issues)
- Entre em contato com a equipe de desenvolvimento

---

## Licença

Este projeto é desenvolvido pelo **Governo do Estado de Rondônia** para uso público.

---

<p align="center">
  <strong>Geração Emprego</strong> - Conectando talentos a oportunidades em Rondônia
</p>

<p align="center">
  Desenvolvido por <a href="https://github.com/DevDataRO">Data-RO</a> | Governo do Estado de Rondônia
</p>
