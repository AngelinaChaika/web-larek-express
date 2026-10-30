import { Request, Response, NextFunction } from 'express';
import { UPLOAD_PATH } from '../config';
import BadRequestError from '../errors/bad-request-error';

function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new BadRequestError('File missing');
    }
    res.status(200).json({
      fileName: `/${UPLOAD_PATH}/${req.file.filename}`,
      originalName: req.file.originalname,
    });
  } catch (error) {
    next(error);
  }
}

export default uploadFile;
