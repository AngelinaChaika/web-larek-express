import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
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
    res.status(200).send({ items: products, total: products.length });
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
    res.status(201).json(newProduct);
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
    } else if (error instanceof Error && error.message.includes('E11000')) {
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

    res.status(200).send(product);
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
    } else if (error instanceof Error && error.message.includes('E11000')) {
      const conflictError = new ConflictError('Product with this title already exists');
      next(conflictError);
    } else if (error instanceof MongooseError.CastError) {
      const castError = new BadRequestError(error.message);
      next(castError);
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
    res.status(200).send(deletedProduct);
  } catch (error) {
    if (error instanceof MongooseError.CastError) {
      const castError = new BadRequestError(error.message);
      next(castError);
    } else {
      next(error);
    }
  }
};

export {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
