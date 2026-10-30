import { Request, Response, NextFunction } from 'express';
import UnauthorizedError from '../errors/unauthorized-error';
import { verifyToken } from '../utils/tokens';
import { JWT_ACCESS_SECRET } from '../config';

function auth(req: Request, _res: Response, next: NextFunction) {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authorization required'));
  }

  const token = authorization.slice(7);
  if (!token.trim()) {
    return next(new UnauthorizedError('Authorization required'));
  }

  try {
    verifyToken(token, JWT_ACCESS_SECRET);
    next();
  } catch (error) {
    next(error);
  }
}

export default auth;
