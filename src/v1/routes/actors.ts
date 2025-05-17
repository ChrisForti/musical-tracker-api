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
  id?: string | number;
  name: string;
};

async function createActorHandler(
  req: Request<{}, {}, CreateActorBody>,
  res: Response
) {
  const { name } = req.body;
  const id = Number(req.body.id);

  try {
    if (isNaN(id) || id < 1) {
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
      res.status(400).json({ error: "ID must be a valid number" });
      return;
    }
    res.status(500).json({ error: "Unknown error occurred" });
    return;
  }
}

type GetActorByIdBody = {
  id: string | number;
};

async function getActorById(
  req: Request<{}, {}, GetActorByIdBody>,
  res: Response
) {
  const id = Number(req.body.id);

  try {
    if (isNaN(Number(id))) {
      res.status(400).json({ error: "ID must be a valid number" });
      return;
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
      res.status(400).json({ error: "ID must be a valid number" });
      return;
    }
    res.status(500).json({ error: "Unknown error occurred" });
  }
}

type UpdateActorBody = {
  id?: string;
  name: string;
};

async function updateActorHandler(
  req: Request<{}, {}, UpdateActorBody>,
  res: Response
) {
  const { name } = req.body;
  const id = Number(req.body.id);

  try {
    if (isNaN(id) || id < 1) {
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
  id: string | number;
};

async function deleteActorHandler(
  req: Request<{}, {}, DeleteActorBody>,
  res: Response
) {
  const id = Number(req.body.id);

  if (isNaN(id) || id < 1) {
    res.status(400).json({ error: "ID must be a valid number" });
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
