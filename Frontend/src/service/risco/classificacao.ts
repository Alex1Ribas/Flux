import type { LimitesRisco, StatusRiscoMensal } from "@/types/flux";

export function classificarPercentualPorLimites(
  percentual: number,
  limites: LimitesRisco
): StatusRiscoMensal {
  if (percentual <= limites.saudavel) return "saudavel";
  if (percentual <= limites.atencao) return "atencao";
  return "critico";
}

export function normalizarLimitesRisco(limites: LimitesRisco): LimitesRisco {
  const saudavel = Math.min(100, Math.max(0, limites.saudavel));
  const atencao = Math.min(100, Math.max(saudavel, limites.atencao));
  return { saudavel, atencao };
}
