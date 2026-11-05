import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
} from '../controllers/auth';
import auth from '../middlewares/auth';

const router = Router();

router.get(
  '/token',
  celebrate({ [Segments.COOKIES]: refreshTokenSchema }),
  refreshAccessToken,
);

router.get(
  '/logout',
  celebrate({ [Segments.COOKIES]: refreshTokenSchema }),
  logout,
);

router.get('/user', auth, getCurrentUser);
router.post('/register', celebrate({ [Segments.BODY]: registerSchema }), register);
router.post('/login', celebrate({ [Segments.BODY]: loginSchema }), login);

export default router;
