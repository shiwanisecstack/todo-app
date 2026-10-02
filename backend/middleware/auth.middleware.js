import User from "../model/user.model.js";
import { verifyToken } from "../utils/token.js";

export const protect = async (req, res, next) => {
  try {
    // Get token from header
    const header = req.headers.authorization || ""; 
    // Validate header format
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ 
        message: "Not authorized, invalid token format" 
      });
    }
    
    const token = header.slice(7); // Remove "Bearer " prefix
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        message: "Not authorized, no token provided" 
      });
    }
    // Verify token
    const decoded = verifyToken(token);
    
    // Check if user exists and is active
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ 
        message: "User no longer exists" 
      });
    } 
    // Additional security check - verify user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        message: "User account is deactivated" 
      });
    }
    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    // Handle different types of token errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "Token expired" 
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        message: "Invalid token" 
      });
    }
  
    // Log error for debugging (remove in production)
    console.error("Authentication error:", error);
    
    return res.status(401).json({ 
      message: "Authentication failed" 
    });
  }
};
// Optional: Role-based protection middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "Authentication required" 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Insufficient permissions" 
      });
    }
    next();
  };
};
// Optional: Admin protection middleware
export const protectAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: "Authentication required" 
    });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ 
      message: "Admin access required" 
    });
  }
  next();
};
