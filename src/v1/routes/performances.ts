import { Router, type Request, type Response } from "express";
import { PerformanceTable } from "../../drizzle/schema.js";
import { Validator } from "../../lib/validator.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq } from "drizzle-orm";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const performanceRouter = Router();

performanceRouter.post("/", ensureAuthenticated, createPerformanceHandler);
performanceRouter.get("/:id", getPerformanceByIdHandler);
performanceRouter.put("/", ensureAuthenticated, updatePerformanceHandler);
performanceRouter.delete("/", ensureAuthenticated, deletePerformanceHandler);
performanceRouter.get(
  "/",
  ensureAuthenticated,
  ensureAdmin,
  getAllPerformancesHandler
);

async function getAllPerformancesHandler(req: Request, res: Response) {
  try {
    const result = await db.query.PerformanceTable.findMany();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllPerformancesHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreatePerformanceBodyParams = {
  productionId: string;
  date: string | Date;
  theaterId: string;
};

async function createPerformanceHandler(
  req: Request<{}, {}, CreatePerformanceBodyParams>,
  res: Response
) {
  const date = new Date(req.body.date);
  const productionId = req.body.productionId;
  const theaterId = req.body.theaterId;
  const validator = new Validator();

  try {
    validator.check(!!productionId, "productionId", "is required");
    if (productionId) {
      validator.check(validateUuid(productionId), "id", "must be a valid UUID");
    }
    validator.check(!!theaterId, "theaterId", "is required");
    if (theaterId) {
      validator.check(validateUuid(theaterId), "id", "must be a valid UUID");
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const newPerformance = await db
      .insert(PerformanceTable)
      .values({ productionId, date: new Date(date), theaterId });

    res.status(201).json({
      message: "Created successfully",
      musical: newPerformance,
    });
  } catch (error) {
    console.error("Error in createPerformanceHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
    return;
  }
}

type GetPerformanceByIdParams = {
  id: string;
};

async function getPerformanceByIdHandler(
  req: Request<GetPerformanceByIdParams>,
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

    const performance = await db.query.PerformanceTable.findFirst({
      where: eq(PerformanceTable.id, id),
    });

    if (!!performance) {
      res.status(404).json({ error: "Performance not found" });
      return;
    }
  } catch (error) {
    console.error("Error in getPerformanceById:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdatePerformanceBodyParams = {
  id: string;
  productionId: string;
  date: string;
  theaterId: string;
};

async function updatePerformanceHandler(
  req: Request<{}, {}, UpdatePerformanceBodyParams>,
  res: Response
) {
  const id = req.body.id;
  const { productionId, date, theaterId } = req.body;
  const validator = new Validator();

  type UpdatedData = {
    productionId?: string;
    date?: string | Date;
    theaterId?: string;
  };

  try {
    validator.check(!!id, "id", "is required");
    if (id) {
      validator.check(validateUuid(id), "id", "must be a valid UUID");
    }
    validator.check(!!productionId, "productionId", "is required");
    if (productionId) {
      validator.check(validateUuid(productionId), "id", "must be a valid UUID");
    }
    validator.check(!date, "date", "is required");

    validator.check(!!theaterId, "theaterId", "is required");
    if (theaterId) {
      validator.check(validateUuid(theaterId), "id", "must be a valid UUID");
    }

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const updatedData: UpdatedData = {};
    if (productionId) {
      updatedData.productionId = productionId;
    }
    if (date) {
      updatedData.date = date;
    }
    if (theaterId) {
      updatedData.theaterId = theaterId;
    }

    const updatedPerformance = await db
      .update(PerformanceTable)
      .set({
        productionId: productionId,
        date: new Date(date),
        theaterId: theaterId,
      })
      .where(eq(PerformanceTable.id, id));

    if (updatedPerformance.rowCount === 0) {
      res.status(404).json({ error: "'id' invalid" });
      return;
    }
    res.status(200).json({
      message: "performance updated successfully",
    });
  } catch (error) {
    console.error("Error in updatePerformanceHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type DeletePerformanceBodyParams = {
  id: string;
};

async function deletePerformanceHandler(
  req: Request<{}, {}, DeletePerformanceBodyParams>,
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
      .delete(PerformanceTable)
      .where(eq(PerformanceTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "'id' not found or already deleted" });
      return;
    }

    res.status(200).json({
      message: "'Performance' deleted successfully",
    });
  } catch (error) {
    console.error("Error in deletePerformanceHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
