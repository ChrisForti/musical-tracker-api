import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Home page
  index("routes/home.tsx"),

  // Single splat route for all actor paths
  route("actors/*", "routes/ActorRoute.tsx"),

  // Single splat route for all musical paths
  route("musicals/*", "routes/MusicalRoute.tsx"),

  // Other routes...
] satisfies RouteConfig;
