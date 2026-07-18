# flux

Sistema de gestão financeira pessoal que organiza o patrimônio em reservas, acompanha o comprometimento da renda e transforma movimentações financeiras em indicadores claros para apoiar decisões.

Todo dinheiro possui um destino quando entra e uma origem quando sai.

---

## Ideia central

O flux parte de um princípio simples:

> dinheiro não deve existir sem propósito.

Sempre que um valor entra, ele recebe um **destino (caixa)**.  
Sempre que um valor sai, ele precisa informar sua **origem (caixa)**.

Isso transforma o controle financeiro de um saldo único em uma visão estruturada de patrimônio.

---

## Filosofia do aplicativo

```text
Todo dinheiro possui um destino.

↓

Toda saída possui uma origem.

↓

O patrimônio é organizado em caixas.

↓

As caixas representam reservas financeiras,
não categorias de gastos.

↓

O Dashboard mede a saúde das reservas.

↓

O Acompanhamento mede o comprometimento da renda.

↓

Categorias existem apenas como contexto da movimentação.
```

---

## Como o modelo funciona

| Conceito    | Descrição                                                           |
| ----------- | ------------------------------------------------------------------- |
| Caixas      | Reservas patrimoniais onde o dinheiro é organizado por objetivo     |
| Competência | Mês ao qual a movimentação impacta o planejamento financeiro        |
| Horizonte   | Define se a movimentação afeta o presente ou apenas projeção futura |

---

## Caixas padrão (MVP)

| Caixa                 | Função                   |
| --------------------- | ------------------------ |
| Saldo Atual           | Disponibilidade imediata |
| Reserva de Emergência | Segurança financeira     |
| Qualidade de Vida     | Consumo e estilo de vida |

---

## Regra principal

> Todo dinheiro possui um destino quando entra e uma origem quando sai.

- Se entra → deve ser distribuído entre caixas
- Se sai → deve vir de uma caixa específica
- Se for futuro → entra como planejamento por competência
- Se estourar orçamento → exige compensação entre caixas

---

## Navegação — 4 pilares

| Tela           | Pergunta central                              |
| -------------- | --------------------------------------------- |
| Movimentar     | O que aconteceu hoje?                         |
| Acompanhamento | Como minhas decisões estão afetando este mês? |
| Dashboard      | Minha saúde financeira está equilibrada?      |
| Caixas         | Onde meu patrimônio está organizado?          |

---

## Formulários principais

### Nova Entrada

- valor
- horizonte
- competência
- distribuição entre caixas

### Nova Saída

- valor
- caixa de origem
- categoria (contexto)
- compensação se necessário

### Parcelamento

- gera compromissos futuros por competência

### Configuração

- saldos iniciais
- orçamento por caixa

---

## Risco financeiro (Acompanhamento)

O risco mensal é calculado por:

```text
risco = (comprometido no mês / entrada prevista) × 100
```

Entrada prevista: salário + recorrências

Comprometido: parcelas + saídas futuras + compromissos

---

## Dashboard (Saúde das Caixas)

Cada caixa possui:

- saldo atual
- orçamento definido
- percentual de uso
- estado (saudável / atenção / risco)

Interpretação:

- verde → dentro do esperado
- amarelo → atenção
- vermelho → comprometimento alto

---

## Fluxo de dados

```text
Entrada
  ↓
Destino (Caixas)
  ↓
Atualização de patrimônio
  ↓
Dashboard
  ↓
Acompanhamento
```

---

## Fluxo de dados

- Entradas presentes → atualizam caixas imediatamente
- Saídas presentes → debitam caixa de origem
- Futuro → simulação por competência
- Parcelamentos → comprometimento distribuído no tempo

---

## Stack técnica

- Expo 57 + React Native
- TypeScript
- NativeWind (Tailwind)
- Zustand
- Lucide Icons

---

## Estrutura do projeto

```text
src/
├── app/              # entrada Expo Router
├── pages/            # telas principais
├── components/       # UI e domínio
├── hooks/            # lógica derivada
├── service/          # estado global (Zustand)
├── shared/           # tokens e constantes
├── types/            # tipagens
└── utils/            # regras financeiras
```

---

## Scripts

```bash
yarn install
yarn start
yarn android
yarn ios
yarn web
yarn validate
yarn ci
```

---

## Documentação adicional

AGENTS.md — regras de implementação e padrões internos

---

## Licença

Projeto privado
