import { Router, type Request, type Response } from "express";
import { PerformanceTable } from "../../drizzle/schema.js";
import { Validator } from "../../lib/validator.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq } from "drizzle-orm";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const performanceRouter = Router();

performanceRouter.get("/", ensureAuthenticated, getAllPerformancesHandler);
performanceRouter.post("/", ensureAuthenticated, createPerformanceHandler);
performanceRouter.get("/:id", getPerformanceByIdHandler);
performanceRouter.put("/:id", ensureAuthenticated, updatePerformanceHandler);
performanceRouter.delete("/:id", ensureAuthenticated, deletePerformanceHandler);

async function getAllPerformancesHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Users can only see their own performances unless they're admin
    if (req.user?.role === "admin") {
      const performances = await db.select().from(PerformanceTable);
      res.status(200).json(performances);
    } else {
      const userPerformances = await db
        .select()
        .from(PerformanceTable)
        .where(eq(PerformanceTable.userId, userId));
      res.status(200).json(userPerformances);
    }
  } catch (error) {
    console.error("Error in getAllPerformancesHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
type CreatePerformanceBodyParams = {
  musicalId: string;
  date?: string;
  notes?: string;
  posterUrl?: string;
};

async function createPerformanceHandler(
  req: Request<{}, {}, CreatePerformanceBodyParams>,
  res: Response
) {
  const { musicalId, date, notes, posterUrl } = req.body;
  const userId = req.user?.id;
  const validator = new Validator();

  try {
    validator.check(!!userId, "userId", "is required");
    validator.check(!!musicalId, "musicalId", "is required");
    if (musicalId) {
      validator.check(
        validateUuid(musicalId),
        "musicalId",
        "must be a valid UUID"
      );
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const [newPerformance] = await db
      .insert(PerformanceTable)
      .values({
        musicalId,
        userId: userId!,
        date: date ? new Date(date) : null,
        notes: notes || null,
        posterUrl: posterUrl || null,
      })
      .returning({ id: PerformanceTable.id });

    if (!newPerformance) {
      res.status(500).json({ error: "Failed to create performance" });
      return;
    }

    res.status(201).json({
      message: "Performance created successfully",
      id: newPerformance.id,
    });
  } catch (error) {
    console.error("Error in createPerformanceHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type GetPerformanceByIdParams = {
  id: string;
};

async function getPerformanceByIdHandler(
  req: Request<GetPerformanceByIdParams>,
  res: Response
) {
  const id = req.params.id;
  const userId = req.user?.id;
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

    const performance = await db.query.PerformanceTable.findFirst({
      where: eq(PerformanceTable.id, id),
    });

    if (!performance) {
      res.status(404).json({ error: "Performance not found" });
      return;
    }

    // Users can only access their own performances unless they're admin
    if (req.user?.role !== "admin" && performance.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.status(200).json(performance);
  } catch (error) {
    console.error("Error in getPerformanceByIdHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdatePerformanceBodyParams = {
  musicalId?: string;
  date?: string;
  notes?: string;
  posterUrl?: string;
};

async function updatePerformanceHandler(
  req: Request<{ id: string }, {}, UpdatePerformanceBodyParams>,
  res: Response
) {
  const id = req.params.id;
  const { musicalId, date, notes, posterUrl } = req.body;
  const userId = req.user?.id;
  const validator = new Validator();

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }
    if (musicalId) {
      validator.check(
        validateUuid(musicalId),
        "musicalId",
        "must be a valid UUID"
      );
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    // Check if performance exists and user has access
    const existingPerformance = await db.query.PerformanceTable.findFirst({
      where: eq(PerformanceTable.id, id),
    });

    if (!existingPerformance) {
      res.status(404).json({ error: "Performance not found" });
      return;
    }

    // Users can only update their own performances unless they're admin
    if (req.user?.role !== "admin" && existingPerformance.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const updateData: Partial<{
      musicalId: string;
      date: Date;
      notes: string;
      posterUrl: string;
    }> = {};
    if (musicalId) updateData.musicalId = musicalId;
    if (date) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;
    if (posterUrl !== undefined) updateData.posterUrl = posterUrl;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        error:
          "At least one field (musicalId, date, notes, or posterUrl) is required",
      });
      return;
    }

    const result = await db
      .update(PerformanceTable)
      .set(updateData)
      .where(eq(PerformanceTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Performance not found" });
      return;
    }

    res.status(200).json({ message: "Performance updated successfully" });
  } catch (error) {
    console.error("Error in updatePerformanceHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function deletePerformanceHandler(
  req: Request<{ id: string }>,
  res: Response
) {
  const id = req.params.id;
  const userId = req.user?.id;
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

    // Check if performance exists and user has access
    const existingPerformance = await db.query.PerformanceTable.findFirst({
      where: eq(PerformanceTable.id, id),
    });

    if (!existingPerformance) {
      res.status(404).json({ error: "Performance not found" });
      return;
    }

    // Users can only delete their own performances unless they're admin
    if (req.user?.role !== "admin" && existingPerformance.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    const result = await db
      .delete(PerformanceTable)
      .where(eq(PerformanceTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Performance not found" });
      return;
    }

    res.status(200).json({ message: "Performance deleted successfully" });
  } catch (error) {
    console.error("Error in deletePerformanceHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
