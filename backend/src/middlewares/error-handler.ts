import { Request, Response, NextFunction } from 'express';
import { isCelebrateError } from 'celebrate';
import { MulterError } from 'multer';
import HttpStatus from '../constants/http-status';
import HttpError from '../errors/http-error';

function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.statusCode).send({ message: err.message });
    return;
  }
  if (isCelebrateError(err)) {
    const validationError = [...err.details.values()][0];
    const message = validationError?.message || 'Validation error';
    res.status(HttpStatus.BAD_REQUEST).send({ message });
    return;
  }
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(HttpStatus.BAD_REQUEST).send({ message: 'File is too large' });
      return;
    }
    res.status(HttpStatus.BAD_REQUEST).send({ message: err.message });
    return;
  }
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'Internal Server Error' });
}

export default errorHandler;
