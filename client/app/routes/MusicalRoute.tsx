import { Routes, Route, useParams } from "react-router-dom";
import MusicalPage from "../components/pages/musicals/MusicalPage";
import MusicalForm from "../components/pages/musicals/MusicalForm";
import MusicalDetail from "../components/pages/musicals/MusicalDetail";

// Wrapper component for MusicalDetail
function MusicalDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  return <MusicalDetail musicalId={id || ""} />;
}

// Wrapper component for MusicalForm (edit mode)
function MusicalFormEditWrapper() {
  const { id } = useParams<{ id: string }>();
  return <MusicalForm mode="edit" musicalId={id || ""} />;
}

export default function MusicalRoute() {
  return (
    <Routes>
      <Route index element={<MusicalPage />} />
      <Route path="new" element={<MusicalForm mode="create" />} />
      <Route path="edit/:id" element={<MusicalFormEditWrapper />} />
      <Route path="view/:id" element={<MusicalDetailWrapper />} />
      <Route path="*" element={<MusicalPage />} />
    </Routes>
  );
}
