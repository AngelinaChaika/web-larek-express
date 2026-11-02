import HttpStatus from '../constants/http-status';
import HttpError from './http-error';

class ConflictError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

export default ConflictError;
