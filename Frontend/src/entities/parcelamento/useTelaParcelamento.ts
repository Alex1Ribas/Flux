import { useMemo, useState } from "react";

import { enviarParcelamentoNaApi } from "@/api";
import { useSincronizarRemoto } from "@/entities/sincronizacao";
import { useStore } from "@/entities/store";
import {
  calcPreviewParcelamento,
  mensagemSucessoParcelamento,
  montarParcelamentoForm,
  validarParcelamento,
  temErrosParcelamento,
  type ErrosParcelamento,
} from "@/service/parcelamento";
import { getMesAtual } from "@/utils/helpers";

export function useTelaParcelamento() {
  const { token, sincronizar } = useSincronizarRemoto();
  const { caixasCatalogo, tiposSaida } = useStore();
  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [parcelas, setParcelas] = useState("12");
  const [primeiraCompetencia, setPrimeiraCompetencia] = useState(getMesAtual());
  const [caixaOrigem, setCaixaOrigem] = useState("");
  const [erro, setErro] = useState<ErrosParcelamento>({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  const formulario = useMemo(
    () =>
      montarParcelamentoForm({
        tipo,
        descricao,
        valorTotal,
        parcelas,
        primeiraCompetencia,
        caixaOrigem,
      }),
    [caixaOrigem, descricao, parcelas, primeiraCompetencia, tipo, valorTotal]
  );

  const preview = useMemo(() => calcPreviewParcelamento(formulario), [formulario]);

  const salvar = async (): Promise<string | null> => {
    const erros = validarParcelamento(formulario);
    if (temErrosParcelamento(erros)) {
      setErro(erros);
      setErroGeral("");
      return null;
    }

    if (!token) {
      setErroGeral("Sessão expirada. Faça login novamente.");
      return null;
    }

    setSalvando(true);
    setErro({});
    setErroGeral("");

    try {
      await enviarParcelamentoNaApi(token, {
        valorTotal: formulario.valorTotal,
        parcelas: formulario.parcelas,
        primeiraCompetencia: formulario.primeiraCompetencia,
        descricao: formulario.descricao || formulario.tipo,
        tipoDescricao: formulario.tipo,
        caixaOrigem: formulario.caixaOrigem,
      });
      await sincronizar();

      const previewSalvo = calcPreviewParcelamento(formulario);
      return previewSalvo
        ? mensagemSucessoParcelamento(previewSalvo)
        : "Parcelamento criado com sucesso.";
    } catch {
      setErroGeral("Não foi possível criar o parcelamento na API");
      return null;
    } finally {
      setSalvando(false);
    }
  };

  return {
    caixasCatalogo,
    tiposSaida,
    tipo,
    setTipo,
    descricao,
    setDescricao,
    valorTotal,
    setValorTotal,
    parcelas,
    setParcelas,
    primeiraCompetencia,
    setPrimeiraCompetencia,
    caixaOrigem,
    setCaixaOrigem,
    erro,
    erroGeral,
    salvando,
    preview,
    salvar,
  };
}
