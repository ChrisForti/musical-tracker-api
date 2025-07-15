import { Sidebar } from "../components/layout/Sidebar";

export function SidebarRoute() {
  const closeAdmin = () => {
    console.log("Admin panel closed");
  };
  return <Sidebar closeAdmin={closeAdmin} />;
}
