import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';
import BadRequestError from '../errors/bad-request-error';
import { UPLOAD_PATH_TEMP } from '../config';

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '..', '..', UPLOAD_PATH_TEMP),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = randomUUID();
    const fileName = `${uniqueName}${ext}`;
    cb(null, fileName);
  },
});

const fileMiddleware = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const isAllowed = allowedTypes.includes(file.mimetype);
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Invalid file type'));
    }
  },
});

export default fileMiddleware;
