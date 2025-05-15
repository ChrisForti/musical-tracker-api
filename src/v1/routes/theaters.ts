import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { TheaterTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const theaterRouter = Router();

theaterRouter.post("/", createTheaterHandler);
theaterRouter.get("/", getTheaterById);
theaterRouter.put("/", updateTheaterHandler);
theaterRouter.delete("/", deleteTheaterHandler);

type CreateTheaterBody = {
  name: string;
};

async function createTheaterHandler(
  req: Request<{}, {}, CreateTheaterBody>,
  res: Response
) {
  const { name } = req.body;

  try {
    if (!name) {
      throw new Error("Name is required");
    }

    const newTheater = await db.insert(TheaterTable).values({
      name,
    });

    res.status(201).json({
      message: "Theater created successfully",
      theater: newTheater,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: "Bad request" });
      return;
    }
    res.status(500).json({ error: "Unknown error occurred" });
    return;
  }
}

type GetTheaterByIdBody = {
  id: number;
};

async function getTheaterById(req: Request, res: Response) {
  const { id } = req.body as GetTheaterByIdBody;

  try {
    const theater = await db
      .select()
      .from(TheaterTable)
      .where(eq(TheaterTable.id, id))
      .limit(1);

    if (theater.length === 0) {
      res.status(404).json({ error: "Theater not found" });
      return;
    }

    res.status(200).json({ theater: theater[0] });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: "Bad request" });
      return;
    }
    res.status(500).json({ error: "Unknown error occurred" });
  }
}

type UpdatedTheaterBody = {
  id: number;
  name: string;
};

async function updateTheaterHandler(req: Request, res: Response) {
  const { id, name } = req.body as UpdatedTheaterBody;

  try {
    if (!id) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const updatedTheater = await db
      .update(TheaterTable)
      .set({ name })
      .where(eq(TheaterTable.id, Number(id))); // should be able to pass in theaterId here

    if (updatedTheater.rowCount === 0) {
      res.status(404).json({ error: "Theater not found" });
      return;
    }

    res.status(200).json({
      message: "Theater updated successfully",
      theater: updatedTheater,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update Theater" });
  }
}

type DeleteTheaterBody = {
  id: number;
};

async function deleteTheaterHandler(req: Request, res: Response) {
  const { id } = req.body.id as DeleteTheaterBody; // pattern used in users.ts

  if (!id) {
    res.status(400).json({ error: "Theater ID is required" });
    return;
  }

  try {
    const deletedTheater = await db
      .delete(TheaterTable)
      .where(eq(TheaterTable.id, id));

    if (deletedTheater.rowCount === 0) {
      throw new Error("Theater not found or already deleted");
    }

    res.status(200).json({
      message: "Theater deleted successfully",
      theater: deletedTheater,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete theater" });
  }
}
