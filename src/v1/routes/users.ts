import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { UserTable } from "../../drizzle/schema.js";
import { compare, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { generateAuthenticationToken } from "../../lib/tokens.js";

export const userRouter = Router();

userRouter.post("/", createUserHandler);
userRouter.post("/login", loginUserHandler);
userRouter.get("/", getUserByEmailHandler); // TODO: change to look up by id after authentication is completed
userRouter.put("/", updateUserHandler);
userRouter.delete("/", deleteUserHandler);

type CreateUserBodyParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

async function createUserHandler(
  req: Request<{}, {}, CreateUserBodyParams>,
  res: Response,
): Promise<any> {
  const { firstName, lastName, email, password } = req.body;

  const errors: string[] = [];

  const emailRx =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  try {
    if (!firstName) {
      errors.push("'firstName' is required");
    }
    if (firstName && firstName.length < 3) {
      errors.push("'firstName' must be at least 3 characters");
    }

    if (!lastName) {
      errors.push("'lastName' is required");
    }
    if (lastName && lastName.length < 3) {
      errors.push("'lastName' must be at least 3 characters");
    }

    if (!email) {
      errors.push("'email' is required");
    }
    if (email && !email.match(emailRx)) {
      errors.push("'email' must be a valid email address");
    }

    if (!password) {
      errors.push("'password' is required");
    }
    if (password && password.length < 8) {
      errors.push("'password' must be at least 8 digits");
    }

    if (errors.length > 0) {
      res.status(400).json({ error: errors.join(",") });
      return;
    }

    // hash password then check for a falsy password hash
    const passwordHash = await hash(password!, 10);
    if (!passwordHash) {
      res.status(500).json({
        error:
          "The server encountered an error and cannot complete your request",
      });
      return;
    }

    await db
      .insert(UserTable)
      .values({ firstName, lastName, email, passwordHash });

    return res.json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Unknown error occurred" });
    return;
  }
}

type LoginUserBody = {
  email: string;
  password: string;
};

async function loginUserHandler(
  req: Request<{}, {}, LoginUserBody>,
  res: Response,
) {
  const { email, password } = req.body;
  console.log("Request body:", req.body);

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    console.log("Querying user with email:", email);

    const user = await db.query.UserTable.findFirst({
      where: (users, { eq }) => {
        return eq(users.email, email); // TODO: can be used for get user by id
      },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = await generateAuthenticationToken(user.id);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
}

type GetUserByEmailBody = {
  email: string;
};

async function getUserByEmailHandler(req: Request, res: Response) {
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
  email?: string;
  password?: string;
};

async function updateUserHandler(
  req: Request<{}, {}, UpdateUserBody>,
  res: Response,
) {
  const userId = req.user!.id;
  const { firstName, lastName, email, password } = req.body as UpdateUserBody;
  console.log("Request body:", req.body);

  if (!firstName && !lastName && !email && !password) {
    res.status(400).json({ error: "Must provide some fields to update" });
    return;
  }

  const emailRx =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  if (email && !email.match(emailRx)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }
  // TODO: validate password

  type UpdateData = {
    firstName?: string;
    lastName?: string;
    email?: string;
    passwordHash?: string;
  };

  try {
    const updatedData: UpdateData = {};
    if (firstName) updatedData.firstName = firstName;
    if (lastName) updatedData.lastName = lastName;
    if (email) updatedData.email = email;

    if (password) {
      if (password.length < 8 || password.length > 32) {
        throw new Error("Password must be between 8 and 32 characters");
      }
      updatedData.passwordHash = await hash(password, 10);
    }

    const result = await db
      .update(UserTable)
      .set(updatedData)
      .where(eq(UserTable.id, userId));

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

async function deleteUserHandler(req: Request, res: Response) {
  const userId = req.user?.id;

  try {
    if (!userId) {
      throw new Error("User does not exist");
    }

    const result = await db.delete(UserTable).where(eq(UserTable.id, userId));

    if (result.rowCount === 0) {
      throw new Error("User not found or already deleted");
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Failed to delete user" }); //
    }
  }
}
