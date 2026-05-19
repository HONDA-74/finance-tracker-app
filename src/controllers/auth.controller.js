import * as authService from "../services/auth.service.js";
import { createError } from "../utils/error.js";
import { addTokenToCookie, removeTokenFromCookie } from "../utils/token.js";
import { sendEmail } from "../utils/email.js";
import { genToken } from "../utils/token.js";

export const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  const exist = await authService.findUserByEmail(email);
  if (exist) {
    throw createError(400, "Email already exists");
  }
  const { user, token, refreshToken } = await authService.registerUser({
    name,
    email,
    password,
  });
  addTokenToCookie(token, refreshToken, res);
  res.status(201).json({ success: true, user, token, refreshToken });
};

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const { user, token, refreshToken } = await authService.loginUser({
    email,
    password,
  });
  if (!user) {
    throw createError(401, "Invalid email or password");
  }
  addTokenToCookie(token, refreshToken, res);
  res.status(200).json({ success: true, user, token, refreshToken });
};

export const logoutUser = async (req, res, next) => {
  removeTokenFromCookie(res);
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const registerAdmin = async (req, res, next) => {
  const { name, email, password } = req.body;
  const exist = await authService.findUserByEmail(email);
  if (exist) {
    throw createError(400, "Email already exists");
  }
  const admin = await authService.registerUser({
    name,
    email,
    password,
    role: "admin",
  });
  res.status(201).json({ success: true, admin });
};

export const resetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await authService.resetPassword(email);
  const isSent = await sendEmail({
    to: user.email,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset. Click the link below to reset your password:</p>
               <a href="${process.env.FRONTEND_URL}/finance-tracker-pro/#/auth/reset-password-confirm/${user.passwordResetToken}">Reset Password</a>
               <p>This link will expire in 10 minutes.</p>`,
  });

  if (!isSent) {
    throw createError(500, "Failed to send password reset email");
  }

  res
    .status(200)
    .json({
      success: true,
      message: "Password reset email sent",
      token: user.passwordResetToken,
    });
};

export const resetPasswordConfirm = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  const user = await authService.resetPasswordConfirm(token, password);
  res
    .status(200)
    .json({ success: true, message: "Password reset successfully" });
};

export const showResetPasswordForm = async (req, res, next) => {
  const { token } = req.params;

  const user = await authService.findUserByResetToken(token);

  if (!user) {
    return res.status(401).send(`
            <html>
                <head>
                    <title>Invalid Token</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #d32f2f; }
                    </style>
                </head>
                <body>
                    <h1 class="error">Invalid or Expired Token</h1>
                    <p>The password reset link is invalid or has expired. Please request a new password reset.</p>
                    <a href="${process.env.FRONTEND_URL || "http://localhost:4200"}">Go back to login</a>
                </body>
            </html>
        `);
  }

  res.send(`
        <html>
            <head>
                <title>Reset Password</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; }
                    .form-group { margin-bottom: 15px; }
                    label { display: block; margin-bottom: 5px; }
                    input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
                    button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                    button:hover { background: #0056b3; }
                    .error { color: #d32f2f; margin-bottom: 10px; }
                    .success { color: #2e7d32; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <h2>Reset Your Password</h2>
                <form id="resetForm" action="/api/v1/auth/reset-password-confirm/${token}" method="POST">
                    <div class="form-group">
                        <label for="newPassword">New Password:</label>
                        <input type="password" id="newPassword" name="newPassword" required minlength="6">
                    </div>
                    <button type="submit">Reset Password</button>
                </form>
                <div id="message"></div>

                <script>
                    document.getElementById('resetForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        const newPassword = formData.get('newPassword');
                        
                        try {
                            const response = await fetch('/api/v1/auth/reset-password-confirm/${token}', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ newPassword })
                            });
                            
                            const result = await response.json();
                            
                            if (response.ok) {
                                document.getElementById('message').innerHTML = '<div class="success">' + result.message + '</div>';
                                setTimeout(() => {
                                    window.location.href = '${process.env.FRONTEND_URL || "http://localhost:4200"}';
                                }, 2000);
                            } else {
                                document.getElementById('message').innerHTML = '<div class="error">' + result.message + '</div>';
                            }
                        } catch (error) {
                            document.getElementById('message').innerHTML = '<div class="error">An error occurred. Please try again.</div>';
                        }
                    });
                </script>
            </body>
        </html>
    `);
};

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
};
