import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"], // Better error message
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"] // Add length validation
    },
    email: { 
      type: String, 
      required: [true, "Email is required"],
      unique: true, 
      lowercase: true, 
      trim: true,
      validate: {
        validator: function(email) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email);
        },
        message: "Please enter a valid email"
      }
    },
    password: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
      // Add password strength validation
      validate: {
        validator: function(password) {
          // At least one uppercase, lowercase, number, and special character
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
        },
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      }
    },
    resetPasswordToken: { 
      type: String, 
      select: false 
    },
    resetPasswordExpires: { 
      type: Date, 
      select: false 
    },
    // One-time code used for signup verification and password reset
    otpHash: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpPurpose: { type: String, enum: ["verify", "reset"], select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpSentAt: { type: Date, select: false },
    // Add additional fields for better user management
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    isActive: {
      type: Boolean,
      default: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true } // Include virtuals in object output
  }
);
// Hash password whenever it changes
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Hash password for update operations
userSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  if (update.password) update.password = await bcrypt.hash(update.password, 12);
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (plainPassword) {
  try {
    return await bcrypt.compare(plainPassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};
// Create reset token method
userSchema.methods.createResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  return rawToken;
};
// ---- OTP helpers ----
const hashOtp = (otp) =>
  crypto.createHmac("sha256", process.env.JWT_SECRET).update(String(otp)).digest("hex");

// Returns the plain 6-digit code (email it) and stores only its hash.
userSchema.methods.createOtp = function (purpose) {
  const otp = String(crypto.randomInt(100000, 1000000));
  this.otpHash = hashOtp(otp);
  this.otpPurpose = purpose;
  this.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  this.otpAttempts = 0;
  this.otpSentAt = new Date();
  return otp;
};

// Returns true if the code is right. Wrong guesses are counted (max 5).
userSchema.methods.checkOtp = function (otp, purpose) {
  if (!this.otpHash || this.otpPurpose !== purpose) return false;
  if (!this.otpExpires || this.otpExpires.getTime() < Date.now()) return false;
  if (this.otpAttempts >= 5) return false;
  const a = Buffer.from(hashOtp(otp));
  const b = Buffer.from(this.otpHash);
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) this.otpAttempts += 1;
  return ok;
};

userSchema.methods.clearOtp = function () {
  this.otpHash = undefined;
  this.otpPurpose = undefined;
  this.otpExpires = undefined;
  this.otpSentAt = undefined;
  this.otpAttempts = 0;
};

// Virtual for full name (if needed)
userSchema.virtual("fullName").get(function () {
  return `${this.name}`;
});
// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ resetPasswordToken: 1 });
export default mongoose.model("User", userSchema);
