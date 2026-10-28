import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import Product from '../models/product';

export const getProducts = async (
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

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
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
