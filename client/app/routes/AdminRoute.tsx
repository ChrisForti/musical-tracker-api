// /Users/fortis/repos/musical-tracker-api/client/app/routes/admin.tsx
import React from "react";
import AdminPage from "../components/pages/admin/AdminPage";

export default function AdminRoute() {
  const closeAdmin = () => {
    console.log("Admin panel closed");
    // You could add navigation logic here
  };

  return <AdminPage closeAdmin={closeAdmin} />;
}
