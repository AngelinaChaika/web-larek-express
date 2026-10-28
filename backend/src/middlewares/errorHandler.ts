import { Request, Response, NextFunction } from 'express';
import { isCelebrateError, Segments } from 'celebrate';
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
  if (isCelebrateError(err)) {
    const error = err.details.get(Segments.BODY);
    const message = error ? error.message : 'Validation error';
    res.status(400).send({ message });
    return;
  }
  res.status(500).send({ message: 'Internal Server Error' });
}

export default errorHandler;
