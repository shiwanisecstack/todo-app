import express from "express";
import User from "../model/user.model.js";
import { signToken } from "../utils/token.js";
import { sendOtpEmail } from "../utils/mailer.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

const OTP_FIELDS = "+otpHash +otpExpires +otpPurpose +otpAttempts +otpSentAt";
const RESEND_COOLDOWN_MS = 60 * 1000;

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });
const sendAuth = (res, user, status = 200) =>
  res.status(status).json({ token: signToken(user._id), user: publicUser(user) });

const normEmail = (e) => String(e || "").trim().toLowerCase();

// Creates a fresh OTP, saves it, and emails it. Throws if the email can't be sent.
const issueOtp = async (user, purpose) => {
  const otp = user.createOtp(purpose);
  await user.save();
  await sendOtpEmail({ to: user.email, name: user.name, otp, purpose });
};

const onCooldown = (user) =>
  user.otpSentAt && Date.now() - user.otpSentAt.getTime() < RESEND_COOLDOWN_MS;

// POST /api/auth/signup  -> creates (unverified) user and emails a 6-digit code
router.post("/signup", async (req, res) => {
  try {
    const { name, password } = req.body;
    const email = normEmail(req.body.email);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    let user = await User.findOne({ email }).select(OTP_FIELDS);
    if (user && user.emailVerified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    if (user) {
      // Earlier signup was never verified: let them start over with new details.
      user.name = name;
      user.password = password;
    } else {
      user = new User({ name, email, password });
    }

    try {
      await issueOtp(user, "verify");
    } catch (mailErr) {
      console.error("Signup OTP email failed:", mailErr);
      return res.status(502).json({
        message: "Account created but we couldn't send the verification email. Tap 'Resend code' to try again.",
        requiresVerification: true,
        email,
      });
    }

    res.status(201).json({
      message: "We sent a 6-digit verification code to your email.",
      requiresVerification: true,
      email,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: Object.values(error.errors)[0].message });
    }
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/verify-email  { email, otp }
router.post("/verify-email", async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    if (!email || !otp) return res.status(400).json({ message: "Email and code are required" });

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    const valid = user && user.checkOtp(otp, "verify");
    if (user && !valid) await user.save(); // persist the failed-attempt counter
    if (!valid) return res.status(400).json({ message: "Invalid or expired code" });

    user.emailVerified = true;
    user.clearOtp();
    await user.save();
    sendAuth(res, user);
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/resend-otp  { email, purpose: "verify" | "reset" }
router.post("/resend-otp", async (req, res) => {
  const generic = { message: "If that email is registered, a new code has been sent." };
  try {
    const email = normEmail(req.body.email);
    const purpose = req.body.purpose === "reset" ? "reset" : "verify";
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    if (!user) return res.json(generic);
    if (purpose === "verify" && user.emailVerified) return res.json(generic);

    if (onCooldown(user)) {
      return res.status(429).json({ message: "Please wait a minute before requesting another code" });
    }
    await issueOtp(user, purpose);
    res.json(generic);
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Could not send the email. Please try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const email = normEmail(req.body.email);
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select(`+password ${OTP_FIELDS}`);
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      if (!onCooldown(user)) {
        try { await issueOtp(user, "verify"); } catch (e) { console.error("Login OTP email failed:", e); }
      }
      return res.status(403).json({
        message: "Please verify your email. We sent you a code.",
        needsVerification: true,
        email,
      });
    }

    sendAuth(res, user);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// POST /api/auth/forgot-password  { email } -> emails a 6-digit reset code
router.post("/forgot-password", async (req, res) => {
  const generic = { message: "If that email is registered, we sent a 6-digit code to it." };
  try {
    const email = normEmail(req.body.email);
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    if (!user) return res.json(generic);

    if (onCooldown(user)) {
      return res.status(429).json({ message: "Please wait a minute before requesting another code" });
    }

    try {
      await issueOtp(user, "reset");
    } catch (mailErr) {
      // Logged only, so the response can't be used to find out which emails exist.
      console.error("Forgot-password email failed:", mailErr);
    }
    res.json(generic);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /api/auth/reset-password  { email, otp, password }
router.post("/reset-password", async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const { password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ message: "Email, code and new password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email }).select(OTP_FIELDS);
    const valid = user && user.checkOtp(otp, "reset");
    if (user && !valid) await user.save();
    if (!valid) return res.status(400).json({ message: "Invalid or expired code" });

    user.password = password;
    user.emailVerified = true; // they just proved they own this inbox
    user.clearOtp();
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
