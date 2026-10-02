import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file - improved approach with error handling
try {
  const envPath = path.resolve(__dirname, "../.env");
  dotenv.config({ path: envPath });
  console.log("Environment variables loaded from:", envPath);
} catch (error) {
  console.error("Failed to load environment variables:", error.message);
  process.exit(1);
}

// Import routes after env is loaded
import connectdb from "./config/db.js";
import todoRoutes from "./routes/todo.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// Middleware
const allowedOrigins = [
  "https://todo-app-ten-phi-49.vercel.app",
  "http://localhost:5173",
  "http://localhost:5000",
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (Postman, curl) and any Vercel preview URL
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data
app.use(async (req, res, next) => {
  try {
    await connectdb();
    next();
  } catch (error) {
    next(error);
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    message: "Server is running"
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

// 404 for unknown API routes - fixed with named wildcard
// Global error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

export default app;