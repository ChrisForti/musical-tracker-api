import { Router } from "express";
import { userRouter } from "./routes/users.js";

export const v1Router = Router();
v1Router.use("/user", userRouter);
