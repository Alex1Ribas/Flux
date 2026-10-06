# Flux

Monorepo do aplicativo financeiro **Flux** — mostra quanto o usuário pode gastar agora sem comprometer contas, parcelas, reserva e os próximos meses.

```
./
├── Frontend/   # Expo / React Native (flux-app) — FSD + TanStack Query + Zustand
├── Backend/    # API Express 5 + MongoDB (flux-api)
├── package.json
└── vercel.json
```

## Desenvolvimento

```bash
yarn install          # workspaces, na raiz

yarn dev:api          # API em http://localhost:3000/api
yarn dev:app          # App (Expo)
yarn dev:web          # Web (Expo)

yarn typecheck
yarn test:api
yarn test:app
```

Variáveis: `Frontend/.env` e `Backend/.env` (veja os `.env.example`). Em dev o app usa `EXPO_PUBLIC_FLUX_API_URL` (com `/api` no final); em build de produção usa `extra.fluxApiBaseUrl` do `app.json` (`https://flux-backend-tizm.vercel.app/api`).

## Deploy (Vercel)

Mesmas conexões do Flux em produção:

- **API** (`flux-backend-tizm.vercel.app`): projeto Vercel com Root Directory `Backend`, usa `Backend/vercel.json` → `src/index.ts`. Precisa de `MONGODB_URI`.
- **Monorepo / web** (`vercel.json` na raiz): API em `/api/*` via `Backend/src/index.ts` e web estática em `Frontend/dist`.

## OTA (EAS Update)

`expo-updates` no app + `.github/workflows/eas-hot-update.yml`: em push na `main`, mudanças só de JS em `Frontend/` publicam hot update (`yarn hot`); mudanças nativas apenas avisam que é preciso novo build. Requer o secret `EXPO_TOKEN`.
