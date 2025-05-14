import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { TheaterTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const theaterRouter = Router();

theaterRouter.post("/", createTheaterHandler);
theaterRouter.get("/", getTheaterById);
theaterRouter.put("/", updateTheaterHandler);
theaterRouter.delete("/", deleteTheaterHandler);

async function createTheaterHandler(req: Request, res: Response) {
  const { name } = req.body; // May need id here too

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

async function getTheaterById(req: Request, res: Response) {
  const { id } = req.body;

  try {
    const theater = await db
      .select()
      .from(TheaterTable)
      .where(eq(TheaterTable.id, Number(id))) // should be able to pass in theaterId here
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

async function updateTheaterHandler(req: Request, res: Response) {
  const { id, name } = req.body;

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

async function deleteTheaterHandler(req: Request, res: Response) {
  const theaterId = req.theater?.id; // pattern used in users.ts

  if (!theaterId) {
    res.status(400).json({ error: "Theater ID is required" });
    return;
  }

  try {
    const deletedTheater = await db
      .delete(TheaterTable)
      .where(eq(TheaterTable.id, theaterId));

    if (deletedTheater.rowCount === 0) {
      throw new Error("Theater not found or already deleted");
      return;
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
