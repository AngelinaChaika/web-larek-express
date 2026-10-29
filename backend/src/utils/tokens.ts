import jsonwebtoken, { JsonWebTokenError } from 'jsonwebtoken';
import mongoose from 'mongoose';
import UnauthorizedError from '../errors/unauthorized-error';
import BadRequestError from '../errors/bad-request-error';
import {
  AUTH_REFRESH_TOKEN_EXPIRY,
  AUTH_ACCESS_TOKEN_EXPIRY,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
} from '../config';

function generateTokens(userId: string) {
  const accessToken = jsonwebtoken.sign(
    { _id: userId },
    JWT_ACCESS_SECRET,
    { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY },
  );

  const refreshToken = jsonwebtoken.sign(
    { _id: userId },
    JWT_REFRESH_SECRET,
    { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY },
  );

  return { accessToken, refreshToken };
}

function verifyToken(token: string, secret: string, invalidIdStatus = 401) {
  try {
    const decoded = jsonwebtoken.verify(token, secret);

    if (typeof decoded === 'string' || !decoded._id || typeof decoded._id !== 'string') {
      throw new UnauthorizedError('Invalid token');
    }

    if (!mongoose.isValidObjectId(decoded._id)) {
      if (invalidIdStatus === 400) {
        throw new BadRequestError('Invalid user ID');
      }
      throw new UnauthorizedError('Invalid token');
    }

    return decoded._id;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw error;
  }
}

export { generateTokens, verifyToken };
