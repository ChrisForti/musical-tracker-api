import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { ActorTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { SERVER_ERROR } from "../../lib/errors.js";
import { Validator } from "../../lib/validator.js";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const actorRouter = Router();

actorRouter.get("/", getAllActorsHandler);
actorRouter.post("/", ensureAuthenticated, createActorHandler);
actorRouter.get("/:id", getActorByIdHandler);
actorRouter.put("/:id", ensureAuthenticated, ensureAdmin, updateActorHandler);
actorRouter.delete("/:id", ensureAuthenticated, deleteActorHandler);
actorRouter.post(
  "/:id/verify",
  ensureAuthenticated,
  ensureAdmin,
  verifyActorHandler
);

async function getAllActorsHandler(req: Request, res: Response) {
  try {
    const isPending = req.query.pending === "true";

    if (isPending) {
      const pendingActors = await db
        .select()
        .from(ActorTable)
        .where(eq(ActorTable.verified, false));

      res.status(200).json(pendingActors);
    } else {
      const actors = await db.select().from(ActorTable);
      res.status(200).json(actors);
    }
  } catch (error) {
    console.error("Error in getAllActorsHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreateActorBodyParams = {
  name: string;
};

async function createActorHandler(
  req: Request<{}, {}, CreateActorBodyParams>,
  res: Response
) {
  const { name } = req.body;
  const validator = new Validator();

  try {
    validator.check(!!name, "name", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const [newActor] = await db
      .insert(ActorTable)
      .values({ name })
      .returning({ id: ActorTable.id });

    if (!newActor) {
      res.status(500).json({ error: "Failed to create actor" });
      return;
    }

    res.status(201).json({
      message: "Actor created successfully",
      id: newActor.id,
    });
  } catch (error) {
    console.error("Error in createActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type GetActorByIdParams = {
  id: string;
};

async function getActorByIdHandler(
  req: Request<GetActorByIdParams>,
  res: Response
) {
  const id = req.params.id;
  const validator = new Validator();

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const actor = await db.query.ActorTable.findFirst({
      where: eq(ActorTable.id, id),
    });

    if (!actor) {
      res.status(404).json({ error: "Actor not found" });
      return;
    }

    res.status(200).json(actor);
  } catch (error) {
    console.error("Error in getActorByIdHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateActorBodyParams = {
  name?: string;
};

async function updateActorHandler(
  req: Request<{ id: string }, {}, UpdateActorBodyParams>,
  res: Response
) {
  const id = req.params.id;
  const { name } = req.body;
  const validator = new Validator();

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const updateData: Partial<{ name: string }> = {};
    if (name) updateData.name = name;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "At least one field (name) is required" });
      return;
    }

    const result = await db
      .update(ActorTable)
      .set(updateData)
      .where(eq(ActorTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Actor not found" });
      return;
    }

    res.status(200).json({ message: "Actor updated successfully" });
  } catch (error) {
    console.error("Error in updateActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function deleteActorHandler(req: Request<{ id: string }>, res: Response) {
  const id = req.params.id;
  const validator = new Validator();

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const result = await db.delete(ActorTable).where(eq(ActorTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Actor not found" });
      return;
    }

    res.status(200).json({ message: "Actor deleted successfully" });
  } catch (error) {
    console.error("Error in deleteActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type VerifyActorParams = {
  id: string;
};

async function verifyActorHandler(
  req: Request<VerifyActorParams>,
  res: Response
) {
  const id = req.params.id;
  const validator = new Validator();

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const result = await db
      .update(ActorTable)
      .set({ verified: true })
      .where(eq(ActorTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Actor not found or already verified" });
      return;
    }

    res.status(200).json({ message: "Actor verified successfully" });
  } catch (error) {
    console.error("Error in verifyActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
