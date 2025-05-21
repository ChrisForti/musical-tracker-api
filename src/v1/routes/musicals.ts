import { Router, type Request, type Response } from "express";
import { MusicalTable } from "../../drizzle/schema.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq } from "drizzle-orm";

export const musicalRouter = Router();

musicalRouter.post("/", createMusicalHandler);
musicalRouter.get("/:id", getMusicalByIdHandler);
musicalRouter.put("/", updateMusicalHandler);
musicalRouter.delete("/", deleteMusicalHandler);

type CreateMusicalBodyParams = {
  id: string | number;
  composer: string;
  lyricist: string;
  title: string;
};

async function createMusicalHandler(
  req: Request<{}, {}, CreateMusicalBodyParams>,
  res: Response
) {
  const { composer, lyricist, title } = req.body;

  const id = Number(req.body.id);

  try {
    if (isNaN(Number(id)) || id < 1) {
      res
        .status(400)
        .json({ error: "'id' required and must be a valid number" });
      return;
    }

    if (!composer) {
      res
        .status(400)
        .json({ error: "'composer' required and must be a valid number" });
      return;
    }

    if (!lyricist) {
      res.status(400).json({ error: "'lyricist' is required" });
      return;
    }

    if (!title) {
      res
        .status(400)
        .json({ error: "'title' required and must be a valid number" });
      return;
    }

    const newMusical = await db
      .insert(MusicalTable)
      .values({ composer, lyricist, title });

    res.status(201).json({
      message: "Created successfully",
      musicalId: newMusical.oid,
    });
  } catch (error) {
    console.error("Error in createActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
    return;
  }
}

type GetMusicalByIdParams = {
  id: string | number;
};

async function getMusicalByIdHandler(
  req: Request<GetMusicalByIdParams>,
  res: Response
) {
  const id = Number(req.params.id);

  try {
    if (isNaN(id) || id < 1) {
      res
        .status(400)
        .json({ error: "'id' required and must be a valid number" });
      return;
    }
    const musical = await db.query.MusicalTable.findFirst({
      where: eq(MusicalTable.id, id),
    });

    if (!musical) {
      res.status(404).json({ error: "Musical not found" });
      return;
    }
  } catch (error) {
    console.error("Error in getActorById:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateMusicalBodyParams = {
  id: string | number;
  composer?: string;
  lyricist?: string;
  title?: string;
};

async function updateMusicalHandler(
  req: Request<{}, {}, UpdateMusicalBodyParams>,
  res: Response
) {
  const { composer, lyricist, title } = req.body;
  const id = Number(req.body.id);

  type UpdatedData = {
    composer?: string;
    lyricist?: string;
    title?: string;
  };

  try {
    if (!id || isNaN(Number(id)) || id < 1) {
      res
        .status(400)
        .json({ error: "'id' required and must be a valid number" });
      return;
    }

    const updatedData: UpdatedData = {};
    if (composer) {
      updatedData.composer = composer;
    }
    if (lyricist) {
      updatedData.lyricist = lyricist;
    }
    if (title) {
      updatedData.title = title;
    }

    const updatedMusical = await db
      .update(MusicalTable)
      .set({ composer, lyricist, title })
      .where(eq(MusicalTable.id, Number(id)));

    if (updatedMusical.rowCount === 0) {
      res.status(404).json({ error: "'id' invalid" });
      return;
    }
    res.status(200).json({
      message: "Musical updated successfully",
    });
  } catch (error) {
    console.error("Error in updateMusicalHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type DeleteMusicalBodyParams = {
  id: string | number;
};

async function deleteMusicalHandler(
  req: Request<{}, {}, DeleteMusicalBodyParams>,
  res: Response
) {
  const id = Number(req.body.id);

  if (isNaN(id) || id < 1) {
    res
      .status(400)
      .json({ error: "'id' is required and must be a valid number" });
    return;
  }

  try {
    const result = await db.delete(MusicalTable).where(eq(MusicalTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "'id' invalid" });
      return;
    }

    res.status(200).json({
      message: "Musical deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
