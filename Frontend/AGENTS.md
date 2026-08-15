# flux — instruções para agentes

## Documentação Expo

Leia a documentação versionada antes de escrever código:
https://docs.expo.dev/versions/v57.0.0/

## Estrutura do projeto

```
src/
├── app/              # Rotas Expo Router (index.tsx, _layout.tsx)
├── components/
│   ├── ui/           # Implementação base de UI (compatibilidade)
│   ├── home/         # Agrupamentos visuais da Home
│   ├── dashboard/    # Agrupamentos visuais do Dashboard
│   ├── acompanhamento/ # Agrupamentos visuais da Previsão/Acompanhamento
│   ├── flux/    # Componentes visuais de domínio
│   ├── onboarding/   # Carrossel onboarding
│   └── navigation/   # NavBar
├── pages/            # Páginas: composição de agrupamentos + navegação
├── shared/
│   ├── components/   # UI global: botões, campos, cards, modais, badges
│   ├── design-tokens.ts
│   ├── icons.tsx
│   └── caixa-styles.ts
├── service/          # Regras de negócio puras por feature
│   ├── home/
│   ├── caixas/
│   ├── configurar/
│   ├── dashboard/
│   ├── acompanhamento/
│   ├── parcelamento/
│   ├── planilhas/
│   ├── previsao/
│   ├── risco/
│   └── store/
├── entities/         # Zustand, estado de tela/componente, selectors e effects
├── hooks/            # Hooks reutilizáveis, não específicos de uma única tela
├── api/              # Clients/adapters HTTP futuros
├── queries/          # TanStack Query: provider, query keys e hooks remotos futuros
├── types/            # Tipos TypeScript
└── utils/            # helpers, risco, previsao
```

Stack: Expo 57, React Native, TypeScript, NativeWind 4, Zustand e TanStack Query.

## Filosofia de negócio — Caixas

As Caixas **não são categorias de gastos**. Separar claramente: receita, origem, distribuição, orçamento, comprometimento, obrigação e movimentação.

Há **três tipos** de caixa:

- **Origem:** ponto de entrada da receita (ex.: Salário). A efetivação credita primeiro aqui.
- **Objetivo:** meta de acúmulo + aporte mensal planejado (prazo estimado = meta / aporte).
- **Orçamento:** envelope de alocação com limite mensal de gastos (limites diário/semanal derivados).

O usuário deve pensar:

- Entrada: "De qual origem veio o dinheiro?" → depois "Para quais caixas alocar?"
- Distribuição: organiza dinheiro já recebido (não é despesa nem conta a pagar).
- Saída: "De qual caixa de alocação esse dinheiro saiu?" (respeitando disponível = saldo − comprometido)
- Orçamento: limite planejado, não saldo.
- Comprometimento: parte do saldo já reservada por obrigações abertas do mês.
- Caixas: "Onde meu patrimônio está organizado?"
- Acompanhamento: "Como minhas decisões impactam o risco do mês?" (fórmula de risco inalterada)

A pergunta principal do app não é "Com o que você gastou?", e sim "De qual parte do patrimônio esse dinheiro saiu?".

### Lançamentos e recorrência

Recorrentes e avulsos ficam na **mesma coleção** de lançamentos, diferenciados por `recorrente: true/false`. Quando `recorrente` é true, use também `competenciaInicial`, `duracaoMeses` e `ativo` para o planejamento mensal.

Ao criar ou alterar fluxos:

- Toda entrada presente exige `caixaOrigem` (tipo origem) e credita só essa caixa.
- Distribuição (`POST /lancamentos/:id/distribuir`) move da origem para caixas de alocação.
- Toda saída presente (exceto cartão) reduz a caixa de alocação por `caixaOrigem`, validando disponível.
- Compra no cartão (`meioPagamento: cartao`) não debita na hora; gera obrigação/comprometimento.
- Conta a pagar aberta compromete saldo; liquidar debita e libera comprometimento.
- Textos de UI devem reforçar origem → distribuição → alocação → pagamento.
- Evitar usar "categoria" como pergunta principal do fluxo.
- Acompanhamento calcula risco mensal pela fórmula existente; `caixasResumo` só enriquece a visão de saldos.

## Configuração de build (não remover)

Estes arquivos na raiz são **obrigatórios** para o app funcionar:

| Arquivo                       | Função                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `babel.config.js`             | Preset Expo + plugin NativeWind                                                                  |
| `metro.config.js`             | Bundler + processamento do `global.css`                                                          |
| `tailwind.config.js`          | **Fonte única de estilização** — cores, spacing, radius, fontes + `colorsFlat` exportado para RN |
| `src/shared/design-tokens.ts` | Reexporta tokens tipados (importa de `tailwind.config.js`)                                       |
| `nativewind-env.d.ts`         | Tipagem TypeScript para `className`                                                              |

## Arquivos gerados automaticamente (não commitar)

| Item            | O que é                                                            |
| --------------- | ------------------------------------------------------------------ |
| `.expo/`        | Cache local do Expo (já no `.gitignore`)                           |
| `expo-env.d.ts` | Tipos gerados pelo Expo ao rodar `expo start` (já no `.gitignore`) |

Não editar nem versionar. O Expo recria ao iniciar o dev server.

## Editor

Recomenda-se a extensão **Expo Tools** (`expo.vscode-expo-tools`) no VS Code/Cursor.

Ativar **Format on Save** com Prettier como formatador padrão.

### Hooks Git (recomendado)

```bash
git config core.hooksPath .githooks
```

O hook `commit-msg` bloqueia commits com `Co-authored-by: Cursor`.

## Formatação (Prettier)

Configuração em `.prettierrc` — principalmente `singleAttributePerLine: true`.

```bash
yarn format        # formata o projeto
yarn format:check  # verifica sem alterar
yarn validate      # typecheck + format:check + lint (antes de PR)
yarn ci            # validação completa incluindo build (espelha o CI)
```

### Padrão JSX (referência: `src/pages/ConfigurarScreen.tsx`)

Componentes com 2+ props: **uma prop por linha**, nesta ordem:

1. `label` / `title` / `key`
2. `icon` / `value` / `children`
3. `onPress` / `onChangeText` / handlers
4. `size` / `variant` / `className`
5. `style` por último

```tsx
<Btn
  label={salvo ? "Salvo!" : "Salvar Configurações"}
  icon={salvo ? Check : undefined}
  onPress={salvar}
  size="lg"
  variant={salvo ? "success" : "primary"}
  style={{ marginTop: 12 }}
/>
```

Ver também `.cursor/rules/formato-jsx.mdc`.

## Navegação — 4 pilares

O app usa navegação interna em [`src/app/index.tsx`](src/app/index.tsx) (não rotas Expo Router para telas principais).

| Aba        | Tela              | Pergunta                                                       |
| ---------- | ----------------- | -------------------------------------------------------------- |
| Movimentar | `HomeScreen`      | Para qual caixa esse dinheiro vai? De qual caixa ele saiu?     |
| Previsão   | `PrevisaoScreen`  | Como minhas decisões, parcelas e recorrências impactam o mês?  |
| Caixas     | `CaixasScreen`    | Onde meu patrimônio está organizado agora?                     |
| Planilhas  | `PlanilhasScreen` | Como os movimentos fecham o histórico e a evolução financeira? |

Onboarding em carrossel na primeira abertura (`OnboardingScreen` + AsyncStorage).

Telas empilhadas (sem tab bar): `parcelamento`, `configurar`. Lançamentos (entrada/saída) ficam na `HomeScreen`.

**Store único** ([`store.ts`](src/entities/store/store.ts)): toda movimentação atualiza `caixas` ou `lancamentos`; entities derivam modelos de tela e chamam `service` para decisões de negócio.

## Arquitetura de camadas

| Camada                  | Responsabilidade                                                         |
| ----------------------- | ------------------------------------------------------------------------ |
| `pages/`                | Telas completas, navegação e composição dos agrupamentos                 |
| `components/<feature>/` | Agrupamentos visuais de uma tela ou domínio                              |
| `shared/components/`    | UI global reutilizável: botões, campos, cards, modais, badges, headers   |
| `service/<feature>/`    | Regra de negócio pura: montar, validar, executar, calcular               |
| `entities/<feature>/`   | Zustand, estado de tela/componente, selectors, `useEffect`, orquestração |
| `hooks/`                | Hooks reutilizáveis e genéricos entre telas/componentes                  |
| `api/`                  | Clients/adapters HTTP e DTOs futuros                                     |
| `queries/`              | TanStack Query: provider, query keys, hooks remotos e invalidações       |
| `utils/`                | Funções genéricas sem domínio forte                                      |

Direção de dependência:

```txt
pages -> components/entities
components -> shared/types
entities -> hooks/service/store/queries
queries -> api
service -> utils/types/shared
```

`service` não importa React, Zustand nem componentes. Componentes visuais não devem importar `useStore`; receba dados por props.

## Regras de negócio (`src/service/`)

Lógica de **decisão** (validar, montar input, executar) fica em pastas por feature — **não** em `pages/`.

```
src/service/
├── home/                 # Movimentações da Home
├── caixas/               # CRUD e validação de caixas
├── configurar/           # Edição em lote de saldos/orçamentos
├── dashboard/            # Métricas e visual de risco por caixa
├── acompanhamento/       # Risco mensal, impactos e recorrentes
├── parcelamento/         # Criação de parcelamentos
├── planilhas/            # Filtros e cálculos de planilha
├── previsao/             # Regras legadas/futuras de previsão
├── risco/                # Classificação compartilhada de risco
└── store/                # Funções puras usadas pelo Zustand
```

| Pasta             | Uso                                                        |
| ----------------- | ---------------------------------------------------------- |
| `home/`           | Registrar entrada/saída; últimos lançamentos               |
| `caixas/`         | Validar/criar/editar caixas                                |
| `configurar/`     | Saldos e orçamentos em lote                                |
| `dashboard/`      | Risco por caixa                                            |
| `acompanhamento/` | Acompanhamento mensal e recorrentes                        |
| `planilhas/`      | Filtrar lançamentos; líquido do mês                        |
| `parcelamento/`   | Criar parcelamento                                         |
| `previsao/`       | Salvar salário previsto legado/futuro                      |
| `risco/`          | Classificação por limites                                  |
| `store/`          | Impacto de lançamentos em saldos; geração pura de parcelas |

Padrão: `montar*` → `validar*` → `executar*` (ou `validarE*` que orquestra). Entities importam de `@/service/<feature>` ou do barrel `@/service`. Pages não devem importar regra de negócio diretamente quando houver estado/orquestração em `entities`.

## Server state e API

O app já fica preparado para API com TanStack Query:

- `src/api/`: client HTTP e adapters de DTO.
- `src/queries/`: `AppQueryProvider`, query keys e futuros hooks `use*Query`/`use*Mutation`.
- Zustand continua para client state: formulários, UI, navegação interna, preferências locais.
- TanStack Query fica para server state: cache remoto, loading, retry, refetch, mutations e invalidações.

## Convenções de código

- Responder e documentar em português BR.
- Usar NativeWind (`className`) em componentes UI; `style` só para valores dinâmicos (cores de caixa, largura de progress bar).
- Tokens de estilo: **somente** em `tailwind.config.js`. `design-tokens.ts` importa `colorsFlat` de lá para ícones/progress bar dinâmicos.
- Importar via alias `@/` (mapeado em `tsconfig.json`).
- Não recriar monolito em `index.tsx` — manter separação em `pages/` e `components/`.
- Não adicionar co-author do Cursor em commits.
- **Nomenclatura**: variáveis devem ser descritivas — proibido `c`, `d`, `v`, `a`, `e`, `s`, `l`, `m` soltos. Usar `caixaId`, `dadosCaixa`, `valorTexto`, `erros`, `estado`, `lancamento`, `competencia`, etc. Ver `.cursor/rules/nomenclatura.mdc`.

## Plugin Expo (Claude Code CLI)

Se usar Claude Code CLI, habilitar o plugin oficial Expo (`expo@claude-plugins-official`) para consulta de docs versionadas.
