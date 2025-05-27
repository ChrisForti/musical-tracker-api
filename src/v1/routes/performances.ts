import { Router, type Request, type Response } from "express";
import { PerformanceTable } from "../../drizzle/schema.js";
import { Validator } from "../../lib/validator.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { eq } from "drizzle-orm";

export const performanceRouter = Router();

performanceRouter.post("/", createPerformanceHandler);
performanceRouter.get("/:id", getPerformanceByIdHandler);
performanceRouter.put("/", updatePerformanceHandler);
performanceRouter.delete("/", deletePerformanceHandler);

type CreatePerformanceBodyParams = {
  id: string | number;
  productionId: string | number;
  date: string | Date;
  theaterId: string | number;
};

async function createPerformanceHandler(
  req: Request<{}, {}, CreatePerformanceBodyParams>,
  res: Response
) {
  const { date } = req.body;
  const id = Number(req.body.id);
  const productionId = Number(req.body.productionId);
  const theaterId = Number(req.body.theaterId);
  const validator = new Validator();

  try {
    validator.check(!isNaN(id) && id > 0, "id", "is required");
    validator.check(
      !isNaN(productionId) && productionId > 0,
      "productionId",
      "is required"
    );
    validator.check(
      !isNaN(theaterId) && theaterId > 0,
      "theaterId",
      "is required"
    );

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const newPerformance = await db
      .insert(PerformanceTable)
      .values({ productionId, date, theaterId });

    res.status(201).json({
      message: "Created successfully",
      musicalId: newPerformance.oid,
    });
  } catch (error) {
    console.error("Error in createPerformanceHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
    return;
  }
}

type GetPerformanceByIdParams = {
  id: string | number;
};

async function getPerformanceByIdHandler(
  req: Request<GetPerformanceByIdParams>,
  res: Response
) {
  const id = Number(req.params.id);
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
      where: eq(PerformanceTable.id, id),
    });

    if (!performance) {
      res.status(404).json({ error: "Performance not found" });
      return;
    }
  } catch (error) {
    console.error("Error in getPerformanceById:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdatePerformanceBodyParams = {
  id: string | number;
  productionId: string | number;
  date: string | Date;
  theaterId: string | number;
};

async function updatePerformanceHandler(
  req: Request<{}, {}, UpdatePerformanceBodyParams>,
  res: Response
) {
  const { productionId, date, theaterId } = req.body;
  const id = Number(req.body.id);
  const validator = new Validator();

  type UpdatedData = {
    productionId?: string | number;
    date?: string | Date;
    theaterId?: string | number;
  };

  try {
    validator.check(
      !isNaN(id) && id > 0,
      "id",
      "is required and must be a valid number"
    );
    validator.check(
      !isNaN(Number(productionId)),
      "productionId",
      "is required"
    );
    validator.check(!date, "date", "is required");
    validator.check(!isNaN(Number(theaterId)), "theaterId", "is required");

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
        productionId: Number(productionId),
        date: new Date(date),
        theaterId: Number(theaterId),
      })
      .where(eq(PerformanceTable.id, Number(id)));

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
  id: string | number;
};

async function deletePerformanceHandler(
  req: Request<{}, {}, DeletePerformanceBodyParams>,
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
    console.error("Error in deleteActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
