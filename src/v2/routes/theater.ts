import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { TheaterTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { SERVER_ERROR } from "../../lib/errors.js";
import { Validator } from "../../lib/validator.js";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const theaterRouter = Router();

// Updated route structure - using URL params for PUT/DELETE
theaterRouter.get("/", getAllTheatersHandler);
theaterRouter.post("/", ensureAuthenticated, createTheaterHandler);
theaterRouter.get("/:id", getTheaterByIdHandler);
theaterRouter.put(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  updateTheaterHandler
);
theaterRouter.delete(
  "/:id",
  ensureAuthenticated,
  ensureAdmin,
  deleteTheaterHandler
);
theaterRouter.post(
  "/:id/verify",
  ensureAuthenticated,
  ensureAdmin,
  verifyTheaterHandler
);

// Combined handler for all theaters (with pending option)
async function getAllTheatersHandler(req: Request, res: Response) {
  try {
    const isPending = req.query.pending === "true";

    if (isPending) {
      const pendingTheaters = await db
        .select()
        .from(TheaterTable)
        .where(eq(TheaterTable.verified, false));

      res.status(200).json(pendingTheaters);
    } else {
      const theaters = await db.select().from(TheaterTable);
      res.status(200).json(theaters);
    }
  } catch (error) {
    console.error("Error in getAllTheatersHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreateTheaterBodyParams = {
  name: string;
  city: string;
};

async function createTheaterHandler(
  req: Request<{}, {}, CreateTheaterBodyParams>,
  res: Response
) {
  const { name, city } = req.body;
  const validator = new Validator();

  try {
    validator.check(!!name, "name", "is required");
    validator.check(!!city, "city", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const [newTheater] = await db
      .insert(TheaterTable)
      .values({ name, city })
      .returning({ id: TheaterTable.id });

    if (!newTheater) {
      res.status(500).json({ error: "Failed to create theater" });
      return;
    }

    res.status(201).json({
      message: "Theater created successfully",
      id: newTheater.id,
    });
  } catch (error) {
    console.error("Error in createTheaterHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type GetTheaterByIdParams = {
  id: string;
};

async function getTheaterByIdHandler(
  req: Request<GetTheaterByIdParams>,
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

    const theater = await db.query.TheaterTable.findFirst({
      where: eq(TheaterTable.id, id),
    });

    if (!theater) {
      res.status(404).json({ error: "Theater not found" });
      return;
    }

    res.status(200).json(theater);
  } catch (error) {
    console.error("Error in getTheaterByIdHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateTheaterBodyParams = {
  name?: string;
  city?: string;
};

async function updateTheaterHandler(
  req: Request<{ id: string }, {}, UpdateTheaterBodyParams>,
  res: Response
) {
  const id = req.params.id;
  const { name, city } = req.body;
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

    // Build update object with only provided fields
    const updateData: Partial<{ name: string; city: string }> = {};
    if (name) updateData.name = name;
    if (city) updateData.city = city;

    if (Object.keys(updateData).length === 0) {
      res
        .status(400)
        .json({ error: "At least one field (name or city) is required" });
      return;
    }

    const result = await db
      .update(TheaterTable)
      .set(updateData)
      .where(eq(TheaterTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Theater not found" });
      return;
    }

    res.status(200).json({ message: "Theater updated successfully" });
  } catch (error) {
    console.error("Error in updateTheaterHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function deleteTheaterHandler(
  req: Request<{ id: string }>,
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

    const result = await db.delete(TheaterTable).where(eq(TheaterTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Theater not found" });
      return;
    }

    res.status(200).json({ message: "Theater deleted successfully" });
  } catch (error) {
    console.error("Error in deleteTheaterHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type VerifyTheaterParams = {
  id: string;
};

async function verifyTheaterHandler(
  req: Request<VerifyTheaterParams>,
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
      .update(TheaterTable)
      .set({ verified: true })
      .where(eq(TheaterTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Theater not found or already verified" });
      return;
    }

    res.status(200).json({ message: "Theater verified successfully" });
  } catch (error) {
    console.error("Error in verifyTheaterHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
