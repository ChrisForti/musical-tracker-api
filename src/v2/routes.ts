import { Router } from "express";
import { theaterRouter } from "./routes/theater.js";
import { castingRouter } from "./routes/castings.js";
import { roleRouter } from "./routes/roles.js";
import { actorRouter } from "./routes/actors.js";
import { musicalRouter } from "./routes/musicals.js";
import { userRouter } from "./routes/users.js";
import { performanceRouter } from "./routes/performances.js";
import { mediaRouter } from "./routes/media.js";
import { pendingRouter } from "./routes/pending.js";

export const v2Router = Router();

v2Router.use("/theater", theaterRouter);
v2Router.use("/casting", castingRouter);
v2Router.use("/role", roleRouter);
v2Router.use("/actor", actorRouter);
v2Router.use("/musical", musicalRouter);
v2Router.use("/user", userRouter);
v2Router.use("/performance", performanceRouter);
v2Router.use("/media", mediaRouter);
v2Router.use("/pending", pendingRouter);
