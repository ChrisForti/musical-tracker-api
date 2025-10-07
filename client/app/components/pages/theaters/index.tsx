import React from "react";
import { useParams } from "react-router-dom";
import TheaterPage from "./TheaterPage";
import TheaterDetail from "./TheaterDetail";
import TheaterForm from "./TheaterForm";

export default function TheaterRouter() {
  // Get parameters from the URL
  const { action, id } = useParams<{ action?: string; id?: string }>();

  // Determine which component to render based on URL parameters
  if (action === "new") {
    return <TheaterForm mode="create" />;
  } else if (action === "edit" && id) {
    return <TheaterForm mode="edit" theaterId={id} />;
  } else if ((action === "view" || !action) && id) {
    return <TheaterDetail theaterId={id} />;
  } else {
    // Default to list view
    return <TheaterPage />;
  }
}