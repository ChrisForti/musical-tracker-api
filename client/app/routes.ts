import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Home page
  index("routes/home.tsx"),

  // Admin routes (using catch-all)
  route("admin/*", "routes/AdminRoute.tsx"),

  // Public routes (using catch-all)
  route("public/*", "routes/PublicRoute.tsx"),

  // Login route
  route("login", "routes/LoginRoute.tsx"),

  // Register route
  route("register", "routes/RegisterRoute.tsx"),

  // 404 catch-all route - must be last
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
