import type { ItemRecorrente } from "@/types/flux";
import { getDataAtual } from "@/utils/helpers";

export interface FormularioItemRecorrente {
  nome: string;
  tipo: "entrada" | "saida";
  valorTexto: string;
  caixaId: string;
  competenciaInicial: string;
  duracaoMesesTexto: string;
}

export interface AcoesItensRecorrentes {
  adicionarItemRecorrente: (item: Omit<ItemRecorrente, "id">) => string;
  atualizarItemRecorrente: (id: string, dados: Partial<Omit<ItemRecorrente, "id">>) => void;
  excluirItemRecorrente: (id: string) => void;
}

const COMPETENCIA_INICIAL_PATTERN = /^\d{4}-\d{2}(?:-\d{2})?$/;

export function montarFormularioItemRecorrente(
  item: ItemRecorrente | null,
  caixaPadrao = ""
): FormularioItemRecorrente {
  if (!item) {
    return {
      nome: "",
      tipo: "saida",
      valorTexto: "",
      caixaId: caixaPadrao,
      competenciaInicial: getDataAtual(),
      duracaoMesesTexto: "12",
    };
  }

  return {
    nome: item.nome,
    tipo: item.tipo,
    valorTexto: String(item.valor),
    caixaId: item.caixaId || caixaPadrao,
    competenciaInicial: item.competenciaInicial,
    duracaoMesesTexto: String(item.duracaoMeses),
  };
}

export function validarFormularioItemRecorrente(
  formulario: FormularioItemRecorrente,
  itens: ItemRecorrente[],
  itemIdEdicao: string | null
): string | null {
  const nome = formulario.nome.trim();
  if (!nome) return "Informe o nome do item";

  const nomeDuplicado = itens.some(
    (item) => item.nome.toLowerCase() === nome.toLowerCase() && item.id !== itemIdEdicao
  );
  if (nomeDuplicado) return "Já existe um item com este nome";

  const valor = Number(formulario.valorTexto);
  if (!formulario.valorTexto || Number.isNaN(valor) || valor <= 0) {
    return "Informe um valor válido";
  }

  if (!formulario.caixaId) {
    return formulario.tipo === "entrada"
      ? "Selecione a caixa de destino"
      : "Selecione a caixa de origem";
  }

  const duracao = Number(formulario.duracaoMesesTexto);
  if (!formulario.duracaoMesesTexto || Number.isNaN(duracao) || duracao < 1) {
    return "Informe a duração em meses (mínimo 1)";
  }

  if (!COMPETENCIA_INICIAL_PATTERN.test(formulario.competenciaInicial)) {
    return "Competência inicial inválida (use AAAA-MM ou AAAA-MM-DD)";
  }

  const partes = formulario.competenciaInicial.split("-");
  if (partes.length >= 3) {
    const dia = Number(partes[2]);
    if (Number.isNaN(dia) || dia < 1 || dia > 31) {
      return "Dia inválido na competência inicial";
    }
  }

  return null;
}

export function executarSalvarItemRecorrente(
  itemIdEdicao: string | null,
  formulario: FormularioItemRecorrente,
  itens: ItemRecorrente[],
  acoes: AcoesItensRecorrentes
): string | null {
  const erro = validarFormularioItemRecorrente(formulario, itens, itemIdEdicao);
  if (erro) return erro;

  const dados = {
    nome: formulario.nome.trim(),
    tipo: formulario.tipo,
    valor: Number(formulario.valorTexto),
    caixaId: formulario.caixaId,
    competenciaInicial: formulario.competenciaInicial,
    duracaoMeses: Number(formulario.duracaoMesesTexto),
    ativo: true,
  };

  if (itemIdEdicao) {
    acoes.atualizarItemRecorrente(itemIdEdicao, dados);
  } else {
    acoes.adicionarItemRecorrente(dados);
  }

  return null;
}

export function criarItemRecorrenteId(): string {
  return `rec_${Date.now().toString(36)}`;
}
