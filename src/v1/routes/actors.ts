import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { ActorTable, TheaterTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const actorRouter = Router();

actorRouter.post("/", createActorHandler);
actorRouter.get("/", getActorById);
actorRouter.put("/", updateActorHandler);
actorRouter.delete("/", deleteActorHandler);

type CreateActorBody = {
  id: number;
  name: string;
};

async function createActorHandler(
  req: Request<{}, {}, CreateActorBody>,
  res: Response
) {
  const { id, name } = req.body;

  try {
    if (!id || isNaN(id)) {
      throw new Error("ID must be a valid number");
    }

    if (!name) {
      throw new Error("Name is required");
    }

    const newActor = await db.insert(ActorTable).values({
      name,
    });

    res.status(201).json({
      message: "Theater created successfully",
      theater: newActor,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: "Bad request" });
      return;
    }
    res.status(500).json({ error: "Unknown error occurred" });
    return;
  }
}

type GetActorByIdBody = {
  id: number;
};

async function getActorById(
  req: Request<{}, {}, GetActorByIdBody>,
  res: Response
) {
  const { id } = req.body;

  try {
    if (!id || isNaN(id)) {
      throw new Error("ID must be a valid number");
    }

    const actor = await db
      .select()
      .from(ActorTable)
      .where(eq(ActorTable.id, id))
      .limit(1);

    if (actor.length === 0) {
      res.status(404).json({ error: "Actor not found" });
      return;
    }

    res.status(200).json({ Actor: actor[0] });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: "Bad request" });
      return;
    }
    res.status(500).json({ error: "Unknown error occurred" });
  }
}

type UpdateActorBody = {
  id: number;
  name: string;
};

async function updateActorHandler(
  req: Request<{}, {}, UpdateActorBody>,
  res: Response
) {
  const { id, name } = req.body;

  try {
    if (!id || isNaN(id)) {
      res.status(400).json({ error: "Id must be a valid number" });
      return;
    }

    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const updatedActor = await db
      .update(ActorTable)
      .set({ name })
      .where(eq(ActorTable.id, Number(id)));

    if (updatedActor.rowCount === 0) {
      res.status(404).json({ error: "Actor not found" });
      return;
    }

    res.status(200).json({
      message: "Actor updated successfully",
      Actor: updatedActor,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update actor" });
  }
}

type DeleteActorBody = {
  id: number;
};

async function deleteActorHandler(
  req: Request<{}, {}, DeleteActorBody>,
  res: Response
) {
  const id = req.body.id;

  if (!id || isNaN(id)) {
    res.status(400).json({ error: "Id must be a valid number" });
    return;
  }

  try {
    const deletedActor = await db
      .delete(ActorTable)
      .where(eq(ActorTable.id, id));

    if (deletedActor.rowCount === 0) {
      throw new Error("Actor not found or already deleted");
    }

    res.status(200).json({
      message: "Actor deleted successfully",
      Actor: deletedActor,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete Actor" });
  }
}
