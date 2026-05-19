import { createError } from "../utils/error.js";
import { verifyToken } from "../utils/token.js";
import {User} from "../models/user.model.js";

export const authenticate = async (req, res, next) => {
  let token = req.cookies.token;
  
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  
  if (!token) {
    return next(createError(401, "No token provided"));
  }

  const isValid = verifyToken(token);

  if (!isValid) {
    return next(createError(401, "Invalid token"));
  }

  const user = await User.findById(isValid.id).select("-password");

  if (!user) {
    return next(createError(404, "User not found"));
  }

  if(user.blocked) {
    return next(createError(403, "User is blocked"));
  }

  req.user = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  next();
};
