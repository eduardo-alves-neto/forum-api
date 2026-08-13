import { Request } from 'express';

export interface JwtPayload {
  sub: number;
}

export interface AuthenticatedRequest extends Request {
  sub: JwtPayload;
}
