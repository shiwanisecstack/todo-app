import express from "express";
import crypto from "crypto";
import User from "../model/user.model.js";
import { signToken } from "../utils/token.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Helper functions
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });
const sendAuth = (res, user, status = 200) =>
  res.status(status).json({ 
    token: signToken(user._id),
    user: publicUser(user) 
  });

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email and password are required" 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email already registered" 
      });
    }

    // Create new user
    const user = await User.create({ name, email, password });
    sendAuth(res, user, 201);
  }  catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required" 
      });
    }

    // Find user and verify password
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });
    }

    sendAuth(res, user);
  } 
  catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  try {
    res.json({ user: publicUser(req.user) });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const generic = { message: "If that email exists, a reset link has been generated." };
    
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json(generic);

    const raw = user.createResetToken();
    await user.save();

    const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${raw}`;
    console.log(`Password reset link for ${user.email}: ${link}`);

    res.json(process.env.NODE_ENV === "production" ? generic : { ...generic, resetLink: link });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    
    // Validation
    if (!password) {
      return res.status(400).json({ 
        message: "Password is required" 
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      });
    }

    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({ 
        message: "Reset link is invalid or expired" 
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password updated. You can now log in." });
   } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
