import { faker } from '@faker-js/faker';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product';
import { IOrder } from '../models/order';
import BadRequestError from '../errors/BadRequestError';

const createOrder = async (
  req: Request<unknown, unknown, IOrder, unknown>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    if (!Array.isArray(items) || items.length <= 0) {
      throw new BadRequestError('Items must be a non-empty array of product IDs');
    }
    if (!['card', 'online'].includes(payment)) {
      throw new BadRequestError('Invalid payment method');
    }
    if (!Number.isFinite(total) || total <= 0) {
      throw new BadRequestError('Invalid total amount');
    }
    if (
      typeof phone !== 'string'
      || phone.trim() === ''
      || typeof address !== 'string'
      || address.trim() === ''
    ) {
      throw new BadRequestError('Invalid contact information');
    }
    if (
      typeof email !== 'string'
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      throw new BadRequestError('Invalid email address');
    }
    if (
      !items.every((i) => typeof i === 'string' && mongoose.isValidObjectId(i))
    ) {
      throw new BadRequestError('Invalid product IDs in items');
    }

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
    res.status(200).send({ id: randomUuid, total });
  } catch (error) {
    next(error);
  }
};

export default createOrder;
