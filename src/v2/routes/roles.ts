import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { RoleTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { SERVER_ERROR } from "../../lib/errors.js";
import { Validator } from "../../lib/validator.js";
import { ensureAdmin, ensureAuthenticated } from "../../lib/auth.js";
import { validate as validateUuid } from "uuid";

export const roleRouter = Router();

roleRouter.get("/", getAllRolesHandler);
roleRouter.post("/", ensureAuthenticated, createRoleHandler);
roleRouter.get("/:id", getRoleByIdHandler);
roleRouter.put("/:id", ensureAuthenticated, ensureAdmin, updateRoleHandler);
roleRouter.delete("/:id", ensureAuthenticated, ensureAdmin, deleteRoleHandler);
roleRouter.post(
  "/:id/verify",
  ensureAuthenticated,
  ensureAdmin,
  verifyRoleHandler
);

async function getAllRolesHandler(req: Request, res: Response) {
  try {
    const isPending = req.query.pending === "true";

    if (isPending) {
      const pendingRoles = await db
        .select()
        .from(RoleTable)
        .where(eq(RoleTable.verified, false));

      res.status(200).json(pendingRoles);
    } else {
      const roles = await db.select().from(RoleTable);
      res.status(200).json(roles);
    }
  } catch (error) {
    console.error("Error in getAllRolesHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type CreateRoleBodyParams = {
  name: string;
  musicalId: string;
};

async function createRoleHandler(
  req: Request<{}, {}, CreateRoleBodyParams>,
  res: Response
) {
  const { name, musicalId } = req.body;
  const validator = new Validator();

  try {
    validator.check(!!name, "name", "is required");
    validator.check(!!musicalId, "musicalId", "is required");

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const [newRole] = await db
      .insert(RoleTable)
      .values({ name, musicalId })
      .returning({ id: RoleTable.id });

    if (!newRole) {
      res.status(500).json({ error: "Failed to create role" });
      return;
    }

    res.status(201).json({
      message: "Role created successfully",
      id: newRole.id,
    });
  } catch (error) {
    console.error("Error in createRoleHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type GetRoleByIdParams = {
  id: string;
};

async function getRoleByIdHandler(
  req: Request<GetRoleByIdParams>,
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

    const role = await db.query.RoleTable.findFirst({
      where: eq(RoleTable.id, id),
    });

    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    res.status(200).json(role);
  } catch (error) {
    console.error("Error in getRoleByIdHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type UpdateRoleBodyParams = {
  name?: string;
  musicalId?: string;
};

async function updateRoleHandler(
  req: Request<{ id: string }, {}, UpdateRoleBodyParams>,
  res: Response
) {
  const id = req.params.id;
  const { name, musicalId } = req.body;
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

    const updateData: Partial<{ name: string; musicalId: string }> = {};
    if (name) updateData.name = name;
    if (musicalId) updateData.musicalId = musicalId;

    if (Object.keys(updateData).length === 0) {
      res
        .status(400)
        .json({ error: "At least one field (name or musicalId) is required" });
      return;
    }

    const result = await db
      .update(RoleTable)
      .set(updateData)
      .where(eq(RoleTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    console.error("Error in updateRoleHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

async function deleteRoleHandler(req: Request<{ id: string }>, res: Response) {
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

    const result = await db.delete(RoleTable).where(eq(RoleTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRoleHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}

type VerifyRoleParams = {
  id: string;
};

async function verifyRoleHandler(
  req: Request<VerifyRoleParams>,
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
      .update(RoleTable)
      .set({ verified: true })
      .where(eq(RoleTable.id, id));

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Role not found or already verified" });
      return;
    }

    res.status(200).json({ message: "Role verified successfully" });
  } catch (error) {
    console.error("Error in verifyRoleHandler:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
}
