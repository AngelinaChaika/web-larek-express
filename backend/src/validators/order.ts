import { Joi } from 'celebrate';

const orderSchema = Joi.object({
  payment: Joi.string().valid('card', 'online').required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().required(),
  address: Joi.string().trim().required(),
  total: Joi.number().positive().required(),
  items: Joi.array().items(Joi.string().pattern(/^[a-fA-F0-9]{24}$/)).min(1).required(),
});

export default orderSchema;
