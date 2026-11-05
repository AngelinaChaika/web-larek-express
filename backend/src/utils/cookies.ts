import { Response, CookieOptions } from 'express';
import { AUTH_REFRESH_TOKEN_EXPIRY } from '../config';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  path: '/',
};

function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie(
    'refreshToken',
    refreshToken,
    {
      ...refreshCookieOptions,
      maxAge: AUTH_REFRESH_TOKEN_EXPIRY * 1000,
    },
  );
}

function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(
    'refreshToken',
    refreshCookieOptions,
  );
}

export { setRefreshTokenCookie, clearRefreshTokenCookie };
