import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authApi, type CadastroUsuarioPayload, type LoginPayload, type UsuarioApi } from "@/api";
import { getItem, removeItem, setItem } from "@/utils/storage";

const CHAVE_TOKEN = "finance_api_token";
const CHAVE_USUARIO_ID = "finance_api_usuario_id";

interface SessaoUsuario {
  token: string;
  usuarioId: string;
  usuario?: UsuarioApi;
}

interface AuthContextValue {
  sessao: SessaoUsuario | null;
  carregando: boolean;
  erro: string;
  login: (payload: LoginPayload) => Promise<void>;
  cadastrar: (payload: CadastroUsuarioPayload) => Promise<void>;
  logout: () => Promise<void>;
  limparErro: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function mensagemErro(error: unknown): string {
  if (
    typeof error === "object" &&
    error &&
    "payload" in error &&
    typeof error.payload === "object" &&
    error.payload &&
    "message" in error.payload
  ) {
    return String(error.payload.message);
  }
  if (error instanceof Error) return error.message;
  return "Não foi possível concluir a autenticação";
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [sessao, setSessao] = useState<SessaoUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const salvarSessao = useCallback(async (token: string, usuarioId: string) => {
    await Promise.all([setItem(CHAVE_TOKEN, token), setItem(CHAVE_USUARIO_ID, usuarioId)]);
    const usuario = await authApi.buscarUsuario(usuarioId, token);
    setSessao({ token, usuarioId, usuario });
  }, []);

  const limparSessao = useCallback(async () => {
    await Promise.all([removeItem(CHAVE_TOKEN), removeItem(CHAVE_USUARIO_ID)]);
    setSessao(null);
  }, []);

  useEffect(() => {
    async function restaurarSessao() {
      try {
        const [token, usuarioId] = await Promise.all([
          getItem(CHAVE_TOKEN),
          getItem(CHAVE_USUARIO_ID),
        ]);
        if (token && usuarioId) {
          await salvarSessao(token, usuarioId);
        }
      } catch {
        await limparSessao();
      } finally {
        setCarregando(false);
      }
    }

    restaurarSessao();
  }, [limparSessao, salvarSessao]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setErro("");
      try {
        const resposta = await authApi.login(payload);
        await salvarSessao(resposta.token, resposta.id);
      } catch (error) {
        setErro(mensagemErro(error));
        throw error;
      }
    },
    [salvarSessao]
  );

  const cadastrar = useCallback(
    async (payload: CadastroUsuarioPayload) => {
      setErro("");
      try {
        await authApi.cadastrar(payload);
        await login({ email: payload.email, password: payload.password });
      } catch (error) {
        setErro(mensagemErro(error));
        throw error;
      }
    },
    [login]
  );

  const logout = useCallback(async () => {
    setErro("");
    await limparSessao();
  }, [limparSessao]);

  const value = useMemo(
    () => ({
      sessao,
      carregando,
      erro,
      login,
      cadastrar,
      logout,
      limparErro: () => setErro(""),
    }),
    [cadastrar, carregando, erro, login, logout, sessao]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
