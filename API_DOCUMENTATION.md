# 📚 API Intercom - Documentação de Endpoints

## 🌐 Informações Gerais

- **Base URL**: `http://177.53.200.55:3000`
- **Ambiente**: Produção
- **Autenticação**: JWT Bearer Token
- **Content-Type**: `application/json` (exceto upload de imagens)

---

## 🔐 Autenticação

### 1. Registrar Usuário

**Endpoint**: `POST /auth/register`

**Descrição**: Cria uma nova conta de usuário.

**Autenticação**: Não requerida

**Request Body**:

```json
{
  "name": "João Silva",
  "email": "joao.silva@minha.fag.edu.br",
  "password": "senha123"
}
```

**Validações**:

- `name`: Obrigatório, string não vazia
- `email`: Obrigatório, deve ser institucional (@minha.fag.edu.br)
- `password`: Obrigatório, mínimo 6 caracteres

**Response (201)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao.silva@minha.fag.edu.br",
  "createdAt": "2024-03-22T10:30:00.000Z"
}
```

**Erros Possíveis**:

- `400`: Dados inválidos
- `409`: Email já cadastrado

---

### 2. Login

**Endpoint**: `POST /auth/login`

**Descrição**: Autentica um usuário e retorna token JWT.

**Autenticação**: Não requerida

**Request Body**:

```json
{
  "email": "joao.silva@minha.fag.edu.br",
  "password": "senha123"
}
```

**Response (200)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao.silva@minha.fag.edu.br"
  }
}
```

**Erros Possíveis**:

- `400`: Dados inválidos
- `401`: Credenciais incorretas

**Como usar o token**:

```javascript
// Em todas as requisições autenticadas, adicione o header:
Authorization: Bearer {access_token}
```

---

## 👤 Usuários

### 3. Listar Todos os Usuários

**Endpoint**: `GET /user`

**Descrição**: Retorna lista de todos os usuários cadastrados.

**Autenticação**: ✅ JWT Bearer Token requerido

**Headers**:

```
Authorization: Bearer {access_token}
```

**Response (200)**:

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva",
    "email": "joao.silva@minha.fag.edu.br",
    "createdAt": "2024-03-22T10:30:00.000Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Maria Santos",
    "email": "maria.santos@minha.fag.edu.br",
    "createdAt": "2024-03-22T11:00:00.000Z"
  }
]
```

**Erros Possíveis**:

- `401`: Token inválido ou ausente

---

### 4. Buscar Usuário por ID

**Endpoint**: `GET /user/:id`

**Descrição**: Retorna informações de um usuário específico.

**Autenticação**: ✅ JWT Bearer Token requerido

**Parâmetros URL**:

- `id` (string): UUID do usuário

**Exemplo**: `GET /user/550e8400-e29b-41d4-a716-446655440000`

**Response (200)**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "João Silva",
  "email": "joao.silva@minha.fag.edu.br",
  "createdAt": "2024-03-22T10:30:00.000Z"
}
```

**Erros Possíveis**:

- `401`: Token inválido
- `404`: Usuário não encontrado

---

### 5. Deletar Usuário

**Endpoint**: `DELETE /user/:id`

**Descrição**: Remove um usuário do sistema.

**Autenticação**: ✅ JWT Bearer Token requerido

**Parâmetros URL**:

- `id` (string): UUID do usuário

**Exemplo**: `DELETE /user/550e8400-e29b-41d4-a716-446655440000`

**Response (200)**:

```json
{
  "message": "Usuário deletado com sucesso"
}
```

**Erros Possíveis**:

- `401`: Token inválido
- `404`: Usuário não encontrado

---

## 📝 Posts

### 6. Listar Todos os Posts

**Endpoint**: `GET /posts`

**Descrição**: Retorna lista de todos os posts (público).

**Autenticação**: ❌ Não requerida

**Response (200)**:

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "title": "Meu Primeiro Post",
    "subtitle": "Um subtítulo interessante",
    "category": "Tecnologia",
    "content": "Este é o conteúdo completo do post...",
    "images": [
      "http://177.53.200.55:9000/intercom/posts/image1.jpg",
      "http://177.53.200.55:9000/intercom/posts/image2.jpg"
    ],
    "authorId": "550e8400-e29b-41d4-a716-446655440000",
    "author": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "João Silva",
      "email": "joao.silva@minha.fag.edu.br"
    },
    "createdAt": "2024-03-22T12:00:00.000Z",
    "updatedAt": "2024-03-22T12:00:00.000Z"
  }
]
```

---

### 7. Buscar Post por ID

**Endpoint**: `GET /posts/:id`

**Descrição**: Retorna um post específico (público).

**Autenticação**: ❌ Não requerida

**Parâmetros URL**:

- `id` (string): UUID do post

**Exemplo**: `GET /posts/770e8400-e29b-41d4-a716-446655440002`

**Response (200)**:

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "title": "Meu Primeiro Post",
  "subtitle": "Um subtítulo interessante",
  "category": "Tecnologia",
  "content": "Este é o conteúdo completo do post...",
  "images": ["url1", "url2"],
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "author": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "João Silva"
  },
  "createdAt": "2024-03-22T12:00:00.000Z",
  "updatedAt": "2024-03-22T12:00:00.000Z"
}
```

**Erros Possíveis**:

- `404`: Post não encontrado

---

### 8. Criar Post

**Endpoint**: `POST /posts`

**Descrição**: Cria um novo post com upload opcional de imagens.

**Autenticação**: ✅ JWT Bearer Token requerido

**Content-Type**: `multipart/form-data`

**Headers**:

```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Data**:

```
title: "Título do Post" (obrigatório)
subtitle: "Subtítulo" (opcional)
category: "Categoria" (opcional)
content: "Conteúdo completo do post" (obrigatório)
authorId: "550e8400-e29b-41d4-a716-446655440000" (obrigatório)
images: [File, File, ...] (opcional, máximo 6 arquivos)
```

**Validação de Imagens**:

- Máximo: 6 imagens por post
- Tamanho máximo: 2MB por imagem
- Formatos aceitos: jpg, jpeg, png, webp

**Exemplo JavaScript (Fetch)**:

```javascript
const formData = new FormData();
formData.append('title', 'Meu Post');
formData.append('subtitle', 'Subtítulo');
formData.append('category', 'Tecnologia');
formData.append('content', 'Conteúdo do post...');
formData.append('authorId', userId);

// Adicionar imagens
const fileInput = document.querySelector('input[type="file"]');
for (let file of fileInput.files) {
  formData.append('images', file);
}

const response = await fetch('http://177.53.200.55:3000/posts', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

**Response (201)**:

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "title": "Meu Post",
  "subtitle": "Subtítulo",
  "category": "Tecnologia",
  "content": "Conteúdo do post...",
  "images": [
    "http://177.53.200.55:9000/intercom/posts/uuid1.jpg",
    "http://177.53.200.55:9000/intercom/posts/uuid2.jpg"
  ],
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-03-22T12:00:00.000Z",
  "updatedAt": "2024-03-22T12:00:00.000Z"
}
```

**Erros Possíveis**:

- `400`: Dados inválidos ou arquivo muito grande
- `401`: Token inválido
- `413`: Arquivo excede 2MB

---

### 9. Atualizar Post

**Endpoint**: `PATCH /posts/:id`

**Descrição**: Atualiza um post existente.

**Autenticação**: ✅ JWT Bearer Token requerido

**Content-Type**: `multipart/form-data`

**Parâmetros URL**:

- `id` (string): UUID do post

**Form Data**: (todos campos são opcionais)

```
title: "Novo Título"
subtitle: "Novo Subtítulo"
category: "Nova Categoria"
content: "Novo Conteúdo"
images: [File, File, ...] (novas imagens substituem as antigas)
```

**Exemplo**: `PATCH /posts/770e8400-e29b-41d4-a716-446655440002`

**Response (200)**: Retorna o post atualizado

**Erros Possíveis**:

- `400`: Dados inválidos
- `401`: Token inválido
- `404`: Post não encontrado

---

### 10. Deletar Post

**Endpoint**: `DELETE /posts/:id`

**Descrição**: Remove um post do sistema.

**Autenticação**: ✅ JWT Bearer Token requerido

**Parâmetros URL**:

- `id` (string): UUID do post

**Exemplo**: `DELETE /posts/770e8400-e29b-41d4-a716-446655440002`

**Response (200)**:

```json
{
  "message": "Post deletado com sucesso"
}
```

**Erros Possíveis**:

- `401`: Token inválido
- `404`: Post não encontrado

---

## 🎯 Exemplo de Fluxo Completo

### 1. Registrar e Fazer Login

```javascript
// 1. Registrar usuário
const registerResponse = await fetch(
  'http://177.53.200.55:3000/auth/register',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'João Silva',
      email: 'joao.silva@minha.fag.edu.br',
      password: 'senha123',
    }),
  },
);
const user = await registerResponse.json();

// 2. Fazer login
const loginResponse = await fetch('http://177.53.200.55:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'joao.silva@minha.fag.edu.br',
    password: 'senha123',
  }),
});
const { access_token, user: userData } = await loginResponse.json();

// Salvar token para próximas requisições
localStorage.setItem('token', access_token);
localStorage.setItem('userId', userData.id);
```

### 2. Criar um Post com Imagens

```javascript
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');

const formData = new FormData();
formData.append('title', 'Meu Primeiro Post');
formData.append('subtitle', 'Uma jornada incrível');
formData.append('category', 'Tecnologia');
formData.append('content', 'Este é o conteúdo completo...');
formData.append('authorId', userId);

// Adicionar imagens do input file
const fileInput = document.querySelector('#imageInput');
for (let file of fileInput.files) {
  formData.append('images', file);
}

const response = await fetch('http://177.53.200.55:3000/posts', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const post = await response.json();
console.log('Post criado:', post);
```

### 3. Listar Posts (Público)

```javascript
const response = await fetch('http://177.53.200.55:3000/posts');
const posts = await response.json();

posts.forEach((post) => {
  console.log(`${post.title} - por ${post.author.name}`);
});
```

---

## ⚠️ Problemas de Segurança Identificados

### 🔴 CRÍTICO

1. **CORS não configurado**
   - Frontend em outro domínio não funcionará
   - Necessário habilitar CORS no `main.ts`

2. **Senha exposta no response**
   - A senha hash está sendo retornada nas respostas de usuário
   - Vulnerabilidade de segurança

### 🟡 MÉDIO

3. **Falta validação de propriedade**
   - Qualquer usuário autenticado pode deletar/editar posts de outros
   - Necessário verificar se o usuário é o autor

4. **Falta Rate Limiting**
   - API vulnerável a ataques de força bruta
   - Recomendado adicionar throttling

5. **Senha fraca aceita**
   - Mínimo de 6 caracteres é muito baixo
   - Recomendado: mínimo 8 caracteres + complexidade

---

## 🔧 Correções Recomendadas

```typescript
// 1. Habilitar CORS em src/main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://seu-frontend.com'],
  credentials: true,
});

// 2. Remover senha do response (User Entity)
@Exclude()
@Column()
password: string;

// 3. Adicionar validação de autorização nos controllers
// Verificar se req.user.id === post.authorId antes de editar/deletar
```

---

## 📊 Armazenamento de Imagens

- **Serviço**: MinIO S3
- **Endpoint**: `http://177.53.200.55:9000`
- **Console**: `http://177.53.200.55:9001`
- **Bucket**: `intercom`
- **Path**: `/intercom/posts/{uuid}.{ext}`

As URLs das imagens são retornadas automaticamente nos posts.

---

## 🚀 Informações do Deploy

- **Host**: 177.53.200.55
- **API Port**: 3000
- **PostgreSQL Port**: 5433 (interno: 5432)
- **MinIO Port**: 9000
- **MinIO Console**: 9001
- **Containers**: api-intercom, postgres-prod, minio-prod

**Status**: ✅ Operacional

---

## 📝 Notas Importantes

1. Todos os IDs são UUIDs v4
2. Timestamps em formato ISO 8601 (UTC)
3. Senhas são hashadas com bcrypt
4. JWT não expira (considerar adicionar expiração)
5. Email institucional obrigatório: `@minha.fag.edu.br`

---

## 🐛 Reportar Problemas

Em caso de bugs ou problemas, documente:

- Endpoint usado
- Request body completo
- Response recebido
- Token JWT (se aplicável)
- Logs do servidor

---

**Última Atualização**: 2024-03-22
**Versão**: 1.0.0
