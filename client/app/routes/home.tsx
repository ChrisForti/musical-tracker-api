import type { Route } from "./+types/home";
import { Header } from "~/components/pages/Header";
import { Login } from "~/components/auth/login";
import { Sidebar } from "~/components/pages/Sidebar";


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
      <Sidebar/>
      </>
  );
}
