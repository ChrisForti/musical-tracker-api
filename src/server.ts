import "./environment.js"; // Must be first import to load environment variables
import express from "express";
import cors from "cors";
import { v2Router } from "./v2/routes.js";
import { authenticate } from "./lib/auth.js";

// Port configuration - allow override via environment variable
const APP_PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const app = express();

// Health check endpoints FIRST - before ANY middleware
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Musical Tracker API",
    version: "2.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

// middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            // Production domains (replace with your actual deployment URLs)
            "https://your-production-domain.com",
            "https://musical-tracker.netlify.app",
            "https://musical-tracker.vercel.app",
          ]
        : [
            // Local development - all localhost ports
            "http://localhost:5173", // Vite default port
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:8080",
          ],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply authentication middleware before protected routes
app.use(authenticate);

// routers
app.use("/v2", v2Router);

const server = app
  .listen(APP_PORT, "0.0.0.0", () => {
    console.log(`Server started on port ${APP_PORT}`);
  })
  .on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${APP_PORT} is already in use. Try these steps:`);
      console.error("1. Check if another instance of the server is running");
      console.error(
        "2. Use a different port by setting the PORT environment variable"
      );
      console.error("3. Or kill the process using the port with:");
      console.error(
        `   lsof -i :${APP_PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`
      );
    } else {
      console.error("Server error:", error);
    }
    process.exit(1);
  });
