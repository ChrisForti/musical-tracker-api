import { Router, type Request, type Response } from "express";
import { CastingTable } from "../../drizzle/schema.js";
import { Validator } from "../../lib/validator.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq } from "drizzle-orm";

export const castingRouter = Router();

castingRouter.post("/", createCastingHandler);
castingRouter.get("/:id", getCastingByIdHandler);
castingRouter.put("/", updateCastingHandler);
castingRouter.delete("/", deleteCastingHandler);

type CreateCastingBodyParams = {
  roleId: string | number;
  actorId: string | number;
  performanceId: string | number;
};

async function createCastingHandler(
  req: Request<{}, {}, CreateCastingBodyParams>,
  res: Response
) {
  const roleId = Number(req.body.roleId);
  const actorId = Number(req.body.actorId);
  const performanceId = Number(req.body.performanceId);
  const validator = new Validator();

  try {
    validator.check(!isNaN(roleId) && roleId > 0, "roleId", "is required");
    validator.check(!isNaN(actorId) && actorId > 0, "actorId", "is required");
    validator.check(
      !isNaN(performanceId) && performanceId > 0,
      "performanceId",
      "is required"
    );

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const newCasting = await db.insert(CastingTable).values({
      roleId,
      actorId,
      performanceId,
    });

    res.status(201).json({
      message: "Created successfully",
      CastingId: newCasting.oid,
    });
  } catch (error) {
    console.error("Error in createActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
    return;
  }
}

type GetCastingbyIdParams = {
  id: string | number;
};

async function getCastingByIdHandler(
  req: Request<GetCastingbyIdParams>,
  res: Response
) {
  const validator = new Validator();
  const id = Number(req.params.id);
  try {
    validator.check(
      !isNaN(id) && id > 1,
      "id",
      "is required and must be a number"
    );

    if (!validator.valid) {
      res.json({ errors: validator.errors });
      return;
    }

    const casting = await db.query.CastingTable.findFirst({
      where: eq(CastingTable.id, id),
    });

    validator.check(!casting, "casting", "not found");
    if (!validator.valid) {
      res.status(404).json({ errors: validator.errors });
      return;
    }
  } catch (error) {
    console.error("Error in getCastingById:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateCastinghBodyParams = {
  id: string | number;
  roleId: string | number;
  actorId: string | number;
  performanceId: string | number;
};

async function updateCastingHandler(
  req: Request<{}, {}, UpdateCastinghBodyParams>,
  res: Response
) {
  const id = Number(req.body.id);
  const roleId = Number(req.body.roleId);
  const actorId = Number(req.body.actorId);
  const performanceId = Number(req.body.performanceId);
  const validator = new Validator();

  type UpdatedData = {
    roleId?: number;
    actorId?: number;
    performanceId?: number;
  };

  try {
    validator.check(
      !isNaN(id) && id > 1,
      "id",
      "is required and must be a number"
    );

    const updatedData: UpdatedData = {};
    if (roleId) {
      updatedData.roleId = roleId;
    }
    if (actorId) {
      updatedData.actorId = actorId;
    }
    if (performanceId) {
      updatedData.performanceId = performanceId;
    }

    const result = await db
      .update(CastingTable)
      .set({ roleId, actorId, performanceId })
      .where(eq(CastingTable.id, Number(id)));

    validator.check(result.rowCount === 0, "id", "not found");

    if (!validator.valid) {
      res.json({ errors: validator.errors });
      return;
    }

    res.status(200).json({
      message: "Casting updated successfully",
    });
  } catch (error) {
    console.error("Error in updateCastingHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type DeleteCastingBodyParams = {
  id: string | number;
};

async function deleteCastingHandler(
  req: Request<{}, {}, DeleteCastingBodyParams>,
  res: Response
) {
  const id = Number(req.body.id);
  const validator = new Validator();

  validator.check(
    !isNaN(id) && id > 1,
    "id",
    "is required and must be a number"
  );

  try {
    const result = await db.delete(CastingTable).where(eq(CastingTable.id, id));

    validator.check(result.rowCount === 0, "id", "invalid");

    if (!validator.valid) {
      res.json({ errors: validator.errors });
      return;
    }

    res.status(200).json({
      message: "casting deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCastingHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
