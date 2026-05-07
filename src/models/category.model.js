import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         _id:
 *           type: string
 *           example: "65f1c2a3"
 *         type:
 *           type: string
 *           enum:
 *             - living expenses
 *             - food
 *             - transportation
 *             - shopping
 *             - entertainment
 *             - health
 *             - education
 *             - other
 *           example: "food"
 *         user:
 *           type: string
 *           nullable: true
 *           example: "64a8c2b1"
 *         icon:
 *           type: string
 *           example: "🍔"
 *         color:
 *           type: string
 *           example: "#FF5733"
 *
 *     CreateCategoryInput:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           enum:
 *             - living expenses
 *             - food
 *             - transportation
 *             - shopping
 *             - entertainment
 *             - health
 *             - education
 *             - other
 *         icon:
 *           type: string
 *         color:
 *           type: string
 *
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Category'
 *
 *     CategoriesListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         count:
 *           type: number
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Category not found"
 */

const categorySchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  icon: String,
  color: String,
});
const categoryModel = mongoose.model("Category", categorySchema);

export default categoryModel;
