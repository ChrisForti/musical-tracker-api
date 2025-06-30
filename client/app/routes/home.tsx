import type { Route } from "./+types/home";
import { Header } from "~/components/pages/Header";
import { Sidebar } from "~/components/pages/Sidebar";
import { Mainpage } from "~/components/pages/Mainpage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Musical tracker dashboard" },
    { name: "description", content: "Welcome to Musical tracker!" },
  ];
}

export default function Home() {
  return (
    <>
      <Header />
      <aside>
        <Sidebar />
      </aside>
    </>
  );
}
