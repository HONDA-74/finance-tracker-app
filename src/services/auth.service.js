import { createError } from "../utils/error.js";
import { genToken, verifyToken } from "../utils/token.js";
import { comparePassword } from "../utils/hash.js";
import { User } from "../models/user.model.js";

export const registerUser = async (userData) => {
  const user = new User(userData);
  await user.save();
  const { token, refreshToken } = genToken(user);
  return { user, token, refreshToken };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    return { user: null, token: null };
  }
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return { user: null, token: null };
  }
  const { token, refreshToken } = genToken(user);
  return { user, token, refreshToken };
};

export const resetPassword = async (email) => {
  const user = await User.findOne({ email });
  if (user) {
    const { token } = genToken(user);
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  } else {
    throw createError(404, "User not found");
  }
  await user.save();
  return user;
};

export const resetPasswordConfirm = async (token, newPassword) => {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (user) {
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
  } else {
    throw createError(401, "Invalid or expired token");
  }
  await user.save();
  return user;
};

export const findUserByResetToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await User.findOne({
      _id: decoded.id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    return user;
  } catch (error) {
    return null;
  }
};

export const findUserByEmail = (email) => User.findOne({ email });

export const findUserByRefreshToken = async (refreshToken) => {
  let user = verifyToken(refreshToken);
  console.log(1, user);

  if (!user) {
    return null;
  }
  user = await User.findById(user.id);
  if (!user) {
    return null;
  }
  return user;
};
