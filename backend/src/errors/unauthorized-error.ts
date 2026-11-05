import HttpStatus from '../constants/http-status';
import HttpError from './http-error';

class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export default UnauthorizedError;
