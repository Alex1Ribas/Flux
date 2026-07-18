## Resumo

<!-- Em 2–4 frases: o que este PR entrega do ponto de vista do usuário ou do sistema. -->

---

## 1. O que foi feito

<!-- Descreva as mudanças de forma concreta: telas, regras de negócio, hooks, store, UI, config, etc. -->

- 
- 
- 

---

## 2. Dor / problema que resolve

<!-- Qual friction, bug, débito técnico ou necessidade de produto motivou este PR? -->

**Antes:**

**Depois:**

---

## 3. Arquivos alterados

<!-- Liste os principais arquivos — foco no que o revisor deve olhar. -->

| Área | Arquivos |
| ---- | -------- |
| Páginas | `src/pages/...` |
| Componentes | `src/components/...` |
| Store / hooks | `src/service/...`, `src/hooks/...` |
| Config / docs | `tailwind.config.js`, `README.md`, etc. |

**Principais alterações:**

- [ ] `caminho/do/arquivo.tsx` — breve motivo da mudança
- [ ] `caminho/do/outro.ts` — breve motivo da mudança

---

## 4. Tipo de PR

<!-- Marque **apenas um** tipo principal. -->

- [ ] `feature` — Nova funcionalidade ou expansão de escopo
- [ ] `fix` — Correção de bug ou regressão
- [ ] `refactor` — Reestruturação sem mudar comportamento esperado
- [ ] `docs` — Apenas documentação (README, AGENTS, comentários)
- [ ] `chore` — Tooling, deps, CI, formatação, configs
- [ ] `test` — Adição ou correção de testes
- [ ] `perf` — Melhoria de performance

**Escopo adicional (opcional):**

- [ ] UI / design system (NativeWind, componentes)
- [ ] Regra de negócio (caixas, lançamentos, previsão)
- [ ] Navegação / onboarding
- [ ] Breaking change ⚠️

---

## 5. Comentários, alertas e testes

### Observações para o revisor

- [ ] Este PR **não** requer atenção especial além do fluxo normal
- [ ] Há **decisões de arquitetura** a validar (descreva abaixo)
- [ ] Há **débito técnico** aceito conscientemente (descreva abaixo)
- [ ] Depende de **outro PR** ou issue (link: )

**Comentários / alertas:**

### Testes realizados

- [ ] `npx tsc --noEmit` sem erros
- [ ] `yarn format:check` ok
- [ ] Testado no **Expo Go / emulador Android**
- [ ] Testado no **simulador iOS**
- [ ] Testado na **web**
- [ ] Fluxo manual descrito abaixo
- [ ] Testes automatizados adicionados/atualizados
- [ ] **Não testei** (justifique)

**Passos de teste manual:**

1. 
2. 
3. 

### Screenshots / gravações (se aplicável)

---

## Checklist final

- [ ] Título do PR é claro e segue o tipo marcado acima
- [ ] Código segue convenções do projeto (`AGENTS.md`, Prettier, nomenclatura descritiva)
- [ ] Não inclui secrets (`.env`, tokens, credenciais)
- [ ] Documentação atualizada quando necessário (`README`, `AGENTS.md`)
