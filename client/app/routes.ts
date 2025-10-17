import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Home page
  index("routes/home.tsx"),

  // Actor routes (using catch-all)
  route("actors/*", "routes/ActorRoute.tsx"),

  // Musical  routes (using catch-all)
  route("musicals/*", "routes/MusicalRoute.tsx"),

  // Performance routes (using catch-all)
  route("performances/*", "routes/PerformanceRoute.tsx"),

  // Theater routes (using catch-all)
  route("theaters/*", "routes/TheaterRoute.tsx"),

  // Role routes (using catch-all)
  route("roles/*", "routes/RoleRoute.tsx"),

  // Casting routes (using catch-all)
  route("castings/*", "routes/CastingRoute.tsx"),

  // Admin routes (using catch-all)
  route("admin/*", "routes/AdminRoute.tsx"),

  // Public routes (using catch-all)
  route("public/*", "routes/PublicRoute.tsx"),

  // Login route
  route("login", "routes/LoginRoute.tsx"),

  // Register route
  route("register", "routes/RegisterRoute.tsx"),

  // Other routes...
] satisfies RouteConfig;
