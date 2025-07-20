import React from "react";
import { useParams } from "react-router-dom";
import MusicalPage from "./MusicalPage";
import MusicalDetail from "./MusicalDetail";
import MusicalForm from "./MusicalForm";

export default function MusicalRouter() {
  // Get parameters from the URL
  const { action, id } = useParams<{ action?: string; id?: string }>();

  // Determine which component to render based on URL parameters
  if (action === "new") {
    return <MusicalForm mode="create" />;
  } else if (action === "edit" && id) {
    return <MusicalForm mode="edit" musicalId={id} />;
  } else if ((action === "view" || !action) && id) {
    return <MusicalDetail musicalId={id} />;
  } else {
    // Default to list view
    return <MusicalPage />;
  }
}
