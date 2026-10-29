import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import bcryptjs from 'bcryptjs';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import UnauthorizedError from '../errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';
import userModel from '../models/user';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../config';
import { generateTokens, verifyToken } from '../utils/tokens';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/cookies';

async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    user.tokens.push({ token: refreshToken });

    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(201)
      .send({
        user:
        {
          name: user.name,
          email: user.email,
        },
        accessToken,
        success: true,
      });
  } catch (error) {
    if (error instanceof Error && error.message.includes('E11000')) {
      const conflictError = new ConflictError('User with this email already exists');
      next(conflictError);
    } else if (error instanceof MongooseError.ValidationError) {
      const validationError = new BadRequestError(error.message);
      next(validationError);
    } else {
      next(error);
    }
  }
}

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select('+password').select('+tokens');

    if (!user) {
      throw new UnauthorizedError('Incorrect email or password');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Incorrect email or password');
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    user.tokens.push({ token: refreshToken });

    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    res.status(200)
      .send({
        user:
        {
          name: user.name,
          email: user.email,
        },
        accessToken,
        success: true,
      });
  } catch (error) {
    next(error);
  }
}

async function refreshAccessToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.cookies;

    if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
      throw new UnauthorizedError('Refresh token is missing');
    }

    const secret = JWT_REFRESH_SECRET;
    const userId = verifyToken(refreshToken, secret);

    const user = await userModel.findById(userId).select('+tokens');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isTokenValid = user.tokens.some((t) => t.token === refreshToken);

    if (!isTokenValid) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);

    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    } = generateTokens(user._id.toString());

    user.tokens.push({ token: newRefreshToken });

    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200)
      .send({
        user:
        {
          name: user.name,
          email: user.email,
        },
        accessToken: newAccessToken,
        success: true,
      });
  } catch (error) {
    next(error);
  }
}

async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.cookies;

    if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
      throw new UnauthorizedError('Refresh token is missing');
    }

    const secret = JWT_REFRESH_SECRET;
    const userId = verifyToken(refreshToken, secret, 400);

    const user = await userModel.findById(userId).select('+tokens');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isTokenValid = user.tokens.some((t) => t.token === refreshToken);

    if (!isTokenValid) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    user.tokens = user.tokens.filter((t) => t.token !== refreshToken);

    await user.save();

    clearRefreshTokenCookie(res);

    res.status(200).send({ success: true });
  } catch (error) {
    next(error);
  }
}

async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Invalid access token');
    }

    const token = authorization.slice(7);
    if (!token.trim()) {
      throw new UnauthorizedError('Invalid access token');
    }

    const secret = JWT_ACCESS_SECRET;
    const userId = verifyToken(token, secret);

    const user = await userModel.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).send({
      user: {
        name: user.name,
        email: user.email,
      },
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

export {
  login,
  register,
  refreshAccessToken,
  logout,
  getCurrentUser,
};
