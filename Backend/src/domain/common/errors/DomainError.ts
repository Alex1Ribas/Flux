import { EErrorCode } from './enums/EErrorCode.js';

export class DomainError extends Error {
  constructor(
    public readonly code: EErrorCode,
    public readonly status: number,
  ) {
    super(code);
    this.name = 'DomainError';
  }
}
