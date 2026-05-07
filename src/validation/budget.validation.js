import joi from "joi";

export const createBudgetSchema = joi.object({
    amount: joi.number().positive().required(),
    category: joi.string().hex().length(24).required(),
    month: joi.number().min(1).max(12).required(),
    year: joi.number().min(2000).required(),
}).required();

export const updateBudgetSchema = joi.object({
    id: joi.string().hex().length(24).required(),
    amount: joi.number().positive().optional(),
    category: joi.string().hex().length(24).optional().allow(null, ""),
    month: joi.number().min(1).max(12).optional(),
    year: joi.number().min(2000).optional(),
}).or("amount", "category", "month", "year").unknown(true);

export const deleteOrGetBudgetSchema = joi.object({
    id: joi.string().hex().length(24).required(),
}).unknown(true);
