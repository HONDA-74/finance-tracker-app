import Budget from "../models/budget.model.js";
import { APIFeatures } from "../utils/apiFeatures.js";
import { createError } from "../utils/error.js";
import { createNotification } from "../services/notification.service.js";

/*
@desc    Create a new budget
@route   POST /api/v1/budgets
@access  Private
*/
export const createBudget = async (req, res, next) => {
  const { amount, category, month, year } = req.body;

  const exists = await Budget.findOne({
    user: req.user.id,
    month,
    year,
    category: category || null
  });

  if (exists) {
    return next(createError(400, "A budget for this category and month already exists."));
  }

  const budget = await Budget.create({
    user: req.user.id,
    amount,
    category: category || null,
    month,
    year,
  });

  res.status(201).json({
    success: true,
    message: "Budget created successfully",
    data: budget,
  });
};

/*
@desc    Get all budgets
@route   GET /api/v1/budgets
@access  Private
*/
export const getBudgets = async (req, res, next) => {
  const features = new APIFeatures(Budget.find({ user: req.user.id }).populate("category", "type icon color"), req.query)
    .filter()
    .sort()
    .paginate();

  const budgets = await features.query;

  res.status(200).json({
    success: true,
    count: budgets.length,
    data: budgets,
  });
};

/* 
@desc    Get a single budget
@route   GET /api/v1/budgets/:id
@access  Private
*/
 export const getBudgetById = async (req, res, next) => {
  const budget = await Budget.findOne({ _id: req.params.id, user: req.user.id }).populate("category", "type icon color");

  if (!budget) {
    return next(createError(404, "Budget not found"));
  }

  res.status(200).json({
    success: true,
    data: budget,
  });
};

/* 
@desc    Update a budget
@route   PATCH /api/v1/budgets/:id
@access  Private
*/
export const updateBudget = async (req, res, next) => {
  const { amount, category, month, year } = req.body;
  const existingBudget = await Budget.findOne({ _id: req.params.id, user: req.user.id });

  if (!existingBudget) {
    return next(createError(404, "Budget not found"));
  }

  const normalizedCategory =
    category === undefined ? existingBudget.category : category || null;
  const normalizedMonth = month ?? existingBudget.month;
  const normalizedYear = year ?? existingBudget.year;

  const duplicateBudget = await Budget.findOne({
    _id: { $ne: req.params.id },
    user: req.user.id,
    category: normalizedCategory,
    month: normalizedMonth,
    year: normalizedYear,
  });
  if (duplicateBudget) {
    return next(createError(400, "A budget for this category and month already exists."));
  }

  const updatePayload = {};
  if (amount !== undefined) updatePayload.amount = amount;
  if (category !== undefined) updatePayload.category = category || null;
  if (month !== undefined) updatePayload.month = month;
  if (year !== undefined) updatePayload.year = year;

  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    updatePayload,
    { new: true, runValidators: true }
  );

  if (!budget) {
    return next(createError(404, "Budget not found"));
  }

  if (budget.spent > budget.amount) {
    await createNotification({
      user: req.user.id,
      title: "budget_alert",
      message: `Warning: Current spent amount (${budget.spent}) exceeds the new budget limit (${budget.amount}).`,
    });
  }

  res.status(200).json({
    success: true,
    data: budget,
  });
};

/* 
@desc    Delete a budget
@route   DELETE /api/v1/budgets/:id
@access  Private
*/
export const deleteBudget = async (req, res, next) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });

  if (!budget) {
    return next(createError(404, "Budget not found"));
  }

  res.status(200).json({
    success: true,
    message: "Budget deleted successfully",
  });
};
