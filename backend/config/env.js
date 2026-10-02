import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
// Using a more robust approach with error handling
try {
  const envPath = path.join(__dirname, "../../.env");
  dotenv.config({ path: envPath });
  console.log("Environment variables loaded successfully from:", envPath);
} catch (error) {
  console.error("Failed to load environment variables:", error.message);
  // Optionally exit the process or handle the error as needed
  // process.exit(1);
}

// Alternative approach - more explicit and readable
// const envPath = path.resolve(__dirname, "../../.env");
// dotenv.config({ path: envPath });

