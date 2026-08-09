import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
  Text,
} from "react-native";

import { Botao } from "@/shared/components";
import { useCores } from "@/shared/tema";
import { INSTRUCOES_ONBOARDING, PROPORCAO_ONBOARDING } from "@/shared/instrucoesBoasVindas";

const { width: LARGURA_TELA } = Dimensions.get("window");
const SLIDES = INSTRUCOES_ONBOARDING;
const { titulo, subtitulo, descritivo, icone } = PROPORCAO_ONBOARDING;

interface CarrosselBoasVindasProps {
  onConcluir: () => void;
  onConfigurar: () => void;
}

export function CarrosselBoasVindas({ onConcluir, onConfigurar }: CarrosselBoasVindasProps) {
  const cores = useCores();
  const [indiceAtual, setIndiceAtual] = useState(0);
  const listaRef = useRef<FlatList>(null);
  const ultimoSlide = indiceAtual === SLIDES.length - 1;

  const aoRolar = (evento: NativeSyntheticEvent<NativeScrollEvent>) => {
    const indice = Math.round(evento.nativeEvent.contentOffset.x / LARGURA_TELA);
    setIndiceAtual(indice);
  };

  const irPara = (indice: number) => {
    listaRef.current?.scrollToIndex({ index: indice, animated: true });
    setIndiceAtual(indice);
  };

  const renderIlustracao = (tipo: (typeof SLIDES)[number]["ilustracao"]) => {
    if (tipo === "dinheiro") {
      return (
        <View className="h-[300px] items-center justify-center">
          <View
            className="absolute rounded-full"
            style={{
              width: 170,
              height: 170,
              borderWidth: 2,
              borderColor: cores.primary + "55",
            }}
          />
          <View
            className="rounded-full items-center justify-center"
            style={{
              width: 92,
              height: 92,
              backgroundColor: cores.primary,
            }}
          >
            <Text style={{ color: cores.bg, fontSize: icone, fontWeight: "700" }}>R$</Text>
          </View>
        </View>
      );
    }

    if (tipo === "caixas") {
      const caixas = [
        { label: "Meta", altura: 120 },
        { label: "Reserva", altura: 180 },
        { label: "Objetivo", altura: 150 },
      ];
      return (
        <View className="h-[300px] flex-row items-end justify-center gap-[18px]">
          {caixas.map((caixa) => (
            <View
              key={caixa.label}
              className="rounded-2xl items-center justify-center"
              style={{
                width: 75,
                height: caixa.altura,
                backgroundColor: cores.surface2,
              }}
            >
              <Text style={{ color: cores.primary, fontSize: descritivo, fontWeight: "600" }}>
                {caixa.label}
              </Text>
            </View>
          ))}
        </View>
      );
    }

    if (tipo === "grafico") {
      const barras = [42, 68, 58, 92, 120];
      return (
        <View className="h-[300px] items-center justify-center">
          <View
            className="flex-row items-end gap-3 px-4 pb-4"
            style={{
              width: 250,
              height: 150,
              borderLeftWidth: 2,
              borderBottomWidth: 2,
              borderColor: cores.border,
            }}
          >
            {barras.map((altura, indice) => (
              <View
                key={indice}
                className="rounded-t-xl"
                style={{
                  width: 28,
                  height: altura,
                  backgroundColor: indice === barras.length - 1 ? cores.primary : cores.surface3,
                }}
              />
            ))}
          </View>
        </View>
      );
    }

    const cards = ["Caixas", "Contas", "Acompanhamento", "Movimentos"];
    return (
      <View className="h-[300px] items-center justify-center">
        <View className="flex-row flex-wrap gap-4 px-2">
          {cards.map((card, indice) => (
            <View
              key={card}
              className="rounded-2xl p-4"
              style={{ width: 132, backgroundColor: cores.surface }}
            >
              <Text style={{ color: cores.text, fontSize: descritivo, fontWeight: "700" }}>
                {card}
              </Text>
              <View
                className="mt-4 rounded-full overflow-hidden"
                style={{ height: 8, backgroundColor: cores.surface3 }}
              >
                <View
                  style={{
                    height: 8,
                    width: `${[70, 55, 82, 40][indice]}%`,
                    backgroundColor: cores.primary,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-bg">
      <View className="items-end px-8 pt-3">
        <Pressable onPress={onConcluir}>
          <Text style={{ color: cores.textMuted, fontSize: descritivo }}>Pular</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listaRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={aoRolar}
        keyExtractor={(slide) => slide.titulo}
        renderItem={({ item: slide }) => {
          return (
            <View
              style={{ width: LARGURA_TELA }}
              className="flex-1 px-9"
            >
              {renderIlustracao(slide.ilustracao)}
              <View>
                <Text
                  className="text-text font-bold mb-[18px]"
                  style={{ fontSize: titulo, lineHeight: titulo + 8 }}
                >
                  {slide.titulo}
                </Text>
                <Text
                  className="text-textMuted"
                  style={{ fontSize: descritivo, lineHeight: subtitulo }}
                >
                  {slide.descricao}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View className="px-8 pb-10 flex-row justify-between items-center">
        <View className="flex-row gap-2">
          {SLIDES.map((slide, indice) => (
            <View
              key={slide.titulo}
              className="h-2 rounded-full"
              style={{
                width: indice === indiceAtual ? 30 : 8,
                backgroundColor: indice === indiceAtual ? cores.primary : cores.border,
              }}
            />
          ))}
        </View>

        <View className="flex-row gap-2.5 flex-1 justify-end ml-5">
          {indiceAtual > 0 && (
            <Botao
              label="Anterior"
              onPress={() => irPara(indiceAtual - 1)}
              variant="secondary"
              style={{ minWidth: 104 }}
            />
          )}
          {ultimoSlide ? (
            <Botao
              label="Itens recorrentes"
              onPress={onConfigurar}
              variant="primary"
              style={{ minWidth: 150 }}
            />
          ) : (
            <Botao
              label="Continuar"
              onPress={() => irPara(indiceAtual + 1)}
              variant="primary"
              style={{ minWidth: 118 }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
