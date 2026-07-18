import { COLORS } from "@/shared/tokensDesign";

export interface InstrucaoOnboarding {
  titulo: string;
  descricao: string;
  ilustracao: "dinheiro" | "caixas" | "grafico" | "painel";
  cor: string;
}

/** Proporção tipográfica alinhada à tela inicial (título / subtítulo / descritivo / ícone). */
export const PROPORCAO_ONBOARDING = {
  titulo: 36,
  subtitulo: 18,
  descritivo: 16,
  icone: 40,
} as const;

export const INSTRUCOES_ONBOARDING: InstrucaoOnboarding[] = [
  {
    titulo: "Orgazinando seu dinheiro.",
    descricao:
      "Organize seu dinheiro em reservas e saiba o que pode usar hoje e o que já pertence aos seus objetivos.",
    ilustracao: "dinheiro",
    cor: COLORS.primary,
  },
  {
    titulo: "O Flux organiza por você.",
    descricao:
      "Ao receber dinheiro, escolha para quais caixas ele vai e acompanhe quanto cada reserva deve manter protegido.",
    ilustracao: "caixas",
    cor: COLORS.primary,
  },
  {
    titulo: "Acompanhe sua saúde financeira.",
    descricao:
      "Veja como seus lançamentos afetam o risco do mês e onde estão os maiores impactos.",
    ilustracao: "grafico",
    cor: COLORS.primary,
  },
  {
    titulo: "Vamos começar.",
    descricao:
      "Configure salário, contas recorrentes e caixas. O restante o Flux acompanha automaticamente.",
    ilustracao: "painel",
    cor: COLORS.primary,
  },
];
