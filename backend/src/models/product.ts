import mongoose from 'mongoose';
import { deleteImage } from '../utils/files';
import { serverLogger } from '../middlewares/logger';

interface IProductImage {
  fileName: string;
  originalName: string;
}

interface IProduct {
  title: string;
  image: IProductImage;
  category: string;
  description?: string;
  price?: number | null;
}

const imageSchema = new mongoose.Schema<IProductImage>(
  {
    fileName: { type: String, required: [true, 'Поле "fileName" является обязательным'] },
    originalName: { type: String, required: [true, 'Поле "originalName" является обязательным'] },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
    required: [true, 'Поле "title" является обязательным'],
    unique: true,
  },
  image: {
    type: imageSchema,
    required: [true, 'Поле "image" является обязательным'],
  },
  category: { type: String, required: [true, 'Поле "category" является обязательным'] },
  description: { type: String },
  price: { type: Number, min: 0, default: null },
});

productSchema.post(
  'findOneAndDelete',
  async (doc: mongoose.HydratedDocument<IProduct> | null) => {
    if (!doc) {
      return;
    }
    try {
      await deleteImage(doc.image.fileName);
    } catch (error) {
      serverLogger.error(error);
    }
  },
);

export default mongoose.model<IProduct>('Product', productSchema);
