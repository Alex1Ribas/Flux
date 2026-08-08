import type { CaixaCatalogoItem } from "@/types/flux";

export const CAIXAS_PADRAO: CaixaCatalogoItem[] = [
  {
    id: "saldo_atual",
    nome: "Saldo Atual",
    tipo: "orcamento",
    orcamentoMensal: 500,
  },
  {
    id: "reserva_emergencia",
    nome: "Reserva de Emergência",
    tipo: "objetivo",
    meta: 10000,
    aporteMensal: 500,
  },
  {
    id: "objetivo_pessoal",
    nome: "Objetivo Pessoal",
    tipo: "objetivo",
    meta: 5000,
    aporteMensal: 250,
  },
];

export function gerarCaixaId(nome: string, idsExistentes: string[]): string {
  const base =
    nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") || "caixa";

  let id = base;
  let indice = 1;
  while (idsExistentes.includes(id)) {
    id = `${base}_${indice}`;
    indice += 1;
  }
  return id;
}

export function obterNomeCaixa(catalogo: CaixaCatalogoItem[], caixaId: string): string {
  return catalogo.find((item) => item.id === caixaId)?.nome ?? caixaId;
}

export function obterIdsCaixas(catalogo: CaixaCatalogoItem[]): string[] {
  return catalogo.map((item) => item.id);
}

/** Com saldo: maior → menor à esquerda; zeradas por último (direita). */
export function ordenarCaixasPorSaldo(
  catalogo: CaixaCatalogoItem[],
  saldos: Record<string, number>
): CaixaCatalogoItem[] {
  return [...catalogo].sort((caixaA, caixaB) => {
    const saldoA = saldos[caixaA.id] || 0;
    const saldoB = saldos[caixaB.id] || 0;
    const zeradaA = saldoA === 0;
    const zeradaB = saldoB === 0;

    if (zeradaA && !zeradaB) return 1;
    if (!zeradaA && zeradaB) return -1;
    return saldoB - saldoA;
  });
}

export function prazoEstimadoMeses(meta: number, aporteMensal: number): number {
  if (meta <= 0 || aporteMensal <= 0) return 0;
  return Math.ceil(meta / aporteMensal);
}

export function limiteDiarioOrcamento(orcamentoMensal: number, diasNoMes: number): number {
  if (orcamentoMensal <= 0 || diasNoMes <= 0) return 0;
  return orcamentoMensal / diasNoMes;
}

export function limiteSemanalOrcamento(orcamentoMensal: number): number {
  if (orcamentoMensal <= 0) return 0;
  return orcamentoMensal / 4;
}
