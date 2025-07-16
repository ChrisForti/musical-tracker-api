import React from "react";
import Header from "~/components/layout/header/Header";
import Mainpage from "~/components/layout/Mainpage";
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
      <Mainpage closeAdmin={closeAdmin} />
    </div>
  );
}
