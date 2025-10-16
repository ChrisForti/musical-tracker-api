import React from "react";
import Header from "~/components/layout/header/Header";
import HomePage from "~/components/pages/HomePage";
import { Sidebar } from "~/components/layout/Sidebar";

export default function Home() {
  const closeAdmin = () => {
    console.log("Admin panel closed");
  };
  return (
    <div>
      <Header />
      <aside>
        <Sidebar closeAdmin={closeAdmin} />
      </aside>
      <HomePage closeAdmin={closeAdmin} />
    </div>
  );
}
