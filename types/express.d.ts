import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        // Add other properties if needed, e.g., email, roles, etc.
      };
      theater?: {
        id: number;
        name: string;
        // Add other properties if needed, e.g., location, capacity, etc.
      };
    }
  }
}
