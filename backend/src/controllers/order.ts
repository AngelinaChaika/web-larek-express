import { faker } from '@faker-js/faker';
import { Request, Response, NextFunction } from 'express';
import HttpStatus from '../constants/http-status';
import Product from '../models/product';
import { IOrder } from '../models/order';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (
  req: Request<unknown, unknown, IOrder, unknown>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { total, items } = req.body;

    const orderedProducts = await Product.find({ _id: { $in: items } });
    const uniqueOrderedProductIds = new Set(items);

    if (orderedProducts.length !== uniqueOrderedProductIds.size) {
      throw new BadRequestError('Some products in the order do not exist');
    }

    if (!orderedProducts.every((product) => Number.isFinite(product.price))) {
      throw new BadRequestError('Some products in the order do not have a valid price');
    }

    const prices = items.map(
      (id) => orderedProducts.find((p) => p._id.toString() === id)?.price ?? 0,
    );

    const calculatedTotal = prices.reduce((sum, price) => sum + price, 0);

    if (calculatedTotal !== total) {
      throw new BadRequestError('Total amount does not match the sum of product prices');
    }

    const randomUuid = faker.string.uuid();
    res.status(HttpStatus.OK).send({ id: randomUuid, total });
  } catch (error) {
    next(error);
  }
};

export default createOrder;
