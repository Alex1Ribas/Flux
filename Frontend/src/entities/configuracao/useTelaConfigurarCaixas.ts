import { useState } from "react";

import { caixasApi, orcamentosApi } from "@/api";
import { useSincronizarRemoto } from "@/entities/sincronizacao";
import { useStore } from "@/entities/store";
import { montarValoresCaixaTexto, montarValoresOrcamentoTexto } from "@/service/configurar";
import { getMesAtual } from "@/utils/helpers";

export function useTelaConfigurarCaixas() {
  const { token, sincronizar } = useSincronizarRemoto();
  const { caixas, caixasCatalogo, orcamentos } = useStore();
  const mes = getMesAtual();

  const [valoresCaixa, setValoresCaixa] = useState<Record<string, string>>(() =>
    montarValoresCaixaTexto(caixas, caixasCatalogo)
  );
  const [valoresOrc, setValoresOrc] = useState<Record<string, string>>(() =>
    montarValoresOrcamentoTexto(orcamentos, mes, caixasCatalogo)
  );
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    setErro("");

    if (!token) {
      setErro("Sessão expirada. Faça login novamente.");
      return;
    }

    setSalvando(true);
    try {
      await Promise.all(
        caixasCatalogo.map((caixa) =>
          caixasApi.atualizar(token, caixa.id, {
            saldo: Number(valoresCaixa[caixa.id]) || 0,
          })
        )
      );
      await orcamentosApi.salvar(
        token,
        mes,
        Object.entries(valoresOrc)
          .filter(([, valor]) => valor !== "")
          .map(([caixa, valor]) => ({ caixa, valor: Number(valor) || 0 }))
      );

      await sincronizar();
      setSalvo(true);
      setTimeout(() => setSalvo(false), 2000);
    } catch {
      setErro("Não foi possível salvar a configuração na API");
    } finally {
      setSalvando(false);
    }
  };

  return {
    mes,
    caixasCatalogo,
    valoresCaixa,
    setValoresCaixa,
    valoresOrc,
    setValoresOrc,
    salvo,
    erro,
    salvando,
    salvar,
  };
}
