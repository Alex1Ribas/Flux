export const formatBRL = (value: number | string): string => {
  const num = Number(value) || 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const getMesAtual = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const getDataAtual = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export const getMesDeCompetencia = (competencia: string): string => competencia.slice(0, 7);

export const competenciaNoMes = (competencia: string, mes: string): boolean =>
  getMesDeCompetencia(competencia) === mes;

export const parseCompetencia = (competencia: string): Date => {
  const [ano, mes, dia] = competencia.split("-").map(Number);
  if (dia) {
    return new Date(ano, mes - 1, dia);
  }
  return new Date(ano, mes - 1, 1);
};

export const dataParaCompetencia = (data: Date): string =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;

const MESES_CURTOS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export const getMesLabel = (competencia: string): string => {
  if (!competencia) return "";
  const [ano, mes] = competencia.split("-");
  return `${MESES_CURTOS[parseInt(mes, 10) - 1]}/${ano}`;
};

export const getCompetenciaLabel = (competencia: string): string => {
  if (!competencia) return "";
  const partes = competencia.split("-");
  if (partes.length >= 3) {
    const [ano, mes, dia] = partes;
    return `${parseInt(dia, 10)} ${MESES_CURTOS[parseInt(mes, 10) - 1]} ${ano}`;
  }
  return getMesLabel(competencia);
};

export const formatarCompetencia = (competencia: string): string => {
  if (!competencia) return "";
  if (competencia.split("-").length >= 3) {
    return parseCompetencia(competencia).toLocaleDateString("pt-BR");
  }
  return getMesLabel(competencia);
};

export const gerarId = (): string =>
  Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

export const getMesesFuturos = (inicio: string, qtd: number): string[] => {
  const resultado: string[] = [];
  const [ano, mes] = inicio.split("-").map(Number);
  for (let i = 0; i < qtd; i++) {
    let novoMes = mes + i;
    let novoAno = ano + Math.floor((novoMes - 1) / 12);
    novoMes = ((novoMes - 1) % 12) + 1;
    resultado.push(`${novoAno}-${String(novoMes).padStart(2, "0")}`);
  }
  return resultado;
};

export const mesAnterior = (competencia: string): string => {
  const [ano, mes] = competencia.split("-").map(Number);
  let novoMes = mes - 1;
  let novoAno = ano;
  if (novoMes < 1) {
    novoMes = 12;
    novoAno--;
  }
  return `${novoAno}-${String(novoMes).padStart(2, "0")}`;
};

export const mesSeguinte = (competencia: string): string => {
  const [ano, mes] = competencia.split("-").map(Number);
  let novoMes = mes + 1;
  let novoAno = ano;
  if (novoMes > 12) {
    novoMes = 1;
    novoAno++;
  }
  return `${novoAno}-${String(novoMes).padStart(2, "0")}`;
};

export const getMesesPassados = (fim: string, qtd: number): string[] => {
  const resultado: string[] = [];
  let competencia = fim;
  for (let i = 0; i < qtd; i++) {
    resultado.unshift(competencia);
    competencia = mesAnterior(competencia);
  }
  return resultado;
};

export const somarCaixas = (caixas: Record<string, number>): number =>
  Object.values(caixas).reduce((total, saldo) => total + (Number(saldo) || 0), 0);

export const getDiasNoMes = (competencia: string): number => {
  const [ano, mes] = competencia.split("-").map(Number);
  return new Date(ano, mes, 0).getDate();
};

export const getDiaCompetencia = (competencia: string): number => {
  const partes = competencia.split("-");
  if (partes.length >= 3) return parseInt(partes[2], 10);
  return getDiasNoMes(getMesDeCompetencia(competencia));
};
