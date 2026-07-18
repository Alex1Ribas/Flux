import type { IJwtPayload } from '../../domain/common/types/IJwtPayload.js';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

export {};
