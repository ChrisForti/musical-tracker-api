import express from "express";
import { v1Router } from "./v1/router.js";

const app = express();

app.use("/v1", v1Router);

app.listen(3000, (err) => {
  if (err) {
    console.error(err);
  }
  console.log("server starting on port 3000");
});
