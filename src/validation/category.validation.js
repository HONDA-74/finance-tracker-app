import joi from "joi";

export const createCategorySchema = joi
  .object({
    type: joi.string().min(1).required(),
    icon: joi.string().optional(),
    color: joi.string().optional(),
  })
  .required();

export const getOrDeleteCategorySchema = joi
  .object({
    id: joi.string().hex().length(24).required(),
  })
  .unknown(true);

export const updateCategorySchema = joi
  .object({
    id: joi.string().hex().length(24).required(),
    type: joi.string().min(1).optional(),
    icon: joi.string().optional(),
    color: joi.string().optional(),
  })
  .unknown(true);
