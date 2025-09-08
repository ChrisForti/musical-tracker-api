import { Router, type Request, type Response } from "express";
import { CastingTable, PerformanceTable } from "../../drizzle/schema.js";
import { Validator } from "../../lib/validator.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq } from "drizzle-orm";
import { ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const castingRouter = Router();

castingRouter.get("/", ensureAuthenticated, getAllCastingsHandler);
castingRouter.post("/", ensureAuthenticated, createCastingHandler);
castingRouter.get("/:id", ensureAuthenticated, getCastingByIdHandler);
castingRouter.put("/:id", ensureAuthenticated, updateCastingHandler);
castingRouter.delete("/:id", ensureAuthenticated, deleteCastingHandler);

async function getAllCastingsHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "User authentication required" });
      return;
    }

    // Get castings only for performances owned by the current user (unless admin)
    if (req.user?.role === "admin") {
      const result = await db.select().from(CastingTable);
      res.status(200).json(result);
    } else {
      const result = await db
        .select({
          id: CastingTable.id,
          roleId: CastingTable.roleId,
          actorId: CastingTable.actorId,
          performanceId: CastingTable.performanceId,
        })
        .from(CastingTable)
        .innerJoin(
          PerformanceTable,
          eq(CastingTable.performanceId, PerformanceTable.id)
        )
        .where(eq(PerformanceTable.userId, userId));

      res.status(200).json(result);
    }
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
  const { roleId, actorId, performanceId } = req.body;
  const userId = req.user?.id;
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

    validator.check(!!performanceId, "performanceId", "is required");
    if (performanceId) {
      validator.check(
        validateUuid(performanceId),
        "performanceId",
        "must be a valid UUID"
      );
    }

    if (!userId) {
      res.status(401).json({ error: "User authentication required" });
      return;
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    // Check if user owns the performance (unless admin)
    if (req.user?.role !== "admin") {
      const performance = await db
        .select({ userId: PerformanceTable.userId })
        .from(PerformanceTable)
        .where(eq(PerformanceTable.id, performanceId));

      if (performance.length === 0) {
        res.status(404).json({ error: "Performance not found" });
        return;
      }

      if (performance[0]!.userId !== userId) {
        res
          .status(403)
          .json({
            error:
              "Access denied - can only create castings for your own performances",
          });
        return;
      }
    }

    const newCasting = await db
      .insert(CastingTable)
      .values({
        roleId,
        actorId,
        performanceId,
      })
      .returning({ id: CastingTable.id });

    if (newCasting.length > 0) {
      // Return only the casting ID as requested
      res.status(201).json({
        id: newCasting[0]!.id,
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
  const userId = req.user?.id;
  const validator = new Validator();

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }

    if (!userId) {
      res.status(401).json({ error: "User authentication required" });
      return;
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    // Get casting with performance info to check ownership
    const castingResult = await db
      .select({
        id: CastingTable.id,
        roleId: CastingTable.roleId,
        actorId: CastingTable.actorId,
        performanceId: CastingTable.performanceId,
        performanceUserId: PerformanceTable.userId,
      })
      .from(CastingTable)
      .innerJoin(
        PerformanceTable,
        eq(CastingTable.performanceId, PerformanceTable.id)
      )
      .where(eq(CastingTable.id, id));

    if (castingResult.length === 0) {
      res.status(404).json({ error: "Casting not found" });
      return;
    }

    const casting = castingResult[0]!;

    // Only allow access if user owns the performance or is admin
    if (req.user?.role !== "admin" && casting.performanceUserId !== userId) {
      res
        .status(403)
        .json({
          error:
            "Access denied - casting belongs to another user's performance",
        });
      return;
    }

    // Return casting data without the internal performanceUserId
    const { performanceUserId, ...castingResponse } = casting;
    res.status(200).json(castingResponse);
  } catch (error) {
    console.error("Error in getCastingByIdHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateCastingBodyParams = {
  roleId?: string;
  actorId?: string;
  performanceId?: string;
};

async function updateCastingHandler(
  req: Request<{ id: string }, {}, UpdateCastingBodyParams>,
  res: Response
) {
  const { id } = req.params;
  const { roleId, actorId, performanceId } = req.body;
  const userId = req.user?.id;
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

    if (performanceId) {
      validator.check(
        validateUuid(performanceId),
        "performanceId",
        "must be a valid UUID"
      );
    }

    if (!userId) {
      res.status(401).json({ error: "User authentication required" });
      return;
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    // Check if casting exists and user owns the performance
    const existingCastingResult = await db
      .select({
        id: CastingTable.id,
        roleId: CastingTable.roleId,
        actorId: CastingTable.actorId,
        performanceId: CastingTable.performanceId,
        performanceUserId: PerformanceTable.userId,
      })
      .from(CastingTable)
      .innerJoin(
        PerformanceTable,
        eq(CastingTable.performanceId, PerformanceTable.id)
      )
      .where(eq(CastingTable.id, id));

    if (existingCastingResult.length === 0) {
      res.status(404).json({ error: "Casting not found" });
      return;
    }

    const existingCasting = existingCastingResult[0]!;

    // Only allow updates if user owns the performance or is admin
    if (
      req.user?.role !== "admin" &&
      existingCasting.performanceUserId !== userId
    ) {
      res
        .status(403)
        .json({
          error:
            "Access denied - can only update castings for your own performances",
        });
      return;
    }

    // If updating performanceId, verify user owns the new performance too (unless admin)
    if (
      performanceId &&
      performanceId !== existingCasting.performanceId &&
      req.user?.role !== "admin"
    ) {
      const newPerformance = await db
        .select({ userId: PerformanceTable.userId })
        .from(PerformanceTable)
        .where(eq(PerformanceTable.id, performanceId));

      if (newPerformance.length === 0) {
        res.status(404).json({ error: "New performance not found" });
        return;
      }

      if (newPerformance[0]!.userId !== userId) {
        res
          .status(403)
          .json({
            error:
              "Access denied - can only assign castings to your own performances",
          });
        return;
      }
    }

    const updateData: Partial<{
      roleId: string;
      actorId: string;
      performanceId: string;
    }> = {};

    if (roleId) updateData.roleId = roleId;
    if (actorId) updateData.actorId = actorId;
    if (performanceId) updateData.performanceId = performanceId;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        error:
          "At least one field (roleId, actorId, or performanceId) is required",
      });
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
  const userId = req.user?.id;
  const validator = new Validator();

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }

    if (!userId) {
      res.status(401).json({ error: "User authentication required" });
      return;
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    // Check if casting exists and user owns the performance
    const existingCastingResult = await db
      .select({
        id: CastingTable.id,
        performanceUserId: PerformanceTable.userId,
      })
      .from(CastingTable)
      .innerJoin(
        PerformanceTable,
        eq(CastingTable.performanceId, PerformanceTable.id)
      )
      .where(eq(CastingTable.id, id));

    if (existingCastingResult.length === 0) {
      res.status(404).json({ error: "Casting not found" });
      return;
    }

    const existingCasting = existingCastingResult[0]!;

    // Only allow deletion if user owns the performance or is admin
    if (
      req.user?.role !== "admin" &&
      existingCasting.performanceUserId !== userId
    ) {
      res
        .status(403)
        .json({
          error:
            "Access denied - can only delete castings for your own performances",
        });
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
