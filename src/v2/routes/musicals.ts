import { Router, type Request, type Response } from "express";
import { MusicalTable } from "../../drizzle/schema.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq } from "drizzle-orm";
import { Validator } from "../../lib/validator.js";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const musicalRouter = Router();

musicalRouter.get("/", ensureAuthenticated, getAllMusicalsHandler);
musicalRouter.post("/", ensureAuthenticated, createMusicalHandler);
musicalRouter.get("/:id", ensureAuthenticated, getMusicalByIdHandler);
musicalRouter.put("/:id", ensureAuthenticated, updateMusicalHandler);
musicalRouter.delete("/:id", ensureAuthenticated, deleteMusicalHandler);
musicalRouter.post(
  "/:id/verify",
  ensureAuthenticated,
  ensureAdmin,
  verifyMusicalHandler
);

async function getAllMusicalsHandler(req: Request, res: Response) {
  try {
    const isPending = req.query.pending === "true";

    if (isPending) {
      const pendingMusicals = await db
        .select()
        .from(MusicalTable)
        .where(eq(MusicalTable.verified, false));

      res.status(200).json(pendingMusicals);
    } else {
      const musicals = await db.select().from(MusicalTable);
      res.status(200).json(musicals);
    }
  } catch (error) {
    console.error("Error in getAllMusicalsHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreateMusicalBodyParams = {
  composer: string;
  lyricist: string;
  title: string;
  posterUrl?: string;
};

async function createMusicalHandler(
  req: Request<{}, {}, CreateMusicalBodyParams>,
  res: Response
) {
  const { composer, lyricist, title, posterUrl } = req.body;
  const validator = new Validator();

  try {
    validator.check(!!composer, "composer", "is required");
    validator.check(!!lyricist, "lyricist", "is required");
    validator.check(!!title, "title", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const [newMusical] = await db
      .insert(MusicalTable)
      .values({ composer, lyricist, title, posterUrl })
      .returning({ id: MusicalTable.id });

    if (!newMusical) {
      res.status(500).json({ error: "Failed to create musical" });
      return;
    }

    res.status(201).json({
      message: "Musical created successfully",
      id: newMusical.id,
    });
  } catch (error) {
    console.error("Error in createMusicalHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
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

    res.status(200).json(musical);
  } catch (error) {
    console.error("Error in getMusicalByIdHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateMusicalBodyParams = {
  composer?: string;
  lyricist?: string;
  title?: string;
  posterUrl?: string;
};

async function updateMusicalHandler(
  req: Request<{ id: string }, {}, UpdateMusicalBodyParams>,
  res: Response
) {
  const id = req.params.id;
  const { composer, lyricist, title, posterUrl } = req.body;
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

    // Check if the musical exists and get its verified status
    const existingMusical = await db.query.MusicalTable.findFirst({
      where: eq(MusicalTable.id, id),
    });

    if (!existingMusical) {
      res.status(404).json({ error: "Musical not found" });
      return;
    }

    // If musical is verified, only admin can make changes
    if (existingMusical.verified && req.user?.role !== "admin") {
      res.status(403).json({ 
        error: "Only admins can modify verified musicals" 
      });
      return;
    }

    const updateData: Partial<{
      composer: string;
      lyricist: string;
      title: string;
      posterUrl: string;
    }> = {};
    if (composer) updateData.composer = composer;
    if (lyricist) updateData.lyricist = lyricist;
    if (title) updateData.title = title;
    if (posterUrl !== undefined) updateData.posterUrl = posterUrl;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        error:
          "At least one field (composer, lyricist, title, or posterUrl) is required",
      });
      return;
    }

    const result = await db
      .update(MusicalTable)
      .set(updateData)
      .where(eq(MusicalTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Musical not found" });
      return;
    }

    res.status(200).json({ message: "Musical updated successfully" });
  } catch (error) {
    console.error("Error in updateMusicalHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function deleteMusicalHandler(
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

    const result = await db.delete(MusicalTable).where(eq(MusicalTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Musical not found" });
      return;
    }

    res.status(200).json({ message: "Musical deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMusicalHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type VerifyMusicalParams = {
  id: string;
};

async function verifyMusicalHandler(
  req: Request<VerifyMusicalParams>,
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
      .set({ verified: true })
      .where(eq(MusicalTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Musical not found or already verified" });
      return;
    }

    res.status(200).json({ message: "Musical verified successfully" });
  } catch (error) {
    console.error("Error in verifyMusicalHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
