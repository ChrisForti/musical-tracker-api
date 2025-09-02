import { Router, type Request, type Response } from "express";
import { CastingTable } from "../../drizzle/schema.js";
import { Validator } from "../../lib/validator.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq } from "drizzle-orm";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const castingRouter = Router();

castingRouter.get("/", getAllCastingsHandler);
castingRouter.post("/", ensureAuthenticated, createCastingHandler);
castingRouter.get("/:id", getCastingByIdHandler);
castingRouter.put("/:id", ensureAuthenticated, updateCastingHandler);
castingRouter.delete("/:id", ensureAuthenticated, deleteCastingHandler);
castingRouter.post(
  "/:id/verify",
  ensureAuthenticated,
  ensureAdmin,
  verifyCastingHandler
);

async function getAllCastingsHandler(req: Request, res: Response) {
  try {
    const { pending } = req.query;

    if (pending === "true") {
      // Admin-only: show pending castings
      if (req.user?.role !== "admin") {
        res.status(403).json({ error: "Access denied" });
        return;
      }
      const result = await db.query.CastingTable.findMany({
        where: eq(CastingTable.verified, false),
      });
      res.status(200).json(result);
      return;
    }

    // Public: show verified castings
    const result = await db.query.CastingTable.findMany({
      where: eq(CastingTable.verified, true),
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllCastingsHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreateCastingBodyParams = {
  roleId: string;
  actorId: string;
};

async function createCastingHandler(
  req: Request<{}, {}, CreateCastingBodyParams>,
  res: Response
) {
  const { roleId, actorId } = req.body;
  const validator = new Validator();

  try {
    validator.check(!!roleId, "roleId", "is required");
    if (roleId) {
      validator.check(validateUuid(roleId), "roleId", "must be a valid UUID");
    }

    validator.check(!!actorId, "actorId", "is required");
    if (actorId) {
      validator.check(validateUuid(actorId), "actorId", "must be a valid UUID");
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const newCasting = await db
      .insert(CastingTable)
      .values({
        roleId,
        actorId,
      })
      .returning({ id: CastingTable.id });

    if (newCasting.length > 0) {
      res.status(201).json({
        message: "Casting created successfully",
        casting: { id: newCasting[0]!.id, roleId, actorId },
      });
    } else {
      res.status(500).json({ error: "Failed to create casting" });
    }
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(409).json({ error: "Casting already exists" });
      return;
    }
    console.error("Error in createCastingHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type GetCastingByIdParams = {
  id: string;
};

async function getCastingByIdHandler(
  req: Request<GetCastingByIdParams>,
  res: Response
) {
  const { id } = req.params;
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

    const casting = await db.query.CastingTable.findFirst({
      where: eq(CastingTable.id, id),
    });

    if (!casting) {
      res.status(404).json({ error: "Casting not found" });
      return;
    }

    res.status(200).json(casting);
  } catch (error) {
    console.error("Error in getCastingByIdHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateCastingBodyParams = {
  roleId?: string;
  actorId?: string;
};

async function updateCastingHandler(
  req: Request<{ id: string }, {}, UpdateCastingBodyParams>,
  res: Response
) {
  const { id } = req.params;
  const { roleId, actorId } = req.body;
  const validator = new Validator();

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }

    if (roleId) {
      validator.check(validateUuid(roleId), "roleId", "must be a valid UUID");
    }

    if (actorId) {
      validator.check(validateUuid(actorId), "actorId", "must be a valid UUID");
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const existingCasting = await db.query.CastingTable.findFirst({
      where: eq(CastingTable.id, id),
    });

    if (!existingCasting) {
      res.status(404).json({ error: "Casting not found" });
      return;
    }

    const updateData: Partial<{
      roleId: string;
      actorId: string;
    }> = {};

    if (roleId) updateData.roleId = roleId;
    if (actorId) updateData.actorId = actorId;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: "No fields to update" });
      return;
    }

    await db
      .update(CastingTable)
      .set(updateData)
      .where(eq(CastingTable.id, id));

    res.status(200).json({ message: "Casting updated successfully" });
  } catch (error) {
    console.error("Error in updateCastingHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function deleteCastingHandler(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id } = req.params;
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

    const existingCasting = await db.query.CastingTable.findFirst({
      where: eq(CastingTable.id, id),
    });

    if (!existingCasting) {
      res.status(404).json({ error: "Casting not found" });
      return;
    }

    const result = await db.delete(CastingTable).where(eq(CastingTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Casting not found" });
      return;
    }

    res.status(200).json({ message: "Casting deleted successfully" });
  } catch (error) {
    console.error("Error in deleteCastingHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function verifyCastingHandler(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id } = req.params;
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

    const existingCasting = await db.query.CastingTable.findFirst({
      where: eq(CastingTable.id, id),
    });

    if (!existingCasting) {
      res.status(404).json({ error: "Casting not found" });
      return;
    }

    await db
      .update(CastingTable)
      .set({ verified: true })
      .where(eq(CastingTable.id, id));

    res.status(200).json({ message: "Casting verified successfully" });
  } catch (error) {
    console.error("Error in verifyCastingHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
