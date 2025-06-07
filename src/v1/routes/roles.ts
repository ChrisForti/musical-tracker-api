import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { RoleTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { SERVER_ERROR } from "../../lib/errors.js";
import { Validator } from "../../lib/validator.js";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";

export const roleRouter = Router();

roleRouter.post("/", ensureAuthenticated, createRoleHandler);
roleRouter.get("/:id", getRoleByIdHandler);
roleRouter.put("/", ensureAuthenticated, updateRoleHandler);
roleRouter.delete("/", ensureAuthenticated, deleteRoleHandler);
roleRouter.post<ApproveRoleParams>(
  "/:id/approve",
  ensureAuthenticated,
  ensureAdmin,
  approveRoleHandler
);
roleRouter.get(
  "/pending",
  ensureAuthenticated,
  ensureAdmin,
  getPendingRolesHandler
);

type ApproveRoleParams = {
  id: string;
};

async function approveRoleHandler(
  req: Request<ApproveRoleParams>,
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

    const result = await db
      .update(RoleTable)
      .set({ approved: true })
      .where(eq(RoleTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Role not found or already approved" });
      return;
    }

    res.status(200).json({ message: "Role approved successfully" });
  } catch (error) {
    console.error("Error in approveRoleHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function getPendingRolesHandler(req: Request, res: Response) {
  try {
    const pendingRoles = await db
      .select()
      .from(RoleTable)
      .where(eq(RoleTable.approved, false));

    res.status(200).json(pendingRoles);
  } catch (error) {
    console.error("Error in getPendingRolesHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreateRoleBodyParams = {
  name: string;
};

async function createRoleHandler(
  req: Request<{}, {}, CreateRoleBodyParams>,
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

    const newRole = await db.insert(RoleTable).values({
      name,
    });

    res.status(201).json({
      message: "Role created successfully",
      roleId: newRole.oid,
    });
  } catch (error) {
    console.error("Error in createRoleHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type GetRoleByIdQueryParams = {
  id: string | number;
};

async function getRoleByIdHandler(
  req: Request<GetRoleByIdQueryParams>,
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

    const theater = await db.query.TheaterTable.findFirst({
      where: eq(RoleTable.id, id),
    });

    if (!theater) {
      res.status(404).json({ error: "'id' is invalid" });
      return;
    }

    res.status(200).json({ theater });
  } catch (error) {
    console.error("Error in getRoleByIdHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateRoleBodyParams = {
  id: string | number;
  name: string;
};

async function updateRoleHandler(
  req: Request<{}, {}, UpdateRoleBodyParams>,
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

    const updatedRole = await db
      .update(RoleTable)
      .set({ name })
      .where(eq(RoleTable.id, Number(id)));

    if (updatedRole.rowCount === 0) {
      res.status(404).json({ error: "'id' is invalid" });
      return;
    }

    res.status(200).json({
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Error in updateRoleHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type DeleteRoleBodyParams = {
  id: string | number;
};

async function deleteRoleHandler(
  req: Request<{}, {}, DeleteRoleBodyParams>,
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

    const result = await db.delete(RoleTable).where(eq(RoleTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "'id' is invalid" });
      return;
    }

    res.status(200).json({
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteRoleHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
