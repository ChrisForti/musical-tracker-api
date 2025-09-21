import { Router, type Request, type Response } from "express";
import {
  MusicalTable,
  TheaterTable,
  ActorTable,
  RoleTable,
} from "../../drizzle/schema.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq } from "drizzle-orm";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";

export const pendingRouter = Router();

pendingRouter.get(
  "/musicals",
  ensureAuthenticated,
  ensureAdmin,
  getPendingMusicalsHandler
);
pendingRouter.get(
  "/theaters",
  ensureAuthenticated,
  ensureAdmin,
  getPendingTheatersHandler
);
pendingRouter.get(
  "/actors",
  ensureAuthenticated,
  ensureAdmin,
  getPendingActorsHandler
);
pendingRouter.get(
  "/roles",
  ensureAuthenticated,
  ensureAdmin,
  getPendingRolesHandler
);

async function getPendingMusicalsHandler(req: Request, res: Response) {
  try {
    const pendingMusicals = await db
      .select({
        name: MusicalTable.title,
        composer: MusicalTable.composer,
        lyricist: MusicalTable.lyricist,
        id: MusicalTable.id,
      })
      .from(MusicalTable)
      .where(eq(MusicalTable.verified, false));

    res.status(200).json(pendingMusicals);
  } catch (error) {
    console.error("Error in getPendingMusicalsHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function getPendingTheatersHandler(req: Request, res: Response) {
  try {
    const pendingTheaters = await db
      .select({
        name: TheaterTable.name,
        id: TheaterTable.id,
      })
      .from(TheaterTable)
      .where(eq(TheaterTable.verified, false));

    res.status(200).json(pendingTheaters);
  } catch (error) {
    console.error("Error in getPendingTheatersHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function getPendingActorsHandler(req: Request, res: Response) {
  try {
    const pendingActors = await db
      .select({
        name: ActorTable.name,
        id: ActorTable.id,
      })
      .from(ActorTable)
      .where(eq(ActorTable.verified, false));

    res.status(200).json(pendingActors);
  } catch (error) {
    console.error("Error in getPendingActorsHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function getPendingRolesHandler(req: Request, res: Response) {
  try {
    const pendingRoles = await db
      .select({
        name: RoleTable.name,
        id: RoleTable.id,
      })
      .from(RoleTable)
      .where(eq(RoleTable.verified, false));

    res.status(200).json(pendingRoles);
  } catch (error) {
    console.error("Error in getPendingRolesHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
