import { Request } from "express";
import { Request as ExpressRequest } from "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
    }

    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }

    interface AuthenticatedRequest extends ExpressRequest {
      isAuthenticated?: boolean;
      isAdmin?: boolean;
    }
  }
}
