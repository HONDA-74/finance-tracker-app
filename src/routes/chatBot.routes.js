import { Router } from "express";
import * as chatBotController from "../controllers/chatBot.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorization.middleware.js";

const router = Router();

router.post(
  "/",
//   authenticate,
//   authorize(["user", "admin"]),
  chatBotController.getChatBot
);

export default router;