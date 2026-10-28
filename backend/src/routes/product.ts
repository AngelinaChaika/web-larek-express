import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import { getProducts, createProduct } from '../controllers/product';
import productSchema from '../validators/product';

const router = Router();

router.get('/', getProducts);
router.post('/', celebrate({ [Segments.BODY]: productSchema }), createProduct);

export default router;
