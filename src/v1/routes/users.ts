import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { UserTable } from "../../drizzle/schema.js";
import { hash } from "bcrypt";

export const userRouter = Router();
userRouter.post("/user", createUserHandler);

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
