import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { TheaterTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { SERVER_ERROR } from "../../lib/errors.js";

export const theaterRouter = Router();

theaterRouter.post("/", createTheaterHandler);
theaterRouter.get("/", getTheaterByIdHandler);
theaterRouter.put("/", updateTheaterHandler);
theaterRouter.delete("/", deleteTheaterHandler);

type CreateTheaterBodyParams = {
  name: string;
};

async function createTheaterHandler(
  req: Request<{}, {}, CreateTheaterBodyParams>,
  res: Response,
) {
  const name = req.body.name;

  try {
    if (!name) {
      res.status(400).json({ error: "'name' is required" });
      return;
    }

    const newTheater = await db.insert(TheaterTable).values({
      name,
    });

    res.status(201).json({
      message: "Theater created successfully",
      theaterId: newTheater.oid,
    });
  } catch (error) {
    console.error("Error in createTheaterHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type GetTheaterByIdQueryParams = {
  id: string | number;
};

async function getTheaterByIdHandler(
  req: Request<GetTheaterByIdQueryParams>,
  res: Response,
) {
  const id = Number(req.body);

  if (isNaN(id) || id < 1) {
    res
      .status(400)
      .json({ error: "'id' is required and must be a valid number" });
    return;
  }

  try {
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
  id: string | number;
  name: string;
};

async function updateTheaterHandler(
  req: Request<{}, {}, UpdateTheaterBodyParams>,
  res: Response,
) {
  const name = req.body.name;
  const id = Number(req.body.id);

  try {
    if (isNaN(id) || id < 1) {
      res.status(400).json({ error: "'id' is required and must be a number" });
      return;
    }

    if (!name) {
      res.status(400).json({ error: "'name' is required" });
      return;
    }

    const updatedTheater = await db
      .update(TheaterTable)
      .set({ name })
      .where(eq(TheaterTable.id, Number(id)));

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
  id: string | number;
};

async function deleteTheaterHandler(
  req: Request<{}, {}, DeleteTheaterBodyParams>,
  res: Response,
) {
  const id = Number(req.body.id);

  if (isNaN(id) || id < 1) {
    res
      .status(400)
      .json({ error: "'id' is required and must be a valid number" });
    return;
  }

  try {
    const deletedTheater = await db
      .delete(TheaterTable)
      .where(eq(TheaterTable.id, id));

    if (deletedTheater.rowCount === 0) {
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
