import { User } from "../models/user.model.js";
import { createError } from "../utils/error.js";
import cloudinary from "../config/cloudConfig.js";
import { defaultAvatar } from "../utils/globalVariables.js";
import { comparePassword } from "../utils/hash.js";

export const getProfile = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    return null;
  }

  const profile = {
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    plan: user.plan,
  };

  return profile;
};

export const updateProfile = async (id, { name, email }) => {
  const user = await User.findById(id);
  if (!user) {
    return null;
  }
  user.name = name ? name : user.name;
  user.email = email ? email : user.email;
  await user.save();

  const profile = {
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    plan: user.plan,
  };

  return profile;
};

export const uploadAvatar = async (id, avatarFilePath) => {
  const user = await User.findById(id);
  if (!user) {
    return null;
  }
  let options = {};

  if (user.avatar.public_id == defaultAvatar.public_id) {
    options.folder = `Finance-tracker-app/users/${user._id}/avatar`;
  } else {
    options.public_id = user.avatar.public_id;
  }

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    avatarFilePath,
    options,
  );

  user.avatar = { secure_url, public_id };
  await user.save();
  return user;
};

export const deleteAvatar = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    return null;
  }
  if (user.avatar.public_id != defaultAvatar.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }
  user.avatar = defaultAvatar;
  await user.save();
  return user;
};

export const changePassword = async (id, oldPassword, newPassword) => {
  const user = await User.findById(id);
  if (!user) {
    return null;
  }
  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) {
    throw createError(400, "Old password is incorrect");
  }
  user.password = newPassword;
  await user.save();
  return user;
};

export const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    return null;
  }
  await user.deleteOne();
  return user;
};
