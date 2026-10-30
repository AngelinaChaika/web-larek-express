import { Joi } from 'celebrate';

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(30).optional(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export { registerSchema, loginSchema };
