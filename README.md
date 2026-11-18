# CRM Pro — Prova P2 de Laboratório de Front-end

Aplicação CRM desenvolvida com **Vite, React e TypeScript** para gerenciar clientes, pedidos e histórico de atendimento. O projeto usa a API local fornecida pela professora e funciona com dados persistidos em JSON.

## Repositório

- GitHub: https://github.com/Leonardo-Paulucci/p2-front

## Tecnologias

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- Context API
- CSS responsivo

## Estrutura principal

```text
src/
├── components/       Layout, rota protegida e estados de interface
├── context/          Contexto de autenticação
├── pages/            Telas do CRM
├── services/         Configuração Axios e tratamento de erros
├── utils/            Cálculos puros, filtros e formatação
├── types.ts          Tipos TypeScript
├── App.tsx           Rotas da aplicação
└── App.css           Estilos responsivos
```

Os totais de pedidos, totais por cliente, selo, ticket médio e Top 3 ficam centralizados em funções puras de `src/utils/calculations.ts`.

## Pré-requisitos

- Node.js 18 ou superior
- Servidor `servidor-crm` fornecido pela professora
- O terminal do servidor e o terminal do front precisam ficar abertos ao mesmo tempo

## 1. Iniciar o servidor da professora

Abra um terminal na pasta principal e execute:

```powershell
cd servidor-crm
npm install
npm start
```

O servidor ficará disponível em:

```text
http://localhost:3333
```

Para restaurar todos os dados originais, pare o servidor e execute:

```powershell
cd servidor-crm
npm run reset
```

## 2. Configurar o front-end

A raiz deste projeto já contém o arquivo `.env`:

```env
VITE_API_URL=http://localhost:3333
```

A URL é acessada pelo código com `import.meta.env.VITE_API_URL`. Nunca fixe a URL da API diretamente no código de componentes ou serviços.

Se alterar o `.env`, reinicie o servidor do Vite.

## 3. Instalar e executar

Em outro terminal:

```powershell
cd crm-front
npm install
npm run dev
```

Abra o endereço informado pelo Vite, normalmente:

```text
http://127.0.0.1:5173

ou

http://localhost:5173/
```

## Conta de teste

```text
Usuário: emilys
Senha: emilyspass
```

O login usa `POST /auth/login` e recebe `accessToken`. O token é salvo no navegador e enviado nas demais chamadas no header:

```text
Authorization: Bearer <accessToken>
```

Se o servidor reiniciar, o token antigo perde a validade e o app volta ao Login.

## Funcionalidades implementadas

### Login e segurança

- Login com usuário e senha
- Sessão protegida por Context
- Rotas privadas
- Retorno à página que o usuário tentou abrir antes do login
- Logout que remove o token
- Tratamento automático de `401`

### Clientes

- Lista paginada de 5 em 5 usando `limit` e `skip`
- Busca por nome ou e-mail usando `q`
- Estados de carregamento, vazio e erro
- Detalhe do cliente
- Criar e editar cliente
- Validação de nome, e-mail e pelo menos dois campos opcionais
- Excluir cliente com confirmação informando pedidos e atendimentos relacionados
- Selo VIP, Regular ou Sem compras

### Pedidos

- Listagem com data, status e total calculado no front
- Criação com pelo menos um item
- Validação de título, preço e quantidade
- Editar itens somente em pedidos abertos
- Abrir -> Pago ou Cancelado
- Pago -> Cancelado
- Cancelado sem ações de alteração
- Exclusão com confirmação
- Atualização da lista e dos indicadores após todas as operações

### Histórico de atendimento

- Mais recente primeiro
- Filtro por telefone, e-mail, WhatsApp, presencial ou todos
- Contador de atendimentos acompanhando o filtro
- Criar, editar e excluir atendimento

### Painel e pedidos gerais

- Total de clientes
- Total vendido sem pedidos cancelados
- Ticket médio sem pedidos cancelados
- Quantidade e valor por status
- Top 3 clientes por compra válida
- Todos os pedidos com nome do cliente
- Filtro por status
- Filtro por faixa de valor
- Ordenação por data ou total

### Erros e páginas

- Mensagens na tela para `400`, `401`, `404`, `409`, `500` e sem rede
- `try/catch/finally` com carregamento finalizado no `finally`
- Página `/xyz` para rota inexistente
- Mensagem “Cliente não encontrado” em `/clientes/999`

## API utilizada

Rotas principais fornecidas pelo servidor:

- `POST /auth/login`
- `GET /auth/me`
- `GET /clientes?q=&limit=&skip=`
- `GET /clientes/:id`
- `POST /clientes`
- `PATCH /clientes/:id`
- `DELETE /clientes/:id`
- `GET /pedidos`
- `GET /clientes/:id/pedidos`
- `POST /clientes/:id/pedidos`
- `PATCH /pedidos/:id`
- `DELETE /pedidos/:id`
- `GET /clientes/:id/atendimentos`
- `POST /clientes/:id/atendimentos`
- `PATCH /atendimentos/:id`
- `DELETE /atendimentos/:id`

O total de cada pedido é calculado no front pela soma de `preço × quantidade`. Preços devem ser enviados como números usando ponto decimal.

Os canais aceitos pelo servidor são:

```text
telefone
email
whatsapp
presencial
```

## Build de produção

```powershell
npm run build
npm run preview
```

O build deve concluir sem erros de TypeScript.

## Checklist antes da entrega

- [ ] O servidor está iniciado e o front abre normalmente
- [ ] Login e logout funcionam
- [ ] Página protegida sem login abre o Login e retorna ao destino
- [ ] Busca e paginação de clientes funcionam
- [ ] Criar, editar e excluir cliente funcionam
- [ ] Confirmação de exclusão mostra pedidos e atendimentos
- [ ] Criar pedido valida todos os itens
- [ ] Pedido cancelado não permite editar itens ou mudar status
- [ ] Histórico filtra canais e atualiza o contador
- [ ] Criar, editar e excluir atendimento funcionam
- [ ] Painel, Top 3 e selo ignoram pedidos cancelados
- [ ] `/xyz` mostra página não encontrada
- [ ] `/clientes/999` mostra Cliente não encontrado
- [ ] Senha inválida, e-mail repetido e erro `500` mostram mensagens na tela
- [ ] Reiniciar o servidor força nova autenticação
- [ ] Layout funciona em celular com 375 px sem rolagem lateral
- [ ] O console não contém erros vermelhos
- [ ] `npm run build` termina sem erros
- [ ] O ZIP não contém `node_modules`
- [ ] O ZIP não contém a pasta `servidor-crm`
- [ ] O README contém o link do GitHub
- [ ] O projeto possui commits no GitHub


## Entrega no AVA


1. Crie um repositório novo no GitHub para o CRM.
2. Faça commits durante o desenvolvimento.
3. Gere o ZIP apenas da pasta `crm-front`, sem `node_modules`, `dist` ou `servidor-crm`.
4. Suba o ZIP no AVA até as 22:10.
5. Cole o link do GitHub no campo ou comentário da entrega.
6. Confira se o link do GitHub está também neste README.
