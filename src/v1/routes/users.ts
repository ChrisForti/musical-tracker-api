import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { UserTable } from "../../drizzle/schema.js";
import { compare, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { generateAuthenticationToken } from "../../lib/tokens.js";
import { Validator } from "../../lib/validator.js";

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
  res: Response
): Promise<any> {
  const { firstName, lastName, email, password } = req.body;
  const emailRx =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  const validator = new Validator();

  try {
    validator.check(!firstName, "firstName", "is required");
    validator.check(
      !!firstName && firstName.length < 3,
      "firstName",
      "must be 3 characters"
    );
    validator.check(!lastName, "lastName", "is required");
    validator.check(
      !!lastName && lastName.length < 3,
      "lastName",
      " must be at least 3 characters"
    );
    validator.check(!email, "email", "is required");
    validator.check(
      !!email && !email.match(emailRx),
      "email",
      "must be a valid email address"
    );
    validator.check(!password, "password", "is required");
    validator.check(
      !!password && password.length < 8,
      "password",
      "must be at least 8 digits"
    );

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

    return res.json(validator.errors);
  } catch (error) {
    res.status(500).json(validator.errors);
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
  console.log("Request body:", req.body);

  validator.check(!email, "email", "is required");
  validator.check(!password, "password", "is required");

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
      res.status(500).json(validator.errors);
    } else {
      res.status(500).json(validator.errors);
    }
  }
}

type GetUserByEmailBody = {
  email: string;
};

async function getUserByEmailHandler(req: Request, res: Response) {
  const email = req.query.email as string;
  const validator = new Validator();
  try {
    const emailRx =
      "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
    validator.check(!email, "email", "is required");
    validator.check(!!!email.match(emailRx), "email", "is invalid format");

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
      res.status(400).json(validator.errors);
    } else {
      res.status(500).json(validator.errors);
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
  const validator = new Validator();
  console.log("Request body:", req.body);

  const emailRx =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  validator.check(!email, "email", "is required");
  validator.check(
    !!email && !email.match(emailRx),
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
      res.status(400).json(validator.errors);
      return;
    } else {
      res.status(500).json(validator.errors);
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
