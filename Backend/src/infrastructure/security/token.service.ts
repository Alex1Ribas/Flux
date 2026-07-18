import jwt, { type SignOptions } from 'jsonwebtoken';
import { IJwtPayload } from '../../domain/common/types/IJwtPayload.js';
import { DomainError } from '../../domain/common/errors/DomainError.js';
import { EErrorCode } from '../../domain/common/errors/enums/EErrorCode.js';
import { env } from '../../configurations/env/env.config.js';

export interface ITokenSignInput {
  _id: string;
  email: string;
  role: IJwtPayload['role'];
}

export class TokenService {
  sign(payload: ITokenSignInput): string {
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRATION as SignOptions['expiresIn'],
    };
    return jwt.sign(
      { _id: payload._id, email: payload.email, role: payload.role },
      env.JWT_SECRET,
      options,
    );
  }

  verify(token: string): IJwtPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as IJwtPayload;
      return decoded;
    } catch {
      throw new DomainError(EErrorCode.INVALID_TOKEN, 401);
    }
  }
}
