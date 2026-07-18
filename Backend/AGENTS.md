# AGENTS.md — finance-api

Contrato de arquitetura para humanos e agentes de IA. **Consulte este arquivo antes de qualquer alteração.**

## Camadas e responsabilidades

| Camada | Pasta | Pode | Não pode |
|--------|-------|------|----------|
| **Domain** | `src/domain/` | Entidades, interfaces, contratos de repository, services, `EErrorCode`, `DomainError`, helpers puros | Express, Mongoose, `ErrorCatalog`, env, HTTP |
| **Infrastructure** | `src/infrastructure/` | Schemas `IM*`, models `M*`, repos, mappers, JWT/bcrypt, `error-catalog`, `handleTranslatedError` | Regras de negócio, rotas HTTP |
| **Application** | `src/application/` | Controllers (`IController` + `initRoutes`), middlewares | Mongoose/models direto; lógica de negócio |
| **Configurations** | `src/configurations/` | `env`, factories (composition root) | Lógica de domínio ou handlers |
| **Contracts** | `src/contracts/` | `service.yaml` (OpenAPI) | Código executável |
| **Tests** | `src/__tests__/` | Testes por camada | Lógica de produção |

## Matriz de dependências

```
application     →  domain, infrastructure (i18n helpers, middlewares)
configurations  →  domain, infrastructure, application
infrastructure  →  domain
domain          →  domain apenas
__tests__       →  qualquer camada
```

**Proibido:** `domain` importar `express`, `mongoose`, `application`, `infrastructure`; controllers importarem `M*` ou repos concretos; factories fora de `configurations/factory`; pasta `routes/` separada de controllers.

## Nomenclatura

- `I*` interface · `IM*` Mongoose doc · `E*` enum · `M*` model
- Controller: `*.controller.ts`, `implements IController`, `router` + `initRoutes()`

## Contratos de domínio: persistência vs caso de uso

**Sempre dois arquivos** em `entity/interfaces/` (ver [`.cursor/rules/domain-contratos-finance-api.mdc`](.cursor/rules/domain-contratos-finance-api.mdc)):

| Arquivo | Conteúdo |
|---------|----------|
| `<feature>.interface.ts` | Entidade: `E*`, `I*`, `IParams*` que **criam/persistem** o agregado |
| `<feature>.service.interface.ts` | Caso de uso: `I*Service`, `IParams*` de fluxos (login, update, …), ports, results |

- `user.interface.ts` **não** importa `user.service.interface.ts`.
- `IParamsCreateUser` → entidade; `IParamsLoginUser` / `IParamsUpdateUser` → service.

## Enums (`E*`) — localização obrigatória

**Nunca** criar pasta `src/domain/common/enums/` para enums de entidade (ex.: `EPaymentMethod`, `ETransactionStatus`). **Nunca** `src/domain/<feature>/enums/E*.ts`.

| Tipo de enum | Onde declarar | Exemplo |
|--------------|---------------|---------|
| **Persistência / entidade** | `entity/interfaces/<feature>.interface.ts` | `EUserRole`, `EPaymentMethod`, `ETransactionStatus` |
| **Caso de uso / fluxo** | `entity/interfaces/<feature>.service.interface.ts` | `EReportType`, `ECredentialVerifyStatus` |
| **Erros cross-cutting** | `domain/common/errors/enums/EErrorCode.ts` | única exceção em `common/` |

### Regras

1. Enum usado em `I*`, `IParamsCreate*` ou schema do agregado → **sempre** em `<feature>.interface.ts` (junto com a entidade).
2. Enum só de fluxo (relatório, login, port) → `<feature>.service.interface.ts`.
3. **Proibido** extrair enums de entidade para `domain/common/enums/` “porque são compartilhados” entre features. Se income e expense usam os mesmos valores, **declare em cada** `income.interface.ts` e `expense.interface.ts` (valores idênticos ao contrato persistido / TCC).
4. Infrastructure importa enums de entidade **do** `domain/<feature>/entity/interfaces/<feature>.interface.ts` do agregado correspondente (ex.: schema de Income → `income.interface.ts`).
5. Precedente: `EUserRole` em `user.interface.ts` — siga o mesmo padrão.

Detalhes e checklist: [`.cursor/rules/domain-contratos-finance-api.mdc`](.cursor/rules/domain-contratos-finance-api.mdc).

## Segurança em repositories

Ver [`.cursor/rules/domain-seguranca-repositorio.mdc`](.cursor/rules/domain-seguranca-repositorio.mdc):

- **Proibido** métodos como `findUserByEmailWithPassword` (ou similares) em contratos `repository/`.
- Login: port `IUserCredentialsPort` em `user.service.interface.ts`; implementação só em `infrastructure/`.
- `IUserRepositoryRead` retorna apenas `IUser` (sem senha/hash).

## Segurança HTTP e autorização

Ver [`.cursor/rules/seguranca-api-finance-api.mdc`](.cursor/rules/seguranca-api-finance-api.mdc) e [`SECURITY.md`](SECURITY.md).

### Papéis (`EUserRole`)

| Enum | Papel | Escopo |
|------|-------|--------|
| `USER` | Titular | CRUD global; cria dependentes via `POST /users` |
| `DEPENDENT` | Dependente | Só recursos próprios (`record.user === jwt._id`) |

### Matriz resumida

| Tipo | Exemplos |
|------|----------|
| Pública | `POST /users/register` (1º titular), `POST /users/login` |
| JWT qualquer | `GET/PUT /incomes\|expenses/:id` (com ownership no service), `POST /reports`, `GET /users/:id` (self ou titular) |
| Só titular | `POST /users`, `GET /users`, `POST/GET/DELETE /incomes\|expenses` |

### Checklist antes de merge (endpoint novo)

- [ ] Ownership validado no **service** (`assertResourceAccess`) para rotas `:id`
- [ ] OpenAPI atualizado (`403`, sem campos privilegiados em register)
- [ ] Testes em `__tests__/integration/security/` se houver auth cross-user

## Nova feature (ordem obrigatória)

1. Domain (`entity/interfaces/<feature>.interface.ts` + `<feature>.service.interface.ts` · `entity/` · `repository/` · `service/`)
2. Infrastructure (schema, model, mapper, repository impl)
3. Configurations (service + controller factories)
4. Application (`*.controller.ts`)
5. `contracts/service.yaml`
6. Testes: `*.unit.test.ts` (schema) + `*.int.test.ts` (endpoint)

## Testes por camada

| Alteração | Teste | Sufixo |
|-----------|-------|--------|
| Schema Mongoose | Unit | `*.unit.test.ts` em `__tests__/unit/.../schema/` |
| Endpoint HTTP | Integração E2E | `*.int.test.ts` em `__tests__/integration/<feature>/` |
| Auth / IDOR | Segurança E2E | `*.security.int.test.ts` em `__tests__/integration/security/` |

## Erros

- Domain: `throw new DomainError(EErrorCode.X, status)`
- Application: `catch` → `handleTranslatedError(error, ErrorCatalog, res, req)`
- Novo código: `EErrorCode.ts` + `error-catalog.ts` (pt-BR, en, es)

## Comandos antes de concluir

```bash
yarn build
yarn test:unit
yarn test:int
```

## Regra para IA

1. **Leia este arquivo** e as rules em [`.cursor/rules/`](.cursor/rules/) antes de criar ou mover arquivos em `src/`.
2. Se a mudança violar contratos (enums, interfaces, repositories, camadas), **pare** e corrija — não improvise `common/enums/`, `routes/` ou pastas `enums/` por feature.
3. Ao adicionar enum novo, classifique: persistência → `*.interface.ts`; caso de uso → `*.service.interface.ts`; erro → `EErrorCode` apenas.
