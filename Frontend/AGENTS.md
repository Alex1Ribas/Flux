# Agents.md – Frontend (React Native + TypeScript)

Guia de arquitetura e contribuição para humanos e agentes de IA neste repositório.
Stack e princípios obrigatórios: **FSD**, **TanStack Query**, **React Native**, **Zustand**.

Alinhado ao boilerplate `st-app-rn` e à simetria com o backend (`Agents.md` do BE).

---

## 0. Stack

| Peça | Uso |
| ---- | --- |
| **React Native** | UI nativa (iOS/Android); sem DOM web APIs |
| **FSD** | Camadas `app → pages → widgets → features → entities → shared` |
| **TanStack Query** (`@tanstack/react-query` v5) | **Server state**: fetch, cache, invalidação, mutations |
| **Zustand** | **Client state**: sessão, UI, filtros, drafts — não cache de API |

---

## 1. FSD – Camadas e imports

Uma camada só importa de camadas **abaixo**. Cross-import entre slices da mesma camada é proibido (exceto `@x` pontual documentado).

```text
app/        → bootstrap, providers, routing
pages/      → telas / composição de rota
widgets/    → blocos compostos (usar com parcimônia)
features/   → interações do usuário (login, lançar entrada, filtros)
entities/   → modelos de domínio + UI/API/store da entidade
shared/     → UI kit, api client, lib, utils (sem regra de negócio)
```

| Camada | Path | Responsabilidade |
| ------ | ---- | ---------------- |
| **App** | `src/app` | Providers (QueryClient, theme), rotas, init de SDKs |
| **Pages** | `src/pages` | Orquestra features/entities; sem axios direto |
| **Widgets** | `src/widgets` | Composição reutilizável de UI (evitar se o bloco carrega muita lógica) |
| **Features** | `src/features/<slice>` | Casos de uso: mutations, forms, ações |
| **Entities** | `src/entities/<slice>` | Tipos `I*`, cards, stores de entidade, queries de leitura |
| **Shared** | `src/shared` | `ui`, `api`, `design`, `lib`, `utils`, `config` |

### Segmentos por slice

```text
src/features/<nome>/
  ui/
    *.tsx
    __tests__/          # testes do segmento ui
  model/
    *.ts
    __tests__/          # testes do segmento model
  api/
    *.ts
    __tests__/          # testes do segmento api
```

Exemplos: `features/auth/api/__tests__/...`, `entities/account/model/__tests__/...`, `features/login/ui/__tests__/...`.

Em pastas `ui/` (de qualquer slice — `features`, `entities`, `widgets`, `shared`): **apenas arquivos `.tsx`**. Sem `.ts` puro em `ui/`. Hooks, stores, utils, types e api ficam em `model/`, `api/` ou outros segmentos. Testes **não** ficam ao lado do arquivo-fonte — sempre em `__tests__/` dentro do segmento.

Public API do slice: exportar só o necessário via `index.ts` (ou imports diretos estáveis do projeto).

### Simetria com o backend

| Backend | Frontend (FSD) |
| ------- | -------------- |
| Domain | `entities` (`IAccount`, UI da entidade) |
| Service / use case | `features` (ações + mutations) |
| Controller | `pages` / `widgets` (orquestração) |
| Infrastructure HTTP | `shared/api` + `shared/lib/react-query` |
| Configuration | `app` (providers, routes) |

---

## 2. React Native

- Componentes: `View`, `Text`, `Pressable`, etc. — **não** `div`/`span`.
- Estilos via Design System (Tailwind/NativeWind do projeto); evitar `StyleSheet`/`inline` salvo animação, valor dinâmico ou API nativa.
- Navegação: React Navigation / Expo Router conforme o repo; rotas finas em `app`/`pages`, lógica em features.
- Sem `window`/`document`; foco/rede: `AppState`, NetInfo se o projeto já usar.
- Strings de UI via i18n (`react-i18next`) — sem hardcode de copy.
- Arquivos: `kebab-case.ts(x)`; componentes exportados em PascalCase.
- Em `ui/`: somente `.tsx` (componentes). Lógica em `model/` / `api/` / `lib` — nunca `.ts` dentro de `ui/`.

Correto (RN + design system + i18n):

```tsx
import { View, Text } from "react-native";

<View className="flex-1 bg-background p-4">
  <Text className="text-foreground text-base">{t("accounts.title")}</Text>
</View>
```

Evitar: `StyleSheet` / cores hardcoded / `axios` dentro da page.

---

## 3. TanStack Query – Server state (API)

**Tudo que vem do backend** passa por TanStack Query. Não espelhar listas/detalhes da API no Zustand.

### Onde vive

| Artefato | Onde |
| -------- | ---- |
| `QueryClient` + defaults | `shared/lib/react-query` |
| `QueryClientProvider` | `app/providers` |
| HTTP client (axios) | `shared/api` |
| `queryFn` / `useQuery` / keys | `entities/*/api` ou `features/*/api` |
| `useMutation` + invalidate | `features/*/api` |

### Defaults recomendados (RN)

Em `shared/lib/react-query.ts` (`refetchOnWindowFocus: false` — RN sem window focus clássico):

```ts
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  });

export const queryClient = createQueryClient();
```

### Query factory / keys

Centralizar keys para invalidar e prefetch sem strings mágicas (`entities/account/api/account-queries.ts`):

```ts
import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { IAccount } from "../model/account";

export const accountQueries = {
  all: () => ["accounts"] as const,
  detail: (accountId: string) =>
    queryOptions({
      queryKey: [...accountQueries.all(), accountId],
      queryFn: () =>
        apiClient
          .get<IAccount>(`/accounts/${accountId}`)
          .then((response) => response.data),
    }),
};

const { data } = useQuery(accountQueries.detail(accountId));
```

### Mutations

```ts
export const useCreateEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ICreateEntryBody) =>
      apiClient.post("/entries", body).then((response) => response.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountQueries.all() });
    },
  });
};
```

### Regras

1. Pages/widgets **não** chamam `apiClient` direto — só hooks da feature/entity.
2. Tipagem da resposta alinhada aos `I*` do backend (OpenAPI / domain).
3. Após mutation: `invalidateQueries` ou `setQueryData` — não duplicar no Zustand.
4. Listas longas: `useInfiniteQuery` + `infiniteQueryOptions`.
5. Loading/error/empty tratados na UI da feature/page, não no store global.

---

## 4. Zustand – Client state

Use Zustand para estado **do cliente**, não para dados remotos.

| Sim → Zustand | Não → TanStack Query |
| ------------- | -------------------- |
| Auth tokens / sessão hidratada | Lista de contas da API |
| Theme, locale, flags de UI | Detalhe de cartão |
| Filtros, seleção, wizard step | Extrato / ledger |
| Draft de formulário offline-ish | Qualquer GET cacheável |

### Onde vive o store

- Entidade compartilhada: `entities/<slice>/model/*-store.ts`
- Fluxo de feature: `features/<slice>/model/*-store.ts`
- App-wide mínimo: tema/auth só se realmente global

Em `entities/session/model/session-store.ts`:

```ts
import { create } from "zustand";

interface SessionState {
  isOnboarded: boolean;
  selectedAccountId: string | null;
  setSelectedAccountId: (accountId: string | null) => void;
  setOnboarded: (value: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  isOnboarded: false,
  selectedAccountId: null,
  setSelectedAccountId: (accountId) => set({ selectedAccountId: accountId }),
  setOnboarded: (value) => set({ isOnboarded: value }),
}));
```

### Regras

1. Selectors finos: `useSessionStore((state) => state.selectedAccountId)` — evita re-render.
2. Persistência (AsyncStorage/MMKV) só para o que precisa sobreviver ao kill do app (auth, preferências).
3. Não guardar `IAccount[]` da API no store; guardar no máximo IDs/seleção e buscar com Query.
4. Actions síncronas/simples no store; side effects de rede nas mutations do TanStack.

---

## 5. Divisão de estado (resumo)

```text
UI local de um componente     → useState
Fluxo / draft da feature      → Zustand (features/*/model)
Seleção / sessão / preferência→ Zustand (entities ou app)
Dados do servidor             → TanStack Query (api/)
```

---

## 6. Naming e estilo de código

| Tipo | Forma | Exemplo |
| ---- | ----- | ------- |
| Interface de domínio | `I` + PascalCase | `IAccount`, `IEntry` |
| Enum | `E` + PascalCase | `EEntryType.SALARY` |
| Arquivo | kebab-case | `ui/account-card.tsx`; `model/use-session-store.ts` |
| Componente | PascalCase | `AccountCard` |
| Hook | `use` + camelCase | `useCreateEntry`, `useSessionStore` |
| Query key factory | camelCase + `Queries` | `accountQueries` |

Tipos da API devem espelhar o contrato OpenAPI / domain do backend.

- **Sem comentários no código** (`//`, `/* */`, JSDoc desnecessários). Preferir nomes claros e código autoexplicativo.
- **Sem variáveis de uma letra** (`i`, `e`, `r`, etc.). Usar nomes descritivos (`index`, `error`, `response`, `accountId`).
- **Preferir `if`/`else` ou early return** em vez de operador ternário. Evitar ternários aninhados. Ternário só é aceitável em atribuição trivial de um valor simples em uma linha — a preferência forte do time é `if` por legibilidade.

---

## 7. Testes (Jest)

**Local físico obrigatório:** testes do frontend ficam em `<segmento>/__tests__/`, nunca ao lado do arquivo-fonte nem em `__tests__` na raiz do slice.

| Tipo | Extensão | Local |
| ---- | -------- | ----- |
| Unit | `*.test.ts(x)` | `<segmento>/__tests__/` (ex.: `api/__tests__/`, `model/__tests__/`, `ui/__tests__/`) |
| Integration | `*.spec.ts(x)` | Mesmo padrão: `<segmento>/__tests__/` do segmento sob teste |
| E2E | — | `e2e/` (fora de `src`) |

Exemplos de path:

```text
features/auth/api/__tests__/use-login.test.ts
features/auth/ui/__tests__/login-form.spec.tsx
entities/account/model/__tests__/account-store.test.ts
entities/account/api/__tests__/account-queries.test.ts
```

- Unit vs integration: a distinção é pela extensão (`*.test` vs `*.spec`); o diretório é sempre `__tests__` no segmento correspondente (`api`, `model`, `ui`, etc.).
- Um `it` por `describe`.
- Descrições em inglês: `describe("When...")` / `it("should...")`.
- Mockar `apiClient` / `queryClient` em unit; não bater API real.
- Cobertura alvo ≥ 80%.

---

## 8. Checklist do agente ✅

1. Respeitar FSD (imports só para baixo; sem axios em `pages`).
2. Server state → **TanStack Query**; client state → **Zustand**.
3. Não duplicar cache da API no Zustand.
4. Query keys centralizadas; mutations invalidam as keys certas.
5. UI React Native + design system; i18n para copy.
6. Em pastas `ui/`: só `.tsx` — sem `.ts` puro (lógica em `model/` / `api` / etc.).
7. Tipagem `I*` alinhada ao backend; sem variáveis de uma letra.
8. Sem comentários no código — nomes claros e código autoexplicativo.
9. Preferir `if`/`else` ou early return em vez de ternário (evitar ternários aninhados).
10. Testes Jest em `<segmento>/__tests__/` (ex.: `api/__tests__`, `model/__tests__`, `ui/__tests__`) — nunca co-location ao lado do fonte.
11. Escopo isolado: mudanças mínimas e localizadas — **não** alterar APIs públicas, contratos, assinaturas, exports ou comportamento compartilhado de forma que quebre ou mude outros consumers do mesmo módulo/camada/slice — a menos que isso seja o pedido explícito. Preferir extensão local (nova função/arquivo/path) a modificar código compartilhado usado por vários lugares. Em refactors, não “melhorar de passagem” outros consumers.

Seguir este guia mantém o app **escalável, previsível e alinhado ao backend** para humanos e agentes.
