export interface IOrcamento {
  _id: string;
  user: string;
  caixa: string;
  competencia: string;
  valor: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IParamsCreateOrcamento {
  user: string;
  caixa: string;
  competencia: string;
  valor: number;
}
