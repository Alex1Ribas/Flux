import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { preferenciasApi } from "@/api";
import { feedbackTactilLeve } from "@/shared/feedbackTactil";
import { useCores } from "@/shared/tema";
import type { TipoLancamento } from "@/types/flux";

import { useTokensInicio } from "./tokensInicio";

const DEBOUNCE_MS = 300;

interface AutocompleteCategoriaProps {
  token?: string;
  modo: TipoLancamento;
  valor: string;
  onChange: (categoria: string) => void;
}

export function AutocompleteCategoria({
  token,
  modo,
  valor,
  onChange,
}: AutocompleteCategoriaProps) {
  const tokens = useTokensInicio();
  const cores = useCores();
  const [texto, setTexto] = useState(valor);
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [buscaFeita, setBuscaFeita] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requisicaoRef = useRef(0);

  useEffect(() => {
    setTexto(valor);
  }, [valor]);

  useEffect(() => {
    setSugestoes([]);
    setBuscaFeita(false);
    setAberto(false);
  }, [modo]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const buscar = (query: string) => {
    if (!token) {
      setSugestoes([]);
      setBuscaFeita(true);
      return;
    }

    const id = ++requisicaoRef.current;
    setCarregando(true);

    preferenciasApi
      .buscarCategorias(token, { q: query, tipo: modo })
      .then((lista) => {
        if (id !== requisicaoRef.current) return;
        setSugestoes(lista);
        setBuscaFeita(true);
        setAberto(true);
      })
      .catch(() => {
        if (id !== requisicaoRef.current) return;
        setSugestoes([]);
        setBuscaFeita(true);
        setAberto(true);
      })
      .finally(() => {
        if (id === requisicaoRef.current) setCarregando(false);
      });
  };

  const aoDigitar = (novoTexto: string) => {
    setTexto(novoTexto);
    onChange(novoTexto.trim());
    setAberto(true);
    setBuscaFeita(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => buscar(novoTexto.trim()), DEBOUNCE_MS);
  };

  const selecionar = (categoria: string) => {
    const nome = categoria.trim();
    void feedbackTactilLeve();
    setTexto(nome);
    onChange(nome);
    setAberto(false);
    setSugestoes([]);
    setBuscaFeita(false);
  };

  const adicionarDigitado = () => {
    const nome = texto.trim();
    if (!nome) return;
    selecionar(nome);
  };

  const mostrarAdicionar =
    buscaFeita && !carregando && texto.trim().length > 0 && sugestoes.length === 0;

  const mostraLista = aberto && (carregando || sugestoes.length > 0 || mostrarAdicionar);

  return (
    <View>
      <View
        className="flex-row items-center rounded-2xl border border-border bg-surface2 px-3"
        style={{ minHeight: 48 }}
      >
        <TextInput
          value={texto}
          onChangeText={aoDigitar}
          onFocus={() => {
            setAberto(true);
            if (!buscaFeita) buscar(texto.trim());
          }}
          onSubmitEditing={adicionarDigitado}
          placeholder="Categoria"
          placeholderTextColor={tokens.textMuted}
          returnKeyType="done"
          autoCorrect={false}
          autoCapitalize="sentences"
          className="flex-1 text-text text-md py-3"
          style={{ color: tokens.text }}
          accessibilityLabel="Categoria do lançamento"
        />
        {carregando ? (
          <ActivityIndicator
            size="small"
            color={cores.textMuted}
          />
        ) : null}
      </View>

      {mostraLista ? (
        <View
          className="mt-2 rounded-2xl border border-border overflow-hidden"
          style={{ backgroundColor: tokens.surfaceActive }}
        >
          {carregando && sugestoes.length === 0 ? (
            <Text className="text-textMuted text-sm px-4 py-3">Buscando…</Text>
          ) : null}

          {sugestoes.map((item) => (
            <Pressable
              key={item}
              onPress={() => selecionar(item)}
              className="px-4 py-3 border-b border-border active:opacity-80"
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.98 : 1 }] })}
              accessibilityRole="button"
            >
              <Text className="text-text text-md">{item}</Text>
            </Pressable>
          ))}

          {mostrarAdicionar ? (
            <Pressable
              onPress={adicionarDigitado}
              className="px-4 py-3"
              accessibilityRole="button"
              accessibilityLabel={`Adicionar categoria ${texto.trim()}`}
            >
              <Text
                className="text-md font-semibold"
                style={{ color: cores.primary }}
              >
                + Adicionar &quot;{texto.trim()}&quot;
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
