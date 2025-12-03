import "./environment.js"; // Must be first import to load environment variables
console.log("✅ Environment loaded");

import express from "express";
console.log("✅ Express imported");

import cors from "cors";
console.log("✅ CORS imported");

import { v2Router } from "./v2/routes.js";
console.log("✅ Routes imported");

import { authenticate } from "./lib/auth.js";
console.log("✅ Auth middleware imported");

// Port configuration - allow override via environment variable
const APP_PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
console.log(`📝 Configured to listen on port: ${APP_PORT}`);

const app = express();
console.log("✅ Express app created");

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
console.log("✅ Health check routes registered");

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
console.log("✅ CORS middleware configured");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("✅ Body parsing middleware configured");

// Apply authentication middleware before protected routes
app.use(authenticate);
console.log("✅ Authentication middleware configured");

// routers
app.use("/v2", v2Router);
console.log("✅ API routes registered");

const server = app
  .listen(APP_PORT, "0.0.0.0", () => {
    console.log("=".repeat(50));
    console.log(`🚀 Server successfully started!`);
    console.log(`📍 Port: ${APP_PORT}`);
    console.log(`🌍 Host: 0.0.0.0`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`💚 Health check: http://0.0.0.0:${APP_PORT}/health`);
    console.log("=".repeat(50));
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
