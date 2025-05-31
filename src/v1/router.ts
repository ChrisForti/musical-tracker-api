import { Router } from "express";
import { userRouter } from "./routes/users.js";
import { theaterRouter } from "./routes/theaters.js";
import { roleRouter } from "./routes/roles.js";
import { actorRouter } from "./routes/actors.js";
import { musicalRouter } from "./routes/musicals.js";
import { performanceRouter } from "./routes/performances.js";
import { castingRouter } from "./routes/castings.js";
import { productionRouter } from "./routes/productions.js";

export const v1Router = Router(); // Can add auth logig here too encompass whole router

v1Router.use("/user", userRouter);
v1Router.use("/theater", theaterRouter);
v1Router.use("/role", roleRouter);
v1Router.use("/actor", actorRouter);
v1Router.use("/musical", musicalRouter);
v1Router.use("/performance", performanceRouter);
v1Router.use("/casting", castingRouter);
v1Router.use("/production", productionRouter);
