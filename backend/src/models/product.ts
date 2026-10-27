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
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
    unique: true,
  },
  image: {
    type: imageSchema,
    required: true,
  },
  category: { type: String, required: true },
  description: { type: String },
  price: { type: Number, default: null },
});

export default mongoose.model<IProduct>('Product', productSchema);
