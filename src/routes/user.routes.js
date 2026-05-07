import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";
import * as userController from "../controllers/user.controller.js";
import { validation } from "../middlewares/validation.middleware.js";
import {
  updateUserSchema,
  avatarSchema,
  changePasswordSchema,
} from "../validation/user.validation.js";
import { cloudUpload } from "../config/multerConfig.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User profile management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: "user"
 *         avatar:
 *           type: object
 *           properties:
 *             secure_url:
 *               type: string
 *               example: "https://res.cloudinary.com/..."
 *             public_id:
 *               type: string
 *               example: "Finance-tracker-app/users/123/avatar/abc"
 *
 *     UpdateProfileInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           maxLength: 30
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "jane@example.com"
 *
 *     ChangePasswordInput:
 *       type: object
 *       required:
 *         - oldPassword
 *         - newPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *           minLength: 6
 *           example: "oldSecret123"
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           example: "newSecret456"
 *
 *     UserProfileResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         profile:
 *           $ref: '#/components/schemas/UserProfile'
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get(
  "/profile",
  authenticate,
  userController.getProfile,
);

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update the authenticated user's name and/or email
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileInput'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 updatedProfile:
 *                   $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put(
  "/profile",
  authenticate,
  validation(updateUserSchema),
  userController.updateProfile,
);

/**
 * @swagger
 * /user/profile:
 *   delete:
 *     summary: Delete the authenticated user's account
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete(
  "/profile",
  authenticate,
  userController.deleteUser,
);

/**
 * @swagger
 * /user/profile/password:
 *   put:
 *     summary: Change the authenticated user's password
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Old password is incorrect or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put(
  "/profile/password",
  authenticate,
  validation(changePasswordSchema),
  userController.changePassword,
);

/**
 * @swagger
 * /user/profile/avatar:
 *   put:
 *     summary: Upload or update the authenticated user's avatar
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (PNG or JPEG only)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put(
  "/profile/avatar",
  authenticate,
  cloudUpload(["image/png", "image/jpeg" , "image/jpg" , "image/webp"]).single("avatar"),
  validation(avatarSchema),
  userController.uploadAvatar,
);

/**
 * @swagger
 * /user/profile/avatar:
 *   delete:
 *     summary: Delete the authenticated user's avatar and revert to default
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Avatar deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete(
  "/profile/avatar",
  authenticate,
  userController.deleteAvatar,
);

export default router;