import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { TokenTable, UserTable } from "../../drizzle/schema.js";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";

export const userRouter = Router();
userRouter.post("/user", createUserHandler);
// userRouter.get("/", getUserByEmailHandler);
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
function where(arg0: any) {
  throw new Error("Function not implemented.");
}
