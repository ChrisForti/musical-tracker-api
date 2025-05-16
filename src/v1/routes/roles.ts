import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { RoleTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";

export const roleRouter = Router();

roleRouter.post("/", createRoleHandler);
roleRouter.get("/", getRoleById);
roleRouter.put("/", updateRoleHandler);
roleRouter.delete("/", deleteRoleHandler);

type CreateRoleBody = {
  name: string;
};

async function createRoleHandler(
  req: Request<{}, {}, CreateRoleBody>,
  res: Response
) {
  const { name } = req.body;

  try {
    if (!name) {
      throw new Error("Name is required");
    }

    const newRole = await db.insert(RoleTable).values({
      name,
    });

    res.status(201).json({
      message: "Role created successfully",
      role: newRole,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: "Bad request" });
      return;
    }
    res.status(500).json({ error: "Unknown error occurred" });
    return;
  }
}

type GetRoleByIdBody = {
  id: number;
};

async function getRoleById(
  req: Request<{}, {}, GetRoleByIdBody>,
  res: Response
) {
  const { id } = req.body;

  try {
    const theater = await db
      .select()
      .from(RoleTable)
      .where(eq(RoleTable.id, id))
      .limit(1);

    if (theater.length === 0) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    res.status(200).json({ theater: theater[0] });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: "Bad request" });
      return;
    }
    res.status(500).json({ error: "Unknown error occurred" });
  }
}

type UpdateRoleBody = {
  id: number;
  name: string;
};

async function updateRoleHandler(
  req: Request<{}, {}, UpdateRoleBody>,
  res: Response
) {
  const { id, name } = req.body;

  try {
    if (!id) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    if (!name) {
      res.status(400).json({ error: "Name is required" });
      return;
    }

    const updatedRole = await db
      .update(RoleTable)
      .set({ name })
      .where(eq(RoleTable.id, Number(id))); // should be able to pass in theaterId here

    if (updatedRole.rowCount === 0) {
      res.status(404).json({ error: "Role not found" });
      return;
    }

    res.status(200).json({
      message: "Role updated successfully",
      role: updatedRole,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update role" });
  }
}

type DeleteRoleBody = {
  id: number;
};

async function deleteRoleHandler(
  req: Request<{}, {}, DeleteRoleBody>,
  res: Response
) {
  const id = req.body.id;

  if (!id) {
    res.status(400).json({ error: "Role ID is required" });
    return;
  }

  try {
    const deletedRole = await db.delete(RoleTable).where(eq(RoleTable.id, id));

    if (deletedRole.rowCount === 0) {
      throw new Error("Role not found or already deleted");
    }

    res.status(200).json({
      message: "Role deleted successfully",
      role: deletedRole,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete role" });
  }
}
