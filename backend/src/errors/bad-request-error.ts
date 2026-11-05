import HttpStatus from '../constants/http-status';
import HttpError from './http-error';

class BadRequestError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export default BadRequestError;
