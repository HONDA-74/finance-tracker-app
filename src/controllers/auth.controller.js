import * as authService from "../services/auth.service.js";
import { createError } from "../utils/error.js";
import { addTokenToCookie , removeTokenFromCookie} from "../utils/token.js";
import { sendEmail } from "../utils/email.js";
import { genToken } from "../utils/token.js";


export const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;
    const exist = await authService.findUserByEmail(email);
    if(exist){
        throw createError(400 , "Email already exists")
    }
    const { user , token , refreshToken } = await authService.registerUser({name , email , password});
    addTokenToCookie(token , refreshToken , res);
    res.status(201).json({success: true , user, token , refreshToken });
}

export const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    const { user, token , refreshToken } = await authService.loginUser({email , password});
    if(!user){
        throw createError(401 , "Invalid email or password")
    }
    addTokenToCookie(token , refreshToken , res);
    res.status(200).json({success: true , user , token , refreshToken });
}

export const logoutUser = async (req, res, next) => {
    removeTokenFromCookie(res);
    res.status(200).json({success: true , message: "Logged out successfully" });
}

export const registerAdmin = async (req, res, next) => {
    const { name, email, password } = req.body;
    const exist = await authService.findUserByEmail(email);
    if(exist){
        throw createError(400 , "Email already exists")
    }
    const admin = await authService.registerUser({name , email , password , role: "admin"});
    res.status(201).json({success: true , admin});
}

export const resetPassword = async (req, res, next) => {
    const { email } = req.body;
    const user = await authService.resetPassword(email);
    const isSent = await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: `<p>You requested a password reset. Click the link below to reset your password:</p>
               <a href="${process.env.BACKEND_URL}/auth/reset-password-confirm/${user.passwordResetToken}">Reset Password</a>
               <p>This link will expire in 10 minutes.</p>`,
    });

    if (!isSent) {
        throw createError(500, "Failed to send password reset email");
    }

    res.status(200).json({success: true , message: "Password reset email sent" , token: user.passwordResetToken });
}

export const resetPasswordConfirm = async (req, res, next) => {
    const { token } = req.params; 
    const { newPassword } = req.body;
    const user = await authService.resetPasswordConfirm(token, newPassword);
    res.status(200).json({success: true , message: "Password reset successfully" });
}

export const refreshToken = async (req, res, next) => {
    let { refreshToken } = req.cookies;
    if (!refreshToken) {
        throw createError(401, "No refresh token provided");
    }
    const user = await authService.findUserByRefreshToken(refreshToken);
    
    if (!user) {
        throw createError(401, "Invalid refresh token");
    }
    const { token: newToken, refreshToken: newRefreshToken } = genToken(user);
    addTokenToCookie(newToken, newRefreshToken, res);
    res.status(200).json({ success: true, token: newToken });
}