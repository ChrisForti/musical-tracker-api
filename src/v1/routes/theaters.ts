import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { TheaterTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { SERVER_ERROR } from "../../lib/errors.js";
import { Validator } from "../../lib/validator.js";

export const theaterRouter = Router();

theaterRouter.post("/", createTheaterHandler);
theaterRouter.get("/:id", getTheaterByIdHandler);
theaterRouter.put("/", updateTheaterHandler);
theaterRouter.delete("/", deleteTheaterHandler);

type CreateTheaterBodyParams = {
  name: string;
};

async function createTheaterHandler(
  req: Request<{}, {}, CreateTheaterBodyParams>,
  res: Response
) {
  const name = req.body.name;
  const validator = new Validator();

  try {
    validator.check(!name, "name", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
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
  res: Response
) {
  const id = Number(req.body);
  const validator = new Validator();

  try {
    validator.check(
      !isNaN(id) && id > 0,
      "id",
      "is required and must be a valid number"
    );

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
  id: string | number;
  name: string;
};

async function updateTheaterHandler(
  req: Request<{}, {}, UpdateTheaterBodyParams>,
  res: Response
) {
  const name = req.body.name;
  const id = Number(req.body.id);
  const validator = new Validator();

  try {
    validator.check(
      !isNaN(id) && id > 0,
      "id",
      "is required and must be a valid number"
    );
    validator.check(!name, "name", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
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
  res: Response
) {
  const id = Number(req.body.id);
  const validator = new Validator();

  try {
    validator.check(
      !isNaN(id) && id > 0,
      "id",
      "is required and must be a valid number"
    );

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
