import Constants from "expo-constants";

import { criarClienteApi } from "./clienteApi";
import type {
  AcompanhamentoMes,
  ConfigLimitesRisco,
  Distribuicao,
  Horizonte,
  TipoLancamento,
} from "@/types/flux";

const extra = Constants.expoConfig?.extra as { fluxApiBaseUrl?: string } | undefined;

/** Em dispositivo físico, troca localhost pelo IP do host do Metro (mesma máquina da API). */
function resolverUrlApi(): string {
  const configurada =
    process.env.EXPO_PUBLIC_FLUX_API_URL || extra?.fluxApiBaseUrl || ""

  if (!configurada) {
    throw new Error(
      "Defina EXPO_PUBLIC_FLUX_API_URL no .env (ou extra.fluxApiBaseUrl no app.json)."
    );
  }

  const hostMetro = Constants.expoConfig?.hostUri?.split(":")[0];
  const usaLoopback = /^(https?:\/\/)(127\.0\.0\.1|localhost)(:\d+)?/i.test(configurada);

  if (usaLoopback && hostMetro && hostMetro !== "127.0.0.1" && hostMetro !== "localhost") {
    return configurada.replace(/127\.0\.0\.1|localhost/i, hostMetro);
  }

  return configurada;
}

export const FINANCE_API_BASE_URL = resolverUrlApi();

const cliente = criarClienteApi({ baseUrl: FINANCE_API_BASE_URL });

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export type PapelUsuarioApi = "USER" | "DEPENDENT";

export interface UsuarioApi {
  _id: string;
  name: string;
  email: string;
  role: PapelUsuarioApi;
  createdAt?: string;
  updatedAt?: string;
}

export interface CadastroUsuarioPayload {
  name: string;
  email: string;
  password: string;
  confPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CadastroUsuarioResposta {
  message: string;
  user: UsuarioApi;
}

export interface LoginResposta {
  message: string;
  token: string;
  id: string;
}

export interface CaixaApi {
  _id: string;
  user: string;
  nome: string;
  saldo: number;
  tipo: "objetivo" | "orcamento";
  meta?: number;
  aporteMensal?: number;
  orcamentoMensal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CaixaPayload {
  nome: string;
  saldo?: number;
  tipo: "objetivo" | "orcamento";
  meta?: number;
  aporteMensal?: number;
  orcamentoMensal?: number;
}

export interface LancamentoApi {
  _id: string;
  user: string;
  tipo: TipoLancamento;
  horizonte: Horizonte;
  valor: number;
  descricao: string;
  competencia: string;
  observacao?: string;
  caixaOrigem?: string;
  caixaCompensacao?: string;
  distribuicao?: Distribuicao[];
  parcelaRef?: string;
  parcelaNum?: number;
  totalParcelas?: number;
  recorrente?: boolean;
  competenciaInicial?: string;
  duracaoMeses?: number;
  ativo?: boolean;
  mesesAbatidos?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type LancamentoPayload = Omit<LancamentoApi, "_id" | "user" | "createdAt" | "updatedAt">;

export interface OrcamentoApi {
  _id: string;
  user: string;
  caixa: string;
  competencia: string;
  valor: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrcamentoPayload {
  caixa: string;
  valor: number;
}

export interface PreferenciasApi {
  _id: string;
  user: string;
  tiposEntrada: string[];
  tiposSaida: string[];
  limitesRisco: ConfigLimitesRisco;
  createdAt?: string;
  updatedAt?: string;
}

export type PreferenciasUpdatePayload = Partial<
  Pick<PreferenciasApi, "tiposEntrada" | "tiposSaida" | "limitesRisco">
>;

export interface ContaApi {
  _id: string;
  user: string;
  tipo: "a_pagar" | "a_receber";
  descricao: string;
  valor: number;
  competencia: string;
  vencimento: string;
  caixaId: string;
  status: "aberta" | "liquidada" | "cancelada";
  recorrenteId?: string;
  liquidadoEm?: string;
  lancamentoId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ContaPayload = {
  tipo: ContaApi["tipo"];
  descricao: string;
  valor: number;
  competencia?: string;
  vencimento: string;
  caixaId: string;
  recorrenteId?: string;
};

export type ContaUpdatePayload = Partial<
  ContaPayload & { status: "aberta" | "cancelada" }
>;

export type ContaLiquidarPayload = {
  liquidadoEm?: string;
  caixaId?: string;
  caixaCompensacao?: string;
};

export type ContaLiquidacaoResposta = {
  conta: ContaApi;
  lancamentos: LancamentoApi[];
};

export const authApi = {
  cadastrar: (payload: CadastroUsuarioPayload) =>
    cliente.post<CadastroUsuarioResposta, CadastroUsuarioPayload>("/users/register", payload),
  login: (payload: LoginPayload) =>
    cliente.post<LoginResposta, LoginPayload>("/users/login", payload),
  buscarUsuario: (id: string, token: string) =>
    cliente.get<UsuarioApi>(`/users/${id}`, { headers: authHeaders(token) }),
};

export const caixasApi = {
  listar: (token: string) => cliente.get<CaixaApi[]>("/caixas", { headers: authHeaders(token) }),
  criar: (token: string, payload: CaixaPayload) =>
    cliente.post<CaixaApi, CaixaPayload>("/caixas", payload, { headers: authHeaders(token) }),
  atualizar: (token: string, id: string, payload: Partial<CaixaPayload>) =>
    cliente.put<CaixaApi, Partial<CaixaPayload>>(`/caixas/${id}`, payload, {
      headers: authHeaders(token),
    }),
  excluir: (token: string, id: string) =>
    cliente.delete<CaixaApi>(`/caixas/${id}`, { headers: authHeaders(token) }),
};

export const contasApi = {
  listar: (
    token: string,
    filtro?: { status?: ContaApi["status"]; tipo?: ContaApi["tipo"]; competencia?: string }
  ) => {
    const params = new URLSearchParams();
    if (filtro?.status) params.set("status", filtro.status);
    if (filtro?.tipo) params.set("tipo", filtro.tipo);
    if (filtro?.competencia) params.set("competencia", filtro.competencia);
    const query = params.toString() ? `?${params.toString()}` : "";
    return cliente.get<ContaApi[]>(`/contas${query}`, { headers: authHeaders(token) });
  },
  criar: (token: string, payload: ContaPayload) =>
    cliente.post<ContaApi, ContaPayload>("/contas", payload, { headers: authHeaders(token) }),
  atualizar: (token: string, id: string, payload: ContaUpdatePayload) =>
    cliente.put<ContaApi, ContaUpdatePayload>(`/contas/${id}`, payload, {
      headers: authHeaders(token),
    }),
  excluir: (token: string, id: string) =>
    cliente.delete<ContaApi>(`/contas/${id}`, { headers: authHeaders(token) }),
  liquidar: (token: string, id: string, payload: ContaLiquidarPayload = {}) =>
    cliente.post<ContaLiquidacaoResposta, ContaLiquidarPayload>(
      `/contas/${id}/liquidar`,
      payload,
      { headers: authHeaders(token) }
    ),
};

export const lancamentosApi = {
  listar: (token: string, filtro?: { competencia?: string; recorrente?: boolean }) => {
    const params = new URLSearchParams();
    if (filtro?.competencia) params.set("competencia", filtro.competencia);
    if (typeof filtro?.recorrente === "boolean") {
      params.set("recorrente", String(filtro.recorrente));
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    return cliente.get<LancamentoApi[]>(`/lancamentos${query}`, { headers: authHeaders(token) });
  },
  criar: (token: string, payload: LancamentoPayload) =>
    cliente.post<LancamentoApi[], LancamentoPayload>("/lancamentos", payload, {
      headers: authHeaders(token),
    }),
  atualizar: (token: string, id: string, payload: Partial<LancamentoPayload>) =>
    cliente.put<LancamentoApi, Partial<LancamentoPayload>>(`/lancamentos/${id}`, payload, {
      headers: authHeaders(token),
    }),
  excluir: (token: string, id: string) =>
    cliente.delete<LancamentoApi>(`/lancamentos/${id}`, { headers: authHeaders(token) }),
};

export const orcamentosApi = {
  listar: (token: string, competencia: string) =>
    cliente.get<OrcamentoApi[]>(`/orcamentos/${competencia}`, { headers: authHeaders(token) }),
  salvar: (token: string, competencia: string, orcamentos: OrcamentoPayload[]) =>
    cliente.put<OrcamentoApi[], { orcamentos: OrcamentoPayload[] }>(
      `/orcamentos/${competencia}`,
      { orcamentos },
      { headers: authHeaders(token) }
    ),
};

export const acompanhamentoApi = {
  obter: (token: string, competencia: string) =>
    cliente.get<AcompanhamentoMes>(`/acompanhamento/${competencia}`, {
      headers: authHeaders(token),
    }),
};

export interface CategoriaCreatePayload {
  tipo: TipoLancamento;
  categoria: string;
}

export interface CategoriaCreateResposta {
  tipo: TipoLancamento;
  categoria: string;
}

export const preferenciasApi = {
  obter: (token: string) =>
    cliente.get<PreferenciasApi>("/preferencias", { headers: authHeaders(token) }),
  salvar: (token: string, payload: PreferenciasUpdatePayload) =>
    cliente.put<PreferenciasApi, PreferenciasUpdatePayload>("/preferencias", payload, {
      headers: authHeaders(token),
    }),
  buscarCategorias: (
    token: string,
    filtro: { q?: string; tipo: TipoLancamento }
  ) => {
    const params = new URLSearchParams();
    params.set("tipo", filtro.tipo);
    if (filtro.q?.trim()) params.set("q", filtro.q.trim());
    return cliente.get<string[]>(`/categorias?${params.toString()}`, {
      headers: authHeaders(token),
    });
  },
  adicionarCategoria: (token: string, payload: CategoriaCreatePayload) =>
    cliente.post<CategoriaCreateResposta, CategoriaCreatePayload>("/categorias", payload, {
      headers: authHeaders(token),
    }),
};
