import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product';
import { productSchema, updateProductValidationSchema, productIdValidationSchema } from '../validators/product';

const router = Router();

router.get('/', getProducts);
router.post('/', celebrate({ [Segments.BODY]: productSchema }), createProduct);
router.patch(
  '/:productId',
  celebrate({
    [Segments.PARAMS]: productIdValidationSchema,
    [Segments.BODY]: updateProductValidationSchema,
  }),
  updateProduct,
);
router.delete(
  '/:productId',
  celebrate({ [Segments.PARAMS]: productIdValidationSchema }),
  deleteProduct,
);

export default router;
