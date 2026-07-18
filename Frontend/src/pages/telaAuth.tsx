import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FINANCE_API_BASE_URL } from "@/api";
import { useAuth } from "@/entities/auth";
import { Botao, Campo } from "@/shared/components";
import { useFundoTela } from "@/shared/estiloSuperficie";
import { COLORS, MARCA } from "@/shared/tokensDesign";

type ModoAuth = "login" | "cadastro";

export function TelaAuth() {
  const { login, cadastrar, erro, limparErro } = useAuth();
  const fundo = useFundoTela();
  const [modo, setModo] = useState<ModoAuth>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confPassword, setConfPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erroLocal, setErroLocal] = useState("");

  const alternarModo = () => {
    limparErro();
    setErroLocal("");
    setModo((atual) => (atual === "login" ? "cadastro" : "login"));
  };

  const enviar = async () => {
    setErroLocal("");
    limparErro();

    if (!email.trim() || !password) {
      setErroLocal("Informe e-mail e senha");
      return;
    }
    if (modo === "cadastro" && (!name.trim() || !confPassword)) {
      setErroLocal("Informe nome e confirmação de senha");
      return;
    }

    setEnviando(true);
    try {
      if (modo === "login") {
        await login({ email, password });
      } else {
        await cadastrar({ name, email, password, confPassword });
      }
    } catch {
    } finally {
      setEnviando(false);
    }
  };

  const erroVisivel = erroLocal || erro;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: fundo }}
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center px-12 py-7"
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-surface border border-border rounded-3xl px-3 py-10 min-h-[400px] justify-center shadow-xl shadow-slate-200/50">
            <Text
              className="text-[40px] font-semibold text-center mb-1"
              style={{ color: COLORS.primary }}
            >
              {MARCA}
            </Text>
            <Text className="text-text text-[28px] font-semibold text-center mb-3">
              {modo === "login" ? "Entrar" : "Criar conta"}
            </Text>
            <Text className="text-textMuted text-xl leading-7 mb-8 py-2 text-center">
              Seja bem-vindo(a) ao {MARCA}
            </Text>

            {modo === "cadastro" ? (
              <Campo
                label="Nome"
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
              />
            ) : null}

            <View className="py-2">
              <Campo
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                keyboardType="email-address"
              />
            </View>
            <View className="py-2">
              <Campo
                label="Senha"
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo de 8 caracteres"
                secureTextEntry
              />
            </View>
            {modo === "cadastro" ? (
              <Campo
                label="Confirmar senha"
                value={confPassword}
                onChangeText={setConfPassword}
                placeholder="Repita sua senha"
                secureTextEntry
              />
            ) : null}

            {erroVisivel ? (
              <Text className="text-error text-lg text-center mb-4">{erroVisivel}</Text>
            ) : null}

            <Botao
              label={enviando ? "" : modo === "login" ? "Entrar" : "Cadastrar"}
              onPress={enviar}
              disabled={enviando}
              size="lg"
            />
            {enviando ? (
              <View className="items-center -mt-9 mb-4">
                <ActivityIndicator
                  size="small"
                  color={COLORS.text}
                />
              </View>
            ) : null}

            <Pressable
              className="mt-4 items-center justify-center py-2.5"
              onPress={alternarModo}
              accessibilityRole="button"
            >
              <Text className="text-textMuted text-xl font-medium">
                {modo === "login" ? "Criar uma conta" : "Já tenho conta"}
              </Text>
            </Pressable>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
