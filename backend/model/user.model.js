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
// Virtual for full name (if needed)
userSchema.virtual("fullName").get(function () {
  return `${this.name}`;
});
// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ resetPasswordToken: 1 });
export default mongoose.model("User", userSchema);
