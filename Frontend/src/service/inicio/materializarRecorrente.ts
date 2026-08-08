import { lancamentosApi } from "@/api/fluxApi";
import type { Lancamento, TipoLancamento } from "@/types/flux";

import { montarPayloadLancamentoRecorrente } from "./recorrentes";

export interface PayloadItemRecorrente {
  nome: string;
  tipo: TipoLancamento;
  valor: number;
  caixaId: string;
  competenciaInicial: string;
  duracaoMeses: number;
  ativo?: boolean;
}

export async function criarItemRecorrenteComLancamentos(
  token: string,
  payload: PayloadItemRecorrente
): Promise<string> {
  const criados = await lancamentosApi.criar(
    token,
    montarPayloadLancamentoRecorrente(payload)
  );
  return criados[0]._id;
}

export async function atualizarItemRecorrenteComLancamentos(
  token: string,
  itemId: string,
  payload: PayloadItemRecorrente,
  _lancamentos: Lancamento[]
): Promise<void> {
  await lancamentosApi.atualizar(token, itemId, montarPayloadLancamentoRecorrente(payload));
}

export async function excluirItemRecorrenteComLancamentos(
  token: string,
  itemId: string,
  _lancamentos: Lancamento[]
): Promise<void> {
  await lancamentosApi.excluir(token, itemId);
}

export function derivarHorizonteDaData(
  dataIso: string,
  hojeIso: string
): "presente" | "futuro" {
  return dataIso <= hojeIso ? "presente" : "futuro";
}
