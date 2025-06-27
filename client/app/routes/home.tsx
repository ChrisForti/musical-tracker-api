import type { Route } from "./+types/home";
import { Header } from "~/components/pages/Header";
import { Login } from "~/components/auth/login";
import { Welcome } from "~/welcome/welcome";
import { useState } from "react";

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
      <Login />
      <Welcome />
    </>
  );
}
