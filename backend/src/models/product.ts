import mongoose from 'mongoose';

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
  price: { type: Number, default: null },
});

export default mongoose.model<IProduct>('Product', productSchema);
