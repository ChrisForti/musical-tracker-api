import { Router, type Request, type Response } from "express";
import { CastingTable } from "../../drizzle/schema.js";
import { Validator } from "../../lib/validator.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { and, eq } from "drizzle-orm";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const castingRouter = Router();

castingRouter.post("/", ensureAuthenticated, createCastingHandler);
castingRouter.get("/:roleId/:actorId/:performanceId", getCastingByIdHandler);
castingRouter.put("/", ensureAuthenticated, updateCastingHandler);
castingRouter.delete("/", ensureAuthenticated, deleteCastingHandler);
castingRouter.get("/", ensureAuthenticated, ensureAdmin, getAllCastingsHandler);

async function getAllCastingsHandler(req: Request, res: Response) {
  try {
    const result = await db.query.CastingTable.findMany();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllCastingsHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreateCastingBodyParams = {
  roleId: string;
  actorId: string;
  performanceId: string;
};

async function createCastingHandler(
  req: Request<{}, {}, CreateCastingBodyParams>,
  res: Response
) {
  const roleId = req.body.roleId;
  const actorId = req.body.actorId;
  const performanceId = req.body.performanceId;
  const validator = new Validator();

  try {
    validator.check(!!roleId, "roleId", "is required");
    if (roleId) {
      validator.check(validateUuid(roleId), "id", "must be a valid UUID");
    }
    validator.check(!!actorId, "actorId", "is required");
    if (actorId) {
      validator.check(validateUuid(actorId), "id", "must be a valid UUID");
    }
    validator.check(!!performanceId, "performanceId", "is required");
    if (performanceId) {
      validator.check(
        validateUuid(performanceId),
        "id",
        "must be a valid UUID"
      );
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    await db.insert(CastingTable).values({
      roleId,
      actorId,
      performanceId,
    });

    res.status(201).json({
      message: "Created successfully",
      casting: { roleId, actorId, performanceId },
    });
  } catch (error: any) {
    if (error.code === "23505") {
      // Handle duplicate insert errors: unique_violation
      res.status(409).json({ error: "Casting already exists" });
      return;
    }
    console.error("Error in createActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
    return;
  }
}

type GetCastingByKeyParams = {
  roleId: string;
  actorId: string;
  performanceId: string;
};

async function getCastingByIdHandler(
  req: Request<GetCastingByKeyParams>,
  res: Response
) {
  const { roleId, actorId, performanceId } = req.params;
  const validator = new Validator();

  try {
    validator.check(!!roleId, "roleId", "is required");
    if (roleId) {
      validator.check(validateUuid(roleId), "id", "must be a valid UUID");
    }
    validator.check(!!actorId, "actorId", "is required");
    if (actorId) {
      validator.check(validateUuid(actorId), "id", "must be a valid UUID");
    }
    validator.check(!!performanceId, "performanceId", "is required");
    if (performanceId) {
      validator.check(
        validateUuid(performanceId),
        "id",
        "must be a valid UUID"
      );
    }

    if (!validator.valid) {
      res.json({ errors: validator.errors });
      return;
    }

    const result = await db.query.CastingTable.findFirst({
      where: and(
        eq(CastingTable.roleId, roleId),
        eq(CastingTable.actorId, actorId),
        eq(CastingTable.performanceId, performanceId)
      ),
    });

    if (!result) {
      res
        .status(404)
        .json({ errors: [{ field: "casting", message: "not found" }] });
      return;
    }
  } catch (error) {
    console.error("Error in getCastingById:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateCastinghBodyParams = {
  roleId: string;
  actorId: string;
  performanceId: string;
};

async function updateCastingHandler(
  req: Request<{}, {}, UpdateCastinghBodyParams>,
  res: Response
) {
  const roleId = req.body.roleId;
  const actorId = req.body.actorId;
  const performanceId = req.body.performanceId;
  const validator = new Validator();

  type UpdatedData = {
    roleId?: string;
    actorId?: string;
    performanceId?: string;
  };

  try {
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
      .where(
        and(
          eq(CastingTable.roleId, roleId),
          eq(CastingTable.actorId, actorId),
          eq(CastingTable.performanceId, performanceId)
        )
      );
    if (result.rowCount === 0) {
      res
        .status(404)
        .json({ errors: [{ field: "casting", message: "not found" }] });
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
  roleId: string;
  actorId: string;
  performanceId: string;
};

async function deleteCastingHandler(
  req: Request<{}, {}, DeleteCastingBodyParams>,
  res: Response
) {
  const roleId = req.body.roleId;
  const actorId = req.body.actorId;
  const performanceId = req.body.performanceId;
  const validator = new Validator();

  try {
    validator.check(!!roleId, "roleId", "is required");
    if (roleId) {
      validator.check(validateUuid(roleId), "id", "must be a valid UUID");
    }
    validator.check(!!actorId, "actorId", "is required");
    if (actorId) {
      validator.check(validateUuid(actorId), "id", "must be a valid UUID");
    }
    validator.check(!!performanceId, "performanceId", "is required");
    if (performanceId) {
      validator.check(
        validateUuid(performanceId),
        "id",
        "must be a valid UUID"
      );
    }

    if (!validator.valid) {
      res.json({ errors: validator.errors });
      return;
    }

    const result = await db
      .delete(CastingTable)
      .where(
        and(
          eq(CastingTable.roleId, roleId),
          eq(CastingTable.actorId, actorId),
          eq(CastingTable.performanceId, performanceId)
        )
      );
    if (result.rowCount === 0) {
      res
        .status(404)
        .json({ errors: [{ field: "casting", message: "not found" }] });
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
