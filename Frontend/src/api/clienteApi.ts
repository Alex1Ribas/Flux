export interface ConfigClienteApi {
  baseUrl: string;
  headers?: Record<string, string>;
}

export interface OpcoesRequisicaoApi extends RequestInit {
  path: string;
}

export class ErroApi extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown
  ) {
    super(message);
    this.name = "ErroApi";
  }
}

export function criarClienteApi(config: ConfigClienteApi) {
  async function request<TResponse>({
    path,
    headers,
    ...options
  }: OpcoesRequisicaoApi): Promise<TResponse> {
    const resposta = await fetch(`${config.baseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
        ...headers,
      },
    });

    const texto = await resposta.text();
    const payload = texto ? JSON.parse(texto) : null;

    if (!resposta.ok) {
      throw new ErroApi("Erro ao consultar API", resposta.status, payload);
    }

    return payload as TResponse;
  }

  return {
    get: <TResponse>(path: string, options?: Omit<OpcoesRequisicaoApi, "path" | "method">) =>
      request<TResponse>({ ...options, path, method: "GET" }),
    post: <TResponse, TBody>(
      path: string,
      body: TBody,
      options?: Omit<OpcoesRequisicaoApi, "path" | "method" | "body">
    ) => request<TResponse>({ ...options, path, method: "POST", body: JSON.stringify(body) }),
    put: <TResponse, TBody>(
      path: string,
      body: TBody,
      options?: Omit<OpcoesRequisicaoApi, "path" | "method" | "body">
    ) => request<TResponse>({ ...options, path, method: "PUT", body: JSON.stringify(body) }),
    delete: <TResponse>(path: string, options?: Omit<OpcoesRequisicaoApi, "path" | "method">) =>
      request<TResponse>({ ...options, path, method: "DELETE" }),
  };
}
