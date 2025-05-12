import express from "express";
import { v1Router } from "./v1/router.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/v1", v1Router);

app.listen(3000, (error) => {
  if (error) {
    console.error(error);
  }
  console.log("server starting on port 3000");
});
