import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/dbConfig.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoriesRouter from "./routes/category.routes.js";
import transactionsRouter from "./routes/transaction.routes.js";
import budgetsRouter from "./routes/budget.routes.js";
import adminUserRoutes from "./routes/admin.user.routes.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";
import recurringRoutes from "./routes/recurringTransaction.routes.js";
import { startRecurringJob } from "./utils/recurringCron.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import chatBotRoutes from "./routes/chatBot.routes.js";

const app = express();

//http://localhost:5000/api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

connectDB();

app.use(
  cors({
    origin : "http://localhost:4200",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(helmet());

// global rate limiter
app.use(globalLimiter);

// log http requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/transactions", transactionsRouter);
app.use("/api/v1/budgets", budgetsRouter);
app.use("/api/v1/recurring", recurringRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminUserRoutes);
app.use("/api/v1/admin/analytics", adminRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use("/chatBot" , chatBotRoutes)

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

startRecurringJob();
export default app;
