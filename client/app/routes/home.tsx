import { useState } from "react";
import type { Route } from "./+types/home";
import { Header } from "~/components/pages/Header";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Musical tracker dashboard" },
    { name: "description", content: "Welcome to Musical tracker!" },
  ];
}

export default function Home() {
  const [headerNavigation, setHeaderNavigation] = useState(0);
  return (
    <>
      <Header setHeaderNavigation={setHeaderNavigation} />
    </>
  );
}
