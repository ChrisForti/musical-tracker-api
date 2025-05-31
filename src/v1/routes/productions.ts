import { Router, type Request, type Response } from "express";
import { Validator } from "../../lib/validator.js";
import { ProductionTable } from "../../drizzle/schema.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq } from "drizzle-orm";
import { date } from "drizzle-orm/mysql-core";

export const productionRouter = Router();

productionRouter.post("/", createProductionHandler);
productionRouter.get("/:id", getproductionByIdHandler);
productionRouter.put("/", updateproductionHandler);
productionRouter.delete("/", deleteproductionHandler);

type CreateProductionBodyParams = {
  id: string | number;
  musicalId: string | number;
  startDate: string | Date;
  endDate: string | Date;
  posterUrl: string;
};

async function createProductionHandler(
  req: Request<{}, {}, CreateProductionBodyParams>,
  res: Response
) {
  const id = Number(req.body.id);
  const musicalId = Number(req.body.musicalId);
  const { posterUrl } = req.body;
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const validator = new Validator();

  try {
    validator.check(!isNaN(id) && id > 0, "id", "is required");
    validator.check(
      !isNaN(musicalId) && musicalId > 0,
      "musicalId",
      "is required"
    );
    validator.check(
      startDate instanceof Date && !isNaN(startDate.getTime()),
      "startDate",
      "is required"
    );
    validator.check(
      endDate instanceof Date && !isNaN(endDate.getTime()),
      "endDate",
      "is required"
    );
    validator.check(!!posterUrl, "posterUrl", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const newProduction = await db.insert(ProductionTable).values({
      musicalId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      posterUrl,
    });

    res.status(201).json({
      message: "Created successfully",
      id: newProduction.oid,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(409).json({ error: "production already exists" });
      return;
    }
    console.error("Error in createActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
    return;
  }
}

type GetProductionByIdParams = {
  id: string | number;
};

async function getproductionByIdHandler(
  req: Request<GetProductionByIdParams>,
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

    const performance = await db.query.PerformanceTable.findFirst({
      where: eq(ProductionTable.id, id),
    });

    if (!performance) {
      res.status(404).json({ error: "Performance not found" });
      return;
    }
  } catch (error) {
    console.error("Error in getProductionById:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateProductionBodyParams = {
  id: string | number;
  musicalId?: string | number;
  startDate?: string | Date;
  endDate?: string | Date;
  posterUrl?: string;
};

async function updateproductionHandler(
  req: Request<{}, {}, UpdateProductionBodyParams>,
  res: Response
) {
  const id = Number(req.body.id);
  const musicalId = Number(req.body.musicalId);
  const { posterUrl } = req.body;
  const startDate = req.body.startDate
    ? new Date(req.body.startDate)
    : undefined;
  const endDate = req.body.endDate ? new Date(req.body.endDate) : undefined;
  const validator = new Validator();

  type UpdatedData = {
    musicalId?: string | number;
    startDate?: string | Date | undefined;
    endDate?: string | Date | undefined;
    posterUrl?: string;
  };

  try {
    validator.check(
      !isNaN(id) && id > 0,
      "id",
      "is required and must be a valid number"
    );
    validator.check(
      !isNaN(musicalId) && musicalId > 0,
      "id",
      "is required and must be a valid number"
    );
    validator.check(!startDate, "startDate", "is invalid format");
    validator.check(!endDate, "endDate", "is invalid format");
    validator.check(!posterUrl, "posterUrl", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }
    const updatedData: UpdatedData = {};
    if (musicalId) {
      updatedData.musicalId = musicalId;
    }
    if (!!startDate && isNaN(new Date(startDate).getTime())) {
      updatedData.startDate = startDate;
    }
    if (!!endDate && isNaN(new Date(endDate).getTime())) {
      updatedData.endDate = endDate;
    }
    if (posterUrl) {
      updatedData.posterUrl = posterUrl;
    }

    const updatedProduction = await db
      .update(ProductionTable)
      .set({
        musicalId: Number(musicalId),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        posterUrl,
      })
      .where(eq(ProductionTable.id, Number(id)));

    if (updatedProduction.rowCount === 0) {
      res.status(404).json({ error: "'id' invalid" });
      return;
    }
    res.status(200).json({
      message: "Production updated successfully",
    });
  } catch (error) {
    console.error("Error in updateProductionHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type DeleteProductionBodtParams = {
  id: string | number;
};

async function deleteproductionHandler(
  req: Request<DeleteProductionBodtParams>,
  res: Response
) {
  const id = Number(req.body.id);
  const validator = new Validator();

  try {
    validator.check(!id, "id", "does not exist");

    validator.check(
      !isNaN(id) && id > 0,
      "id",
      "is required and must be a valid number"
    );

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const result = await db
      .delete(ProductionTable)
      .where(eq(ProductionTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "'id' not found or already deleted" });
      return;
    }

    res.status(200).json({
      message: "'Production' deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProductionHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
