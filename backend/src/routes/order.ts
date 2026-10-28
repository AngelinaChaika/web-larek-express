import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import createOrder from '../controllers/order';
import orderSchema from '../validators/order';

const router = Router();

router.post('/', celebrate({ [Segments.BODY]: orderSchema }), createOrder);

export default router;
