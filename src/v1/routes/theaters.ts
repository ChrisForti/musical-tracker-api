import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js"; // Ensure the correct path
import { TheaterTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const theaterRouter = Router();

theaterRouter.post("/", createTheaterHandler);
theaterRouter.get("/", getTheaterById);
theaterRouter.put("/", updateTheaterHandler);
theaterRouter.delete("/", deleteTheaterHandler);

async function createTheaterHandler(req: Request, res: Response) {
  const { name } = req.body;

  try {
    if (!name) {
      throw new Error("Name is required");
    }

    const newTheater = await db
      .insert(TheaterTable)
      .values({
        name,
      })
      .returning(); // Optional: Get the inserted row back

    res.status(201).json({
      message: "Theater created successfully",
      theater: newTheater[0],
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
      .where(eq(TheaterTable.id, Number(id)))
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
  const { id } = req.params; // Extract `id` from request parameters
  const { name } = req.body; // Extract updated data from request body

  try {
    // Validate input
    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    // Update the theater in the database
    const updatedTheater = await db
      .update(TheaterTable)
      .set({ name }) // Set the new values
      .where(eq(TheaterTable.id, Number(id))) // Match the theater by ID
      .returning(); // Return the updated row(s)

    if (updatedTheater.length === 0) {
      // If no theater was updated, it means the ID does not exist
      res.status(404).json({ error: "Theater not found" });
      return;
    }

    // Return the updated theater details
    res.status(200).json({
      message: "Theater updated successfully",
      theater: updatedTheater[0],
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Unknown error occurred" });
  }
}

async function deleteTheaterHandler(req: Request, res: Response) {
  const { id } = req.params; // Extract `id` from request parameters

  try {
    // Delete the theater from the database
    const deletedTheater = await db
      .delete(TheaterTable)
      .where(eq(TheaterTable.id, Number(id))) // Match the theater by ID
      .returning(); // Return the deleted row(s)

    if (deletedTheater.length === 0) {
      // If no theater was deleted, it means the ID does not exist
      res.status(404).json({ error: "Theater not found" });
      return;
    }

    // Return a success message
    res.status(200).json({
      message: "Theater deleted successfully",
      theater: deletedTheater[0],
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Unknown error occurred" });
  }
}
