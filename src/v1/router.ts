import { Router } from "express";
import { userRouter } from "./routes/users.js";
import { theaterRouter } from "./routes/theaters.js";
import { roleRouter } from "./routes/roles.js";

export const v1Router = Router();
v1Router.use("/user", userRouter);
v1Router.use("/theater", theaterRouter);
v1Router.use("/role", roleRouter);
