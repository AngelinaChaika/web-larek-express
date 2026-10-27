import { Request, Response, NextFunction } from 'express';
import Product from '../models/product';

export const getProducts = async (
  req: Request,
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
    const { title, image, category, description, price } = req.body;
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
    next(error);
  }
};
