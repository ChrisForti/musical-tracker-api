import { Routes, Route, useParams } from "react-router-dom";
import { AppLayout } from "~/components/layout/AppLayout";
import ActorPage from "../components/pages/actors/ActorPage";
import ActorForm from "../components/pages/actors/ActorForm";
import ActorDetail from "../components/pages/actors/ActorDetail";

// Wrapper component for ActorDetail
function ActorDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  return <ActorDetail actorId={id || ""} />;
}

// Wrapper component for ActorForm (edit mode)
function ActorFormEditWrapper() {
  const { id } = useParams<{ id: string }>();
  return <ActorForm mode="edit" actorId={id || ""} />;
}

export default function ActorRoute() {
  return (
    <AppLayout>
      <Routes>
        <Route index element={<ActorPage />} />
        <Route path="new" element={<ActorForm mode="create" />} />
        <Route path="edit/:id" element={<ActorFormEditWrapper />} />
        <Route path="view/:id" element={<ActorDetailWrapper />} />
        <Route path="*" element={<ActorPage />} />
      </Routes>
    </AppLayout>
  );
}
