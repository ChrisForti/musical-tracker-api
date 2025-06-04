import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { ActorTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { SERVER_ERROR } from "../../lib/errors.js";
import { Validator } from "../../lib/validator.js";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";

export const actorRouter = Router();

actorRouter.post("/", createActorHandler);
actorRouter.get("/:id", getActorByIdHandler);
actorRouter.put("/", updateActorHandler);
actorRouter.delete("/", deleteActorHandler);
// New routes for approval workflow
actorRouter.post<ApproveActorParams>(
  "/:id/approve",
  ensureAuthenticated,
  ensureAdmin,
  approveActorHandler
);
actorRouter.get("/pending", ensureAdmin, getPendingActorsHandler);

type ApproveActorParams = {
  id: string;
};

async function approveActorHandler(
  req: Request<ApproveActorParams>,
  res: Response
) {
  const id = Number(req.params.id);
  const validator = new Validator();

  try {
    validator.check(!isNaN(id) && id > 0, "id", "is required");
    validator.check(id > 0, "id", "must be a valid number");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const result = await db
      .update(ActorTable)
      .set({ approved: true })
      .where(eq(ActorTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Actor not found or already approved" });
      return;
    }

    res.status(200).json({ message: "Actor approved successfully" });
  } catch (error) {
    console.error("Error in approveActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function getPendingActorsHandler(req: Request, res: Response) {
  try {
    const pendingActors = await db
      .select()
      .from(ActorTable)
      .where(eq(ActorTable.approved, false));

    res.status(200).json({ actors: pendingActors });
  } catch (error) {
    console.error("Error in getPendingActorsHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreateActorBodyParams = {
  id: string | number;
  name: string;
};

async function createActorHandler(
  req: Request<{}, {}, CreateActorBodyParams>,
  res: Response
) {
  const name = req.body.name;
  const id = Number(req.body.id);
  const validator = new Validator();

  try {
    validator.check(
      !isNaN(id) && id > 0,
      "id",
      "is required and must be a valid number"
    );
    validator.check(!name, "name", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
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
  res: Response
) {
  const id = Number(req.params.id);
  const validator = new Validator();

  try {
    validator.check(
      !isNaN(id) && id > 0,
      "id",
      "is required and must be a valid number"
    );

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
  res: Response
) {
  const name = req.body.name;
  const id = Number(req.body.id);
  const validator = new Validator();

  try {
    validator.check(
      !isNaN(id) && id > 0,
      "id",
      "is required and must be a valid number"
    );
    validator.check(!name, "name", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
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
  res: Response
) {
  const id = Number(req.body.id);
  const validator = new Validator();

  try {
    validator.check(
      !isNaN(id) && id > 0,
      "id",
      "is required and must be a valid number"
    );

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

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
