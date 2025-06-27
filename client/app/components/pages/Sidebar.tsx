import { useState } from "react";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleSidebar() {
    setIsOpen(!isOpen);
  }
  return (
    <div className="bg-sky-900">
      <button
        className="absolute top-20 bg-clip-text p-2 text-teal-500 md:hidden"
        onClick={toggleSidebar}
      >
        Sidebar
      </button>
    </div>
  );
}
