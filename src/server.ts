import express from "express";
import cors from "cors";
import { v2Router } from "./v2/routes.js";
import { authenticate } from "./lib/auth.js";
import { PORT } from "./environment.js";

const app = express();

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
app.use(authenticate);

// routers
app.use("/v2", v2Router);

app.listen(PORT, (error) => {
  if (error) {
    console.error(error);
  }
  console.log(`Server starting on port ${PORT}`);
});
