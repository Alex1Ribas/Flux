import { useEffect, useState } from "react";
import { Text, type TextProps, type TextStyle } from "react-native";
import { MotiView } from "moti";

import { formatBRL } from "@/utils/helpers";

interface NumeroAnimadoProps {
  valor: number;
  formatar?: (valor: number) => string;
  duracaoMs?: number;
  className?: string;
  style?: TextStyle;
  numberOfLines?: TextProps["numberOfLines"];
  prefixo?: string;
}

/** Conta de 0 até o valor final com easing suave (Acompanhamento / Dashboard). */
export function NumeroAnimado({
  valor,
  formatar = formatBRL,
  duracaoMs = 900,
  className,
  style,
  numberOfLines,
  prefixo = "",
}: NumeroAnimadoProps) {
  const [exibido, setExibido] = useState(0);

  useEffect(() => {
    const alvo = Number(valor) || 0;
    if (alvo === 0) {
      setExibido(0);
      return;
    }

    const inicio = Date.now();
    let frame = 0;

    const tick = () => {
      const t = Math.min(1, (Date.now() - inicio) / duracaoMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setExibido(alvo * eased);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setExibido(alvo);
      }
    };

    setExibido(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [valor, duracaoMs]);

  return (
    <MotiView
      from={{ opacity: 0.4, translateY: 4 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 320 }}
    >
      <Text
        className={className}
        style={style}
        numberOfLines={numberOfLines}
      >
        {prefixo}
        {formatar(exibido)}
      </Text>
    </MotiView>
  );
}
