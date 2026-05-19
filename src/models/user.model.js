import { Schema, model } from "mongoose";
import { hashPassword } from "../utils/hash.js";
import { defaultAvatar } from "../utils/globalVariables.js";
import { userRoles } from "../utils/globalVariables.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: userRoles,
      default: "user",
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    avatar: {
      secure_url: { type: String, default: defaultAvatar.secure_url },
      public_id: { type: String, default: defaultAvatar.public_id },
    },
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    premiumStartedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashPassword(this.password);
  }
  next();
});

export const User = model("User", userSchema);
