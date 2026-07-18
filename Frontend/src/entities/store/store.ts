import { create } from "zustand";

import type {
  CaixaCatalogoItem,
  Caixas,
  ConfigLimitesRisco,
  ItemRecorrente,
  Lancamento,
  LancamentoInput,
  LimitesRisco,
  Orcamentos,
  ParcelamentoInput,
} from "@/types/flux";
import { CAIXAS_PADRAO, gerarCaixaId } from "@/shared/catalogoCaixas";
import { LIMITES_RISCO_PADRAO } from "@/shared/limitesRisco";
import {
  aplicarLancamentoNosSaldos,
  criarLancamentosParcelamento,
} from "@/service/store/lancamentos";
import { getMesAtual, gerarId } from "@/utils/helpers";
import type {
  CaixaApi,
  LancamentoApi,
  OrcamentoApi,
  PreferenciasApi,
} from "@/api";
import { filtrarItensRecorrentes } from "@/service/inicio/recorrentes";

export interface StoreState {
  caixasCatalogo: CaixaCatalogoItem[];
  caixas: Caixas;
  lancamentos: Lancamento[];
  orcamentos: Orcamentos;
  itensRecorrentes: ItemRecorrente[];
  tiposEntrada: string[];
  tiposSaida: string[];
  limitesRisco: ConfigLimitesRisco;
  hidratarDadosRemotos: (dados: {
    caixas: CaixaApi[];
    lancamentos: LancamentoApi[];
    orcamentos: OrcamentoApi[];
    preferencias: PreferenciasApi;
  }) => void;
  criarCaixa: (dados: { nome: string; saldo?: number; orcamentoPrevisto?: number }) => string;
  atualizarCaixaConfig: (
    caixaId: string,
    dados: { nome?: string; saldo?: number; orcamentoPrevisto?: number }
  ) => void;
  excluirCaixa: (caixaId: string) => string | null;
  atualizarCaixa: (caixa: string, valor: string | number) => void;
  adicionarLancamento: (lancamento: LancamentoInput) => string;
  adicionarParcelamento: (dados: ParcelamentoInput) => void;
  excluirLancamento: (id: string) => void;
  definirOrcamento: (competencia: string, caixa: string, valor: string | number) => void;
  adicionarTipoEntrada: (tipo: string) => void;
  adicionarTipoSaida: (tipo: string) => void;
  definirLimitesRiscoGlobais: (limites: Partial<LimitesRisco>) => void;
  definirLimitesRiscoCaixa: (caixaId: string, limites: Partial<LimitesRisco>) => void;
  adicionarItemRecorrente: (item: Omit<ItemRecorrente, "id">) => string;
  atualizarItemRecorrente: (id: string, dados: Partial<Omit<ItemRecorrente, "id">>) => void;
  excluirItemRecorrente: (id: string) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  caixasCatalogo: [...CAIXAS_PADRAO],

  caixas: {
    saldo_atual: 0,
    reserva_emergencia: 0,
    objetivo_pessoal: 0,
  },

  lancamentos: [],
  orcamentos: {},
  itensRecorrentes: [],
  tiposEntrada: ["Salário", "Renda extra", "Venda", "Transferência", "Reembolso", "Rendimento"],
  tiposSaida: [
    "Compromisso",
    "Conta recorrente",
    "Compra planejada",
    "Parcela",
    "Reserva utilizada",
    "Transferência",
    "Antecipação",
    "Ajuste de caixa",
  ],

  limitesRisco: {
    global: { ...LIMITES_RISCO_PADRAO },
    porCaixa: {},
  },

  hidratarDadosRemotos: ({ caixas, lancamentos, orcamentos, preferencias }) => {
    const lancamentosLocais = lancamentos.map((lancamento) => ({
      ...lancamento,
      id: lancamento._id,
      recorrente: Boolean(lancamento.recorrente),
    }));

    set(() => ({
      caixasCatalogo: caixas.map((caixa) => ({
        id: caixa._id,
        nome: caixa.nome,
        tipo: caixa.tipo,
        meta: caixa.meta,
        aporteMensal: caixa.aporteMensal,
        orcamentoMensal: caixa.orcamentoMensal,
      })),
      caixas: Object.fromEntries(caixas.map((caixa) => [caixa._id, Number(caixa.saldo) || 0])),
      lancamentos: lancamentosLocais,
      orcamentos: orcamentos.reduce<Orcamentos>((acc, orcamento) => {
        acc[orcamento.competencia] = {
          ...(acc[orcamento.competencia] || {}),
          [orcamento.caixa]: Number(orcamento.valor) || 0,
        };
        return acc;
      }, {}),
      itensRecorrentes: filtrarItensRecorrentes(lancamentosLocais),
      tiposEntrada: preferencias.tiposEntrada,
      tiposSaida: preferencias.tiposSaida,
      limitesRisco: preferencias.limitesRisco,
    }));
  },

  criarCaixa: ({ nome, saldo = 0, orcamentoPrevisto = 0 }) => {
    const nomeLimpo = nome.trim();
    const idsExistentes = get().caixasCatalogo.map((item) => item.id);
    const caixaId = gerarCaixaId(nomeLimpo, idsExistentes);
    const competencia = getMesAtual();

    set((estado) => ({
      caixasCatalogo: [...estado.caixasCatalogo, { id: caixaId, nome: nomeLimpo }],
      caixas: { ...estado.caixas, [caixaId]: Number(saldo) || 0 },
      orcamentos: orcamentoPrevisto
        ? {
            ...estado.orcamentos,
            [competencia]: {
              ...(estado.orcamentos[competencia] || {}),
              [caixaId]: Number(orcamentoPrevisto) || 0,
            },
          }
        : estado.orcamentos,
    }));

    return caixaId;
  },

  atualizarCaixaConfig: (caixaId, dados) => {
    const competencia = getMesAtual();

    set((estado) => {
      const caixasCatalogo = estado.caixasCatalogo.map((item) =>
        item.id === caixaId && dados.nome !== undefined
          ? { ...item, nome: dados.nome.trim() || item.nome }
          : item
      );

      const caixas =
        dados.saldo !== undefined
          ? { ...estado.caixas, [caixaId]: Number(dados.saldo) || 0 }
          : estado.caixas;

      const orcamentos =
        dados.orcamentoPrevisto !== undefined
          ? {
              ...estado.orcamentos,
              [competencia]: {
                ...(estado.orcamentos[competencia] || {}),
                [caixaId]: Number(dados.orcamentoPrevisto) || 0,
              },
            }
          : estado.orcamentos;

      return { caixasCatalogo, caixas, orcamentos };
    });
  },

  excluirCaixa: (caixaId) => {
    const estado = get();
    if (estado.caixasCatalogo.length <= 1) {
      return "É necessário manter pelo menos uma caixa";
    }

    const emUso = estado.lancamentos.some(
      (lancamento) =>
        lancamento.caixaOrigem === caixaId ||
        lancamento.distribuicao?.some((item) => item.caixa === caixaId)
    );
    if (emUso) {
      return "Esta caixa possui lançamentos e não pode ser excluída";
    }

    set((estadoAtual) => {
      const { [caixaId]: _saldo, ...caixasRestantes } = estadoAtual.caixas;
      const orcamentos = Object.fromEntries(
        Object.entries(estadoAtual.orcamentos).map(([competencia, orcamentoMes]) => {
          const { [caixaId]: _orcamento, ...orcamentoRestante } = orcamentoMes;
          return [competencia, orcamentoRestante];
        })
      );

      return {
        caixasCatalogo: estadoAtual.caixasCatalogo.filter((item) => item.id !== caixaId),
        caixas: caixasRestantes,
        orcamentos,
      };
    });

    return null;
  },

  atualizarCaixa: (caixa, valor) =>
    set((estado) => ({ caixas: { ...estado.caixas, [caixa]: Number(valor) || 0 } })),

  adicionarLancamento: (lancamento) => {
    const id = gerarId();
    const novoLancamento: Lancamento = { ...lancamento, id };

    set((estado) => {
      const lancamentos = [...estado.lancamentos, novoLancamento];
      const caixas = aplicarLancamentoNosSaldos(estado.caixas, lancamento, "adicionar");
      return { lancamentos, caixas };
    });
    return id;
  },

  adicionarParcelamento: (dados) => {
    const referenciaParcelamento = gerarId();
    criarLancamentosParcelamento(dados, referenciaParcelamento).forEach((lancamento) =>
      get().adicionarLancamento(lancamento)
    );
  },

  excluirLancamento: (id) => {
    set((estado) => {
      const lancamento = estado.lancamentos.find((item) => item.id === id);
      if (!lancamento) return estado;

      const caixas = aplicarLancamentoNosSaldos(estado.caixas, lancamento, "remover");
      return {
        lancamentos: estado.lancamentos.filter((item) => item.id !== id),
        caixas,
      };
    });
  },

  definirOrcamento: (competencia, caixa, valor) =>
    set((estado) => ({
      orcamentos: {
        ...estado.orcamentos,
        [competencia]: {
          ...(estado.orcamentos[competencia] || {}),
          [caixa]: Number(valor) || 0,
        },
      },
    })),

  adicionarTipoEntrada: (tipo) =>
    set((estado) => ({ tiposEntrada: [...new Set([...estado.tiposEntrada, tipo])] })),

  adicionarTipoSaida: (tipo) =>
    set((estado) => ({ tiposSaida: [...new Set([...estado.tiposSaida, tipo])] })),

  definirLimitesRiscoGlobais: (limites) =>
    set((estado) => ({
      limitesRisco: {
        ...estado.limitesRisco,
        global: { ...estado.limitesRisco.global, ...limites },
      },
    })),

  definirLimitesRiscoCaixa: (caixaId, limites) =>
    set((estado) => ({
      limitesRisco: {
        ...estado.limitesRisco,
        porCaixa: {
          ...estado.limitesRisco.porCaixa,
          [caixaId]: {
            ...(estado.limitesRisco.porCaixa[caixaId] ?? estado.limitesRisco.global),
            ...limites,
          },
        },
      },
    })),

  adicionarItemRecorrente: (item) => {
    const id = gerarId();
    set((estado) => ({
      itensRecorrentes: [...estado.itensRecorrentes, { ...item, id }],
    }));
    return id;
  },

  atualizarItemRecorrente: (id, dados) =>
    set((estado) => ({
      itensRecorrentes: estado.itensRecorrentes.map((item) =>
        item.id === id ? { ...item, ...dados } : item
      ),
    })),

  excluirItemRecorrente: (id) =>
    set((estado) => ({
      itensRecorrentes: estado.itensRecorrentes.filter((item) => item.id !== id),
    })),
}));
