import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { PORT, MONGO_URL } from './config';
import { errorLogger, requestLogger, serverLogger } from './middlewares/logger';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import errorHandler from './middlewares/error-handler';
import NotFoundError from './errors/not-found-error';

const app = express();

app.use(express.json());
app.use(express.static(path.resolve(process.cwd(), 'src/public')));
app.use(cors());

app.use(requestLogger);

app.use('/product', productRoutes);
app.use('/order', orderRoutes);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  const errorInstance = new NotFoundError('Маршрут не найден');
  next(errorInstance);
});

app.use(errorLogger);

app.use(errorHandler);

async function connectToDatabase() {
  await mongoose.connect(MONGO_URL);

  app.listen(PORT, () => {
    serverLogger.info(`Server is running on port ${PORT}`);
  });
}

connectToDatabase().catch((error) => {
  serverLogger.error(error);
  process.exitCode = 1;
});
