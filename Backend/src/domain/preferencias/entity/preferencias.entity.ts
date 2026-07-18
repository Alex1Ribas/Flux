import type { IConfigLimitesRisco, IPreferencias } from './interfaces/preferencias.interface.js';

export class Preferencias implements IPreferencias {
  constructor(
    public _id: string,
    public user: string,
    public tiposEntrada: string[],
    public tiposSaida: string[],
    public limitesRisco: IConfigLimitesRisco,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
