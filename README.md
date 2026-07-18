# Flux

Monorepo do aplicativo financeiro **Flux**.

```
Flux/
├── Frontend/   # Expo / React Native (flux-app)
├── Backend/    # API Express (flux-api)
├── package.json
├── vercel.json
└── .gitignore
```

## Desenvolvimento

```bash
# na raiz Flux/
yarn install          # workspaces

# API
yarn dev:api

# App (Expo)
yarn dev:app

# Web (Expo)
yarn dev:web
```

Variáveis: `Frontend/.env` e `Backend/.env` (veja os `.env.example` de cada pacote).

## Deploy (Vercel)

O `vercel.json` na raiz aponta:

- **API serverless:** `Backend/src/index.ts` em `/api/*`
- **Web estática:** build Expo em `Frontend/dist`

No painel da Vercel, use o repositório raiz `Flux` (não subpastas isoladas).

## Marca

Antigo nome **finCaixas** / **finance-api** → **Flux** (`flux-app` + `flux-api`).
