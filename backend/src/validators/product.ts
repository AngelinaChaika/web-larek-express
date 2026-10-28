import { Joi } from 'celebrate';

const productSchema = Joi.object({
  title: Joi.string().min(2).max(30).required(),
  category: Joi.string().required(),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }).required(),
  description: Joi.string(),
  price: Joi.number().allow(null),
});

export default productSchema;
