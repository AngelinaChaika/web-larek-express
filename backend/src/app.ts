import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import errorHandler from './middlewares/errorHandler';
import NotFoundError from './errors/NotFoundError';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());

app.use('/product', productRoutes);
app.use('/order', orderRoutes);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  const errorInstance = new NotFoundError('Маршрут не найден');
  next(errorInstance);
});

app.use(errorHandler);

async function connectToDatabase() {
  await mongoose.connect('mongodb://127.0.0.1:27017/weblarek');

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

connectToDatabase().catch(console.error);
