import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import { PORT, MONGO_URL, ORIGIN_ALLOW } from './config';
import { errorLogger, requestLogger, serverLogger } from './middlewares/logger';
import productRoutes from './routes/product';
import orderRoutes from './routes/order';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';
import errorHandler from './middlewares/error-handler';
import NotFoundError from './errors/not-found-error';
import './utils/cleanup-temp';

const app = express();

app.use(requestLogger);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(cors({
  origin: ORIGIN_ALLOW,
  credentials: true,
}));
app.use(cookieParser());

app.use('/product', productRoutes);
app.use('/order', orderRoutes);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);

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
