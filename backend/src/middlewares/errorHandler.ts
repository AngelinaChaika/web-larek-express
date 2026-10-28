import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';
import ConflictError from '../errors/ConflictError';

function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (
    err instanceof BadRequestError
    || err instanceof NotFoundError
    || err instanceof ConflictError
  ) {
    res.status(err.statusCode).send({ message: err.message });
    return;
  }
  res.status(500).send({ message: 'Internal Server Error' });
}

export default errorHandler;
