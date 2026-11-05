import HttpStatus from '../constants/http-status';
import HttpError from './http-error';

class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export default NotFoundError;
