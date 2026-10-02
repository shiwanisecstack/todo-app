import jwt from "jsonwebtoken";
// Enhanced token signing function
export const signToken = (userId, { expiresIn = "7d", role = "user" } = {}) => {
  try {
    // Validate input
    if (!userId) {
      throw new Error("User ID is required for token generation");
    }  
    // Create payload with additional security information
    const payload = {
      id: userId,
      role: role,
    
    };
    // Sign the token with additional security options
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: expiresIn,
      issuer: "todo", // Optional: adds issuer claim
      audience: "user", // Optional: adds audience claim
      subject: "access_token" // Optional: adds subject claim
    });    
    return token;
  } catch (error) {
    throw new Error(`Token signing failed: ${error.message}`);
  }
};
// Enhanced token verification function
export const verifyToken = (token) => {
  try {
    // Validate token exists
    if (!token) {
      throw new Error("No token provided");
    } 
    // Verify the token with additional options
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "todo", // Optional: verify issuer
      audience: "user", // Optional: verify audience
      ignoreExpiration: false // Ensure expiration is checked
    });
    
    return decoded;
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      throw new Error("Token has expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token");
    }
    if (error.name === "NotBeforeError") {
      throw new Error("Token not yet valid");
    }
    
    throw new Error(`Token verification failed: ${error.message}`);
  }
};
// Optional: Refresh token generation
export const signRefreshToken = (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required for refresh token generation");
    }  
    const payload = {
      id: userId,
      type: "refresh",
     
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
      issuer: "todo"
    });
  } catch (error) {
    throw new Error(`Refresh token signing failed: ${error.message}`);
  }
};
// Optional: Token verification with role checking
export const verifyTokenWithRole = (token, requiredRole = "user") => {
  try {
    const decoded = verifyToken(token);  
    // Check if user has required role
    if (decoded.role && decoded.role !== requiredRole) {
      throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
    } 
    return decoded;
  } catch (error) {
    throw new Error(`Token verification with role failed: ${error.message}`);
  }
};
// Optional: Validate token structure before processing
export const validateTokenStructure = (token) => {
  if (!token || typeof token !== "string") {
    return false;
  }
  // Basic format validation
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }
  // Check if all parts are base64url encoded
  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    
    return header && payload;
  } catch (error) {
    return false;
  }
};
