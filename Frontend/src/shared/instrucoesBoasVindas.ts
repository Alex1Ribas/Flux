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
    titulo: "Organizando seu dinheiro.",
    descricao:
      "O Flux organiza o dinheiro em caixas: você vê onde ele está, o que pode usar e o que já pertence aos seus objetivos.",
    ilustracao: "dinheiro",
    cor: COLORS.primary,
  },
  {
    titulo: "Caixas são a alocação.",
    descricao:
      "Ao receber, escolha para onde o dinheiro vai. Ao gastar, escolha de onde ele sai. A caixa é a reserva — não só um rótulo.",
    ilustracao: "caixas",
    cor: COLORS.primary,
  },
  {
    titulo: "Acompanhe a saúde do mês.",
    descricao:
      "Planeje compromissos recorrentes e veja se o mês está saudável — e, depois, onde você está gastando.",
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
