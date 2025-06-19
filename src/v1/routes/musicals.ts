import { Router, type Request, type Response } from "express";
import { MusicalTable } from "../../drizzle/schema.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { and, eq } from "drizzle-orm";
import { Validator } from "../../lib/validator.js";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const musicalRouter = Router();

musicalRouter.post("/", ensureAuthenticated, createMusicalHandler);
musicalRouter.get("/:id", getMusicalByIdHandler);
musicalRouter.put("/", ensureAuthenticated, updateMusicalHandler);
musicalRouter.delete("/", ensureAuthenticated, deleteMusicalHandler);
musicalRouter.post<ApproveMusicalParams>(
  "/:id/approve",
  ensureAuthenticated,
  ensureAdmin,
  approveMusicalHandler
);
musicalRouter.get("/pending", ensureAdmin, getPendingMusicalsHandler);

type ApproveMusicalParams = {
  id: string;
};

async function approveMusicalHandler(
  req: Request<ApproveMusicalParams>,
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
      .update(MusicalTable)
      .set({ approved: true })
      .where(eq(MusicalTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Musical not found or already approved" });
      return;
    }

    res.status(200).json({ message: "Musical approved successfully" });
  } catch (error) {
    console.error("Error in approveMusicalHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function getPendingMusicalsHandler(req: Request, res: Response) {
  try {
    const pendingMusicals = await db
      .select()
      .from(MusicalTable)
      .where(eq(MusicalTable.approved, false));

    res.status(200).json(pendingMusicals);
  } catch (error) {
    console.error("Error in getPendingMusicalsHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreateMusicalBodyParams = {
  composer: string;
  lyricist: string;
  title: string;
};

async function createMusicalHandler(
  req: Request<{}, {}, CreateMusicalBodyParams>,
  res: Response
) {
  const { composer, lyricist, title } = req.body;

  const validator = new Validator();

  try {
    validator.check(!!composer, "composer", "is required");
    validator.check(!!lyricist, "lyricist", "is required");
    validator.check(!!title, "title", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
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
  id: string;
};

async function getMusicalByIdHandler(
  req: Request<GetMusicalByIdParams>,
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
  id: string;
  composer?: string;
  lyricist?: string;
  title?: string;
};

async function updateMusicalHandler(
  req: Request<{}, {}, UpdateMusicalBodyParams>,
  res: Response
) {
  const { composer, lyricist, title } = req.body;
  const id = req.body.id;
  const validator = new Validator();

  type UpdatedData = {
    composer?: string;
    lyricist?: string;
    title?: string;
  };

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
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
      .where(eq(MusicalTable.id, id));

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
  id: string;
};

async function deleteMusicalHandler(
  req: Request<{}, {}, DeleteMusicalBodyParams>,
  res: Response
) {
  const id = req.body.id;
  const validator = new Validator();

  validator.check(!!id, "id", "is required");
  if (id) {
    validator.check(validateUuid(id), "id", "must be a valid UUID");
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
    console.error("Error in deletemusicalHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
