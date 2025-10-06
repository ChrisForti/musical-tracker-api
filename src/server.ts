import express from "express";
import cors from "cors";
import { v2Router } from "./v2/routes.js";
import { authenticate } from "./lib/auth.js";

const app = express();

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
    ], // Allow multiple frontend ports and API origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authenticate);

// routers
app.use("/v2", v2Router);

app.listen(3000, (error) => {
  if (error) {
    console.error(error);
  }
  console.log("server starting on port 3000");
});
