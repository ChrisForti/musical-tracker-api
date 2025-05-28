import { Router, type Request, type Response } from "express";
import { Validator } from "../../lib/validator.js";
import { ProductionTable } from "../../drizzle/schema.js";
import { db } from "../../drizzle/db.js";
import { SERVER_ERROR } from "../../lib/errors.js";

export const productionRouter = Router();

productionRouter.post("/", createProductionHandler);
// productionRouter.get("/:id", getproductionByIdHandler);
// productionRouter.put("/", updateproductionHandler);
// productionRouter.delete("/", deleteproductionHandler);

type CreateProductionBodyParams = {
  id: string | number;
  musicalId: number;
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
    validator.check(!posterUrl, "posterUrl", "is required");

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
      // Handle duplicate insert errors: unique_violation
      res.status(409).json({ error: "production already exists" });
      return;
    }
    console.error("Error in createActorHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
    return;
  }
}
