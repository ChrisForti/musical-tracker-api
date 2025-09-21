import { Router, type Request, type Response } from "express";
import {
  PerformanceTable,
  CastingTable,
  MusicalTable,
  TheaterTable,
  ActorTable,
  RoleTable,
  UploadedImagesTable,
} from "../../drizzle/schema.js";
import { Validator } from "../../lib/validator.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq, and } from "drizzle-orm";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";
import { imageDb } from "../../lib/imageDb.js";

export const performanceRouter = Router();

performanceRouter.get("/", ensureAuthenticated, getAllPerformancesHandler);
performanceRouter.post("/", ensureAuthenticated, createPerformanceHandler);
performanceRouter.get("/:id", ensureAuthenticated, getPerformanceByIdHandler);
performanceRouter.put("/:id", ensureAuthenticated, updatePerformanceHandler);
performanceRouter.delete("/:id", ensureAuthenticated, deletePerformanceHandler);

async function getAllPerformancesHandler(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Get user's performances with joined data
    const performances = await db
      .select({
        performanceId: PerformanceTable.id,
        userId: PerformanceTable.userId,
        date: PerformanceTable.date,
        posterId: PerformanceTable.posterId,
        theaterId: PerformanceTable.theaterId,
        theaterName: TheaterTable.name,
        musicalName: MusicalTable.title,
      })
      .from(PerformanceTable)
      .leftJoin(TheaterTable, eq(PerformanceTable.theaterId, TheaterTable.id))
      .leftJoin(MusicalTable, eq(PerformanceTable.musicalId, MusicalTable.id))
      .where(eq(PerformanceTable.userId, userId));

    // Process each performance to get poster URLs
    const performanceList = await Promise.all(
      performances.map(async (perf) => {
        let posterUrl = "";
        if (perf.posterId) {
          const posterImage = await imageDb.getImageById(perf.posterId);
          posterUrl = posterImage?.s3Url || "";
        }

        return {
          posterUrl,
          date: perf.date?.toISOString().split("T")[0] || "",
          theaterName: perf.theaterName || "",
          theaterId: perf.theaterId || "",
          musicalName: perf.musicalName || "",
        };
      })
    );

    res.status(200).json(performanceList);
  } catch (error) {
    console.error("Error in getAllPerformancesHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreatePerformanceBodyParams = {
  musicalId: string;
  date?: string;
  theaterId?: string;
  notes?: string;
  posterId?: string;
};

async function createPerformanceHandler(
  req: Request<{}, {}, CreatePerformanceBodyParams>,
  res: Response
) {
  const { musicalId, date, theaterId, notes, posterId } = req.body;
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
        theaterId: theaterId || null,
        date: date ? new Date(date) : null,
        notes: notes || null,
        posterId: posterId || null,
      })
      .returning({ id: PerformanceTable.id });

    if (!newPerformance) {
      res.status(500).json({ error: "Failed to create performance" });
      return;
    }

    res.status(201).json({
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

    // First get the basic performance data with joins
    const performanceData = await db
      .select({
        performanceId: PerformanceTable.id,
        userId: PerformanceTable.userId,
        date: PerformanceTable.date,
        notes: PerformanceTable.notes,
        posterId: PerformanceTable.posterId,
        theaterName: TheaterTable.name,
        musicalName: MusicalTable.title,
      })
      .from(PerformanceTable)
      .leftJoin(TheaterTable, eq(PerformanceTable.theaterId, TheaterTable.id))
      .leftJoin(MusicalTable, eq(PerformanceTable.musicalId, MusicalTable.id))
      .where(eq(PerformanceTable.id, id))
      .limit(1);

    if (!performanceData.length) {
      res.status(404).json({ error: "Performance not found" });
      return;
    }

    const performance = performanceData[0]!;

    // Users can only access their own performances unless they're admin
    if (req.user?.role !== "admin" && performance.userId !== userId) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    // Get poster URL if available
    let posterUrl = "";
    if (performance.posterId) {
      const posterImage = await imageDb.getImageById(performance.posterId);
      posterUrl = posterImage?.s3Url || "";
    }

    // Get cast information
    const castData = await db
      .select({
        actorId: ActorTable.id,
        actorName: ActorTable.name,
        roleId: RoleTable.id,
        roleName: RoleTable.name,
      })
      .from(CastingTable)
      .leftJoin(ActorTable, eq(CastingTable.actorId, ActorTable.id))
      .leftJoin(RoleTable, eq(CastingTable.roleId, RoleTable.id))
      .where(eq(CastingTable.performanceId, id));

    // Group cast by actor
    const castMap = new Map();
    castData.forEach((row) => {
      if (!castMap.has(row.actorId)) {
        castMap.set(row.actorId, {
          id: row.actorId,
          actorName: row.actorName,
          roles: [],
        });
      }
      if (row.roleId && row.roleName) {
        castMap.get(row.actorId).roles.push({
          id: row.roleId,
          name: row.roleName,
        });
      }
    });

    const cast = Array.from(castMap.values());

    res.status(200).json({
      posterUrl,
      date: performance.date?.toISOString().split("T")[0] || "",
      theaterName: performance.theaterName || "",
      musicalName: performance.musicalName || "",
      notes: performance.notes || "",
      cast,
    });
  } catch (error) {
    console.error("Error in getPerformanceByIdHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdatePerformanceBodyParams = {
  date?: string;
  theaterId?: string;
  notes?: string;
  posterId?: string;
};

async function updatePerformanceHandler(
  req: Request<{ id: string }, {}, UpdatePerformanceBodyParams>,
  res: Response
) {
  const id = req.params.id;
  const { date, theaterId, notes, posterId } = req.body;
  const userId = req.user?.id;
  const validator = new Validator();

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }
    if (theaterId) {
      validator.check(
        validateUuid(theaterId),
        "theaterId",
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
      theaterId: string;
      date: Date;
      notes: string;
      posterId: string;
    }> = {};
    if (theaterId !== undefined) updateData.theaterId = theaterId;
    if (date) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;
    if (posterId !== undefined) updateData.posterId = posterId;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        error:
          "At least one field (date, theaterId, notes, or posterId) is required",
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

    res.status(200).json({});
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
