import { Joi } from 'celebrate';

const productSchema = Joi.object({
  title: Joi.string().min(2).max(30).required(),
  category: Joi.string().required(),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }).required(),
  description: Joi.string(),
  price: Joi.number().min(0).allow(null),
});

const updateProductValidationSchema = Joi.object({
  title: Joi.string().min(2).max(30),
  category: Joi.string(),
  description: Joi.string().allow(''),
  price: Joi.number().min(0).allow(null),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }),
}).min(1);

const productIdValidationSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
});

export { productSchema, updateProductValidationSchema, productIdValidationSchema };
