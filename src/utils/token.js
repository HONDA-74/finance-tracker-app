import jwt from "jsonwebtoken";

export const addTokenToCookie = (token , refreshToken , res) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "none",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: "none",
  });
};

export const removeTokenFromCookie = (res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
};

export const genToken = (user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );
  return {token, refreshToken};
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
};
