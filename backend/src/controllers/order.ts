import { faker } from '@faker-js/faker';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product';
import { IOrder } from '../models/order';

const createOrder = async (
  req: Request<unknown, unknown, IOrder, unknown>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { payment, email, phone, address, total, items } = req.body;

    if (!Array.isArray(items) || items.length <= 0) {
      res.status(400).send({ message: 'Invalid order data' });
      return;
    }
    if (!['card', 'online'].includes(payment)) {
      res.status(400).send({ message: 'Invalid payment method' });
      return;
    }
    if (!Number.isFinite(total) || total <= 0) {
      res.status(400).send({ message: 'Invalid total amount' });
      return;
    }
    if (
      typeof phone !== 'string' ||
      phone.trim() === '' ||
      typeof address !== 'string' ||
      address.trim() === ''
    ) {
      res.status(400).send({ message: 'Invalid contact information' });
      return;
    }
    if (
      typeof email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      res.status(400).send({ message: 'Invalid email address' });
      return;
    }
    if (
      !items.every((i) => typeof i === 'string' && mongoose.isValidObjectId(i))
    ) {
      res.status(400).send({ message: 'Invalid product IDs in items' });
      return;
    }

    const orderedProducts = await Product.find({ _id: { $in: items } });
    const uniqueOrderedProductIds = new Set(items);

    if (orderedProducts.length !== uniqueOrderedProductIds.size) {
      res
        .status(400)
        .send({ message: 'Some products in the order do not exist' });
      return;
    }

    if (!orderedProducts.every((product) => Number.isFinite(product.price))) {
      res.status(400).send({
        message: 'Some products in the order do not have a valid price',
      });
      return;
    }

    const prices = items.map(
      (id) => orderedProducts.find((p) => p._id.toString() === id)?.price ?? 0,
    );

    const calculatedTotal = prices.reduce((sum, price) => sum + price, 0);

    if (calculatedTotal !== total) {
      res.status(400).send({
        message: 'Total amount does not match the sum of product prices',
      });
      return;
    }

    const randomUuid = faker.string.uuid();
    res.status(200).send({ id: randomUuid, total });
  } catch (error) {
    next(error);
  }
};

export default createOrder;
