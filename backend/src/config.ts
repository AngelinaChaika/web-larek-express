import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);

const MONGO_URL = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';

function getRequiredEnv(key: string) {
  const secret = process.env[key];
  if (!secret) {
    throw new Error('JWT secrets are not defined in the environment variables');
  }
  return secret;
}

const AUTH_REFRESH_TOKEN_EXPIRY = Number(process.env.AUTH_REFRESH_TOKEN_EXPIRY) || 7 * 24 * 60 * 60;
const AUTH_ACCESS_TOKEN_EXPIRY = Number(process.env.AUTH_ACCESS_TOKEN_EXPIRY) || 10 * 60;

const JWT_ACCESS_SECRET = getRequiredEnv('JWT_ACCESS_SECRET');
const JWT_REFRESH_SECRET = getRequiredEnv('JWT_REFRESH_SECRET');

const { ORIGIN_ALLOW } = process.env;

const UPLOAD_PATH = process.env.UPLOAD_PATH || 'images';
const UPLOAD_PATH_TEMP = process.env.UPLOAD_PATH_TEMP || 'temp';

export {
  PORT,
  MONGO_URL,
  AUTH_REFRESH_TOKEN_EXPIRY,
  AUTH_ACCESS_TOKEN_EXPIRY,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ORIGIN_ALLOW,
  UPLOAD_PATH,
  UPLOAD_PATH_TEMP,
};
