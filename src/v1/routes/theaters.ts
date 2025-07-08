import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { TheaterTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { SERVER_ERROR } from "../../lib/errors.js";
import { Validator } from "../../lib/validator.js";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const theaterRouter = Router();

theaterRouter.post("/", ensureAuthenticated, createTheaterHandler);
theaterRouter.get("/:id", getTheaterByIdHandler);
theaterRouter.put("/", ensureAuthenticated, ensureAdmin, updateTheaterHandler);
theaterRouter.delete(
  "/",
  ensureAuthenticated,
  ensureAdmin,
  deleteTheaterHandler
);
theaterRouter.post<ApproveTheaterParams>(
  "/:id/approve",
  ensureAuthenticated,
  ensureAdmin,
  approveTheaterHandler
);
theaterRouter.get(
  "/pending",
  ensureAuthenticated,
  ensureAdmin,
  getPendingTheatersHandler
);

type ApproveTheaterParams = {
  id: string;
};

async function approveTheaterHandler(
  req: Request<ApproveTheaterParams>,
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
      .set({ approved: true })
      .where(eq(TheaterTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Theater not found or already approved" });
      return;
    }

    res.status(200).json({ message: "Theater approved successfully" });
  } catch (error) {
    console.error("Error in approveTheaterHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function getPendingTheatersHandler(req: Request, res: Response) {
  try {
    const pendingTheaters = await db
      .select()
      .from(TheaterTable)
      .where(eq(TheaterTable.approved, false));

    res.status(200).json(pendingTheaters);
  } catch (error) {
    console.error("Error in getPendingTheatersHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreateTheaterBodyParams = {
  name: string;
};

async function createTheaterHandler(
  req: Request<{}, {}, CreateTheaterBodyParams>,
  res: Response
) {
  const name = req.body.name;
  const validator = new Validator();
  console.log(req.body);

  try {
    validator.check(!!name, "name", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const [newTheater] = await db
      .insert(TheaterTable)
      .values({
        name,
      })
      .returning({ id: TheaterTable.id });

    if (!newTheater) {
      res.status(500).json({ error: "Failed to create theater" });
      return;
    }

    res.status(201).json({
      message: "Theater created successfully",
      theater: newTheater.id,
    });
  } catch (error) {
    console.error("Error in createTheaterHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type GetTheaterByIdQueryParams = {
  id: string;
};

async function getTheaterByIdHandler(
  req: Request<GetTheaterByIdQueryParams>,
  res: Response
) {
  const id = req.body;
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
      res.status(404).json({ error: "'id' is invalid" });
      return;
    }

    res.status(200).json({ theater });
  } catch (error) {
    console.error("Error in getTheaterByIdHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateTheaterBodyParams = {
  id: string;
  name: string;
};

async function updateTheaterHandler(
  req: Request<{}, {}, UpdateTheaterBodyParams>,
  res: Response
) {
  const name = req.body.name;
  const id = req.body.id;
  const validator = new Validator();

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }
    validator.check(!name, "name", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const updatedTheater = await db
      .update(TheaterTable)
      .set({ name })
      .where(eq(TheaterTable.id, id));

    if (updatedTheater.rowCount === 0) {
      res.status(404).json({ error: "'id' is invalid" });
      return;
    }

    res.status(200).json({
      message: "Theater updated successfully",
    });
  } catch (error) {
    console.error("Error in updateTheaterHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type DeleteTheaterBodyParams = {
  id: string;
};

async function deleteTheaterHandler(
  req: Request<{}, {}, DeleteTheaterBodyParams>,
  res: Response
) {
  const id = req.body.id;
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
      throw new Error("'id' is invalid");
    }

    res.status(200).json({
      message: "Theater deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTheaterHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
