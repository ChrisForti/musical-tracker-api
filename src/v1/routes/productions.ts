import { Router, type Request, type Response } from "express";
import { Validator } from "../../lib/validator.js";
import { ProductionTable } from "../../drizzle/schema.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq } from "drizzle-orm";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const productionRouter = Router();

productionRouter.post("/", createProductionHandler);
productionRouter.get("/:id", getproductionByIdHandler);
productionRouter.put(
  "/",
  ensureAuthenticated,
  ensureAdmin,
  updateproductionHandler
);
productionRouter.delete(
  "/",
  ensureAuthenticated,
  ensureAdmin,
  deleteproductionHandler
);
productionRouter.post<ApproveProductionParams>(
  "/:id/approve",
  ensureAuthenticated,
  ensureAdmin,
  approveProductionHandler
);
productionRouter.get(
  "/pending",
  ensureAuthenticated,
  ensureAdmin,
  getPendingProductionsHandler
);

type ApproveProductionParams = {
  id: string;
};

async function approveProductionHandler(
  req: Request<ApproveProductionParams>,
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
      .update(ProductionTable)
      .set({ approved: true })
      .where(eq(ProductionTable.id, id));

    if (result.rowCount === 0) {
      res
        .status(404)
        .json({ error: "Production not found or already approved" });
      return;
    }

    res.status(200).json({ message: "Production approved successfully" });
  } catch (error) {
    console.error("Error in approveProductionHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function getPendingProductionsHandler(req: Request, res: Response) {
  try {
    const pendingProductions = await db
      .select()
      .from(ProductionTable)
      .where(eq(ProductionTable.approved, false));

    res.status(200).json(pendingProductions);
  } catch (error) {
    console.error("Error in getPendingProductionsHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreateProductionBodyParams = {
  musicalId: string;
  startDate: string | Date;
  endDate: string | Date;
  posterUrl: string;
};

async function createProductionHandler(
  req: Request<{}, {}, CreateProductionBodyParams>,
  res: Response
) {
  const musicalId = req.body.musicalId;
  const { posterUrl } = req.body;
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  const validator = new Validator();

  try {
    validator.check(!!musicalId, "musicalId", "is required");
    if (musicalId) {
      validator.check(validateUuid(musicalId), "id", "must be a valid UUID");
    }

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

    const [newProduction] = await db
      .insert(ProductionTable)
      .values({
        musicalId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        posterUrl,
      })
      .returning({ id: ProductionTable.id });

    if (!newProduction) {
      res.status(500).json({ error: "Failed to create production" });
      return;
    }

    res.status(201).json({
      message: "Created successfully",
      id: newProduction.id, // need to check this
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
  id: string;
};

async function getproductionByIdHandler(
  req: Request<GetProductionByIdParams>,
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

    const production = await db.query.ProductionTable.findFirst({
      where: eq(ProductionTable.id, id),
    });

    if (!production) {
      res.status(404).json({ error: "Production not found" });
      return;
    }
  } catch (error) {
    console.error("Error in get ProductionById:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateProductionBodyParams = {
  id: string;
  musicalId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  posterUrl?: string;
};

async function updateproductionHandler(
  req: Request<{}, {}, UpdateProductionBodyParams>,
  res: Response
) {
  const id = req.body.id;
  const musicalId = req.body.musicalId;
  const { posterUrl } = req.body;
  const startDate = req.body.startDate
    ? new Date(req.body.startDate)
    : undefined;
  const endDate = req.body.endDate ? new Date(req.body.endDate) : undefined;
  const validator = new Validator();

  type UpdatedData = {
    musicalId?: string;
    startDate?: string | Date | undefined;
    endDate?: string | Date | undefined;
    posterUrl?: string;
  };

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }
    validator.check(!!musicalId, "musicalId", "is required");
    if (musicalId) {
      validator.check(validateUuid(musicalId), "id", "must be a valid UUID");
    }
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
        musicalId: musicalId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        posterUrl,
      })
      .where(eq(ProductionTable.id, id));

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
  id: string;
};

async function deleteproductionHandler(
  req: Request<DeleteProductionBodtParams>,
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
