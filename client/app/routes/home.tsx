import type { Route } from "./+types/home";
import { Main } from "~/components/main";
import { Login } from "~/components/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <Main />
      <Login />
    </>
  );
}
