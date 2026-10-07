# Flux

**Quanto eu posso gastar agora sem comprometer o resto do mês, e os próximos?**

Flux é um app de planejamento financeiro pessoal que responde essa pergunta. Em vez de só registrar gastos passados, ele projeta os próximos meses a partir das rendas, contas fixas, parcelas e da reserva que você quer guardar, e mostra o valor realmente livre hoje.

<p align="center">
  <img src="docs/screenshots/dashboard.png" width="200" alt="Dashboard" />
  <img src="docs/screenshots/planejamento.png" width="200" alt="Planejamento" />
  <img src="docs/screenshots/contas.png" width="200" alt="Contas" />
  <img src="docs/screenshots/simulador.png" width="200" alt="Simulador" />
</p>
<p align="center"><sub>Telas com dados fictícios.</sub></p>

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-57-000020?logo=expo&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

## Funcionalidades

- **Dashboard**: visão do mês atual com renda, gastos, reserva e quanto está livre.
- **Planejamento**: projeção de 1 a 60 meses. Cada mês considera as contas ativas, sobrescritas pontuais e a reserva acumulada.
- **Contas**: contas fixas e parceladas com início/fim, valor e fonte de renda por mês (ex.: só a conta de luz de dezembro foi maior).
- **Rendas**: múltiplas fontes com dia de pagamento, e entradas avulsas que contam só no mês atual. Contas novas são associadas automaticamente à renda que cai antes do vencimento.
- **Simulador**: "posso comprar isso?". Avalia o gasto contra o valor livre do mês e devolve um veredito (ok / atenção / não cabe) com o impacto.
- **Exportação**: planejamento exportável em CSV.
- **Multiusuário**: cadastro aberto com JWT; cada usuário só enxerga o próprio planejamento.

### Como o mês é calculado

```
sobra    = renda − gastos
reserva  = max(0, sobra) × % de reserva
livre    = sobra − reserva
```

A reserva acumula mês a mês a partir do saldo de reserva atual.

## Arquitetura

Monorepo com Yarn workspaces:

```
./
├── Frontend/   # App Expo / React Native (iOS, Android e Web)
├── Backend/    # API REST em Express 5 + MongoDB
└── .github/    # CI de OTA updates
```

### Frontend: Feature-Sliced Design

```
src/
├── app/        # providers, roteamento, bootstrap
├── pages/      # dashboard, planejamento, contas, simulador
├── widgets/    # blocos compostos (planning-board, expenses-board…)
├── features/   # casos de uso (auth, create-expense, simulator…)
├── entities/   # modelos de domínio (user, planning, decision, session)
└── shared/     # UI kit, client HTTP, design tokens, utils
```

- **TanStack Query** para estado de servidor (cache, invalidação, mutations) e **Zustand** só para estado de cliente (sessão, UI).
- **NativeWind** (Tailwind) para estilo, compartilhado entre nativo e web.
- Cada camada só importa das camadas abaixo dela.

### Backend: Clean Architecture

| Camada | Responsabilidade |
|--------|------------------|
| `domain/` | Entidades, regras de negócio e contratos de repositório. Sem Express, Mongoose nem env |
| `infrastructure/` | Schemas Mongoose, repositórios, i18n de erros, segurança (bcrypt/JWT) |
| `application/` | Controllers, middlewares (auth, rate limit), servidor HTTP |
| `configurations/` | Composition root: env e factories que injetam as dependências |
| `contracts/` | Contrato **OpenAPI** (`service.yaml`), validado em runtime em toda requisição |

Os services recebem `(userId, params)` e os repositórios sempre filtram por usuário. Um recurso de outro usuário responde 404.

## Qualidade

- **Testes de unidade** dos services e helpers de domínio com fakes.
- **Testes de integração** da API com Supertest + `mongodb-memory-server`.
- **Testes de unidade no app** (Jest) para a lógica das features: validação de formulários, montagem de payloads, stores e exportação CSV.
- TypeScript estrito nos dois lados (`yarn typecheck`).

## Deploy

- **API e Web**: Vercel (serverless function para `/api/*`, export estático do Expo para a web).
- **Mobile**: builds via EAS. Em push na `main`, um workflow do GitHub Actions classifica a mudança: se for só JS, publica um **OTA update** com `expo-updates`; se tocar código nativo, avisa que é preciso um build novo.

## Evolução do projeto

O Flux começou como **finCaixas**, com frontend e API em repositórios separados, e foi unificado neste monorepo em julho de 2026.

A primeira versão ([Flux v1](https://github.com/Alex1Ribas/Flux-v1)) organizava o dinheiro em **caixas**: cada entrada era distribuída entre envelopes, cada saída debitava uma caixa e contas e cartão geravam comprometimento até serem pagos. Usando no dia a dia, o modelo se mostrou trabalhoso: tudo precisava ser registrado, distribuído e liquidado.

Em outubro de 2026 o produto foi redesenhado em torno do **planejamento** em vez do registro: você descreve rendas e contas, e o app projeta os meses seguintes. A troca manteve o mesmo app em produção (mesmo projeto EAS, canal OTA, API e base de usuários) e reduziu o código em cerca de 70%:

| | v1 (caixas) | v2 (planejamento) |
|---|---|---|
| Operações da API | 35 | 11 |
| Código (front + back) | ~19,8 mil linhas | ~6,7 mil linhas |
| Telas | 10 | 4 |
| Frontend | Pastas por tipo técnico + Expo Router | Feature-Sliced Design |

## Rodando localmente

Pré-requisitos: Node 20+, Yarn 1 e uma instância do MongoDB.

```bash
yarn install

cp Backend/.env.example Backend/.env     # MONGODB_URI, JWT_SECRET, ...
cp Frontend/.env.example Frontend/.env   # EXPO_PUBLIC_FLUX_API_URL=http://localhost:3000/api

yarn dev:api          # API em http://localhost:3000/api
yarn dev:app          # App (Expo)
yarn dev:web          # Web (Expo)
```

```bash
yarn typecheck
yarn test:api
yarn test:app
```

Em dev, o app usa `EXPO_PUBLIC_FLUX_API_URL`. Em build de produção, usa `extra.fluxApiBaseUrl` do `app.json`.

## Licença

[MIT](LICENSE) © Alex Ribas
