import { Router } from "express";
import { userRouter } from "./routes/users.js";
import { theaterRouter } from "./routes/theaters.js";

export const v1Router = Router();
v1Router.use("/user", userRouter);
v1Router.use("/theater", theaterRouter);
