import path from 'path';
import fs from 'fs/promises';
import { UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';
import BadRequestError from '../errors/bad-request-error';

type FileSystemError = Error & { code?: string };

async function moveImage(fileName: string) {
  const baseName = path.basename(fileName);

  const fileNamePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|jpeg|webp)$/;
  const expectedPath = `/${UPLOAD_PATH}/${baseName}`;

  if (!fileNamePattern.test(baseName)) {
    throw new BadRequestError('Invalid image filename');
  }
  if (fileName !== expectedPath) {
    throw new BadRequestError('Invalid image path');
  }
  const tempFilePath = path.resolve(__dirname, '..', '..', UPLOAD_PATH_TEMP, baseName);
  const permFilePath = path.resolve(__dirname, '..', '..', UPLOAD_PATH, baseName);

  await fs.mkdir(path.dirname(permFilePath), { recursive: true });
  try {
    await fs.rename(tempFilePath, permFilePath);
  } catch (error) {
    const fsError = error as FileSystemError;
    if (fsError.code === 'ENOENT') {
      throw new BadRequestError('Image file not found');
    }
    throw error;
  }
}

async function deleteImage(fileName:string) {
  const baseName = path.basename(fileName);

  const fileNamePattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|jpeg|webp)$/;
  const expectedPath = `/${UPLOAD_PATH}/${baseName}`;

  if (!fileNamePattern.test(baseName)) {
    throw new BadRequestError('Invalid image filename');
  }
  if (fileName !== expectedPath) {
    throw new BadRequestError('Invalid image path');
  }

  const permFilePath = path.resolve(__dirname, '..', '..', UPLOAD_PATH, baseName);

  try {
    await fs.unlink(permFilePath);
  } catch (error) {
    const fsError = error as FileSystemError;
    if (fsError.code === 'ENOENT') {
      return;
    }
    throw error;
  }
}

export { moveImage, deleteImage };
