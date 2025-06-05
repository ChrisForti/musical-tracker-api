import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { UserTable } from "../../drizzle/schema.js";
import { compare, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { generateAuthenticationToken } from "../../lib/tokens.js";
import { Validator } from "../../lib/validator.js";
import { SERVER_ERROR } from "../../lib/errors.js";
import { ensureAuthenticated } from "../../lib/auth.js";

export const userRouter = Router();

userRouter.post("/", createUserHandler);
userRouter.post("/login", loginUserHandler);
userRouter.get("/", ensureAuthenticated, getUserByIdHandler); // TODO: get user by id
userRouter.put("/", ensureAuthenticated, updateUserHandler);
userRouter.delete("/", ensureAuthenticated, deleteUserHandler);

type CreateUserBodyParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accountType: "admin" | "user";
};

async function createUserHandler(
  req: Request<{}, {}, CreateUserBodyParams>,
  res: Response
) {
  const { firstName, lastName, email, password } = req.body;
  const emailRx =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  const validator = new Validator();
  const accountType = req.body.accountType;

  if (!["admin", "user"].includes(accountType)) {
    res.status(400).json({ error: "Invalid account type" });
    return;
  }

  try {
    validator.check(!!firstName, "firstName", "is required");
    validator.check(
      firstName.length < 3,
      "firstName",
      "must be at least 3 characters"
    );
    validator.check(!!lastName, "lastName", "is required");
    validator.check(
      lastName.length < 3,
      "lastName",
      " must be at least 3 characters"
    );
    validator.check(!!email, "email", "is required");
    validator.check(
      !!email.match(emailRx),
      "email",
      "must be a valid email address"
    );
    validator.check(!!password, "password", "is required");
    validator.check(
      password.length < 8,
      "password",
      "must be at least 8 digits"
    );

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const passwordHash = await hash(password!, 10);
    if (!passwordHash) {
      res.status(500).json({
        error:
          "The server encountered an error and cannot complete your request",
      });
      return;
    }

    await db.insert(UserTable).values({
      firstName,
      lastName,
      email,
      passwordHash,
      accountType: "user",
    });

    res.json({ message: "User created successfully" });
    return;
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
  res: Response
) {
  const { email, password } = req.body;
  const validator = new Validator();

  validator.check(!!email, "email", "is required");
  validator.check(!!password, "password", "is required");

  if (!validator.valid) {
    res.status(400).json({ errors: validator.errors });
    return;
  }

  try {
    const user = await db.query.UserTable.findFirst({
      where: (users, { eq }) => {
        return eq(users.email, email);
      },
    });

    if (!user) {
      res
        .status(401)
        .json({ errors: { message: "Invalid email or password" } });
      return;
    }

    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res
        .status(401)
        .json({ errors: { message: "Invalid email or password" } });
      return;
    }

    const token = await generateAuthenticationToken(user.id);

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json(validator.errors);
    }
    console.error;
    res.status(500).json({ error: SERVER_ERROR });
    return;
  }
}

type GetUserByIdBody = {
  id: string;
};

async function getUserByIdHandler(
  req: Request<GetUserByIdBody>,
  res: Response
) {
  const userId = parseInt(req.query.id as string);
  const validator = new Validator();

  try {
    validator.check(
      !isNaN(userId) && userId > 1,
      "id",
      "must be a valid number"
    );

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const user = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.id, userId));

    if (user.length === 0) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user[0]);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ errors: validator.errors });
    }
    console.error;
    res.status(500).json({ errors: SERVER_ERROR });
    return;
  }
}

type UpdateUserBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  accountType: "admin" | "user";
};

async function updateUserHandler(
  req: Request<{}, {}, UpdateUserBody>,
  res: Response
) {
  const userId = req.user!.id;
  const { firstName, lastName, email, password } = req.body as UpdateUserBody;
  const validator = new Validator();
  console.log("Request body:", req.body);
  const accountType = req.body.accountType;

  if (!["admin", "user"].includes(accountType)) {
    res.status(400).json({ error: "Invalid account type" });
    return;
  }

  const emailRx =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  validator.check(
    !!email && !!email.match(emailRx),
    "email",
    "is invalid format"
  );

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
    validator.check(!password, "password", "is required");
    if (password) {
      if (password.length < 8 || password.length > 32) {
        res.status(400).json(validator.errors);
        return;
      }
      updatedData.passwordHash = await hash(password, 10);
    }

    const result = await db
      .update(UserTable)
      .set(updatedData)
      .where(eq(UserTable.id, userId));

    validator.check(result.rowCount === 0, "user", "not found");

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ errors: validator.errors });
      return;
    }
    console.error;
    res.status(500).json({ error: SERVER_ERROR });
    return;
  }
}

async function deleteUserHandler(req: Request, res: Response) {
  const userId = req.user?.id;
  const validator = new Validator();

  try {
    validator.check(!userId, "userId", "does not exist");

    if (!userId) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const result = await db.delete(UserTable).where(eq(UserTable.id, userId));

    if (result.rowCount === 0) {
      throw new Error("User not found or already deleted");
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ errors: validator.errors });
    } else {
      res.status(500).json({ message: "Failed to delete user" }); //
    }
  }
}
