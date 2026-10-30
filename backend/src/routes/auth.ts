import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import { registerSchema, loginSchema } from '../validators/auth';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
} from '../controllers/auth';
import auth from '../middlewares/auth';

const router = Router();

router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);
router.post('/register', celebrate({ [Segments.BODY]: registerSchema }), register);
router.post('/login', celebrate({ [Segments.BODY]: loginSchema }), login);

export default router;
