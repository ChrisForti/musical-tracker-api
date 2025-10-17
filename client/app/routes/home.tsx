import React from "react";
import Header from "~/components/layout/header/Header";
import HomePage from "~/components/pages/HomePage";
import { Sidebar } from "~/components/layout/Sidebar";

export default function Home() {
  return (
    <div>
      <Header />
      <aside>
        <Sidebar />
      </aside>
      <HomePage />
    </div>
  );
}
