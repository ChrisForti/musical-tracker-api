import { Routes, Route, useParams } from "react-router-dom";
import TheaterPage from "../components/pages/theaters/TheaterPage";
import TheaterForm from "../components/pages/theaters/TheaterForm";
import TheaterDetail from "../components/pages/theaters/TheaterDetail";

// Wrapper component for TheaterDetail
function TheaterDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  return <TheaterDetail theaterId={id || ""} />;
}

// Wrapper component for TheaterForm (edit mode)
function TheaterFormEditWrapper() {
  const { id } = useParams<{ id: string }>();
  return <TheaterForm mode="edit" theaterId={id || ""} />;
}

export default function TheaterRoute() {
  return (
    <Routes>
      <Route index element={<TheaterPage />} />
      <Route path="new" element={<TheaterForm mode="create" />} />
      <Route path="edit/:id" element={<TheaterFormEditWrapper />} />
      <Route path="view/:id" element={<TheaterDetailWrapper />} />
      <Route path="*" element={<TheaterPage />} />
    </Routes>
  );
}