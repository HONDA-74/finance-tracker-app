import joi from "joi";

export const registerSchema = joi
  .object({
    name: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).max(30).required(),
    role: joi.string().valid("user", "admin").default("user"),
  })
  .required();

export const loginSchema = joi
  .object({
    email: joi.string().email().required(),
    password: joi
      .string()
      .min(8)
      .max(30)
      .pattern(/[a-z]/, 'lowercase')
      .pattern(/[A-Z]/, 'uppercase')
      .pattern(/[0-9]/, 'number')
      .required(),
  })
  .required();

export const resetPasswordSchema = joi
  .object({
    email: joi.string().email().required(),
  })
  .required();

export const resetPasswordConfirmSchema = joi
  .object({
    // El-Body
    password: joi.string().min(6).max(30).required(),

    // El-Params
    token: joi.string().required(),
  })
  .required();
