import { Request, Response, NextFunction } from 'express';
import { isCelebrateError, Segments } from 'celebrate';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import ConflictError from '../errors/conflict-error';
import UnauthorizedError from '../errors/unauthorized-error';

function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (
    err instanceof BadRequestError
    || err instanceof NotFoundError
    || err instanceof ConflictError
    || err instanceof UnauthorizedError
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
