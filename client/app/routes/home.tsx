import type { Route } from "./+types/home";
import { Header } from "~/components/Header";
import { Login } from "~/components/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Musical tracker dashboard" },
    { name: "description", content: "Welcome to Musical tracker!" },
  ];
}

export default function Home() {
  return (
    <>
      <Header setHeaderNavigation={Login} />
    </>
  );
}
