import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { UserTable } from "../../drizzle/schema.js";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";

export const userRouter = Router();

userRouter.post("/user", createUserHandler);
userRouter.get("/user", getUserByEmailHandler);
userRouter.get("/user", updateUserHandler);
userRouter.delete("/user", deleteUserHandler);

type CreateUserBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

async function createUserHandler(
  req: Request<{}, {}, CreateUserBody>,
  res: Response
): Promise<any> {
  const { firstName, lastName, email, password } = req.body;

  const emailRx =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  try {
    if (!firstName || !lastName) {
      throw new Error("First and last name are required");
    }
    if (firstName.length < 3 || lastName.length < 3) {
      throw new Error("First and last shoud be a minimum of three characters");
    }

    if (!email) {
      throw new Error("Email address is required");
    }
    if (!email.match(emailRx)) {
      throw new Error("Invalid email format");
    }

    if (!password) {
      throw new Error("password is missing");
    }
    if (password.length < 8 || password.length > 32) {
      throw new Error("password must be between 8, and 32 characters");
    }

    // hash password then check for a falsy password hash
    const passwordHash = await hash(password, 10);
    if (!passwordHash) {
      throw new Error("Error hashing the password");
    }

    await db
      .insert(UserTable)
      .values({ firstName, lastName, email, passwordHash });

    return res.json({ message: "User created successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Unknown error occurred" });
    return;
  }
}

async function getUserByEmailHandler(
  req: Request,
  res: Response
): Promise<void> {
  const email = req.query.email as string;

  try {
    if (!email) {
      throw new Error("Email is required");
    }

    const emailRx =
      "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
    if (!email.match(emailRx)) {
      throw new Error("Invalid email format");
    }

    const user = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.email, email));

    if (user.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user[0]);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
}

type UpdateUserBody = {
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
};

async function updateUserHandler(
  req: Request<{}, {}, UpdateUserBody>,
  res: Response
): Promise<void> {
  const { firstName, lastName, email, password } = req.body as UpdateUserBody;

  if (!email) {
    res.status(400).json({ error: "Email is required to update the user" });
    return;
  }

  const emailRx =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  if (!email.match(emailRx)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  try {
    const updatedData: any = {};
    if (firstName) updatedData.firstName = firstName;
    if (lastName) updatedData.lastName = lastName;

    if (password) {
      if (password.length < 8 || password.length > 32) {
        throw new Error("Password must be between 8 and 32 characters");
      }
      updatedData.passwordHash = await hash(password, 10);
    }

    const result = await db
      .update(UserTable)
      .set(updatedData)
      .where(eq(UserTable.email, email));

    if (result.rowCount === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
      return;
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
      return;
    }
  }
}

async function deleteUserHandler(req: Request, res: Response): Promise<any> {
  const userId = req.user?.id;

  try {
    if (!userId) {
      throw new Error("User does not exist");
    }

    const result = await db
      .delete(UserTable)
      .where(eq(UserTable.id, userId))
      .returning(); // Use `.returning()` to get the deleted rows (if supported by your database)

    if (result.length === 0) {
      throw new Error("User not found or already deleted");
    }

    res
      .status(200)
      .json({ message: "User deleted successfully", deletedUser: result[0] });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Failed to delete user" }); //
    }
  }
}
