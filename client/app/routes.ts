import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // Home page
  index("routes/home.tsx"),

  // Actors index route - add this if missing
  route("actors", "routes/ActorRoute.tsx"),

  // Actor detail route (likely already working)
  //   route("actors/:id", "routes/actors/$id.tsx"),

  // Other routes...
] satisfies RouteConfig;
