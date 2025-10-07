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

  // Other routes...
] satisfies RouteConfig;
