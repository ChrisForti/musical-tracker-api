import { useState, useRef, useEffect } from "react";

export function Sidebar() {
   const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="flex" ref={ref}>
      {/* The anchor acting as a dropdown trigger */}
      <a
        href="#"
        onClick={e => {
          e.preventDefault();
          setOpen(v => !v);
        }}
        className="text-teal-400 font-bold px-4 py-2 hover:text-teal-600"
      >
        Admin Panel
      </a>
      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 mt-2 w-48 bg-sky-900 text-white rounded shadow-lg z-50">
          <ul className="py-2">
            <li>
              <a href="/admin/dashboard" className="block px-4 py-2 hover:bg-sky-700">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/admin/users" className="block px-4 py-2 hover:bg-sky-700">
                Users
              </a>
            </li>
            <li>
              <a href="/admin/settings" className="block px-4 py-2 hover:bg-sky-700">
                Settings
              </a>
            </li>
            {/* Add more admin links as needed */}
          </ul>
        </div>
      )}
    </div>

  );
}