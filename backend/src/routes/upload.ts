import { Router } from 'express';
import fileMiddleware from '../middlewares/file';
import uploadFile from '../controllers/upload';
import auth from '../middlewares/auth';

const router = Router();

router.use(auth);
router.post('/', fileMiddleware.single('file'), uploadFile);

export default router;
