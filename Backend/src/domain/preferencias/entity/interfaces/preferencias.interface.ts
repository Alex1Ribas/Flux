export interface ILimitesRisco {
  saudavel: number;
  atencao: number;
}

export interface IConfigLimitesRisco {
  global: ILimitesRisco;
  porCaixa: Record<string, ILimitesRisco>;
}

export interface IPreferencias {
  _id: string;
  user: string;
  tiposEntrada: string[];
  tiposSaida: string[];
  limitesRisco: IConfigLimitesRisco;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IParamsUpdatePreferencias {
  tiposEntrada?: string[];
  tiposSaida?: string[];
  limitesRisco?: IConfigLimitesRisco;
}
