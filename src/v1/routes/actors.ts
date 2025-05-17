import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { ActorTable, TheaterTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { SERVER_ERROR } from "../../lib/errors.js";

export const actorRouter = Router();

actorRouter.post("/", createActorHandler);
actorRouter.get("/:id", getActorByIdHandler);
actorRouter.put("/", updateActorHandler);
actorRouter.delete("/", deleteActorHandler);

type CreateActorBodyParams = {
  id: string | number;
  name: string;
};

async function createActorHandler(
  req: Request<{}, {}, CreateActorBodyParams>,
  res: Response,
) {
  const name = req.body.name;
  const id = Number(req.body.id);

  try {
    if (isNaN(id) || id < 1) {
      res
        .status(400)
        .json({ error: "'id' required and must be a valid number" });
      return;
    }

    if (!name) {
      res.status(400).json({ error: "'name' is required" });
      return;
    }

    const newActor = await db.insert(ActorTable).values({
      name,
    });

    res.status(201).json({
      message: "Created successfully",
      actorId: newActor.oid,
    });
  } catch (error) {
    console.error("Error in createActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
    return;
  }
}

type GetActorByIdParams = {
  id: string | number;
};

async function getActorByIdHandler(
  req: Request<GetActorByIdParams>,
  res: Response,
) {
  const id = Number(req.params.id);

  try {
    // Must be a number > 0
    if (isNaN(id) || id < 1) {
      res
        .status(400)
        .json({ error: "'id' required and must be a valid number" });
      return;
    }

    const actor = await db.query.ActorTable.findFirst({
      where: eq(ActorTable.id, id),
    });

    if (!actor) {
      res.status(404).json({ error: "Actor with 'id' not found" });
      return;
    }

    res.status(200).json({ actor });
  } catch (error) {
    console.error("Error in getActorById:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateActorBodyParams = {
  id: string | number;
  name: string;
};

async function updateActorHandler(
  req: Request<{}, {}, UpdateActorBodyParams>,
  res: Response,
) {
  const name = req.body.name;
  const id = Number(req.body.id);

  try {
    if (isNaN(id) || id < 1) {
      res
        .status(400)
        .json({ error: "'id' required and must be a valid number" });
      return;
    }

    if (!name) {
      res.status(400).json({ error: "'name' is required" });
      return;
    }

    const updatedActor = await db
      .update(ActorTable)
      .set({ name })
      .where(eq(ActorTable.id, Number(id)));

    if (updatedActor.rowCount === 0) {
      res.status(404).json({ error: "'id' invalid" });
      return;
    }

    res.status(200).json({
      message: "Actor updated successfully",
    });
  } catch (error) {
    console.error("Error in updateActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type DeleteActorBodyParams = {
  id: string | number;
};

async function deleteActorHandler(
  req: Request<{}, {}, DeleteActorBodyParams>,
  res: Response,
) {
  const id = Number(req.body.id);

  if (isNaN(id) || id < 1) {
    res
      .status(400)
      .json({ error: "'id' is required and must be a valid number" });
    return;
  }

  try {
    const result = await db.delete(ActorTable).where(eq(ActorTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "'id' invalid" });
      return;
    }

    res.status(200).json({
      message: "Actor deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
