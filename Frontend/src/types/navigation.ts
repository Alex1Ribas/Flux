import type { Horizonte } from "@/types/flux";
import type { CaixaId } from "@/shared/estilosCaixa";

export type TelaId =
  "inicio" | "previsao" | "caixas" | "painel" | "parcelamento" | "configurar" | "recorrentes";

export interface NavParams {
  horizonteInicial?: Horizonte;
  modoInicial?: "entrada" | "saida";
  caixaInicial?: CaixaId;
  voltarPara?: TelaId;
}

export type SetTela = (tela: TelaId, params?: NavParams) => void;

export interface TelaProps {
  setTela: SetTela;
  horizonteInicial?: Horizonte;
  modoInicial?: "entrada" | "saida";
  caixaInicial?: CaixaId;
  voltarPara?: TelaId;
}

export const TELAS_COM_NAV = ["inicio", "previsao", "caixas", "painel"] as const;
