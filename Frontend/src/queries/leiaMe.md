# Queries e Server State

Esta pasta prepara a entrada futura do TanStack Query.

- `api`: transporte HTTP e DTOs.
- `queries`: chaves de query, hooks remotos e invalidações.
- `service`: regra de negócio pura, sem React, Zustand ou HTTP.
- `entities`: orquestra Zustand, hooks de consulta, estado local e adaptação para UI.

Zustand deve guardar estado cliente: formulários, navegação interna, preferências locais e estado de UI. TanStack Query deve guardar estado servidor: dados vindos da API, cache, loading remoto, retry, refetch e mutations.
