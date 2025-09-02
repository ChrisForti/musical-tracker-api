import express from "express";
import { v2Router } from "./v2/routes.js";
import { authenticate } from "./lib/auth.js";

const app = express();

// middleware
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
