---
name: eas-deploy-hot-vs-build
description: >-
  Classifica deploy do app Flux (Expo) entre hot update (EAS Update / yarn hot)
  e novo build nativo (eas build APK). Analisa o diff, avisa se precisa de build
  novo, e só então executa o comando certo. Use when the user asks to deploy,
  publicar, hot update, OTA, eas update, eas build, yarn hot, subir pro APK,
  atualizar production, or release the mobile app.
---

# Flux — Deploy: hot update vs build

Antes de qualquer publish mobile, **classifique** as mudanças. Não rode build
nem hot update sem dizer o veredito ao usuário.

## Fluxo obrigatório

1. Inspecionar o que muda (`git status`, `git diff`, arquivos tocados).
2. Classificar: **HOT** | **BUILD** | **MISTO**.
3. **Avisar** o usuário com o veredito e o motivo (1–3 bullets).
4. Só então executar o comando (ou pedir confirmação se for BUILD).

Git push / commit **não** atualiza o APK. Só `yarn hot` ou `eas build`.

Na **main**, o workflow `.github/workflows/eas-hot-update.yml` classifica o
diff e roda `yarn hot` automaticamente quando for HOT. Em BUILD/MISTO só
avisa (job não falha). Requer secret `EXPO_TOKEN` no GitHub.

## Quando basta HOT (OTA)

Mudanças só em JS/TS/UI/assets do bundle:

- `Frontend/src/**` (telas, components, service, entities, styles)
- textos, lógica, NativeWind/CSS do app
- imagens/assets já referenciados no JS (sem plugin nativo novo)
- `app.json` só em campos JS-safe (ex.: `extra.fluxApiBaseUrl`) — **sem**
  mudar `version`, ícones nativos, plugins, permissões, bundle id

Comando (produção):

```bash
# raiz do monorepo
yarn hot -- --message "descrição curta da mudança"

# ou
cd Frontend && yarn hot -- --message "descrição curta da mudança"
```

Equivale a:
`eas update --channel production --environment production --non-interactive`

No device: abrir o APK. Se houver update, o app mostra "Baixando atualizações"
e aplica com reload — sem precisar fechar/abrir só para aplicar.

## Quando precisa BUILD (avisar)

Qualquer mudança nativa ou de runtime. **Avisar explicitamente** antes de rodar:

> ⚠️ Isso **não** resolve com hot update. É necessário **novo APK**
> (`eas build`). Hot update sozinho não entrega essa mudança.

Gatilhos de BUILD:

| Sinal | Exemplos |
|-------|----------|
| Dependência nativa | add/upgrade `expo-*` nativo, `react-native-*`, libs com código nativo |
| Expo SDK / RN | bump `expo`, `react-native`, SDK no `package.json` |
| Config nativa | `plugins` em `app.json`, permissões, `bundleIdentifier` / `package` |
| Runtime | mudar `expo.version` (policy `appVersion` → novo `runtimeVersion`) |
| Ícones/splash nativos | `icon`, `adaptiveIcon`, splash que entram no binary |
| `eas.json` / credenciais | profile de build, channel do **binary** (build já instalado mantém o channel antigo) |
| Primeira vez com `expo-updates` | binary antigo sem o módulo não recebe OTA |

Comando (APK production):

```bash
cd Frontend
eas build --platform android --profile production --non-interactive
```

Depois: instalar o APK novo. Updates JS futuros → `yarn hot` de novo.

## Classificação MISTO

Há arquivos HOT **e** gatilhos BUILD no mesmo conjunto:

1. Avisar que o **binary novo** é obrigatório para a parte nativa.
2. Preferir: `eas build` (o JS já vai embutido no binary).
3. Não publicar só `yarn hot` e fingir que o nativo chegou.

## Checklist rápido no diff

Marque BUILD se aparecer qualquer um:

- [ ] `Frontend/package.json` / `yarn.lock` com lib nativa ou SDK
- [ ] `Frontend/app.json` → `version`, `plugins`, `ios`, `android` nativo, `icon`
- [ ] `Frontend/eas.json` (profiles/channels de build)
- [ ] Pasta `android/` / `ios/` (se existir)
- [ ] Novo config plugin Expo

Se **nenhum** acima e só `Frontend/src/**` (e assets JS) → **HOT**.

## Formato do aviso (sempre)

```text
Veredito: HOT | BUILD | MISTO
Motivo: …
Comando: yarn hot -- --message "…"  |  eas build --platform android --profile production
Device: abrir app (tela Baixando atualizações + reload)  |  instalar APK novo
```

## Regras de segurança

- Não rodar `eas build` ou `yarn hot` sem o usuário pedir deploy/publish/hot/build.
- Em BUILD/MISTO: **parar e avisar** antes de executar; pedir OK se a intenção era “só hot”.
- Channel do binary instalado deve ser `production` para receber `yarn hot`.
- `runtimeVersion` = `appVersion` (`app.json` → `version`). Update HOT só chega em APKs com o mesmo runtime.
