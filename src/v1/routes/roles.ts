import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { RoleTable } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { SERVER_ERROR } from "../../lib/errors.js";

export const roleRouter = Router();

roleRouter.post("/", createRoleHandler);
roleRouter.get("/", getRoleByIdHandler);
roleRouter.put("/", updateRoleHandler);
roleRouter.delete("/", deleteRoleHandler);

type CreateRoleBodyParams = {
  name: string;
};

async function createRoleHandler(
  req: Request<{}, {}, CreateRoleBodyParams>,
  res: Response,
) {
  const name = req.body.name;

  try {
    if (!name) {
      res.status(400).json({ error: "'name' is required" });
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
    return;
  }
}

type GetRoleByIdQueryParams = {
  id: string | number;
};

async function getRoleByIdHandler(
  req: Request<GetRoleByIdQueryParams>,
  res: Response,
) {
  const id = Number(req.params.id);

  if (isNaN(id) || id < 1) {
    res
      .status(400)
      .json({ error: "'id' is required and must be a valid number" });
  }

  try {
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
  res: Response,
) {
  const name = req.body.name;
  const id = Number(req.body.id);

  try {
    if (isNaN(id) || id < 1) {
      res
        .status(400)
        .json({ error: "'id' is required and must be a valid number" });
      return;
    }

    if (!name) {
      res.status(400).json({ error: "'name' is required" });
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
  res: Response,
) {
  const id = Number(req.body.id);

  if (isNaN(id) || id < 1) {
    res
      .status(400)
      .json({ error: "'id' is required and must be a valid number" });
    return;
  }

  try {
    const deletedRole = await db.delete(RoleTable).where(eq(RoleTable.id, id));

    if (deletedRole.rowCount === 0) {
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
