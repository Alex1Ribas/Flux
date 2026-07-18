import { CAIXA_LABELS } from "./tokensDesign";

export type CaixaId = string;

type CaixaEstilo = { bg: string; text: string; border: string; bgSelected: string };

const ESTILOS_PADRAO: CaixaEstilo[] = [
  {
    bg: "bg-blue-highlight",
    text: "text-blue",
    border: "border-white/40",
    bgSelected: "bg-surface2",
  },
  {
    bg: "bg-success-highlight",
    text: "text-success",
    border: "border-white/40",
    bgSelected: "bg-surface2",
  },
  {
    bg: "bg-purple-highlight",
    text: "text-purple",
    border: "border-white/40",
    bgSelected: "bg-surface2",
  },
  {
    bg: "bg-gold-highlight",
    text: "text-gold",
    border: "border-white/40",
    bgSelected: "bg-surface2",
  },
  {
    bg: "bg-warning-highlight",
    text: "text-warning",
    border: "border-white/40",
    bgSelected: "bg-surface2",
  },
];

export const CAIXA_TW: Record<keyof typeof CAIXA_LABELS, CaixaEstilo> = {
  saldo_atual: {
    bg: "bg-blue-highlight",
    text: "text-blue",
    border: "border-white/40",
    bgSelected: "bg-surface2",
  },
  reserva_emergencia: {
    bg: "bg-success-highlight",
    text: "text-success",
    border: "border-white/40",
    bgSelected: "bg-surface2",
  },
  objetivo_pessoal: {
    bg: "bg-purple-highlight",
    text: "text-purple",
    border: "border-white/40",
    bgSelected: "bg-surface2",
  },
};

export function obterEstiloCaixa(caixaId: string, indice = 0): CaixaEstilo {
  const estiloFixo = CAIXA_TW[caixaId as keyof typeof CAIXA_LABELS];
  if (estiloFixo) return estiloFixo;
  return ESTILOS_PADRAO[indice % ESTILOS_PADRAO.length];
}

export function obterIndiceCaixa(caixaIds: string[], caixaId: string): number {
  const indice = caixaIds.indexOf(caixaId);
  return indice >= 0 ? indice : 0;
}
