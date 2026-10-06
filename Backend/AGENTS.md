# AGENTS.md — flux-api

Contrato de arquitetura para humanos e agentes de IA. **Consulte este arquivo antes de qualquer alteração.**

A API existe para servir o app (`../Frontend`). Só expomos o que o frontend consome.

## Endpoints (prefixo `/api`)

| Método | Rota | Auth | Feature do frontend |
|--------|------|------|---------------------|
| GET | `/health` | — | — |
| POST | `/users/register` | — | `features/auth` (tela de registro; e-mail único; rate limit) |
| POST | `/users/login` | — | `features/auth` (rate limit) |
| GET | `/users/me` | JWT | `entities/user` (menu lateral) |
| GET | `/planning?from&months` | JWT | `widgets/planning-board` (1–60 meses, padrão 6 a partir do mês atual em São Paulo) |
| PATCH | `/planning/settings` | JWT | `features/edit-plan-settings` (reserva % e reserva atual) |
| POST | `/planning/income-sources` | JWT | `features/edit-plan-settings` (adicionar renda) |
| PATCH | `/planning/income-sources/:id` | JWT | `features/edit-plan-settings` |
| POST | `/planning/expenses` | JWT | `features/create-expense` |
| PATCH | `/planning/expenses/:id` | JWT | (encerrar/editar conta) |
| PUT | `/planning/expenses/:id/months/:month` | JWT | `features/edit-expense-month` (valor/fonte só daquele mês) |
| POST | `/decisions/simulate` | JWT | `features/simulator` (usa o mês em curso do planejamento) |

Cadastro aberto: cada usuário tem o próprio planejamento (`user` em `PlanningSettings`, `IncomeSource` e `Expense`). Services recebem `(userId, params)` e os repositórios sempre filtram por `user`; recurso de outro usuário responde 404. Mesma coleção `users` do Flux (bcrypt e JWT compatíveis).

### Modelo do planejamento

- `IncomeSource` (nome, dia do pagamento, valor) · `PlanningSettings` (reserva % sobre a sobra, reserva atual) · `Expense` (valor padrão, fonte padrão, `startMonth`, `endMonth` opcional, `monthOverrides[]`).
- Mês = contas ativas (`startMonth ≤ mês ≤ endMonth`) com override do mês → `sobra = renda − gastos`, `reserva = max(0, sobra) × %`, `livre = sobra − reserva`, reserva acumulada a partir da reserva atual.
- Fonte padrão de conta nova: última renda paga até o dia do vencimento; antes da primeira renda do mês (ou sem dia) → a renda de dia mais tarde.

## Camadas e responsabilidades

| Camada | Pasta | Pode | Não pode |
|--------|-------|------|----------|
| **Domain** | `src/domain/` | Interfaces, contratos de repository, services, helpers puros, `EErrorCode`, `DomainError` | Express, Mongoose, `ErrorCatalog`, env, HTTP |
| **Infrastructure** | `src/infrastructure/` | Schemas, models `M*`/`IM*`, repos, mappers, `error-catalog`, `handleTranslatedError` | Regras de negócio, rotas HTTP |
| **Application** | `src/application/` | Controllers (`IController` + `initRoutes`), middlewares, `Server` | Models/repos concretos; lógica de negócio |
| **Configurations** | `src/configurations/` | `env`, factories (composition root), `app.factory` | Lógica de domínio ou handlers |
| **Contracts** | `src/contracts/` | `service.yaml` (OpenAPI, validado em runtime) | Código executável |
| **Tests** | `src/__tests__/` | Unit (services/helpers com fakes) e integração (supertest + mongodb-memory-server) | Lógica de produção |

## Matriz de dependências

```
application     →  domain, infrastructure (i18n helpers)
configurations  →  domain, infrastructure, application
infrastructure  →  domain
domain          →  domain apenas
__tests__       →  qualquer camada
```

## Estrutura por feature

```
src/domain/<feature>/
  entity/interfaces/<feature>.interface.ts          # E*, I*, IParamsCreate* (persistência)
  entity/interfaces/<feature>.service.interface.ts  # I*Service, IParams*Input (HTTP), results
  repository/<feature>.repository.read.ts
  repository/<feature>.repository.write.ts
  service/<feature>.service.ts
  service/<feature>.helper.ts                       # cálculos puros
src/infrastructure/
  db/mongo/schema/<feature>.schema.ts
  db/mongo/models/<feature>.model.ts
  repository/<feature>/<feature>.mapper.ts | .repository.read.ts | .repository.write.ts
src/configurations/factory/<feature>.service.factory.ts | <feature>.controller.factory.ts
src/application/controllers/<feature>.controller.ts
```

## Nomenclatura

- `I*` interface · `IM*` documento Mongo · `E*` enum · `M*` model.
- Domínio expõe `id: string`; `_id` fica no mapper.
- Imports ESM com sufixo `.js`; `import type` para tipos.
- Valores de enum iguais ao contrato persistido; aliases PT (ex.: `roxo` → `purple`) são normalizados no service.

## Fluxo de uma requisição

1. `express-openapi-validator` valida contra `service.yaml` (400 se violar o contrato).
2. Controller monta `IParams*Input` por whitelist e chama o service.
3. Service valida regras e lança `DomainError(EErrorCode.X, status)`.
4. Controller captura → `handleTranslatedError(error, ErrorCatalog, res, req)` (pt-BR, en, es).

## Persistência

- MongoDB via Mongoose; conexão cacheada em `globalThis` (serverless Vercel).
- `reserve` e `cycle-settings` são documentos únicos (`key: 'default'`), criados com valores padrão na primeira leitura.
- Sem seed: o banco começa vazio. Configuração padrão criada na primeira leitura: reserva de 30% da sobra e reserva atual R$ 0.

## Nova feature (ordem obrigatória)

1. Confirmar que o frontend consome o endpoint.
2. Domain (`entity/interfaces` · `repository` · `service`).
3. Infrastructure (schema, model, mapper, repository).
4. Configurations (service + controller factories, registrar em `app.factory.ts`).
5. Application (`*.controller.ts`).
6. `contracts/service.yaml`.
7. Testes: `*.unit.test.ts` (service/helper) + `*.int.test.ts` (endpoint).

## Erros

- Domain: `throw new DomainError(EErrorCode.X, status)`.
- Novo código: `EErrorCode.ts` + `error-catalog.ts` (pt-BR, en, es).

## Comandos antes de concluir

```bash
yarn build
yarn test:unit
yarn test:int
```
