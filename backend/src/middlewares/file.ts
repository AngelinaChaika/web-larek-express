import path from 'path';
import multer from 'multer';
import { randomUUID } from 'crypto';
import BadRequestError from '../errors/bad-request-error';
import { UPLOAD_PATH_TEMP } from '../config';

const mimeByExtension: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '..', '..', UPLOAD_PATH_TEMP),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname.toLowerCase());
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
    const origExt = path.extname(file.originalname).toLowerCase();
    const expectedMimeType = mimeByExtension[origExt];

    const normalizedMimeType = file.mimetype === 'image/jpg' ? 'image/jpeg' : file.mimetype;
    const isMatchingMimeType = expectedMimeType === normalizedMimeType;

    if (isMatchingMimeType) {
      cb(null, true);
    } else {
      cb(new BadRequestError('Invalid file type'));
    }
  },
});

export default fileMiddleware;
