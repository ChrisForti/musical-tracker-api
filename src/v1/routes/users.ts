import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { UserTable } from "../../drizzle/schema.js";
import { compare, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { generateAuthenticationToken } from "../../lib/tokens.js";
import { error } from "console";

export const userRouter = Router();

userRouter.post("/", createUserHandler);
userRouter.post("/login", loginUserHandler);
userRouter.get("/", getUserByEmailHandler); // TODO: change to look up by id after authentication is completed
userRouter.put("/", updateUserHandler);
userRouter.delete("/", deleteUserHandler);

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
      res.status(400).json({ error: "Bad request" });
      return;
    }
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
  res: Response
) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
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
  res: Response
) {
  const userId = req.user!.id;
  const { firstName, lastName, email, password } = req.body as UpdateUserBody;

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
