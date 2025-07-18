import React from "react";
import { useParams } from "react-router-dom";
import ActorPage from "./ActorPage";
import ActorDetail from "./ActorDetail";
import ActorForm from "./ActorForm";

export default function ActorRouter() {
  // Get parameters from the URL
  const { action, id } = useParams<{ action?: string; id?: string }>();

  // Determine which component to render based on URL parameters
  if (action === "new") {
    return <ActorForm mode="create" />;
  } else if (action === "edit" && id) {
    return <ActorForm mode="edit" actorId={id} />;
  } else if ((action === "view" || !action) && id) {
    return <ActorDetail actorId={id} />;
  } else {
    // Default to list view
    return <ActorPage />;
  }
}
