import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
// Import your components
import Home from "./routes/home";
import ActorPage from "./components/pages/actors/ActorPage";
import LoginPage from "./components/pages/admin/LoginPage";
import AdminPage from "./components/pages/admin/AdminPage";
import NotFoundPage from "./routes/404";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/actors",
    element: <ActorPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/admin",
    element: (
      <AdminPage
        closeAdmin={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default function App() {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
