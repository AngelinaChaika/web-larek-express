import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import HttpStatus from '../constants/http-status';
import isDuplicateKeyError from '../utils/mongo-errors';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import Product from '../models/product';
import { moveImage, deleteImage } from '../utils/files';
import { serverLogger } from '../middlewares/logger';
import NotFoundError from '../errors/not-found-error';

const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const products = await Product.find();
    res.status(HttpStatus.OK).send({ items: products, total: products.length });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let imageMoved = false;
  try {
    const {
      title, image, category, description, price,
    } = req.body;
    const newProduct = new Product({
      title,
      image,
      category,
      description,
      price,
    });
    await moveImage(image.fileName);
    imageMoved = true;
    await newProduct.save();
    res.status(HttpStatus.CREATED).json(newProduct);
  } catch (error) {
    if (imageMoved) {
      try {
        await deleteImage(req.body.image.fileName);
      } catch (cleanupError) {
        serverLogger.error(cleanupError);
      }
    }
    if (error instanceof MongooseError.ValidationError) {
      const validationError = new BadRequestError(error.message);
      next(validationError);
    } else if (isDuplicateKeyError(error)) {
      const conflictError = new ConflictError('Product with this title already exists');
      next(conflictError);
    } else {
      next(error);
    }
  }
};

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let imageMoved = false;
  try {
    const { productId } = req.params;
    const {
      title, category, description, price, image,
    } = req.body;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }
    const oldImagePath = existingProduct.image.fileName;

    if (image && image.fileName !== oldImagePath) {
      await moveImage(image.fileName);
      imageMoved = true;
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        title,
        category,
        description,
        price,
        image,
      },
      { new: true, runValidators: true },
    );

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (imageMoved) {
      imageMoved = false;
      try {
        await deleteImage(oldImagePath);
      } catch (cleanupError) {
        serverLogger.error(cleanupError);
      }
    }

    res.status(HttpStatus.OK).send(product);
  } catch (error) {
    if (imageMoved) {
      try {
        await deleteImage(req.body.image.fileName);
      } catch (cleanupError) {
        serverLogger.error(cleanupError);
      }
    }
    if (error instanceof MongooseError.ValidationError) {
      const validationError = new BadRequestError(error.message);
      next(validationError);
    } else if (isDuplicateKeyError(error)) {
      const conflictError = new ConflictError('Product with this title already exists');
      next(conflictError);
    } else {
      next(error);
    }
  }
};

const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { productId } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (deletedProduct === null) {
      throw new NotFoundError('Product not found');
    }
    res.status(HttpStatus.OK).send(deletedProduct);
  } catch (error) {
    next(error);
  }
};

export {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
